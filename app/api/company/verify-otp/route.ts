import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { companyId, otp } = await req.json();

    if (!companyId || !otp) {
      return NextResponse.json({ error: 'Company ID and OTP are required.' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const verificationCollection = firestore.collection('pending_verifications');
    const q = verificationCollection.where('target', '==', companyId).where('type', '==', 'company');
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Invalid OTP or Company ID.' }, { status: 400 });
    }

    let otpVerified = false;
    for (const doc of querySnapshot.docs) {
      const verificationData = doc.data();
      const isOtpValid = await bcrypt.compare(otp, verificationData.otp);

      if (isOtpValid) {
        const isOtpExpired = verificationData.expiresAt.toMillis() < Date.now();
        if (isOtpExpired) {
          await doc.ref.delete();
          continue;
        }

        const companyRef = firestore.collection('new_companies').doc(companyId);
        await companyRef.update({ isVerified: true });

        await doc.ref.delete();
        otpVerified = true;
        break;
      }
    }

    if (otpVerified) {
        return NextResponse.json({ success: true, message: 'Company verified successfully.' });
    } else {
        return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Company OTP verification error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
