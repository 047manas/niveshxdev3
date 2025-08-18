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

    // Hash the token to find it in the database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('users');

    const userQuery = await usersCollection
      .where('resetPasswordToken', '==', hashedToken)
      .where('resetPasswordExpires', '>', admin.firestore.Timestamp.now())
      .limit(1)
      .get();

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

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
