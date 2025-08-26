"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Check if the required environment variables are defined.
const hasRequiredEnvVars = process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;
// Initialize the app only if the env vars are present and no app is already initialized.
if (hasRequiredEnvVars && !firebase_admin_1.default.apps.length) {
    try {
        // Clean up the private key
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey.startsWith('"')) {
            privateKey = privateKey.substring(1);
        }
        if (privateKey.endsWith('"')) {
            privateKey = privateKey.slice(0, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
        });
    }
    catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}
exports.default = firebase_admin_1.default;
