import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

// Function to generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    // Step 1: Get form data and validate required fields
    const { userType, ...formData } = await req.json();
    const { email, password, fullName, companyName, companyEmail } = formData;

    const requiredFields = { fullName, email, companyName, companyEmail, password, userType };
    for (const [fieldName, fieldValue] of Object.entries(requiredFields)) {
      if (!fieldValue) {
        return NextResponse.json({ error: `Missing required field: ${fieldName}` }, { status: 400 });
      }
    }

    const firestore = admin.firestore();

    // Step 2: Check if user already exists in the main users collection
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();

    if (!userQuery.empty) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Step 3: Hash password and generate OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Step 4: Store pending user data in 'pending_users' collection
    const pendingUsersCollection = firestore.collection('pending_users');
    const pendingUserDoc = {
      ...formData,
      userType,
      password: hashedPassword,
      userOtp: otp,
      userOtpExpires: otpExpires,
      userEmailVerified: false,
      companyEmailVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Use email as the document ID for easy retrieval
    await pendingUsersCollection.doc(email).set(pendingUserDoc);

    // Step 5: Send OTP to user's email
    const emailSubject = "Your Niveshx Verification Code";
    const emailBody = `
      <p>Hello ${fullName},</p>
      <p>Thank you for starting the registration process. Your One-Time Password (OTP) is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;
    await sendOtpEmail(email, emailBody, emailSubject);

    // Step 6: Return success response
    return NextResponse.json({ success: true, message: 'OTP sent to your email. Please verify to continue.' });

  } catch (error) {
    console.error('Registration initiation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to initiate registration.', details: errorMessage }, { status: 500 });
  }
}
