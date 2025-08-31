"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env.local' });
const firebase_admin_1 = __importDefault(require("../lib/firebase-admin"));
const setupCollections = () => __awaiter(void 0, void 0, void 0, function* () {
    const firestore = firebase_admin_1.default.firestore();
    const collections = [
        'users',
        'companies',
        'investor_profiles',
        'company_members',
        'pending_verifications',
    ];
    console.log('Starting to set up Firestore collections...');
    for (const collectionName of collections) {
        try {
            const collectionRef = firestore.collection(collectionName);
            const placeholderRef = collectionRef.doc('_placeholder');
            const placeholderDoc = yield placeholderRef.get();
            if (!placeholderDoc.exists) {
                yield placeholderRef.set({
                    createdAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
                    description: 'This is a placeholder document to ensure collection existence.'
                });
                console.log(`Successfully created collection: ${collectionName}`);
            }
            else {
                console.log(`Collection already exists: ${collectionName}`);
            }
        }
        catch (error) {
            console.error(`Failed to create or verify collection: ${collectionName}`, error);
        }
    }
});
setupCollections().then(() => {
    console.log('Finished setting up collections.');
    process.exit(0);
}).catch((error) => {
    console.error('An unrecoverable error occurred during collection setup:', error);
    process.exit(1);
});
