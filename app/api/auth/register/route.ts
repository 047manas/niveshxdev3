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
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();

    // --- Smart Redirect for Existing Users ---
    if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        if (userData.userType !== 'company') {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        if (!userData.companyId) {
            return NextResponse.json({ status: 'CONTINUE_PROFILE', userId: userDoc.id });
        }

        const companyDoc = await firestore.collection('companies').doc(userData.companyId).get();
        if (!companyDoc.exists) {
            return NextResponse.json({ status: 'CONTINUE_PROFILE', userId: userDoc.id });
        }

        const companyData = companyDoc.data()!;
        if (companyData.isVerified) {
            return NextResponse.json({ status: 'ONBOARDING_COMPLETE' });
        } else {
            // Resend company OTP and prompt for verification
            const otp = generateOtp();
            await companyDoc.ref.update({ companyOtp: otp, companyOtpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) });
            await sendOtpEmail(companyData.contactEmail, `<p>Your new company verification OTP is: <h2>${otp}</h2></p>`, "New Company Verification Code");
            return NextResponse.json({ status: 'VERIFY_COMPANY', companyId: companyDoc.id, companyEmail: companyData.contactEmail });
        }
    }

    // --- Flow for Pending Users ---
    const pendingUserRef = firestore.collection('pending_users').doc(email);
    const pendingUserDoc = await pendingUserRef.get();
    if (pendingUserDoc.exists) {
        const otp = generateOtp();
        await pendingUserRef.update({ userOtp: otp, userOtpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) });
        const userData = pendingUserDoc.data()!;
        await sendOtpEmail(email, `<p>Your new OTP is: <h2>${otp}</h2></p>`, "New Verification Code");
        return NextResponse.json({ success: true, message: 'A new OTP has been sent.' });
    }

    // --- Flow for New Users ---
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const newPendingUser = {
      ...formData,
      userType,
      password: hashedPassword,
      userOtp: otp,
      userOtpExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
      emailVerificationStatus: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await pendingUserRef.set(newPendingUser);
    await sendOtpEmail(email, `<p>Your OTP is: <h2>${otp}</h2></p>`, "Your Verification Code");

    return NextResponse.json({ success: true, message: 'OTP sent to your email.' });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
