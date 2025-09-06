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
    
    // Initialize variables for document and data
    let foundDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | null = null;
    let foundData: FirebaseFirestore.DocumentData | null = null;

    // Check in the users collection first (verified users)
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email.toLowerCase()).limit(1).get();
    
    if (!userQuery.empty) {
      foundDoc = userQuery.docs[0];
      foundData = foundDoc.data() || null;
    } else {
      // If not found in users, check pending_users
      console.log('User not found in users collection, checking pending_users');
      const pendingUserRef = firestore.collection('pending_users').doc(email.toLowerCase());
      const pendingUserDoc = await pendingUserRef.get();
      
      if (pendingUserDoc.exists) {
        foundDoc = pendingUserDoc;
        foundData = pendingUserDoc.data() || null;
      }
    }

    // Don't reveal if user exists or not
    if (!foundDoc || !foundData) {
      console.log('No user found with email:', email);
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with that email exists, we have sent a password reset link to it.' 
      });
    }

    // We know we have a valid document and data at this point

    // Generate a secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set an expiry for the token (1 hour)
    const tokenExpires = Timestamp.fromMillis(Date.now() + 60 * 60 * 1000);

    // Update user document with reset token
    await foundDoc.ref.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: tokenExpires,
    });

    // Send the email using the email client
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    await emailClient.sendPasswordResetEmail(
      email.toLowerCase(),
      foundData.firstName || 'User',
      resetToken,
      resetUrl
    );

    return NextResponse.json({ success: true, message: 'If an account with that email exists, we have sent a password reset link to it.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    // Avoid leaking error details
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
