import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { userType, ...formData } = await req.json();
    const { email, password, firstName, lastName } = formData;

    // --- Step 1: Validate required fields ---
    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ error: 'Missing required fields: email, password, name, or userType.' }, { status: 400 });
    }

    const firestore = admin.firestore();

    // --- Step 2: Check if user already exists in the main 'users' collection ---
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();
    if (!userQuery.empty) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // --- Step 3: Check if user exists in the 'pending_users' collection ---
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();
    if (pendingUserDoc.exists) {
      return NextResponse.json({ error: 'A registration process for this email has already started. Please check your email for an OTP.' }, { status: 409 });
    }

    // --- Step 4: Hash password and generate OTP ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // --- Step 5: Store all pending user data in 'pending_users' collection ---
    const newPendingUser = {
      ...formData,
      userType,
      password: hashedPassword,
      userOtp: otp,
      userOtpExpires: otpExpires,
      emailVerificationStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await pendingUserRef.set(newPendingUser);

    // --- Step 6: Send OTP to user's email ---
    const emailSubject = "Your NiveshX Verification Code";
    const emailBody = `
      <p>Hello ${firstName},</p>
      <p>Thank you for creating your account. Your One-Time Password (OTP) is:</p>
      <h2 style="text-align:center; font-size: 24px; letter-spacing: 4px;">${otp}</h2>
      <p>This code will expire in 10 minutes. Please use it to verify your email address.</p>
    `;
    await sendOtpEmail(email, emailBody, emailSubject);

    // --- Step 7: Return success response ---
    return NextResponse.json({ success: true, message: 'OTP sent to your email. Please verify to continue.' });

  } catch (error) {
    console.error('Registration initiation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to initiate registration.', details: errorMessage }, { status: 500 });
  }
}
