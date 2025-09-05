import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { sendOtpEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required.' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const companyRef = firestore.collection('new_companies').doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    }

    const companyData = companyDoc.data()!;
    const companyEmail = companyData.contactEmail;

    if (!companyEmail) {
        return NextResponse.json({ error: 'Company contact email not found.' }, { status: 400 });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await firestore.collection('pending_verifications').add({
        type: 'company',
        target: companyId,
        otp: hashedOtp,
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const emailSubject = `Your Verification Code for ${companyData.companyName || companyData.name || 'Your Company'} on NiveshX`;
    const emailBody = `
      <p>Hello,</p>
      <p>Please use the following One-Time Password (OTP) to verify your company's email address (${companyEmail}) for NiveshX:</p>
      <h2 style="text-align:center; font-size: 24px; letter-spacing: 4px;">${otp}</h2>
      <p>This code will expire in 15 minutes.</p>
    `;
    await sendOtpEmail(companyEmail, emailBody, emailSubject);

    return NextResponse.json({ success: true, message: 'Company verification OTP sent successfully.' });

  } catch (error) {
    console.error('Send company verification OTP error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
