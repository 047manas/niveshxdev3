import { NextRequest, NextResponse } from 'next/server';
import { firestore, FieldValue, Timestamp } from '@/lib/server-utils/firebase-admin';
import type { Transaction } from 'firebase-admin/firestore';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rateLimit } from '@/lib/server-utils/rate-limit';
import { isStrongPassword } from '@/lib/utils';

export async function POST(req: NextRequest) {
  let requestToken: string | undefined;
  
  try {
    const { token, password } = await req.json();
    requestToken = token;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Apply rate limiting - 3 attempts per 15 minutes
    const identifier = `reset-password:${token}`;
    const { success, limit, reset } = await rateLimit(identifier, 3, 15 * 60);
    
    if (!success) {
      return NextResponse.json({
        error: 'Too many attempts. Please try again later.',
        reset,
        limit
      }, { status: 429 });
    }

    // Validate password strength
    const passwordValidation = isStrongPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    // Hash the token to find it in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Use a transaction to ensure atomicity
    const result = await firestore.runTransaction(async (transaction: Transaction) => {
      // Check in users collection first
      let usersCollection = firestore.collection('users');
      let userQuery = await transaction.get(
        usersCollection
          .where('resetPasswordToken', '==', hashedToken)
          .where('resetPasswordExpires', '>', Timestamp.now())
          .limit(1)
      );

      // If not found in users, check pending_users
      if (userQuery.empty) {
        const pendingUsersCollection = firestore.collection('pending_users');
        const allPendingUsers = await transaction.get(pendingUsersCollection);
        
        for (const doc of allPendingUsers.docs) {
          const userData = doc.data();
          if (userData.resetPasswordToken === hashedToken && 
              userData.resetPasswordExpires && 
              userData.resetPasswordExpires.toMillis() > Date.now()) {
            userQuery = {
              empty: false,
              docs: [doc]
            } as any;
            break;
          }
        }
      }

      if (userQuery.empty) {
        throw new Error('Invalid or expired password reset token.');
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      // Check if the token has been used already (optional, but adds extra security)
      if (userData.resetPasswordUsed) {
        throw new Error('This reset token has already been used.');
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password and mark token as used
      transaction.update(userDoc.ref, {
        password: hashedPassword,
        resetPasswordToken: FieldValue.delete(),
        resetPasswordExpires: FieldValue.delete(),
        resetPasswordUsed: true,
        passwordLastChanged: FieldValue.serverTimestamp(),
        lastModified: FieldValue.serverTimestamp()
      });

      return userDoc.id;
    });

    console.log(`Password reset successful for user: ${result}`);

    // Create audit log
    await firestore.collection('audit_logs').add({
      type: 'PASSWORD_RESET',
      userId: result,
      timestamp: FieldValue.serverTimestamp(),
      success: true
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    // Log failed attempts
    if (requestToken) {
      await firestore.collection('audit_logs').add({
        type: 'PASSWORD_RESET_FAILED',
        token: crypto.createHash('sha256').update(requestToken).digest('hex'),
        timestamp: FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An internal error occurred.' 
    }, { status: 500 });
  }
}
