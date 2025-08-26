import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    let { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Normalize email to ensure consistent lookup
    email = email.trim().toLowerCase();

    const firestore = admin.firestore();
    const verificationCollection = firestore.collection('pending_verifications');
    const querySnapshot = await verificationCollection.where('target', '==', email).get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Invalid OTP or email.' }, { status: 400 });
    }

    let otpVerified = false;
    for (const doc of querySnapshot.docs) {
      const verificationData = doc.data();
      const isOtpValid = await bcrypt.compare(otp, verificationData.otp);

      if (isOtpValid) {
        const isOtpExpired = verificationData.expiresAt.toMillis() < Date.now();
        if (isOtpExpired) {
          // Clean up expired OTP
          await doc.ref.delete();
          continue; // Check other OTPs for the same email, just in case.
        }

        // OTP is valid and not expired
        const usersCollection = firestore.collection('new_users');
        const userQuery = await usersCollection.where('email', '==', email).limit(1).get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({ isVerified: true });
        }

        // Clean up the used OTP
        await doc.ref.delete();
        otpVerified = true;
        break; // Exit loop once a valid OTP is found and used
      }
    }

    if (otpVerified) {
        return NextResponse.json({ success: true, message: 'Email verified successfully.' });
    } else {
        return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
