import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue, Timestamp } from '@/lib/server-utils/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '@/lib/email';
import { rateLimit } from '@/lib/server-utils/rate-limit';
import { validateEmail } from '@/lib/utils';
import type { Transaction } from 'firebase-admin/firestore';

interface UserData {
  password: string;
  email: string;
  emailVerificationStatus: string;
  isVerified?: boolean;
  firstName: string;
  lastName: string;
  userType: 'company' | 'investor';
  companyId?: string;
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

    const identifier = `login:${email}`;
    const { success, limit, reset } = await rateLimit(identifier, 5, 15 * 60);
    
    if (!success) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.', reset, limit }, { status: 429 });
    }

    const userResult = await firestore.runTransaction(async (transaction: Transaction) => {
      const usersCollection = firestore.collection('users');
      const userQuery = await transaction.get(usersCollection.where('email', '==', email).limit(1));
      if (!userQuery.empty) {
        const doc = userQuery.docs[0];
        const data = doc.data() as UserData;
        return { doc, data, source: 'users' };
      }

      const pendingUsersCollection = firestore.collection('pending_users');
      const pendingUserDoc = await transaction.get(pendingUsersCollection.doc(email));
      if (pendingUserDoc.exists) {
        const data = pendingUserDoc.data() as UserData;
        return { doc: pendingUserDoc, data, source: 'pending_users' };
      }

      return null;
    });

    if (!userResult) {
      await firestore.collection('audit_logs').add({ type: 'LOGIN_FAILED', email, reason: 'USER_NOT_FOUND', timestamp: FieldValue.serverTimestamp(), ip: req.headers.get('x-forwarded-for') || 'unknown' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { doc: userDoc, data: userData, source } = userResult;

    if (!userData.password) {
      await firestore.collection('audit_logs').add({ type: 'LOGIN_FAILED', email, reason: 'NO_PASSWORD', timestamp: FieldValue.serverTimestamp(), ip: req.headers.get('x-forwarded-for') || 'unknown' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      await firestore.collection('audit_logs').add({ type: 'LOGIN_FAILED', email, reason: 'INVALID_PASSWORD', timestamp: FieldValue.serverTimestamp(), ip: req.headers.get('x-forwarded-for') || 'unknown' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // --- Verification Logic ---
    const isUserVerified = source === 'users' ? userData.isVerified === true : userData.emailVerificationStatus === 'verified';

    if (!isUserVerified) {
      const otp = generateOtp();
      await userDoc.ref.update({
        userOtp: otp,
        userOtpExpires: Timestamp.fromMillis(Date.now() + 30 * 60 * 1000),
      });
      await sendOtpEmail(email, `<p>Your new OTP is: <h2>${otp}</h2></p>`, "New Verification Code");
      return NextResponse.json({ error: 'USER_NOT_VERIFIED' }, { status: 401 });
    }

    if (userData.userType === 'company') {
      if (!userData.companyId) {
        // This case should ideally not happen for a verified user, but as a fallback.
        return NextResponse.json({ error: 'COMPANY_PROFILE_INCOMPLETE' }, { status: 401 });
      }

      const companyDoc = await firestore.collection('new_companies').doc(userData.companyId).get();
      if (!companyDoc.exists || companyDoc.data()?.isVerified !== true) {
        // Company is not verified. We can't send an OTP from here easily without more info.
        // The frontend should handle this by redirecting to a page where they can trigger company OTP.
        return NextResponse.json({ error: 'COMPANY_NOT_VERIFIED', companyId: userData.companyId }, { status: 401 });
      }
    }

    // --- JWT Generation ---
    const token = jwt.sign(
      { uid: userDoc.id, email: userData.email, userType: userData.userType, firstName: userData.firstName, lastName: userData.lastName },
      process.env.JWT_SECRET!,
      { expiresIn: '1d', audience: process.env.JWT_AUDIENCE || 'niveshx-app', issuer: process.env.JWT_ISSUER || 'niveshx-auth' }
    );

    await firestore.collection('audit_logs').add({ type: 'LOGIN_SUCCESS', userId: userDoc.id, email, timestamp: FieldValue.serverTimestamp(), ip: req.headers.get('x-forwarded-for') || 'unknown' });

    return NextResponse.json({ 
      success: true, 
      token,
      user: { id: userDoc.id, email: userData.email, firstName: userData.firstName, lastName: userData.lastName, userType: userData.userType }
    });

  } catch (error) {
    console.error('Login error:', error);
    await firestore.collection('audit_logs').add({ type: 'LOGIN_ERROR', error: error instanceof Error ? error.message : 'Unknown error', timestamp: FieldValue.serverTimestamp() });
    return NextResponse.json({ error: 'An unexpected error occurred while trying to log in.' }, { status: 500 });
  }
}
