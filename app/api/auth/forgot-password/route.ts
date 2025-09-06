import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue, Timestamp } from '@/lib/server-utils/firebase-admin';
import emailClient from '@/lib/email/client';
import crypto from 'crypto';
import { validateEmail } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    console.log('Processing password reset request for:', email);
    
    // Check in the users collection first (verified users)
    let usersCollection = firestore.collection('users');
    let userQuery = await usersCollection.where('email', '==', email).limit(1).get();
    
    // If not found in users, check pending_users (unverified users)
    if (userQuery.empty) {
      console.log('User not found in users collection, checking pending_users');
      const pendingUserRef = firestore.collection('pending_users').doc(email);
      const pendingUserDoc = await pendingUserRef.get();
      
      if (pendingUserDoc.exists) {
        userQuery = {
          empty: false,
          docs: [pendingUserDoc]
        };
      }
    }

    if (userQuery.empty) {
      console.log('No user found with email:', email);
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json({ success: true, message: 'If an account with that email exists, we have sent a password reset link to it.' });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set an expiry for the token (1 hour)
    const tokenExpires = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);

    // Update user document with reset token
    await userDoc.ref.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: tokenExpires,
    });

    // Send the email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3003'}/reset-password?token=${resetToken}`;

    // Send the email
    const emailSubject = "Reset Your Password for Niveshx";
    const emailBody = `
      <p>Hello,</p>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    await sendOtpEmail(email, emailBody, emailSubject);

    return NextResponse.json({ success: true, message: 'If an account with that email exists, we have sent a password reset link to it.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    // Avoid leaking error details
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
