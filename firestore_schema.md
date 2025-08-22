# NiveshX Firestore Database Schema

This document outlines the Google Firebase Firestore database structure for the NiveshX platform's Minimum Viable Product (MVP).

## 1. `users` Collection

**Purpose:** This collection is the single source of truth for every person who signs up. It stores common profile and authentication data for all users, regardless of their type.

**Document ID:** Unique User ID (e.g., `auth.uid`)

### Fields

-   `email`: (String) The user's login email.
-   `firstName`: (String) The user's first name.
-   `lastName`: (String) The user's last name.
-   `phone`: (Map) An object to store the phone number.
    -   `countryCode`: (String) e.g., "+91"
    -   `number`: (String) e.g., "9876543210"
-   `userType`: (String) Critical field acting as a role. Must be either "Company" or "Investor".
-   `createdAt`: (Timestamp) The timestamp when the user account was created.

### Sample Document

```json
{
  "email": "rohan.sharma@example.com",
  "firstName": "Rohan",
  "lastName": "Sharma",
  "phone": {
    "countryCode": "+91",
    "number": "9876543210"
  },
  "userType": "Company",
  "createdAt": "2024-08-21T10:00:00Z"
}
```

---

## 2. Structure for 'Company' Users

When a user's `userType` is "Company", their data is stored across two additional collections: `companies` and `teamMembers`.

### a) `companies` Collection

**Purpose:** This collection stores data that belongs specifically to the company entity.

**Document ID:** Unique Company ID (auto-generated)

#### Fields

-   `name`: (String) The legal name of the company.
-   `website`: (String) The company's official website URL.
-   `linkedin`: (String, Optional) The company's LinkedIn profile URL.
-   `oneLiner`: (String) A short, one-liner pitch for the company.
-   `about`: (String) A detailed description of the company.
-   `culture`: (String, Optional) A description of the company's culture.
-   `industry`: (Array of Strings) A list of industries the company operates in.
-   `primarySector`: (String) The primary sector of the company (e.g., "Fintech").
-   `businessModel`: (String) The company's primary business model (e.g., "B2B").
-   `stage`: (String) The current funding stage (e.g., "Pre-Seed", "Seed").
-   `teamSize`: (Number) The number of employees in the company.
-   `locations`: (String) Comma-separated list of company locations.
-   `contactEmail`: (String) The official contact email for the company.
-   `contactPhone`: (Map) The official contact phone for the company.
    -   `countryCode`: (String) e.g., "+91"
    -   `number`: (String) e.g., "9876543210"
-   `funding`: (Map) Information about the company's funding history.
    -   `hasRaised`: (Boolean) Whether the company has raised external funding.
    -   `totalRaised`: (Number, Optional) The total amount of funding raised.
    -   `currency`: (String, Optional) The currency of the funding (e.g., "USD").
    -   `rounds`: (Number, Optional) The number of funding rounds.
    -   `latestRound`: (String, Optional) The name of the latest funding round.
-   `userId`: (String) A reference to the creating user's ID in the `users` collection.
-   `createdAt`: (Timestamp) The timestamp when the company was registered.

#### Sample Document

```json
{
  "name": "Innovatech Solutions Pvt. Ltd.",
  "website": "https://innovatech.com",
  "linkedin": "https://linkedin.com/company/innovatech",
  "oneLiner": "AI-powered solutions for modern businesses.",
  "about": "We provide cutting-edge AI tools to optimize...",
  "culture": "A culture of innovation and collaboration.",
  "industry": ["Technology", "AI"],
  "primarySector": "SaaS",
  "businessModel": "B2B",
  "stage": "Seed",
  "teamSize": 25,
  "locations": "Mumbai, Bangalore",
  "contactEmail": "contact@innovatech.com",
  "contactPhone": { "countryCode": "+91", "number": "1234567890" },
  "funding": {
    "hasRaised": true,
    "totalRaised": 500000,
    "currency": "USD",
    "rounds": 2,
    "latestRound": "Seed"
  },
  "userId": "auth_user_id_123",
  "createdAt": "2024-08-21T10:05:00Z"
}
```

### b) `teamMembers` Collection

**Purpose:** This is a linking collection that creates a many-to-many relationship between `users` and `companies`.

**Document ID:** Unique Team Member ID (auto-generated)

#### Fields

-   `userId`: (String) A reference to the document ID from the `users` collection.
-   `companyId`: (String) A reference to the document ID from the `companies` collection.
-   `role`: (String) The user's role at the company (e.g., "Founder", "CEO").

#### Sample Document

```json
{
  "userId": "auth_user_id_123",
  "companyId": "company_id_abc",
  "role": "Founder"
}
```

---

## 3. `investors` Collection

**Purpose:** When a user's `userType` is "Investor", a corresponding profile document is created in this collection to store investor-specific data.

**Document ID:** Unique Investor Profile ID (auto-generated)

### Fields

-   `userId`: (String) A reference to the document ID from the `users` collection, linking this profile to a specific user.
-   `investorType`: (String) The type of investor (e.g., "Angel", "VC", "Family Office").
-   `investmentType`: (Array of Strings) The type of investments they make (e.g., ["Equity investments", "Debt financing"]).
-   `linkedinProfile`: (String) The URL to their LinkedIn profile.
-   `chequeSize`: (String) The range of their typical investment size (e.g., "25L-1Cr").
-   `interestedSectors`: (String or Array) The industries they are interested in.
-   `isVerified`: (Boolean) A flag to mark if their accredited status has been verified, defaulting to `false`.
-   `createdAt`: (Timestamp) The timestamp when the investor profile was created.

### Sample Document

```json
{
  "userId": "auth_user_id_456",
  "investorType": "Angel",
  "linkedinProfile": "https://www.linkedin.com/in/investor-jane-doe/",
  "chequeSize": "25L-1Cr",
  "interestedSectors": ["FinTech", "SaaS", "HealthTech"],
  "isVerified": false,
  "createdAt": "2024-08-21T11:00:00Z"
}
```
