import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
    const userId = decodedToken.userId;


    const firestore = admin.firestore();
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userDoc.data());
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
