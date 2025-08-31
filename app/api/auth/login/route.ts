import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('new_users');
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    if (!userData.password) {
        return NextResponse.json({ error: 'Invalid credentials, user has no password.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!userData.isVerified) {
      // User is not verified, create a new verification record and send OTP
      const otp = generateOtp();
      const hashedOtp = await bcrypt.hash(otp, 10);
      await firestore.collection('pending_verifications').add({
          type: 'email',
          target: email,
          otp: hashedOtp,
          expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const emailSubject = "Verify Your NiveshX Account";
      const emailBody = `
        <p>Hello ${userData.firstName},</p>
        <p>You tried to log in, but your account is not yet verified. Please use the One-Time Password (OTP) below to verify your account:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 15 minutes.</p>
      `;
      await sendOtpEmail(email, emailBody, emailSubject);

      return NextResponse.json({ error: 'NOT_VERIFIED' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email, userType: userData.userType },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return NextResponse.json({ success: true, token });

  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to log in.', details: errorMessage }, { status: 500 });
  }
}
