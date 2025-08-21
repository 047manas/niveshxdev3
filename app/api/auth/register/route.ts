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
    const { userType, ...formData } = await req.json();
    const { email, password } = formData;

    if (!email || !password || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const usersCollection = firestore.collection('users');
    const userQuery = await usersCollection.where('email', '==', email).get();

    if (!userQuery.empty) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

    const newUserRef = usersCollection.doc();
    let emailRecipientName = '';

    if (userType === 'company') {
      const {
        firstName, lastName, designation, linkedinProfile, countryCode,
        phoneNumber, companyName, companyStage, latestValuation, shareType, dealSize
      } = formData;

      emailRecipientName = `${firstName} ${lastName}`;

      // Core user data
      const newUserData = {
        email,
        password: hashedPassword,
        userType,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        designation,
        linkedinProfile,
        phone: {
          countryCode,
          number: phoneNumber,
        },
        isVerified: false,
        // For companies, profile is complete after this step
        profileComplete: true,
        otp,
        otpExpires,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await newUserRef.set(newUserData);

      // Company-specific data (no redundancy)
      const companyData = {
        userId: newUserRef.id,
        name: companyName,
        stage: companyStage,
        latestValuation,
        shareType,
        dealSize,
      };
      await firestore.collection('companies').add(companyData);

    } else { // Investor
      const {
        firstName, lastName, investorType, linkedinProfile, countryCode, phoneNumber,
        chequeSize, interestedSectors
      } = formData;

      if (!firstName || !lastName || !investorType || !linkedinProfile || !countryCode || !phoneNumber || !chequeSize || !interestedSectors) {
        return NextResponse.json({ error: 'Missing required fields for investor registration.' }, { status: 400 });
      }

      emailRecipientName = `${firstName} ${lastName}`;

      // Core user data
      const newUserData = {
        email,
        password: hashedPassword,
        userType,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        isVerified: false,
        profileComplete: true,
        otp,
        otpExpires,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await newUserRef.set(newUserData);

      // Investor-specific profile data
      const investorData = {
        userId: newUserRef.id,
        investorType,
        linkedinProfile,
        phone: {
          countryCode,
          number: phoneNumber,
        },
        chequeSize,
        interestedSectors,
      };
      await firestore.collection('investors').add(investorData);
    }

    // Send the OTP email
    const emailSubject = "Your Niveshx Verification Code";
    const emailBody = `
      <p>Hello ${emailRecipientName},</p>
      <p>Thank you for registering. Your One-Time Password (OTP) is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;
    await sendOtpEmail(email, emailBody, emailSubject);

    return NextResponse.json({ success: true, message: 'Registration successful. Please check your email for the OTP.' });

  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to register user.', details: errorMessage }, { status: 500 });
  }
}
