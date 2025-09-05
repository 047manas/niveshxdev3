import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // Hash the token to find it in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const firestore = admin.firestore();
    
    // Check in users collection first
    let usersCollection = firestore.collection('users');
    let userQuery = await usersCollection
      .where('resetPasswordToken', '==', hashedToken)
      .where('resetPasswordExpires', '>', admin.firestore.Timestamp.now())
      .limit(1)
      .get();

    // If not found in users, check pending_users
    if (userQuery.empty) {
      usersCollection = firestore.collection('pending_users');
      
      // For pending_users, we need to check each document since we can't query by resetPasswordToken
      const allPendingUsers = await usersCollection.get();
      const matchingDocs = [];
      
      for (const doc of allPendingUsers.docs) {
        const userData = doc.data();
        if (userData.resetPasswordToken === hashedToken && 
            userData.resetPasswordExpires && 
            userData.resetPasswordExpires.toMillis() > Date.now()) {
          matchingDocs.push(doc);
          break;
        }
      }
      
      if (matchingDocs.length > 0) {
        userQuery = {
          empty: false,
          docs: matchingDocs
        } as any;
      }
    }

    if (userQuery.empty) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    const userDoc = userQuery.docs[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and remove the reset token fields
    await userDoc.ref.update({
      password: hashedPassword,
      resetPasswordToken: admin.firestore.FieldValue.delete(),
      resetPasswordExpires: admin.firestore.FieldValue.delete(),
    });

    console.log(`Password reset successful for user: ${userDoc.id}`);

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
