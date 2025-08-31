import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { companyEmail } = await req.json();

    if (!companyEmail) {
      return NextResponse.json({ error: 'Missing required field: companyEmail' }, { status: 400 });
    }

    const firestore = admin.firestore();
    const companiesCollection = firestore.collection('new_companies');
    const companyQuery = await companiesCollection.where('contactEmail', '==', companyEmail).get();

    if (!companyQuery.empty) {
      return NextResponse.json({ exists: true });
    } else {
      return NextResponse.json({ exists: false });
    }

  } catch (error) {
    console.error('Company check error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
