import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/server-utils/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check in pending_users collection
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (pendingUserDoc.exists) {
      return NextResponse.json({ exists: true });
    }

    // Check in users collection
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).limit(1).get();

    if (!userQuery.empty) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });

  } catch (error) {
    console.error('Check email error:', error);
    // Return a generic error to avoid leaking implementation details
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
