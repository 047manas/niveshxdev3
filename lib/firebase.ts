import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required client-side env vars are present.
const hasRequiredClientEnvVars =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId;

let app: FirebaseApp | null = null;
if (hasRequiredClientEnvVars) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// Export null if the app couldn't be initialized
const auth: Auth | null = app ? getAuth(app) : null;
const firestore: Firestore | null = app ? getFirestore(app) : null;

export { app, auth, firestore };
