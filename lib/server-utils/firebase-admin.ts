import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin/app';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  ) as ServiceAccount;

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export const firestore = getFirestore();
export const auth = getAuth();
export { Timestamp, FieldValue };
