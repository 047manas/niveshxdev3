import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue, Timestamp } from '@/lib/server-utils/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import emailClient from '@/lib/email/client';
import { rateLimit } from '@/lib/server-utils/rate-limit';
import { validateEmail } from '@/lib/utils';
import type { Transaction } from 'firebase-admin/firestore';

// Define a more flexible UserData interface
interface UserData {
  password?: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  // Legacy property
  emailVerificationStatus?: string;
  // New property
  isVerified?: boolean;
}

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, password } = await req.json();

    if (!rawEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Apply rate limiting
    const identifier = `login:${email}`;
    const { success, limit, reset } = await rateLimit(identifier, 5, 15 * 60);
    
    if (!success) {
      return NextResponse.json({
        error: 'Too many login attempts. Please try again later.',
        reset,
        limit
      }, { status: 429 });
    }

    const userResult = await firestore.runTransaction(async (transaction: Transaction) => {
      // 1. Check new_users collection (new system)
      const newUsersCollection = firestore.collection('new_users');
      let userQuery = await transaction.get(newUsersCollection.where('email', '==', email).limit(1));
      if (!userQuery.empty) {
        const doc = userQuery.docs[0];
        const data = doc.data() as UserData;
        return { doc, data, source: 'new_users' };
      }

      // 2. Check users collection (verified legacy users)
      const usersCollection = firestore.collection('users');
      userQuery = await transaction.get(usersCollection.where('email', '==', email).limit(1));
      if (!userQuery.empty) {
        const doc = userQuery.docs[0];
        const data = doc.data() as UserData;
        return { doc, data, source: 'users' };
      }

      // 3. Check pending_users collection (unverified legacy users)
      const pendingUserDoc = await transaction.get(firestore.collection('pending_users').doc(email));
      if (pendingUserDoc.exists) {
        const data = pendingUserDoc.data() as UserData;
        return { doc: pendingUserDoc, data, source: 'pending_users' };
      }

      return null;
    });

    if (!userResult) {
      await firestore.collection('audit_logs').add({
        type: 'LOGIN_FAILED',
        email,
        reason: 'USER_NOT_FOUND',
        timestamp: FieldValue.serverTimestamp(),
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { doc: userDoc, data: userData, source } = userResult;

    if (!userData.password) {
      await firestore.collection('audit_logs').add({
        type: 'LOGIN_FAILED',
        email,
        reason: 'NO_PASSWORD',
        timestamp: FieldValue.serverTimestamp(),
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
        timestamp: FieldValue.serverTimestamp(),
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isVerified = (source === 'new_users' && userData.isVerified === true) ||
                       (source === 'users' && userData.emailVerificationStatus === 'verified');

    if (!isVerified) {
      const otp = generateOtp();
      const firstName = userData.firstName || 'User';

      if (source === 'new_users') {
        // New flow: create a doc in pending_verifications
        const hashedOtp = await bcrypt.hash(otp, 10);
        const verificationRef = firestore.collection('pending_verifications').doc();
        await verificationRef.set({
            type: 'email',
            target: email,
            otp: hashedOtp,
            expiresAt: Timestamp.fromMillis(Date.now() + 5 * 60 * 1000), // 5 min expiry
            createdAt: FieldValue.serverTimestamp(),
        });
      } else { // 'pending_users'
        // Legacy flow: update OTP in the same document
        await userDoc.ref.update({
            userOtp: otp,
            userOtpExpires: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
            lastOtpSentAt: FieldValue.serverTimestamp()
        });
      }

      await emailClient.sendOTPEmail(email, firstName, otp);
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

    await firestore.collection('audit_logs').add({
      type: 'LOGIN_SUCCESS',
      userId: userDoc.id,
      email,
      timestamp: FieldValue.serverTimestamp(),
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
    const email = (await req.json().catch(() => ({}))).email || 'unknown';
    await firestore.collection('audit_logs').add({
      type: 'LOGIN_ERROR',
      email: email,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ 
      error: 'An unexpected error occurred while trying to log in.' 
    }, { status: 500 });
  }
}
