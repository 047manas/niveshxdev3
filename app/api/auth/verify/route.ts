import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

async function finalizeInvestorRegistration(pendingUserRef, pendingUserData) {
    const firestore = admin.firestore();
    const auth = admin.auth();
    let authUser;

    try {
        authUser = await auth.getUserByEmail(pendingUserData.email);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            authUser = await auth.createUser({
                email: pendingUserData.email,
                password: pendingUserData.password,
                displayName: `${pendingUserData.firstName} ${pendingUserData.lastName}`,
            });
        } else {
            throw error;
        }
    }

    const {
        email,
        firstName,
        lastName,
        phoneCountryCode,
        phoneNumber,
        linkedinId,
        investorType,
        investmentType,
        chequeSize,
        interestedSectors,
    } = pendingUserData;

    const userDocRef = firestore.collection('users').doc(authUser.uid);
    const investorDocRef = firestore.collection('investors').doc(); // Create a new doc with auto-ID

    await firestore.runTransaction(async (transaction) => {
        transaction.set(userDocRef, {
            email,
            firstName,
            lastName,
            phone: { countryCode: phoneCountryCode, number: phoneNumber },
            userType: 'investor',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        transaction.set(investorDocRef, {
            userId: authUser.uid,
            investorType,
            investmentType,
            linkedinProfile: linkedinId,
            chequeSize,
            interestedSectors,
            isVerified: false, // As per schema
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        transaction.delete(pendingUserRef);
    });
}


export async function POST(req: NextRequest) {
  try {
    const { email, userOtp } = await req.json();

    if (!email || !userOtp) {
      return NextResponse.json({ error: 'Email and userOtp are required.' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (!pendingUserDoc.exists) {
      return NextResponse.json({ error: 'Registration process not found. Please start over.' }, { status: 404 });
    }

    const userData = pendingUserDoc.data()!;

    if (userData.emailVerificationStatus === 'verified' && userData.userType === 'company') {
        return NextResponse.json({ success: true, message: 'Email already verified.' });
    }

    const isOtpValid = userData.userOtp === userOtp;
    const isOtpExpired = userData.userOtpExpires.toMillis() < Date.now();

    if (!isOtpValid || isOtpExpired) {
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    // If user is an investor, finalize their registration now.
    if (userData.userType === 'investor') {
        await finalizeInvestorRegistration(pendingUserRef, userData);
        return NextResponse.json({ success: true, message: 'Investor account created successfully.' });
    }

    // If user is a company, just update their status and let the frontend proceed.
    await pendingUserRef.update({
      emailVerificationStatus: 'verified',
    });

    return NextResponse.json({ success: true, message: 'Email verified successfully.' });

  } catch (error) {
    console.error('User OTP verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'An unexpected error occurred during verification.', details: errorMessage }, { status: 500 });
  }
}
