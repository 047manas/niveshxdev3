import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

// Function to generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, userType, companyName } = await req.json();

    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();

    if (!userQuery.empty) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create new user object
    const newUser = {
      email,
      password: hashedPassword,
      fullName,
      userType,
      companyName: companyName || null,
      isVerified: false,
      otp,
      otpExpires,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await usersCollection.add(newUser);

    // Send the OTP email
    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true, message: 'Registration successful. Please check your email for the OTP.' });

  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to register user.', details: errorMessage }, { status: 500 });
  }
}
