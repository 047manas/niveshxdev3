import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: '.env.local' });

import admin from '../lib/firebase-admin';

async function setupCollections() {
    const firestore = admin.firestore();

    // Core collections that need to exist
    const collections = [
        'users',
        'pending_users',
        'companies',
        'investor_profiles',
        'company_members',
        'rate_limits',
        'audit_logs'
    ];

    console.log('Starting to set up Firestore collections...');

    // Create basic collections
    for (const collectionName of collections) {
        try {
            const collectionRef = firestore.collection(collectionName);
            const configRef = collectionRef.doc('--config--');
            const configDoc = await configRef.get();

            if (!configDoc.exists) {
                const configData: any = {
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    description: `Configuration document for ${collectionName} collection`
                };

                // Add specific configuration based on collection type
                switch (collectionName) {
                    case 'rate_limits':
                        configData.ttlDays = 1; // Auto-delete after 1 day
                        break;
                    case 'audit_logs':
                        configData.retentionDays = 90; // Keep logs for 90 days
                        break;
                    case 'pending_users':
                        configData.otpExpiryMinutes = 10; // OTP expires in 10 minutes
                        break;
                }

                await configRef.set(configData);
                console.log(`Successfully created collection: ${collectionName}`);
            } else {
                console.log(`Collection already exists: ${collectionName}`);
            }
        } catch (error) {
            console.error(`Failed to create or verify collection: ${collectionName}`, error);
        }
    }

    // Read and apply Firestore indexes
    try {
        console.log('Setting up Firestore indexes...');
        const indexesPath = path.join(__dirname, '../firestore.indexes.json');
        const indexesContent = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));

        // Deploy indexes using the Firebase CLI (you'll need to run firebase deploy --only firestore:indexes separately)
        console.log('Please deploy indexes using: firebase deploy --only firestore:indexes');
        fs.writeFileSync(indexesPath, JSON.stringify(indexesContent, null, 2));
        console.log('Updated firestore.indexes.json file');
    } catch (error) {
        console.error('Failed to setup indexes:', error);
    }

    // Read and apply Firestore rules
    try {
        console.log('Updating Firestore security rules...');
        const rulesPath = path.join(__dirname, '../firestore.rules');
        const rulesContent = fs.readFileSync(rulesPath, 'utf8');
        
        // Write rules file (you'll need to run firebase deploy --only firestore:rules separately)
        fs.writeFileSync(rulesPath, rulesContent);
        console.log('Updated firestore.rules file');
        console.log('Please deploy rules using: firebase deploy --only firestore:rules');
    } catch (error) {
        console.error('Failed to update security rules:', error);
    }
}

setupCollections().then(() => {
    console.log('Finished setting up collections.');
    process.exit(0);
}).catch((error) => {
    console.error('An unrecoverable error occurred during collection setup:', error);
    process.exit(1);
});
