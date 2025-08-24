import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { companyId, otp } = await req.json();

    if (!companyId || !otp) {
      return NextResponse.json({ error: 'Company ID and OTP are required.' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const companyRef = firestore.collection('companies').doc(companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return NextResponse.json({ error: 'Company not found.' }, { status: 404 });
    }

    const companyData = companyDoc.data()!;

    if (companyData.isVerified) {
        return NextResponse.json({ success: true, message: 'Company already verified.' });
    }

    if (companyData.companyOtp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 });
    }

    const now = admin.firestore.Timestamp.now();
    if (now > companyData.companyOtpExpires) {
      return NextResponse.json({ error: 'OTP has expired.' }, { status: 400 });
    }

    // OTP is valid, update the company document
    await companyRef.update({
      isVerified: true,
      companyOtp: admin.firestore.FieldValue.delete(),
      companyOtpExpires: admin.firestore.FieldValue.delete(),
    });

    return NextResponse.json({ success: true, message: 'Company verified successfully.' });

  } catch (error) {
    console.error('Company OTP verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Failed to verify company OTP.', details: errorMessage }, { status: 500 });
  }
}
