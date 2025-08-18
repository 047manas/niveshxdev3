import admin from 'firebase-admin';

// Check if the required environment variables are defined.
const hasRequiredEnvVars =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

// Initialize the app only if the env vars are present and no app is already initialized.
if (hasRequiredEnvVars && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key stored in env vars might have its newlines escaped.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default admin;
