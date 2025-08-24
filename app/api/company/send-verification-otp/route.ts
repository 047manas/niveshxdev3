import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import { sendOtpEmail } from '@/lib/email';

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
    const companyRef = firestore.collection('companies').doc(companyId);
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
    const otpExpires = admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await companyRef.update({
      companyOtp: otp,
      companyOtpExpires: otpExpires,
    });

    const emailSubject = `Your Verification Code for ${companyData.name} on NiveshX`;
    const emailBody = `
      <p>Hello,</p>
      <p>Please use the following One-Time Password (OTP) to verify your company's email address (${companyEmail}) for NiveshX:</p>
      <h2 style="text-align:center; font-size: 24px; letter-spacing: 4px;">${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;
    await sendOtpEmail(companyEmail, emailBody, emailSubject);

    return NextResponse.json({ success: true, message: 'Company verification OTP sent successfully.' });

  } catch (error) {
    console.error('Send company verification OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to send company verification OTP.', details: errorMessage }, { status: 500 });
  }
}
