import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const {
      chequeSize,
      interestedSectors,
    } = await req.json();

    if (!chequeSize || !interestedSectors) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const userRef = firestore.collection('users').doc(userId);

    await userRef.update({
      chequeSize,
      interestedSectors,
      profileComplete: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Profile update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to update profile.', details: errorMessage }, { status: 500 });
  }
}
