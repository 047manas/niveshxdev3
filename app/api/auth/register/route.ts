import { NextRequest, NextResponse } from 'next/server';
import { firestore, Timestamp, FieldValue } from '@/lib/server-utils/firebase-admin';
import bcrypt from 'bcryptjs';
import emailClient from '@/lib/email/client';
import { z } from 'zod';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  userType: z.enum(['company', 'investor']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, password, firstName, lastName, userType, ...rest } = validation.data;

    // For security, don't reveal if the user exists or not.
    // We will proceed as if we are creating a new user, but we won't overwrite existing data.
    // The OTP will be sent to the email address provided.

    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    const usersQuery = await firestore.collection('users').where('email', '==', email).limit(1).get();

    if (pendingUserDoc.exists || !usersQuery.empty) {
      // User already exists. Don't create a new one.
      // We can optionally resend OTP here, or just return a generic message.
      // For now, we will return a generic message to avoid complexity.
      // A separate resend-otp endpoint should be used.
      return NextResponse.json({
        status: 'SUCCESS',
        message: 'If your email is not yet verified, a new OTP has been sent. Otherwise, please log in.'
      });
    }

    // --- Flow for a completely new user ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const newPendingUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userType,
      ...rest,
      userOtp: otp,
      userOtpExpires: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000), // 10 minutes
      emailVerificationStatus: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    };

    await pendingUserRef.set(newPendingUser);

    await emailClient.sendOTPEmail(email, firstName, otp);

    return NextResponse.json({ status: 'SUCCESS', message: 'Registration successful. Please check your email for an OTP to verify your account.' });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
