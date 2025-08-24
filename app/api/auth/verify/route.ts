import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, step } = body;

    if (!email || !step) {
      return NextResponse.json({ error: 'Missing required fields: email or step' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const pendingUsersCollection = firestore.collection('pending_users');
    const pendingUserRef = pendingUsersCollection.doc(email);
    const pendingUserDoc = await pendingUserRef.get();

    if (!pendingUserDoc.exists) {
      return NextResponse.json({ error: 'Registration process not found. Please start over.' }, { status: 404 });
    }

    const userData = pendingUserDoc.data()!;

    // --- Step 1: Verify User's OTP ---
    if (step === 'verifyUserOtp') {
      const { userOtp } = body;
      if (!userOtp) {
        return NextResponse.json({ error: 'Missing required field: userOtp' }, { status: 400 });
      }

      const isOtpValid = userData.userOtp === userOtp;
      const isOtpExpired = userData.userOtpExpires.toMillis() < Date.now();

      if (!isOtpValid || isOtpExpired) {
        return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
      }

      await pendingUserRef.update({ userEmailVerified: true });

      // Check if company exists
      const companiesCollection = firestore.collection('companies');
      const companyQuery = await companiesCollection.where('contactEmail', '==', userData.companyEmail).get();
      const companyExists = !companyQuery.empty;

      return NextResponse.json({ success: true, userVerified: true, companyExists });
    }

    // --- Step 2: Send Company OTP (if company is new) ---
    if (step === 'sendCompanyOtp') {
      if (!userData.userEmailVerified) {
        return NextResponse.json({ error: 'User email not verified yet.' }, { status: 400 });
      }

      const companyOtp = generateOtp();
      const companyOtpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000);

      await pendingUserRef.update({
        companyOtp,
        companyOtpExpires,
      });

      const emailSubject = "Your Company Verification Code for Niveshx";
      const emailBody = `
        <p>Hello,</p>
        <p>Please use the following One-Time Password (OTP) to verify your company's email address for registration on Niveshx:</p>
        <h2>${companyOtp}</h2>
        <p>This code will expire in 10 minutes.</p>
      `;
      await sendOtpEmail(userData.companyEmail, emailBody, emailSubject);

      return NextResponse.json({ success: true, companyOtpSent: true });
    }

    // --- Step 3: Finalize Registration ---
    if (step === 'register') {
      if (!userData.userEmailVerified) {
        return NextResponse.json({ error: 'User email not verified.' }, { status: 400 });
      }

      const companiesCollection = firestore.collection('companies');
      let companyQuery;
      if (userData.userType === 'company') {
        companyQuery = await companiesCollection.where('contactEmail', '==', userData.companyEmail).get();
      }
      let companyExists = companyQuery && !companyQuery.empty;
      let companyId: string | undefined = companyExists ? companyQuery.docs[0].id : undefined;

      if (userData.userType === 'company' && !companyExists) {
        const { companyOtp } = body;
        if (!companyOtp) {
          return NextResponse.json({ error: 'Missing required field: companyOtp' }, { status: 400 });
        }
        const isOtpValid = userData.companyOtp === companyOtp;
        const isOtpExpired = userData.companyOtpExpires.toMillis() < Date.now();
        if (!isOtpValid || isOtpExpired) {
          return NextResponse.json({ error: 'Invalid or expired company OTP.' }, { status: 400 });
        }
        await pendingUserRef.update({ companyEmailVerified: true });
      }

      // All verifications passed, create permanent records
      const { password, userType, ...restOfData } = userData;

      const authUser = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      const usersCollection = firestore.collection('users');
      const newUserRef = usersCollection.doc(authUser.uid);

      if (userType === 'company') {
        const {
            firstName, lastName, designation,
            companyName, companyWebsite, companyLinkedin, oneLiner, aboutCompany, companyCulture,
            industry, primarySector, businessModel, companyStage, teamSize, locations,
            hasFunding, totalFundingRaised, fundingCurrency, fundingRounds, latestFundingRound,
            companyEmail, companyPhoneCountryCode, companyPhoneNumber
        } = userData;

        // 1. Create the main user document
        await newUserRef.set({
            email: userData.email,
            userType,
            firstName,
            lastName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 2. Create company and team member documents
        if (!companyExists) {
            const fundingData: any = { hasRaised: hasFunding === 'yes' };
            if (fundingData.hasRaised) {
                fundingData.totalRaised = totalFundingRaised;
                fundingData.currency = fundingCurrency;
                fundingData.rounds = fundingRounds;
                fundingData.latestRound = latestFundingRound;
            }

            const companyData = {
                name: companyName,
                website: companyWebsite,
                linkedin: companyLinkedin,
                oneLiner,
                about: aboutCompany,
                culture: companyCulture,
                industry: [industry], // Assuming industry is a string, schema wants an array
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
                funding: fundingData,
                userId: authUser.uid, // Link to the creating user
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            const newCompanyRef = await firestore.collection('companies').add(companyData);
            companyId = newCompanyRef.id;
        }

        // 3. Map designation to role
        let role = 'Other'; // Default role
        switch (designation) {
            case 'Co-founder':
                role = 'Founder';
                break;
            case 'CEO':
            case 'CTO':
                role = 'CXO';
                break;
            case 'HR':
                role = 'HR';
                break;
        }

        // 4. Create team member link
        if (companyId) {
            await firestore.collection('teamMembers').add({
                userId: authUser.uid,
                companyId: companyId,
                role: role,
            });
        }

      } else { // Investor
        const {
            firstName, lastName, phoneCountryCode, phoneNumber, linkedinId,
            investorType, investmentType, chequeSize, interestedSectors
        } = userData;

        // 1. Create the main user document
        await newUserRef.set({
            email: userData.email,
            userType,
            firstName,
            lastName,
            phone: { countryCode: phoneCountryCode, number: phoneNumber },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 2. Create the investor profile
        const investorData = {
            userId: authUser.uid,
            investorType,
            investmentType,
            linkedinProfile: linkedinId,
            chequeSize,
            interestedSectors,
            isVerified: false, // Default to false as per schema
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await firestore.collection('investors').add(investorData);
      }

      // Clean up pending user document
      await pendingUserRef.delete();

      return NextResponse.json({ success: true, message: 'Registration successful!' });
    }

    return NextResponse.json({ error: 'Invalid step provided.' }, { status: 400 });

  } catch (error) {
    console.error('Verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'An unexpected error occurred during verification.', details: errorMessage }, { status: 500 });
  }
}
