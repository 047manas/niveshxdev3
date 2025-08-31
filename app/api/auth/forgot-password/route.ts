import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { sendOtpEmail } from '@/lib/email'; // Re-using for sending reset links
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('new_users');
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();

    if (userQuery.empty) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json({ success: true, message: 'If an account with that email exists, we have sent a password reset link to it.' });
    }

    const userDoc = userQuery.docs[0];

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set an expiry for the token (e.g., 1 hour)
    const tokenExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);

    // Update user document with reset token
    await userDoc.ref.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: tokenExpires,
    });

    // Send the email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send the email
    const emailSubject = "Reset Your Password for Niveshx";
    const emailBody = `
      <p>Hello,</p>
      <p>You requested a password reset. Please click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
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
