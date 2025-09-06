import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue } from '@/lib/server-utils/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailClient from '@/lib/email/client';
import { rateLimit } from '@/lib/server-utils/rate-limit';
import { validateEmail } from '@/lib/utils';

interface UserData {
  password: string;
  email: string;
  emailVerificationStatus: string;
  firstName: string;
  lastName: string;
  userType: string;
}

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Apply rate limiting - 5 attempts per 15 minutes
    const identifier = `login:${email}`;
    const { success, limit, reset } = await rateLimit(identifier, 5, 15 * 60);
    
    if (!success) {
      return NextResponse.json({
        error: 'Too many login attempts. Please try again later.',
        reset,
        limit
      }, { status: 429 });
    }

    const firestore = admin.firestore();
    
    // First check the users collection (verified users)
    const userResult = await firestore.runTransaction(async (transaction) => {
      const usersCollection = firestore.collection('users');
      const userQuery = await transaction.get(
        usersCollection.where('email', '==', email).limit(1)
      );

      if (!userQuery.empty) {
        const doc = userQuery.docs[0];
        const data = doc.data() as UserData;
        return { doc, data };
      }

      // If not found in users, check pending_users collection
      const pendingUsersCollection = firestore.collection('pending_users');
      const pendingUserDoc = await transaction.get(
        pendingUsersCollection.doc(email)
      );

      if (pendingUserDoc.exists) {
        const data = pendingUserDoc.data() as UserData;
        return { doc: pendingUserDoc, data };
      }

      return null;
    });

    if (!userResult) {
      // Log failed attempt
      await firestore.collection('audit_logs').add({
        type: 'LOGIN_FAILED',
        email,
        reason: 'USER_NOT_FOUND',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { doc: userDoc, data: userData } = userResult;

    if (!userData.password) {
      await firestore.collection('audit_logs').add({
        type: 'LOGIN_FAILED',
        email,
        reason: 'NO_PASSWORD',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      await firestore.collection('audit_logs').add({
        type: 'LOGIN_FAILED',
        email,
        reason: 'INVALID_PASSWORD',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (userData.emailVerificationStatus !== 'verified') {
      // User is not verified, send new OTP
      const otp = generateOtp();
      const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

      await userDoc.ref.update({
        userOtp: otp,
        userOtpExpires: otpExpires,
        otpAttempts: 0,
        lastOtpSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send verification email using the new email service
      await emailClient.sendOTPEmail(email, userData.firstName, otp);

      return NextResponse.json({ error: 'NOT_VERIFIED' }, { status: 401 });
    }

    // Generate JWT with user claims
    const token = jwt.sign(
      { 
        uid: userDoc.id,
        email: userData.email,
        userType: userData.userType,
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      process.env.JWT_SECRET!,
      { 
        expiresIn: '1d',
        audience: process.env.JWT_AUDIENCE || 'niveshx-app',
        issuer: process.env.JWT_ISSUER || 'niveshx-auth'
      }
    );

    // Log successful login
    await firestore.collection('audit_logs').add({
      type: 'LOGIN_SUCCESS',
      userId: userDoc.id,
      email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ 
      success: true, 
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    const firestore = admin.firestore();
    
    // Log unexpected errors
    await firestore.collection('audit_logs').add({
      type: 'LOGIN_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return NextResponse.json({ 
      error: 'An unexpected error occurred while trying to log in.' 
    }, { status: 500 });
  }
}
