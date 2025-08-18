import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, userType } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();

    // If fullName is provided, it's a sign-up attempt
    if (fullName) {
      if (!userQuery.empty) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      // Create a new user profile in Firestore
      await usersCollection.add({
        email,
        fullName,
        userType: userType || 'Founder', // Default to Founder if not provided
        isVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // If it's a login attempt, check if the user exists
      if (userQuery.empty) {
        return NextResponse.json({ error: 'No user found with this email. Please sign up first.' }, { status: 404 });
      }
    }

    // Action code settings for the email link
    const actionCodeSettings = {
      // This URL must be authorized in the Firebase console
      url: 'http://localhost:3000/verify-email',
      handleCodeInApp: true,
    };

    // Generate the sign-in link and ask Firebase to send it
    await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);

    // We don't send the link back to the client for security reasons.
    // The user will receive it in their email.
    return NextResponse.json({ success: true, message: 'Sign-in link sent to your email.' });

  } catch (error) {
    console.error('Error in send-otp route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to send sign-in link.', details: errorMessage }, { status: 500 });
  }
}
