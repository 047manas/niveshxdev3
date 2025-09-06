import { NextRequest, NextResponse } from 'next/server';
import { firestore, Timestamp, FieldValue } from '@/lib/server-utils/firebase-admin';
import emailClient from '@/lib/email/client';
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
        expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000),
        createdAt: FieldValue.serverTimestamp(),
    });

    // Note: The sendOTPEmail function in the client does not support custom subject and body.
    // This will be sent with the default OTP template.
    await emailClient.sendOTPEmail(companyEmail, companyData.name, otp);

    return NextResponse.json({ success: true, message: 'Company verification OTP sent successfully.' });

  } catch (error) {
    console.error('Send company verification OTP error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
