import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

/**
 * Retrieves a verified user from Firestore.
 * Throws an error if the user is not found or their email is not verified.
 */
async function getVerifiedUser(email: string) {
    const firestore = admin.firestore();
    const usersCollection = firestore.collection('new_users');
    
    // Find user by email
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();
    
    if (userQuery.empty) {
        throw new Error('User not found. Please complete the registration process first.');
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    if (!userData.isVerified) {
        throw new Error('User email must be verified before proceeding.');
    }

    return { ref: userDoc.ref, data: userData };
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
    userRef: admin.firestore.DocumentReference,
    userData: admin.firestore.DocumentData,
    companyId: string
) {
    const firestore = admin.firestore();
    const auth = admin.auth();
    let authUser;

    try {
        // First, check if the user already exists in Firebase Auth.
        authUser = await auth.getUserByEmail(userData.email);
    } catch (error: any) {
        // If the user is not found, create them.
        if (error.code === 'auth/user-not-found') {
            authUser = await auth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: `${userData.firstName} ${userData.lastName}`,
            });
        } else {
            // For any other auth errors, re-throw the error.
            throw error;
        }
    }

    const userDocRef = firestore.collection('users').doc(authUser.uid);
    const employeeDocRef = firestore.collection('companies').doc(companyId).collection('employees').doc(authUser.uid);
    const role = getRoleFromDesignation(userData.designation);

    await firestore.runTransaction(async (transaction) => {
        // 1. Create final user document
        transaction.set(userDocRef, {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone || null,
            userType: 'Company',
            companyId: companyId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 2. Add user to company's employee subcollection
        transaction.set(employeeDocRef, {
            role: role,
            addedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 3. Move user from new_users to completed users (delete from new_users)
        transaction.delete(userRef);
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

            const companiesRef = firestore.collection('companies');
            const companyQuery = await companiesRef.where('website', '==', companyWebsite).limit(1).get();

            if (!companyQuery.empty) {
                const companyDoc = companyQuery.docs[0];
                const companyData = companyDoc.data();

                if (companyData.isVerified) {
                    // If company is already verified, abort this registration and prompt user to login.
                    // Clean up the new user document to prevent orphaned data.
                    const usersCollection = firestore.collection('new_users');
                    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();
                    if (!userQuery.empty) {
                        await userQuery.docs[0].ref.delete();
                    }
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

            const { ref: userRef, data: userData } = await getVerifiedUser(email);

            const newCompanyRef = await firestore.collection('companies').add({
                ...companyData,
                isVerified: false,
                createdBy: null, // Will be updated after auth user is created
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            const authUser = await finalizeUserAndCompanyLink(userRef, userData, newCompanyRef.id);

            await newCompanyRef.update({ createdBy: authUser.uid });

            return NextResponse.json({ success: true, status: 'COMPANY_CREATED_NEEDS_VERIFICATION', companyId: newCompanyRef.id });
        }

        return NextResponse.json({ error: 'Invalid step provided' }, { status: 400 });

    } catch (error) {
        console.error('Company onboarding error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return NextResponse.json({ error: 'An unexpected error occurred during company onboarding.', details: errorMessage }, { status: 500 });
    }
}
