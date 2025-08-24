import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, userOtp } = await req.json();

    // --- Step 1: Validate request body ---
    if (!email || !userOtp) {
      return NextResponse.json({ error: 'Email and userOtp are required.' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    // --- Step 2: Check if a registration process has been started ---
    if (!pendingUserDoc.exists) {
      return NextResponse.json({ error: 'Registration process not found. Please start over.' }, { status: 404 });
    }

    const userData = pendingUserDoc.data()!;

    // --- Step 3: Validate the OTP ---
    if (userData.emailVerificationStatus === 'verified') {
        return NextResponse.json({ success: true, message: 'Email already verified.' });
    }

    const isOtpValid = userData.userOtp === userOtp;
    const isOtpExpired = userData.userOtpExpires.toMillis() < Date.now();

    if (!isOtpValid) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }
    if (isOtpExpired) {
        return NextResponse.json({ error: 'Your OTP has expired. Please try registering again.' }, { status: 400 });
    }

    // --- Step 4: Update the document status ---
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
