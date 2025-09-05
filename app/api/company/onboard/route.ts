import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

/**
 * Retrieves a verified user from Firestore.
 * First checks the users collection (for already verified users), 
 * then falls back to pending_users (for users verified but not yet moved).
 */
async function getVerifiedUser(email: string) {
    const firestore = admin.firestore();
    console.log(`[Company Onboard] Looking for verified user: ${email}`);
    
    // First check if user is already in the users collection (verified and moved)
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();
    
    if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        console.log(`[Company Onboard] Found user in users collection: ${userDoc.id}`);
        return { 
            ref: userDoc.ref, 
            data: userDoc.data(),
            isAlreadyInUsers: true,
            authUid: userDoc.id
        };
    }
    
    console.log(`[Company Onboard] User not found in users collection, checking pending_users`);
    // Fallback: check pending_users collection (for edge cases)
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (!pendingUserDoc.exists) {
        console.log(`[Company Onboard] User not found in pending_users either`);
        throw new Error('User not found. Please complete the registration and email verification process first.');
    }

    const userData = pendingUserDoc.data()!;
    if (userData.emailVerificationStatus !== 'verified') {
        throw new Error('User email must be verified before proceeding.');
    }

    console.log(`[Company Onboard] Found user in pending_users collection`);
    return { 
        ref: pendingUserRef, 
        data: userData,
        isAlreadyInUsers: false,
        authUid: null
    };
}

/**
 * Maps a frontend designation string to a backend role string.
 */
function getRoleFromDesignation(designation: string): string {
    switch (designation) {
        case 'Co-founder':
            return 'Founder';
        case 'CEO':
        case 'CTO':
            return 'CXO';
        case 'HR':
            return 'HR';
        default:
            return 'Other';
    }
}

/**
 * Finalizes the user and company creation process in a single transaction.
 * This function is idempotent: it checks if an auth user already exists before creating one.
 */
async function finalizeUserAndCompanyLink(
    pendingUserRef: admin.firestore.DocumentReference,
    pendingUserData: admin.firestore.DocumentData,
    companyId: string
) {
    const firestore = admin.firestore();
    const auth = admin.auth();
    let authUser;

    try {
        // First, check if the user already exists in Firebase Auth.
        authUser = await auth.getUserByEmail(pendingUserData.email);
    } catch (error: any) {
        // If the user is not found, create them.
        if (error.code === 'auth/user-not-found') {
            authUser = await auth.createUser({
                email: pendingUserData.email,
                password: pendingUserData.password,
                displayName: `${pendingUserData.firstName} ${pendingUserData.lastName}`,
            });
        } else {
            // For any other auth errors, re-throw the error.
            throw error;
        }
    }

    const userDocRef = firestore.collection('users').doc(authUser.uid);
    const employeeDocRef = firestore.collection('new_companies').doc(companyId).collection('employees').doc(authUser.uid); // Fixed: Use new_companies
    const role = getRoleFromDesignation(pendingUserData.designation);

    await firestore.runTransaction(async (transaction) => {
        // 1. Create final user document
        transaction.set(userDocRef, {
            email: pendingUserData.email,
            firstName: pendingUserData.firstName,
            lastName: pendingUserData.lastName,
            phone: pendingUserData.phone || null,
            userType: 'Company',
            companyId: companyId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 2. Add user to company's employee subcollection
        transaction.set(employeeDocRef, {
            role: role,
            addedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 3. Delete the pending user document
        transaction.delete(pendingUserRef);
    });

    return authUser;
}


export async function POST(req: NextRequest) {
    const firestore = admin.firestore();

    try {
        const body = await req.json();
        const { step, email } = body;

        if (!step || !email) {
            return NextResponse.json({ error: 'Missing required fields: step or email' }, { status: 400 });
        }

        //=========== Route: Check Company Existence ===========
        if (step === 'checkCompany') {
            const { companyWebsite } = body;
            if (!companyWebsite) {
                return NextResponse.json({ error: 'Company website is required.' }, { status: 400 });
            }

            const companiesRef = firestore.collection('new_companies'); // Fixed: Use new_companies
            const companyQuery = await companiesRef.where('website', '==', companyWebsite).limit(1).get();

            if (!companyQuery.empty) {
                const companyDoc = companyQuery.docs[0];
                const companyData = companyDoc.data();

                if (companyData.isVerified) {
                    // If company is already verified, abort this registration and prompt user to login.
                    // Clean up the pending user document to prevent orphaned data.
                    const pendingUserRef = firestore.collection('pending_users').doc(email);
                    await pendingUserRef.delete();
                    return NextResponse.json({ status: 'COMPANY_ALREADY_VERIFIED' });
                } else {
                    // If company exists but is not verified, frontend will skip to company verification.
                    return NextResponse.json({ status: 'COMPANY_EXISTS_UNVERIFIED', companyId: companyDoc.id });
                }
            } else {
                return NextResponse.json({ status: 'COMPANY_DOES_NOT_EXIST' });
            }
        }

        //=========== Route: Create New Company Profile ===========
        if (step === 'createCompany') {
            const { companyData } = body;
            if (!companyData) {
                return NextResponse.json({ error: 'Missing companyData' }, { status: 400 });
            }

            const { ref: userRef, data: userData, isAlreadyInUsers, authUid } = await getVerifiedUser(email);

            const newCompanyRef = await firestore.collection('new_companies').add({ // Fixed: Use new_companies
                ...companyData,
                isVerified: false,
                createdBy: authUid, // Use existing authUid if user is already in users collection
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            let finalAuthUser;
            if (isAlreadyInUsers) {
                // User is already in users collection, just update their companyId
                finalAuthUser = { uid: authUid };
                await userRef.update({ companyId: newCompanyRef.id });
            } else {
                // User is still in pending_users, move them to users collection
                finalAuthUser = await finalizeUserAndCompanyLink(userRef, userData, newCompanyRef.id);
                await newCompanyRef.update({ createdBy: finalAuthUser.uid });
            }

            return NextResponse.json({ success: true, status: 'COMPANY_CREATED_NEEDS_VERIFICATION', companyId: newCompanyRef.id });
        }

        return NextResponse.json({ error: 'Invalid step provided' }, { status: 400 });

    } catch (error) {
        console.error('Company onboarding error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred during company onboarding.', details: errorMessage }, { status: 500 });
    }
}
