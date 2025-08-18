import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  console.log("SEND-OTP API: Route hit.");
  try {
    const { email, fullName, userType } = await req.json();
    console.log(`SEND-OTP API: Received request for email: ${email}`);

    if (!email) {
      console.log("SEND-OTP API: Error - Email is required.");
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('users');
    console.log("SEND-OTP API: Checking Firestore for existing user.");
    const userQuery = await usersCollection.where('email', '==', email).get();
    console.log(`SEND-OTP API: Firestore query completed. Found ${userQuery.size} matching users.`);

    // If fullName is provided, it's a sign-up attempt
    if (fullName) {
      if (!userQuery.empty) {
        console.log("SEND-OTP API: Error - User already exists during sign-up attempt.");
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      console.log("SEND-OTP API: Creating new user profile in Firestore.");
      await usersCollection.add({
        email,
        fullName,
        userType: userType || 'Founder', // Default to Founder if not provided
        isVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("SEND-OTP API: New user profile created successfully.");
    } else {
      // If it's a login attempt, check if the user exists
      if (userQuery.empty) {
        console.log("SEND-OTP API: Error - User not found during login attempt.");
        return NextResponse.json({ error: 'No user found with this email. Please sign up first.' }, { status: 404 });
      }
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email`;
    console.log(`SEND-OTP API: Preparing to generate sign-in link with callback URL: ${callbackUrl}`);

    const actionCodeSettings = {
      url: callbackUrl,
      handleCodeInApp: true,
    };

    console.log("SEND-OTP API: Calling Firebase to generate and send the link...");
    await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);
    console.log("SEND-OTP API: Firebase call successful. Email should be on its way.");

    return NextResponse.json({ success: true, message: 'Sign-in link sent to your email.' });

  } catch (error) {
    console.error('SEND-OTP API: CRITICAL ERROR - An exception occurred:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to send sign-in link.', details: errorMessage }, { status: 500 });
  }
}
