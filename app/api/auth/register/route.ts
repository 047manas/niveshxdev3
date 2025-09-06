import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { userType, ...formData } = await req.json();
    const { email, password, firstName, lastName } = formData;

    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firestore = admin.firestore();

    // --- Check #1: Is user in pending_users collection? (User email not verified) ---
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();
    if (pendingUserDoc.exists) {
        const userData = pendingUserDoc.data()!;
        if (userData.emailVerificationStatus === 'pending') {
            const otp = generateOtp();
            await pendingUserRef.update({ userOtp: otp, userOtpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 60 * 1000) });
            await sendOtpEmail(email, `<p>Here is your new One-Time Password (OTP): <h2>${otp}</h2></p>`, "New Verification Code");
            // Tell frontend to proceed to user OTP verification
            return NextResponse.json({ status: 'USER_OTP_RESENT' });
        }
    }

    // --- Check #2: Is user in the final users collection? ---
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();
    if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // Check #2a: Have company details been submitted?
        if (!userData.companyId) {
            return NextResponse.json({ status: 'CONTINUE_PROFILE', userId: userDoc.id });
        }

        const companyDoc = await firestore.collection('new_companies').doc(userData.companyId).get();
        if (!companyDoc.exists) {
            // Data inconsistency, treat as if profile is incomplete
            return NextResponse.json({ status: 'CONTINUE_PROFILE', userId: userDoc.id });
        }

        // Check #2b: Is the company's contact email verified?
        const companyData = companyDoc.data()!;
        if (companyData.isVerified) {
            return NextResponse.json({ status: 'ONBOARDING_COMPLETE' });
        } else {
            // Resend company OTP and prompt for verification
            const otp = generateOtp();
            await companyDoc.ref.update({ companyOtp: otp, companyOtpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 60 * 1000) });
            await sendOtpEmail(companyData.contactEmail, `<p>Your new company verification OTP is: <h2>${otp}</h2></p>`, "New Company Verification Code");
            return NextResponse.json({ status: 'VERIFY_COMPANY', companyId: companyDoc.id, companyEmail: companyData.contactEmail });
        }
    }

    // --- Flow for a completely new user ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const newPendingUser = {
      ...formData,
      userType,
      password: hashedPassword,
      userOtp: otp,
      userOtpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 60 * 1000), // 30 minutes
      emailVerificationStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await pendingUserRef.set(newPendingUser);
    await sendOtpEmail(email, `<p>Your OTP is: <h2>${otp}</h2></p>`, "Your Verification Code");

    return NextResponse.json({ status: 'NEW_USER' });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
