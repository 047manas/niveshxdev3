// In niveshxdev3-feature-platform-hardening-and-refactor/app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue, Timestamp } from '@/lib/server-utils/firebase-admin';
import type { Transaction } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email: rawEmail, otp } = await req.json();

  if (!rawEmail || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
  }

  const email = rawEmail.trim().toLowerCase();
  console.log(`[Verify OTP] Received request for email: ${email}`);

  try {
    console.log(`[Verify OTP] Checking in pending_users collection for email: ${email}`);
    
    // Check in pending_users collection (for user registration OTPs)
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();
    
    if (pendingUserDoc.exists) {
      const userData = pendingUserDoc.data()!;
      
      // Check if OTP matches and hasn't expired
      if (userData.userOtp === otp) {
        if (userData.userOtpExpires.toMillis() < Date.now()) {
          console.log(`[Verify OTP] OTP for ${email} is correct but expired.`);
          return NextResponse.json({ error: 'The OTP has expired. Please request a new one.' }, { status: 400 });
        }
        
        console.log(`[Verify OTP] SUCCESS: OTP is valid for ${email}.`);
        
        // Move user from pending_users to users collection
        const { userOtp, userOtpExpires, emailVerificationStatus, ...finalUserData } = userData;
        
        await firestore.runTransaction(async (transaction: Transaction) => {
          // Add to users collection as verified
          const userRef = firestore.collection('users').doc();
          transaction.set(userRef, {
            ...finalUserData,
            isVerified: true,
            createdAt: FieldValue.serverTimestamp()
          });
          
          // Remove from pending_users
          transaction.delete(pendingUserRef);

          console.log(`[Verify OTP] User data moved to users collection for ${email}`);
        });
        
        console.log(`[Verify OTP] SUCCESS: User ${email} has been verified and moved to users collection.`);
        return NextResponse.json({ success: true, message: 'Email verified successfully.' });
      } else {
        console.error(`[Verify OTP] FAILED: Invalid OTP provided for ${email}.`);
        return NextResponse.json({ error: 'The OTP you entered is incorrect.' }, { status: 400 });
      }
    }

    // Fallback: Check in pending_verifications collection (for other types of OTPs)
    const verificationCollection = firestore.collection('pending_verifications');
    const usersCollection = firestore.collection('new_users');

    // Find the pending verification document with retry logic for eventual consistency.
    let querySnapshot = null;
    for (let i = 0; i < 3; i++) {
        querySnapshot = await verificationCollection.where('target', '==', email).get();
        if (!querySnapshot.empty) {
            console.log(`[Verify OTP] Found pending verification for ${email} on attempt ${i + 1}.`);
            break;
        }
        console.log(`[Verify OTP] Attempt ${i + 1} failed to find verification for ${email}. Retrying in 500ms...`);
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!querySnapshot || querySnapshot.empty) {
      console.error(`[Verify OTP] FAILED: No pending verification found for ${email} after checking both collections.`);
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

    // Find the corresponding *unverified* user to update.
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

    // Perform the update and cleanup within a transaction for safety.
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
