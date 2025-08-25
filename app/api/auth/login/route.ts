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
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Add a check to ensure the user and password field exist before comparing
    if (!userData || typeof userData.password !== 'string' || !userData.password) {
        // Return a generic error to prevent leaking information
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!userData.isVerified) {
      // User is not verified, re-send OTP
      const otp = generateOtp();
      const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

      await userDoc.ref.update({ otp, otpExpires });

      const emailSubject = "Your Niveshx Verification Code";
      const emailBody = `
        <p>Hello ${userData.fullName},</p>
        <p>You requested to log in, but your account is not yet verified. Please use the new One-Time Password (OTP) below to verify your account:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 10 minutes.</p>
      `;
      await sendOtpEmail(email, emailBody, emailSubject);

      return NextResponse.json({ error: 'NOT_VERIFIED' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email, userType: userData.userType },
      process.env.JWT_SECRET || 'your-default-secret', // Use an environment variable for the secret
      { expiresIn: '1d' } // Token expires in 1 day
    );

    return NextResponse.json({ success: true, token });

  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to log in.', details: errorMessage }, { status: 500 });
  }
}
