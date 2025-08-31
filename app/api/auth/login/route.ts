import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '@/lib/email';

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
    const firestore = admin.firestore();
    const usersCollection = firestore.collection('new_users');
    
    // Find user by email
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    if (!userData.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Check if user is verified
    if (!userData.isVerified) {
      // Generate and send new OTP
      const otp = generateOtp();
      const hashedOtp = await bcrypt.hash(otp, 10);
      
      await userDoc.ref.update({
        otp: hashedOtp,
        otpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const emailSubject = "Verify Your Email - NiveshX";
      const emailBody = `
        <p>Hello ${userData.firstName},</p>
        <p>You tried to log in, but your account is not yet verified. Please use this verification code:</p>
        <h2 style="text-align:center; font-size: 32px; letter-spacing: 4px; color: #10B981;">${otp}</h2>
        <p>This code will expire in 15 minutes.</p>
      `;
      await sendOtpEmail(email, emailBody, emailSubject);

      return NextResponse.json({ 
        error: 'ACCOUNT_NOT_VERIFIED',
        message: 'Your account is not verified. A verification code has been sent to your email.',
        requiresVerification: true
      }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: userDoc.id, 
        email: userData.email, 
        userType: userData.userType,
        firstName: userData.firstName,
        lastName: userData.lastName
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } // 7 days
    );

    console.log(`[Login] Successful login for user: ${email}`);
    
    return NextResponse.json({ 
      success: true, 
      token,
      user: {
        userId: userDoc.id,
        email: userData.email,
        userType: userData.userType,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
