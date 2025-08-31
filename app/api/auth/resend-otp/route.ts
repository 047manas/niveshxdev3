import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();

    if (!rawEmail) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const email = rawEmail.trim().toLowerCase();
    const firestore = admin.firestore();
    const usersCollection = firestore.collection('new_users');
    
    // Find user by email
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();
    
    if (userQuery.empty) {
      // For security, don't reveal if the user exists or not
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email exists and is pending verification, a new code has been sent.' 
      });
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    // Check if user is already verified
    if (userData.isVerified) {
      return NextResponse.json({ error: 'This account is already verified. You can log in.' }, { status: 400 });
    }
    
    // Generate new OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Update user with new OTP
    await userDoc.ref.update({
      otp: hashedOtp,
      otpExpires: otpExpires,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send email
    const emailSubject = "Your New NiveshX Verification Code";
    const emailBody = `
      <p>Hello ${userData.firstName},</p>
      <p>Here is your new verification code:</p>
      <h2 style="text-align:center; font-size: 32px; letter-spacing: 4px; color: #10B981;">${otp}</h2>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;
    
    await sendOtpEmail(email, emailBody, emailSubject);
    
    console.log(`[Resend OTP] Successfully sent new OTP to: ${email}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'A new verification code has been sent to your email.' 
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ error: 'Failed to resend verification code. Please try again.' }, { status: 500 });
  }
}
