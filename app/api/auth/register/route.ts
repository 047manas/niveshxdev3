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
        // Step 1
        firstName, lastName, designation, linkedinProfile,
        // Step 2
        companyName, companyWebsite, companyLinkedin, oneLiner, aboutCompany, companyCulture,
        // Step 3
        industry, primarySector, businessModel, companyStage, teamSize, locations,
        // Step 4
        hasFunding, totalFundingRaised, fundingCurrency, fundingRounds, latestFundingRound,
        // Step 5
        companyEmail, companyPhoneCountryCode, companyPhoneNumber
      } = formData;

      emailRecipientName = `${firstName} ${lastName}`;

      // Core user data (related to the person signing up)
      const newUserData = {
        email, // This is the user's login email from step 1
        password: hashedPassword,
        userType,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        designation,
        linkedinProfile, // Personal LinkedIn
        isVerified: false,
        profileComplete: true,
        otp,
        otpExpires,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await newUserRef.set(newUserData);

      // Company-specific data, linked to the user
      const companyData = {
        userId: newUserRef.id,
        name: companyName,
        website: companyWebsite,
        linkedin: companyLinkedin,
        oneLiner,
        about: aboutCompany,
        culture: companyCulture,
        industry: [industry],
        primarySector,
        businessModel,
        stage: companyStage,
        teamSize,
        locations,
        contactEmail: companyEmail,
        contactPhone: {
          countryCode: companyPhoneCountryCode,
          number: companyPhoneNumber,
        },
        funding: {
          hasRaised: hasFunding === 'yes',
          totalRaised: totalFundingRaised,
          currency: fundingCurrency,
          rounds: fundingRounds,
          latestRound: latestFundingRound,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await firestore.collection('companies').add(companyData);

    } else { // Investor
      const {
        // Step 1
        firstName, lastName, phoneCountryCode, phoneNumber, linkedinId,
        // Step 2
        investorType, investmentType, chequeSize, interestedSectors
      } = formData;

      emailRecipientName = `${firstName} ${lastName}`;

      // Core user data
      const newUserData = {
        email, // from formData
        password: hashedPassword,
        userType,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        phone: {
          countryCode: phoneCountryCode,
          number: phoneNumber,
        },
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
        investmentType,
        linkedinProfile: linkedinId,
        chequeSize,
        interestedSectors,
        isVerified: false, // Explicitly set verification status
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
