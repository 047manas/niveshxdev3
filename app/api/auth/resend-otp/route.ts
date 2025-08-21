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
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json({ success: true, message: 'If an account with this email exists, a new OTP has been sent.' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    if (userData.isVerified) {
        return NextResponse.json({ error: 'This account is already verified.' }, { status: 400 });
    }

    // Generate and send a new OTP
    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await userDoc.ref.update({ otp, otpExpires });

    const emailSubject = "Your New Niveshx Verification Code";
    const emailBody = `
      <p>Hello ${userData.fullName},</p>
      <p>You requested a new One-Time Password (OTP). Your new code is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;
    await sendOtpEmail(email, emailBody, emailSubject);

    return NextResponse.json({ success: true, message: 'A new OTP has been sent to your email address.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to resend OTP.', details: errorMessage }, { status: 500 });
  }
}
