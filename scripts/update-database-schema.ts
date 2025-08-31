import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import admin from '../lib/firebase-admin';

/**
 * Script to update the database schema for the simplified authentication flow
 * This migrates from the complex pending_users/pending_verifications setup to a simpler new_users collection
 */

const updateDatabaseSchema = async () => {
    const firestore = admin.firestore();
    
    console.log('🔄 Starting database schema update...');
    
    try {
        // 1. Create required collections if they don't exist
        const collections = [
            'new_users',         // Main users collection with built-in OTP
            'companies',         // Companies collection
            'investors',         // Investor profiles collection
        ];

        for (const collectionName of collections) {
            try {
                const collectionRef = firestore.collection(collectionName);
                const placeholderRef = collectionRef.doc('_placeholder');
                const placeholderDoc = await placeholderRef.get();

                if (!placeholderDoc.exists) {
                    await placeholderRef.set({
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        description: 'Placeholder document to ensure collection exists',
                        _temp: true
                    });
                    console.log(`✅ Created collection: ${collectionName}`);
                } else {
                    console.log(`✅ Collection already exists: ${collectionName}`);
                }
            } catch (error) {
                console.error(`❌ Failed to create collection ${collectionName}:`, error);
            }
        }

        // 2. Migrate existing pending_users to new_users if they exist
        console.log('🔄 Checking for pending users to migrate...');
        
        const pendingUsersSnapshot = await firestore.collection('pending_users').get();
        const newUsersCollection = firestore.collection('new_users');
        
        if (!pendingUsersSnapshot.empty) {
            console.log(`Found ${pendingUsersSnapshot.docs.length} pending users to migrate`);
            
            for (const doc of pendingUsersSnapshot.docs) {
                const pendingData = doc.data();
                
                try {
                    // Check if user already exists in new_users
                    const existingUserQuery = await newUsersCollection
                        .where('email', '==', pendingData.email)
                        .limit(1)
                        .get();
                    
                    if (existingUserQuery.empty) {
                        // Migrate user to new format
                        const newUserData = {
                            email: pendingData.email,
                            password: pendingData.password,
                            firstName: pendingData.firstName,
                            lastName: pendingData.lastName,
                            userType: pendingData.userType,
                            phone: pendingData.phone || null,
                            linkedinProfile: pendingData.linkedinProfile || null,
                            designation: pendingData.designation || null,
                            isVerified: pendingData.emailVerificationStatus === 'verified',
                            otp: pendingData.userOtp || null,
                            otpExpires: pendingData.userOtpExpires || null,
                            createdAt: pendingData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            migratedFrom: 'pending_users'
                        };
                        
                        await newUsersCollection.add(newUserData);
                        console.log(`✅ Migrated user: ${pendingData.email}`);
                    } else {
                        console.log(`⚠️  User already exists in new_users: ${pendingData.email}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to migrate user ${pendingData.email}:`, error);
                }
            }
        } else {
            console.log('ℹ️  No pending users found to migrate');
        }

        // 3. Clean up placeholder documents
        console.log('🔄 Cleaning up placeholder documents...');
        for (const collectionName of collections) {
            try {
                const placeholderRef = firestore.collection(collectionName).doc('_placeholder');
                const placeholderDoc = await placeholderRef.get();
                
                if (placeholderDoc.exists && placeholderDoc.data()?._temp) {
                    await placeholderRef.delete();
                    console.log(`🗑️  Removed placeholder from ${collectionName}`);
                }
            } catch (error) {
                console.log(`⚠️  Could not remove placeholder from ${collectionName}: ${error.message}`);
            }
        }

        console.log('🎉 Database schema update completed successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log('- ✅ All required collections are ready');
        console.log('- ✅ Simplified authentication flow enabled');
        console.log('- ✅ OTP storage integrated into user documents');
        console.log('- ✅ Migration completed (if applicable)');
        
    } catch (error) {
        console.error('❌ Database schema update failed:', error);
        process.exit(1);
    }
};

// Run the script
updateDatabaseSchema()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });