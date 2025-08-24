# NiveshX Firestore Database Schema

This document outlines the Google Firebase Firestore database structure for the NiveshX platform, designed to support a multi-step, conditional onboarding flow.

## 1. `pending_users` Collection

**Purpose:** This collection temporarily stores data for users who have started the registration process but have not yet completed all verification steps. Documents in this collection are expected to be short-lived.

**Document ID:** User's Email Address (e.g., `user@company.com`)

### Fields
-   `email`: (String) The user's login email.
-   `password`: (String) The user's hashed password.
-   `firstName`: (String) The user's first name.
-   `lastName`: (String) The user's last name.
-   `designation`: (String) The user's stated role (e.g., "Co-founder", "CEO").
-   `linkedinProfile`: (String) The URL for the user's LinkedIn profile.
-   `userOtp`: (String) The OTP sent to the user's email for verification.
-   `userOtpExpires`: (Timestamp) The expiry time for the user's OTP.
-   `emailVerificationStatus`: (String) The status of the user's email verification. Can be `'pending'` or `'verified'`.
-   `createdAt`: (Timestamp) The timestamp when the pending user entry was created.

### Sample Document
```json
{
  "email": "rohan.sharma@example.com",
  "password": "hashed_password_string",
  "firstName": "Rohan",
  "lastName": "Sharma",
  "designation": "CEO",
  "linkedinProfile": "https://linkedin.com/in/rohan",
  "userOtp": "123456",
  "userOtpExpires": "2024-08-22T10:10:00Z",
  "emailVerificationStatus": "pending",
  "createdAt": "2024-08-22T10:00:00Z"
}
```

---

## 2. `users` Collection

**Purpose:** This is the main collection for all fully registered and verified users. It stores common profile and authentication data.

**Document ID:** Unique User ID from Firebase Auth (e.g., `auth.uid`)

### Fields
-   `email`: (String) The user's login email.
-   `firstName`: (String) The user's first name.
-   `lastName`: (String) The user's last name.
-   `phone`: (Map, Optional) An object to store the phone number, primarily for investors.
    -   `countryCode`: (String) e.g., "+91"
    -   `number`: (String) e.g., "9876543210"
-   `userType`: (String) Critical field for role-based access. Must be either `"Company"` or `"Investor"`.
-   `companyId`: (String, Optional) A reference to the document ID from the `companies` collection. This is mandatory if `userType` is `"Company"`.
-   `createdAt`: (Timestamp) The timestamp when the user account was finalized.

### Sample Document (Company User)
```json
{
  "email": "rohan.sharma@example.com",
  "firstName": "Rohan",
  "lastName": "Sharma",
  "userType": "Company",
  "companyId": "company_id_abc",
  "createdAt": "2024-08-22T10:30:00Z"
}
```

---

## 3. `companies` Collection

**Purpose:** This collection stores all data specific to a company entity.

**Document ID:** Unique Company ID (auto-generated)

### Fields
-   `name`: (String) The legal name of the company.
-   `website`: (String) The company's official website URL.
-   `linkedin`: (String, Optional) The company's LinkedIn profile URL.
-   `oneLiner`: (String) A short, one-liner pitch for the company.
-   `about`: (String) A detailed description of the company.
-   `industry`: (Array of Strings) A list of industries the company operates in.
-   `primarySector`: (String) The primary sector of the company (e.g., "Fintech").
-   `businessModel`: (String) The company's primary business model (e.g., "B2B").
-   `stage`: (String) The current funding stage (e.g., "Pre-Seed", "Seed").
-   `teamSize`: (Number) The number of employees in the company.
-   `locations`: (Array of Strings) A list of company locations.
-   `contactEmail`: (String) The official contact email for the company.
-   `contactPhone`: (Map) The official contact phone for the company.
-   `funding`: (Map) Information about the company's funding history.
-   `isVerified`: (Boolean) `true` if the company's contact email has been verified, otherwise `false`.
-   `createdBy`: (String) A reference to the creating user's ID (`auth.uid`) in the `users` collection.
-   `createdAt`: (Timestamp) The timestamp when the company was registered.

### Subcollections
-   **`employees` Subcollection:**
    -   **Purpose:** Links multiple users from the `users` collection to this company.
    -   **Document ID:** User ID (`auth.uid`) of the employee.
    -   **Fields:**
        -   `role`: (String) The user's role at the company (e.g., "Founder", "CXO", "HR", "Other").
        -   `addedAt`: (Timestamp) When the user was added to the company.

### Sample Document
```json
{
  "name": "Innovatech Solutions Pvt. Ltd.",
  "website": "https://innovatech.com",
  "linkedin": "https://linkedin.com/company/innovatech",
  "oneLiner": "AI-powered solutions for modern businesses.",
  "about": "We provide cutting-edge AI tools...",
  "industry": ["Technology", "AI"],
  "primarySector": "SaaS",
  "businessModel": "B2B",
  "stage": "Seed",
  "teamSize": 25,
  "locations": ["Mumbai", "Bangalore"],
  "contactEmail": "contact@innovatech.com",
  "contactPhone": { "countryCode": "+91", "number": "1234567890" },
  "funding": { "hasRaised": true, "totalRaised": 500000, "currency": "USD" },
  "isVerified": false,
  "createdBy": "auth_user_id_123",
  "createdAt": "2024-08-22T10:35:00Z"
}

// Sample document in the 'employees' subcollection at:
// companies/company_id_abc/employees/auth_user_id_123
{
  "role": "Founder",
  "addedAt": "2024-08-22T10:35:00Z"
}
```

---

## 4. `investors` Collection

**Purpose:** When a user's `userType` is "Investor", a corresponding profile document is created here. This schema remains unchanged from the previous version.

**Document ID:** Unique Investor Profile ID (auto-generated)

### Fields
-   `userId`: (String) A reference to the document ID from the `users` collection.
-   `investorType`: (String) The type of investor (e.g., "Angel", "VC").
-   `investmentType`: (Array of Strings) e.g., ["Equity investments", "Debt financing"].
-   `linkedinProfile`: (String) The URL to their LinkedIn profile.
-   `chequeSize`: (String) The range of their typical investment size.
-   `interestedSectors`: (Array of Strings) The industries they are interested in.
-   `isVerified`: (Boolean) A flag for accredited status, defaulting to `false`.
-   `createdAt`: (Timestamp) The timestamp when the investor profile was created.
