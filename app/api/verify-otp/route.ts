import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Email already verified.' }, { status: 400 });
    }

    if (userData.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    const now = admin.firestore.Timestamp.now();
    if (now > userData.otpExpires) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // OTP is valid, update the user document
    await userDoc.ref.update({
      isVerified: true,
      otp: admin.firestore.FieldValue.delete(),
      otpExpires: admin.firestore.FieldValue.delete(),
    });

    // Generate a new JWT to log the user in automatically
    const token = jwt.sign(
      { userId: userDoc.id, email: userData.email, userType: userData.userType },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '1d' }
    );

    return NextResponse.json({ success: true, message: 'Email verified successfully.', token });

  } catch (error) {
    console.error('OTP verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to verify OTP.', details: errorMessage }, { status: 500 });
  }
}
