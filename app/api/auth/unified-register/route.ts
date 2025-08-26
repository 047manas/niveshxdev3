import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { sendOtpEmail } from '@/lib/email';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
    const { userType, ...formData } = await req.json();
    let { email, password, firstName, lastName } = formData;

    if (!userType || !email || !password || !firstName || !lastName) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize email
    email = email.trim().toLowerCase();

    const auth = admin.auth();
    const firestore = admin.firestore();
    let authUser;

    try {
        // Step 1: Check if user already exists
        const userQuery = await firestore.collection('new_users').where('email', '==', email).limit(1).get();
        if (!userQuery.empty) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }
        try {
            await auth.getUserByEmail(email);
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        } catch (error: any) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 2: Create Firebase Auth user
        authUser = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
            disabled: false,
        });

        // Step 3: Create Firestore documents in a transaction
        if (userType === 'founder') {
            const { companyName, companyWebsite, contactEmail, role } = formData;
            if (!companyName || !companyWebsite || !contactEmail) {
                return NextResponse.json({ error: 'Missing required company fields' }, { status: 400 });
            }

            const companyQuery = await firestore.collection('new_companies').where('website', '==', companyWebsite).limit(1).get();
            if(!companyQuery.empty) {
                return NextResponse.json({ error: 'A company with this website is already registered.' }, { status: 409 });
            }

            await firestore.runTransaction(async (transaction) => {
                const userRef = firestore.collection('new_users').doc(authUser.uid);
                const companyRef = firestore.collection('new_companies').doc();
                const companyMemberRef = firestore.collection('new_company_members').doc();

                transaction.set(userRef, {
                    email: email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone || null,
                    linkedinProfile: formData.linkedinProfile || null,
                    userType: 'founder',
                    isVerified: false,
                    password: hashedPassword,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                transaction.set(companyRef, {
                    name: companyName,
                    website: companyWebsite,
                    contactEmail: contactEmail,
                    isVerified: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                transaction.set(companyMemberRef, {
                    userId: authUser.uid,
                    companyId: companyRef.id,
                    role: role || 'Founder',
                    status: 'pending_verification',
                    addedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
        } else if (userType === 'investor') {
            const { investorType, investmentType, chequeSize } = formData;
            if (!investorType || !investmentType || !chequeSize) {
                return NextResponse.json({ error: 'Missing required investor fields' }, { status: 400 });
            }

            await firestore.runTransaction(async (transaction) => {
                const userRef = firestore.collection('new_users').doc(authUser.uid);
                const investorProfileRef = firestore.collection('new_investor_profiles').doc(authUser.uid);

                transaction.set(userRef, {
                    email: email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone || null,
                    linkedinProfile: formData.linkedinProfile || null,
                    userType: 'investor',
                    isVerified: false,
                    password: hashedPassword,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                transaction.set(investorProfileRef, {
                    investorType: investorType,
                    investmentType: investmentType,
                    chequeSize: chequeSize,
                    isAccredited: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            });
        } else {
            return NextResponse.json({ error: 'Invalid userType specified' }, { status: 400 });
        }

        // Step 4: Send verification OTP
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);
        await firestore.collection('pending_verifications').add({
            type: 'email',
            target: email,
            otp: hashedOtp,
            expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await sendOtpEmail(email, `<p>Your NiveshX verification code is: <h2>${otp}</h2></p>`, "Verify your NiveshX Account");

        return NextResponse.json({ success: true, message: 'Registration successful. Please check your email for a verification code.' });

    } catch (error) {
        if (authUser) {
            await auth.deleteUser(authUser.uid).catch(deleteError => {
                console.error(`CRITICAL: Failed to delete orphaned auth user ${authUser.uid}:`, deleteError);
            });
        }
        console.error('Unified Registration Error:', error);
        return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
    }
}
