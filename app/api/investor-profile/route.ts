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
      investorType,
      linkedinProfile,
      countryCode,
      phoneNumber,
      chequeSize,
      interestedSectors,
    } = await req.json();

    const requiredFields = { investorType, linkedinProfile, phoneNumber, chequeSize, interestedSectors };
    for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
      if (!fieldValue) {
        return NextResponse.json({ error: `Missing required field: ${fieldName}` }, { status: 400 });
      }
    }

    const firestore = admin.firestore();
    const userRef = firestore.collection('users').doc(userId);

    await userRef.update({
      investorType,
      linkedinProfile,
      phone: {
        countryCode,
        number: phoneNumber,
      },
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
