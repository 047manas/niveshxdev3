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
const firestore = firebase_admin_1.default.firestore();
// Set a batch size for Firestore writes to avoid memory issues.
const BATCH_SIZE = 250;
const migrateUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Migrating users...');
    const oldUsersSnapshot = yield firestore.collection('users').get();
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
            createdAt: oldUser.createdAt || firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        };
        const newUserRef = newUsersCollection.doc(userId);
        batch.set(newUserRef, newUser, { merge: true });
        count++;
        if (count % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} users...`);
            yield batch.commit();
            batch = firestore.batch();
        }
    }
    if (count % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${count % BATCH_SIZE} users...`);
        yield batch.commit();
    }
    console.log(`Migrated ${count} users successfully.`);
});
const migrateCompaniesAndMembers = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Migrating companies and company members...');
    const oldCompaniesSnapshot = yield firestore.collection('companies').get();
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
            createdAt: oldCompany.createdAt || firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        };
        companyBatch.set(newCompanyRef, newCompany);
        companyCount++;
        // Migrate employees subcollection to company_members
        const employeesSnapshot = yield doc.ref.collection('employees').get();
        for (const empDoc of employeesSnapshot.docs) {
            const employee = empDoc.data();
            const newMemberRef = newCompanyMembersCollection.doc();
            memberBatch.set(newMemberRef, {
                userId: empDoc.id,
                companyId: newCompanyRef.id,
                role: employee.role,
                status: 'active',
                addedAt: employee.addedAt || firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            });
            memberCount++;
        }
        if (companyCount % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} companies...`);
            yield companyBatch.commit();
            companyBatch = firestore.batch();
        }
        if (memberCount > 0 && memberCount % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} company members...`);
            yield memberBatch.commit();
            memberBatch = firestore.batch();
        }
    }
    if (companyCount % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${companyCount % BATCH_SIZE} companies...`);
        yield companyBatch.commit();
    }
    if (memberCount > 0 && memberCount % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${memberCount % BATCH_SIZE} company members...`);
        yield memberBatch.commit();
    }
    console.log(`Migrated ${companyCount} companies and ${memberCount} company members successfully.`);
});
const migrateInvestorProfiles = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Migrating investor profiles...');
    const oldInvestorsSnapshot = yield firestore.collection('investors').get();
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
            createdAt: oldInvestor.createdAt || firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
        };
        batch.set(newProfileRef, newProfile, { merge: true });
        count++;
        if (count % BATCH_SIZE === 0) {
            console.log(`Committing batch of ${BATCH_SIZE} investor profiles...`);
            yield batch.commit();
            batch = firestore.batch();
        }
    }
    if (count % BATCH_SIZE !== 0) {
        console.log(`Committing final batch of ${count % BATCH_SIZE} investor profiles...`);
        yield batch.commit();
    }
    console.log(`Migrated ${count} investor profiles successfully.`);
});
const runMigration = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting database migration. Data will be written to new collections prefixed with "new_".');
    yield migrateUsers();
    yield migrateCompaniesAndMembers();
    yield migrateInvestorProfiles();
    console.log('----------------------------------------------------');
    console.log('Database migration script finished.');
    console.log('Please review the new collections and, if everything is correct,');
    console.log('you can manually delete the old collections and rename the new ones.');
    console.log('----------------------------------------------------');
});
runMigration().catch(console.error).finally(() => {
    // Manually exit to ensure the script terminates, as Firestore connections might keep it alive.
    process.exit(0);
});
