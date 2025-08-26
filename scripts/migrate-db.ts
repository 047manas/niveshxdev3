import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import admin from '../lib/firebase-admin';

const firestore = admin.firestore();

// Set a batch size for Firestore writes to avoid memory issues.
const BATCH_SIZE = 250;

const migrateUsers = async () => {
    console.log('Migrating users...');
    const oldUsersSnapshot = await firestore.collection('users').get();
    const newUsersCollection = firestore.collection('new_users');
    let batch = firestore.batch();
    let count = 0;

    for (const doc of oldUsersSnapshot.docs) {
        const oldUser = doc.data();
        const userId = doc.id;

        if (!oldUser.email) {
            console.warn(`Skipping user document ${userId} due to missing email.`);
            continue;
        }

        const newUser = {
            email: oldUser.email,
            firstName: oldUser.firstName,
            lastName: oldUser.lastName,
            phone: oldUser.phone || null,
            linkedinProfile: oldUser.linkedinProfile || null,
            userType: oldUser.userType === 'Company' ? 'founder' : 'investor',
            isVerified: oldUser.isVerified || false, // Assuming a default, might need adjustment
            createdAt: oldUser.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const newUserRef = newUsersCollection.doc(userId);
        batch.set(newUserRef, newUser, { merge: true });
        count++;

        if (count % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} users...`);
            await batch.commit();
            batch = firestore.batch();
        }
    }

    if (count % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${count % BATCH_SIZE} users...`);
        await batch.commit();
    }

    console.log(`Migrated ${count} users successfully.`);
};

const migrateCompaniesAndMembers = async () => {
    console.log('Migrating companies and company members...');
    const oldCompaniesSnapshot = await firestore.collection('companies').get();
    const newCompaniesCollection = firestore.collection('new_companies');
    const newCompanyMembersCollection = firestore.collection('new_company_members');
    let companyBatch = firestore.batch();
    let memberBatch = firestore.batch();
    let companyCount = 0;
    let memberCount = 0;

    for (const doc of oldCompaniesSnapshot.docs) {
        const oldCompany = doc.data();

        if (!oldCompany.name) {
            console.warn(`Skipping company document ${doc.id} due to missing name.`);
            continue;
        }

        const newCompanyRef = newCompaniesCollection.doc(); // Auto-generate new ID

        const newCompany = {
            name: oldCompany.name,
            website: oldCompany.website,
            linkedin: oldCompany.linkedin,
            oneLiner: oldCompany.oneLiner,
            about: oldCompany.about,
            industry: oldCompany.industry,
            primarySector: oldCompany.primarySector,
            businessModel: oldCompany.businessModel,
            stage: oldCompany.stage,
            teamSize: oldCompany.teamSize,
            locations: oldCompany.locations,
            contactEmail: oldCompany.contactEmail,
            isVerified: oldCompany.isVerified || false,
            createdAt: oldCompany.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        companyBatch.set(newCompanyRef, newCompany);
        companyCount++;

        // Migrate employees subcollection to company_members
        const employeesSnapshot = await doc.ref.collection('employees').get();
        for (const empDoc of employeesSnapshot.docs) {
            const employee = empDoc.data();
            const newMemberRef = newCompanyMembersCollection.doc();
            memberBatch.set(newMemberRef, {
                userId: empDoc.id,
                companyId: newCompanyRef.id,
                role: employee.role,
                status: 'active',
                addedAt: employee.addedAt || admin.firestore.FieldValue.serverTimestamp(),
            });
            memberCount++;
        }

        if (companyCount % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} companies...`);
            await companyBatch.commit();
            companyBatch = firestore.batch();
        }
        if (memberCount > 0 && memberCount % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} company members...`);
            await memberBatch.commit();
            memberBatch = firestore.batch();
        }
    }

    if (companyCount % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${companyCount % BATCH_SIZE} companies...`);
        await companyBatch.commit();
    }
    if (memberCount > 0 && memberCount % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${memberCount % BATCH_SIZE} company members...`);
        await memberBatch.commit();
    }

    console.log(`Migrated ${companyCount} companies and ${memberCount} company members successfully.`);
};

const migrateInvestorProfiles = async () => {
    console.log('Migrating investor profiles...');
    const oldInvestorsSnapshot = await firestore.collection('investors').get();
    const newInvestorProfilesCollection = firestore.collection('new_investor_profiles');
    let batch = firestore.batch();
    let count = 0;

    for (const doc of oldInvestorsSnapshot.docs) {
        const oldInvestor = doc.data();
        if (!oldInvestor.userId) {
            console.warn(`Skipping investor document ${doc.id} due to missing userId.`);
            continue;
        }

        const newProfileRef = newInvestorProfilesCollection.doc(oldInvestor.userId);
        const newProfile = {
            investorType: oldInvestor.investorType,
            investmentType: oldInvestor.investmentType,
            chequeSize: oldInvestor.chequeSize,
            interestedSectors: oldInvestor.interestedSectors,
            isAccredited: oldInvestor.isVerified || false, // Mapping isVerified to isAccredited
            createdAt: oldInvestor.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.set(newProfileRef, newProfile, { merge: true });
        count++;

        if (count % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} investor profiles...`);
            await batch.commit();
            batch = firestore.batch();
        }
    }

    if (count % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${count % BATCH_SIZE} investor profiles...`);
        await batch.commit();
    }

    console.log(`Migrated ${count} investor profiles successfully.`);
};


const runMigration = async () => {
    console.log('Starting database migration. Data will be written to new collections prefixed with "new_".');

    await migrateUsers();
    await migrateCompaniesAndMembers();
    await migrateInvestorProfiles();

    console.log('----------------------------------------------------');
    console.log('Database migration script finished.');
    console.log('Please review the new collections and, if everything is correct,');
    console.log('you can manually delete the old collections and rename the new ones.');
    console.log('----------------------------------------------------');
};

runMigration().catch(console.error).finally(() => {
    // Manually exit to ensure the script terminates, as Firestore connections might keep it alive.
    process.exit(0);
});
