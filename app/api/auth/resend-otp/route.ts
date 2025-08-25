import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (!pendingUserDoc.exists) {
      // For security, don't reveal if the user exists or not.
      // The frontend will show the same message regardless.
      return NextResponse.json({ success: true, message: 'If an account with this email is pending verification, a new OTP has been sent.' });
    }

    const userData = pendingUserDoc.data()!;

    // Check if user is already verified
    if (userData.emailVerificationStatus === 'verified') {
        return NextResponse.json({ error: 'This account has already been verified.' }, { status: 400 });
    }

    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await pendingUserRef.update({
      userOtp: otp,
      userOtpExpires: otpExpires,
    });

    const emailSubject = "Your New NiveshX Verification Code";
    const emailBody = `
      <p>Hello ${userData.firstName},</p>
      <p>Here is your new One-Time Password (OTP):</p>
      <h2 style="text-align:center; font-size: 24px; letter-spacing: 4px;">${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;
    await sendOtpEmail(email, emailBody, emailSubject);

    return NextResponse.json({ success: true, message: 'A new OTP has been sent to your email.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to resend OTP.', details: errorMessage }, { status: 500 });
  }
}
