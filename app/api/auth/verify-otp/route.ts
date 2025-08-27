// In niveshxdev3-feature-platform-hardening-and-refactor/app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email: rawEmail, otp } = await req.json();

  if (!rawEmail || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();
  console.log(`[Verify OTP] Received request for email: ${email}`);

  try {
    const firestore = admin.firestore();
    const verificationCollection = firestore.collection('pending_verifications');
    const usersCollection = firestore.collection('new_users');

    // Step 1: Find the pending verification document.
    const querySnapshot = await verificationCollection.where('target', '==', email).get();

    if (querySnapshot.empty) {
      console.error(`[Verify OTP] FAILED: No pending verification found for ${email}.`);
      return NextResponse.json({ error: 'Invalid OTP or verification session has expired.' }, { status: 400 });
    }

    console.log(`[Verify OTP] Found ${querySnapshot.docs.length} pending verification(s) for ${email}.`);

    let otpVerified = false;
    let verificationDocRef = null;

    for (const doc of querySnapshot.docs) {
      const verificationData = doc.data();
      const isOtpValid = await bcrypt.compare(otp, verificationData.otp);

      if (isOtpValid) {
        if (verificationData.expiresAt.toMillis() < Date.now()) {
          console.log(`[Verify OTP] OTP for ${email} is correct but expired. Deleting expired OTP.`);
          await doc.ref.delete(); // Clean up expired OTP
          continue; // Check if other valid OTPs exist
        }

        console.log(`[Verify OTP] SUCCESS: OTP is valid for ${email}.`);
        otpVerified = true;
        verificationDocRef = doc.ref;
        break; // Exit after finding the first valid OTP
      }
    }

    if (!otpVerified) {
      console.error(`[Verify OTP] FAILED: Invalid or expired OTP provided for ${email}.`);
      return NextResponse.json({ error: 'The OTP you entered is incorrect or has expired.' }, { status: 400 });
    }

    // Step 2: Find the corresponding *unverified* user to update.
    const userQuery = await usersCollection
      .where('email', '==', email)
      .where('isVerified', '==', false) // This is critical
      .limit(1)
      .get();

    if (userQuery.empty) {
        console.error(`[Verify OTP] FAILED: OTP was correct for ${email}, but no matching unverified user was found to update.`);
        // Clean up the used OTP doc even if the user isn't found, to prevent reuse.
        if (verificationDocRef) await verificationDocRef.delete();
        return NextResponse.json({ error: 'Could not find a user to verify. Please try signing up again.' }, { status: 404 });
    }

    // Step 3: Perform the update and cleanup within a transaction for safety.
    const userDoc = userQuery.docs[0];

    await firestore.runTransaction(async (transaction) => {
        transaction.update(userDoc.ref, { isVerified: true });
        if (verificationDocRef) {
            transaction.delete(verificationDocRef);
        }
    });

    console.log(`[Verify OTP] SUCCESS: User ${email} has been verified and OTP record has been deleted.`);
    return NextResponse.json({ success: true, message: 'Email verified successfully.' });

  } catch (error) {
    console.error(`[Verify OTP] CRITICAL ERROR for ${email}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
