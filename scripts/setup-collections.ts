import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import admin from '../lib/firebase-admin';

const setupCollections = async () => {
    const firestore = admin.firestore();

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
            const placeholderDoc = await placeholderRef.get();

            if (!placeholderDoc.exists) {
                await placeholderRef.set({
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    description: 'This is a placeholder document to ensure collection existence.'
                });
                console.log(`Successfully created collection: ${collectionName}`);
            } else {
                console.log(`Collection already exists: ${collectionName}`);
            }
        } catch (error) {
            console.error(`Failed to create or verify collection: ${collectionName}`, error);
        }
    }
};

setupCollections().then(() => {
    console.log('Finished setting up collections.');
    process.exit(0);
}).catch((error) => {
    console.error('An unrecoverable error occurred during collection setup:', error);
    process.exit(1);
});
