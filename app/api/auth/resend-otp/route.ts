import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import emailClient from '@/lib/email/client';
import { rateLimit, validateEmail } from '@/lib/utils';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Apply rate limiting - 5 attempts per 30 minutes
    const identifier = `resend-otp:${email}`;
    const { success, limit, reset } = await rateLimit(identifier, 5, 30 * 60);
    
    if (!success) {
      return NextResponse.json({
        error: 'Too many attempts. Please try again later.',
        reset,
        limit
      }, { status: 429 });
    }

    const firestore = admin.firestore();
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (!pendingUserDoc.exists) {
      // For security, don't reveal if the user exists or not
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email is pending verification, a new OTP has been sent.' 
      });
    }

    const userData = pendingUserDoc.data()!;

    // Check if user is already verified
    if (userData.emailVerificationStatus === 'verified') {
      return NextResponse.json({ 
        error: 'This account has already been verified.' 
      }, { status: 400 });
    }

    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update the user document with new OTP and expiry
    await pendingUserRef.update({
      userOtp: otp,
      userOtpExpires: otpExpires,
      otpAttempts: admin.firestore.FieldValue.increment(1),
      lastOtpSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

      // Send the email using the improved email service
      await emailClient.sendOTPEmail(email, userData.firstName, otp);    return NextResponse.json({ success: true, message: 'A new OTP has been sent to your email.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to resend OTP.', details: errorMessage }, { status: 500 });
  }
}
