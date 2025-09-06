import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue, Timestamp } from '@/lib/server-utils/firebase-admin';
import emailClient from '@/lib/email/client';
import { rateLimit } from '@/lib/server-utils/rate-limit';
import { validateEmail } from '@/lib/utils';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    // Check if request has a body
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ 
        error: 'Content-Type must be application/json'
      }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }

    const { email } = body;
    console.log('Received resend OTP request for:', { email });

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Email is required and must be a string.' 
      }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format.' 
      }, { status: 400 });
    }

    console.log('Email validation passed, checking rate limit...');

    // Apply rate limiting - 5 attempts per 30 minutes
    const identifier = `resend-otp:${email}`;
    const { success, limit, reset } = await rateLimit(identifier, 5, 30 * 60);
    
    if (!success) {
      return NextResponse.json({
        error: 'Too many attempts. Please try again later.',
        reset,
        limit
      }, { status: 429 });
    }

    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (!pendingUserDoc.exists) {
      // For security, don't reveal if the user exists or not
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email is pending verification, a new OTP has been sent.' 
      });
    }

    const userData = pendingUserDoc.data()!;

    // Check if user is already verified
    if (userData.emailVerificationStatus === 'verified') {
      return NextResponse.json({ 
        error: 'This account has already been verified.' 
      }, { status: 400 });
    }

    const otp = generateOtp();
    const otpExpires = Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update the user document with new OTP and expiry
    await pendingUserRef.update({
      userOtp: otp,
      userOtpExpires: otpExpires,
      otpAttempts: FieldValue.increment(1),
      lastOtpSentAt: FieldValue.serverTimestamp(),
    });

      // Ensure email client is initialized
      console.log('Initializing email client...');
      await emailClient.initialize();
      
      console.log('Attempting to send OTP email to user:', { 
        email,
        firstName: userData.firstName,
        otpGenerated: true
      });

      await emailClient.sendOTPEmail(email, userData.firstName, otp);
      console.log('Email sent successfully');

      return NextResponse.json({ 
        success: true, 
        message: 'A new OTP has been sent to your email.' 
      });

  } catch (error) {
    console.error('Resend OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to resend OTP.', details: errorMessage }, { status: 500 });
  }
}
