import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { userType, ...formData } = await req.json();
    const { email, password, firstName, lastName } = formData;

    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists in main users collection
    const usersCollection = firestore.collection('new_users');
    const existingUserQuery = await usersCollection.where('email', '==', normalizedEmail).limit(1).get();
    
    if (!existingUserQuery.empty) {
      const userDoc = existingUserQuery.docs[0];
      const userData = userDoc.data();
      
      if (userData.isVerified) {
        // For company users, check if they've completed onboarding
        if (userType === 'company') {
          const usersCollection = firestore.collection('users');
          const mainUserQuery = await usersCollection.where('email', '==', normalizedEmail).limit(1).get();
          
          if (mainUserQuery.empty) {
            // User is verified but didn't complete company onboarding
            // Allow them to continue onboarding
            return NextResponse.json({ 
              status: 'VERIFIED_INCOMPLETE',
              message: 'Your email is verified. Please continue with company onboarding.',
              canContinue: true
            });
          }
        }
        
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
      } else {
        // User exists but not verified, resend OTP
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        
        // Update user with new OTP
        await userDoc.ref.update({
          otp: hashedOtp,
          otpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000), // 15 minutes
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await sendOtpEmail(normalizedEmail, `
          <p>Hello ${userData.firstName},</p>
          <p>Your verification code is:</p>
          <h2 style="text-align:center; font-size: 32px; letter-spacing: 4px; color: #10B981;">${otp}</h2>
          <p>This code will expire in 15 minutes.</p>
        `, "Verify Your Email - NiveshX");
        
        return NextResponse.json({ 
          status: 'OTP_RESENT',
          message: 'A new verification code has been sent to your email.'
        });
      }
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    
    const newUser = {
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      userType,
      isVerified: false,
      otp: hashedOtp,
      otpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000), // 15 minutes
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...formData // Include any additional form data
    };
    
    // Add user to collection
    const userRef = await usersCollection.add(newUser);
    
    await sendOtpEmail(normalizedEmail, `
      <p>Hello ${firstName},</p>
      <p>Welcome to NiveshX! Your verification code is:</p>
      <h2 style="text-align:center; font-size: 32px; letter-spacing: 4px; color: #10B981;">${otp}</h2>
      <p>This code will expire in 15 minutes.</p>
    `, "Verify Your Email - NiveshX");

    return NextResponse.json({ 
      status: 'SUCCESS',
      message: 'Registration successful. Please check your email for verification code.',
      userId: userRef.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
