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
      investmentType,
      linkedinProfile,
      phone,
      chequeSize,
      interestedSectors,
      isAccredited,
    } = await req.json();

    const requiredFields = { investorType, investmentType, linkedinProfile, phone, chequeSize, interestedSectors };
    for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
      if (!fieldValue) {
        return NextResponse.json({ error: `Missing required field: ${fieldName}` }, { status: 400 });
      }
    }

    const firestore = admin.firestore();
    await firestore.runTransaction(async (transaction) => {
        const userRef = firestore.collection('new_users').doc(userId);
        const investorProfileRef = firestore.collection('new_investor_profiles').doc(userId);

        // Update the main user document
        transaction.update(userRef, {
            linkedinProfile,
            phone,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create/update the investor profile document
        transaction.set(investorProfileRef, {
            investorType,
            investmentType,
            chequeSize,
            interestedSectors,
            isAccredited: isAccredited || false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    });


    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
