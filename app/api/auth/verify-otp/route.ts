import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, otp } = await req.json();

    if (!rawEmail || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    console.log(`[Verify OTP] Processing verification for email: ${email}`);

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('new_users');
    
    // Find user by email
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();
    
    if (userQuery.empty) {
      console.error(`[Verify OTP] No user found for email: ${email}`);
      return NextResponse.json({ error: 'User not found. Please register first.' }, { status: 404 });
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    // Check if user is already verified
    if (userData.isVerified) {
      return NextResponse.json({ error: 'Email is already verified. You can log in.' }, { status: 400 });
    }
    
    // Check if OTP exists and is not expired
    if (!userData.otp || !userData.otpExpires) {
      console.error(`[Verify OTP] No OTP found for user: ${email}`);
      return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
    }
    
    // Check if OTP is expired
    if (userData.otpExpires.toMillis() < Date.now()) {
      console.error(`[Verify OTP] OTP expired for user: ${email}`);
      // Clean up expired OTP
      await userDoc.ref.update({
        otp: admin.firestore.FieldValue.delete(),
        otpExpires: admin.firestore.FieldValue.delete()
      });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }
    
    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, userData.otp);
    
    if (!isOtpValid) {
      console.error(`[Verify OTP] Invalid OTP provided for user: ${email}`);
      return NextResponse.json({ error: 'Invalid verification code. Please check and try again.' }, { status: 400 });
    }
    
    // OTP is valid, verify the user
    await userDoc.ref.update({
      isVerified: true,
      otp: admin.firestore.FieldValue.delete(),
      otpExpires: admin.firestore.FieldValue.delete(),
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`[Verify OTP] Successfully verified user: ${email}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully! You can now log in.',
      userType: userData.userType
    });

  } catch (error) {
    console.error('[Verify OTP] Error:', error);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
