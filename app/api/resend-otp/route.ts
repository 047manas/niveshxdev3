import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { sendOtpEmail } from '@/lib/email';

// Function to generate a 6-digit OTP
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    if (userData.isVerified) {
      return NextResponse.json({ error: 'Email is already verified.' }, { status: 400 });
    }

    // Generate a new OTP and expiry
    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update user document with the new OTP
    await userDoc.ref.update({
      otp,
      otpExpires,
    });

    // Send the new OTP email
    const emailSubject = "Your New Niveshx Verification Code";
    const emailBody = `
      <p>Hello ${userData.fullName},</p>
      <p>Your new One-Time Password (OTP) is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;
    await sendOtpEmail(email, emailBody, emailSubject);

    return NextResponse.json({ success: true, message: 'A new OTP has been sent.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to resend OTP.', details: errorMessage }, { status: 500 });
  }
}
