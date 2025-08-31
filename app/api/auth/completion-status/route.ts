import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decodedToken.userId;

    const firestore = admin.firestore();
    const userDoc = await firestore.collection('new_users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    
    // Determine completion status and next step
    const completionStatus = {
      emailVerified: userData.isVerified || false,
      profileComplete: false,
      nextStep: 'dashboard',
      userType: userData.userType
    };
    
    if (userData.userType === 'company') {
      // Check if user has completed company onboarding
      const mainUsersCollection = firestore.collection('users');
      const mainUserQuery = await mainUsersCollection.where('email', '==', userData.email).limit(1).get();
      
      if (mainUserQuery.empty) {
        // User hasn't completed company onboarding
        completionStatus.profileComplete = false;
        completionStatus.nextStep = 'company-onboarding';
      } else {
        // User completed onboarding
        const mainUserData = mainUserQuery.docs[0].data();
        completionStatus.profileComplete = true;
        
        if (mainUserData.companyId) {
          // Check if company is verified
          const companyDoc = await firestore.collection('companies').doc(mainUserData.companyId).get();
          const isCompanyVerified = companyDoc.exists ? companyDoc.data()?.isVerified || false : false;
          
          if (!isCompanyVerified) {
            completionStatus.nextStep = 'company-verification-pending';
          } else {
            completionStatus.nextStep = 'dashboard';
          }
        } else {
          completionStatus.nextStep = 'dashboard';
        }
      }
    } else if (userData.userType === 'investor') {
      // For investors, if email is verified, they're complete
      completionStatus.profileComplete = userData.isVerified;
      completionStatus.nextStep = userData.isVerified ? 'dashboard' : 'verify-email';
    }

    return NextResponse.json({
      success: true,
      completionStatus
    });

  } catch (error: any) {
    console.error('Failed to check completion status:', error);
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}