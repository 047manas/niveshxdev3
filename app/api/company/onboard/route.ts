import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Retrieves a verified pending user from Firestore.
 * Throws an error if the user is not found or their email is not verified.
 */
async function getVerifiedPendingUser(email: string) {
    const firestore = getFirestore();
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (!pendingUserDoc.exists) {
        throw new Error('Pending user not found. Please start the registration process again.');
    }

    const userData = pendingUserDoc.data()!;
    if (userData.emailVerificationStatus !== 'verified') {
        throw new Error('User email must be verified before proceeding.');
    }

    return { ref: pendingUserRef, data: userData };
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
 */
async function finalizeUserAndCompanyLink(
    pendingUserRef: admin.firestore.DocumentReference,
    pendingUserData: admin.firestore.DocumentData,
    companyId: string
) {
    const firestore = getFirestore();
    const auth = admin.auth();

    const authUser = await auth.createUser({
        email: pendingUserData.email,
        password: pendingUserData.password,
        displayName: `${pendingUserData.firstName} ${pendingUserData.lastName}`,
    });

    const userDocRef = firestore.collection('users').doc(authUser.uid);
    const employeeDocRef = firestore.collection('companies').doc(companyId).collection('employees').doc(authUser.uid);
    const role = getRoleFromDesignation(pendingUserData.designation);

    await firestore.runTransaction(async (transaction) => {
        // 1. Create final user document
        transaction.set(userDocRef, {
            email: pendingUserData.email,
            firstName: pendingUserData.firstName,
            lastName: pendingUserData.lastName,
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
    const firestore = getFirestore();

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
                    const { ref: pendingUserRef, data: pendingUserData } = await getVerifiedPendingUser(email);
                    await finalizeUserAndCompanyLink(pendingUserRef, pendingUserData, companyDoc.id);
                    return NextResponse.json({ status: 'LINKED_TO_VERIFIED_COMPANY' });
                } else {
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

            const { ref: pendingUserRef, data: pendingUserData } = await getVerifiedPendingUser(email);

            // Create the new company document first to get an ID
            const newCompanyRef = await firestore.collection('companies').add({
                ...companyData,
                isVerified: false,
                createdBy: null, // Will be updated after auth user is created
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Finalize user creation and link to the new company
            const authUser = await finalizeUserAndCompanyLink(pendingUserRef, pendingUserData, newCompanyRef.id);

            // Update the company with the creator's ID
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
