import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin/app';

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  ) as ServiceAccount;

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export const firestore = admin.firestore();
export const auth = admin.auth();
export default admin;
