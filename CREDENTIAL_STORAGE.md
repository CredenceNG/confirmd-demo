# Credential Attributes Storage Locations

This document explains where credential attributes are defined and stored throughout the ConfirmD demo application.

---

## Storage Locations Overview

Credential attributes are stored in **3 main locations**:

1. **Environment Variables** (`.env`) - Schema IDs and Credential Definition IDs
2. **Issuance API Routes** (`src/app/api/*/issue/route.ts`) - Attribute definitions for credential creation
3. **Proof Request Config Files** (`config/*-proof-attributes.json`) - Attributes for verification

---

## 1. Environment Variables (`.env`)

**Location:** `/Users/itopa/projects/_confirmd/confirmd-demo/.env`

### Purpose
Stores Schema IDs and Credential Definition IDs that reference the credential schemas on the ConfirmD Platform/blockchain.

### Structure

```bash
# Credential Schema IDs (define the structure)
STUDENT_CARD_SCHEMA_ID=your-student-card-schema-id
STATEMENT_OF_RESULT_SCHEMA_ID=your-statement-of-result-schema-id
MEDICAL_FITNESS_SCHEMA_ID=your-medical-fitness-schema-id
EKYC_SCHEMA_ID=GRGDLMFpSpRSnwUTgW55Mf:2:EKYC:0.1
NYSC_GREEN_CARD_SCHEMA_ID=your-nysc-green-card-schema-id
NYSC_CERTIFICATE_SCHEMA_ID=your-nysc-certificate-schema-id

# Credential Definition IDs (link schemas to issuers)
ISSUE_CRED_DEF_ID=your-default-cred-def-id
STUDENT_CARD_CRED_DEF_ID=your-student-card-cred-def-id
STATEMENT_OF_RESULT_CRED_DEF_ID=your-statement-of-result-cred-def-id
MEDICAL_FITNESS_CRED_DEF_ID=your-medical-fitness-cred-def-id
EKYC_CRED_DEF_ID=NxbvVcdwR5a2oyiYa6UbPP:3:CL:2981071:E-KYC Credential
NYSC_GREEN_CARD_CRED_DEF_ID=your-nysc-green-card-cred-def-id
NYSC_ID_CARD_CRED_DEF_ID=your-nysc-id-card-cred-def-id
NYSC_CERTIFICATE_CRED_DEF_ID=your-nysc-certificate-cred-def-id
```

### What These IDs Mean

- **Schema ID**: A unique identifier for the credential schema (blueprint) on the blockchain
  - Format: `{DID}:2:{SchemaName}:{Version}`
  - Example: `GRGDLMFpSpRSnwUTgW55Mf:2:EKYC:0.1`
  - Defines: Attribute names and types

- **Credential Definition ID**: Links a schema to a specific issuer organization
  - Format: `{DID}:3:CL:{SchemaSeqNo}:{Tag}`
  - Example: `NxbvVcdwR5a2oyiYa6UbPP:3:CL:2981071:E-KYC Credential`
  - Defines: Who can issue this credential type

---

## 2. Issuance API Routes

**Location:** `src/app/api/*/issue/route.ts`

### Purpose
Define the **actual attribute values** that get issued in credentials. These are the runtime implementations.

### Files

| Credential Type | File Path |
|----------------|-----------|
| Student Card | [src/app/api/student-card/issue/route.ts](src/app/api/student-card/issue/route.ts) |
| Statement of Results | [src/app/api/statement-of-results/issue/route.ts](src/app/api/statement-of-results/issue/route.ts) |
| Medical Fitness | [src/app/api/medical-fitness/issue/route.ts](src/app/api/medical-fitness/issue/route.ts) |
| NYSC Green Card | [src/app/api/nysc/registration/issue-green-card/route.ts](src/app/api/nysc/registration/issue-green-card/route.ts) |
| NYSC ID Card | [src/app/api/nysc/onboarding/issue-id-card/route.ts](src/app/api/nysc/onboarding/issue-id-card/route.ts) |
| NYSC Certificate | [src/app/api/nysc/certificate/issue/route.ts](src/app/api/nysc/certificate/issue/route.ts) |
| eKYC | [src/app/api/finance/ekyc/issue/route.ts](src/app/api/finance/ekyc/issue/route.ts) |

### Example Structure

```typescript
// Student Card issuance (src/app/api/student-card/issue/route.ts)
const payload = {
  credentialOffer: [
    {
      emailId: email,
      attributes: [
        {
          value: "ADM/2020/0001",
          name: "admission_number",
          isRequired: true,
        },
        {
          value: "Computer Science",
          name: "programme",
          isRequired: true,
        },
        {
          value: "2024",
          name: "graduation_year",
          isRequired: true,
        },
        // ... 13 more attributes
      ],
    },
  ],
  credentialDefinitionId: process.env.ISSUE_CRED_DEF_ID,
  isReuseConnection: true,
};
```

### Key Points

- **Attributes MUST match the schema** defined on the blockchain
- **Order may matter** depending on the schema definition
- **All values are strings** (even numbers and dates)
- **Default values** are provided for missing/null fields using `ensureValue()` helper

---

## 3. Proof Request Configuration Files

**Location:** `config/*-proof-attributes.json`

### Purpose
Define which attributes to **request during verification**. These are used when asking holders to prove their credentials.

### Files

| Config File | Used By | Credentials Requested |
|-------------|---------|----------------------|
| [proof-attributes.json](config/proof-attributes.json) | Course Registration | Student Card (9 attributes) |
| [nysc-proof-attributes.json](config/nysc-proof-attributes.json) | NYSC Registration | Student Card, Statement of Results, Medical Fitness (19 attributes) |
| [green-card-proof-attributes.json](config/green-card-proof-attributes.json) | NYSC Onboarding | NYSC Green Card |
| [onboarding-ekyc-proof-attributes.json](config/onboarding-ekyc-proof-attributes.json) | Finance Onboarding | eKYC (8 attributes) |
| [professional-proof-attributes.json](config/professional-proof-attributes.json) | Professional Licensing | Student Card, Statement of Results |
| [course-registration-proof-attributes.json](config/course-registration-proof-attributes.json) | Course Registration | Student Card |
| [comprehensive-onboarding-proof-attributes.json](config/comprehensive-onboarding-proof-attributes.json) | NYSC Onboarding (alternative) | All 4 credentials |

### Example Structure

```json
// proof-attributes.json (Course Registration)
[
  {
    "name": "surname",
    "description": "Student's surname/family name",
    "credential": "Student Card"
  },
  {
    "name": "matric_number",
    "description": "Matriculation number",
    "credential": "Student Card"
  },
  {
    "name": "programme",
    "description": "Academic programme/course of study",
    "credential": "Student Card"
  }
  // ... 6 more attributes
]
```

### With Schema/CredDef IDs

```json
// onboarding-ekyc-proof-attributes.json (Finance Onboarding)
[
  {
    "name": "full_name",
    "schemaId": "GRGDLMFpSpRSnwUTgW55Mf:2:EKYC:0.1",
    "credDefId": "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2981071:E-KYC Credential"
  },
  {
    "name": "national_id_number",
    "schemaId": "GRGDLMFpSpRSnwUTgW55Mf:2:EKYC:0.1",
    "credDefId": "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2981071:E-KYC Credential"
  }
  // ... 6 more attributes
]
```

### Key Points

- **Credential field** references the credential type (mapped to schema/credDef in code)
- **Optional schemaId/credDefId** can be specified for exact matching
- **Description** is for documentation only (not sent to platform)
- **Used by** `buildProofAttributeRequests()` in [src/lib/proof-config.ts](src/lib/proof-config.ts)

---

## How They Work Together

### Credential Issuance Flow

```
1. User fills form → Frontend sends data to API
2. API route (e.g., /api/student-card/issue)
   ├─ Gets credentialDefinitionId from .env
   ├─ Builds attributes array with values
   └─ Sends to ConfirmD Platform API
3. ConfirmD validates against schema on blockchain
4. Issues credential to holder's wallet via email/connection
```

### Proof Request Flow

```
1. User clicks verification button
2. Frontend calls API (e.g., /api/education/course-registration/request-proof)
3. API loads proof-attributes.json config
4. buildProofAttributeRequests() function:
   ├─ Reads credential type (e.g., "Student Card")
   ├─ Maps to STUDENT_CARD_SCHEMA_ID and STUDENT_CARD_CRED_DEF_ID from .env
   └─ Builds proof request with those restrictions
5. Sends proof request to ConfirmD Platform
6. Platform sends to holder's wallet
7. Holder selects matching credential and shares
8. Verifier receives and validates proof
```

---

## Adding a New Credential

To add a new credential type to the demo:

### Step 1: Create Schema on ConfirmD Platform
1. Log into ConfirmD Platform
2. Create new schema with attribute names
3. Note the Schema ID (e.g., `ABC123...`)

### Step 2: Create Credential Definition
1. Create credential definition from schema
2. Note the Credential Definition ID (e.g., `XYZ789...`)

### Step 3: Add to Environment Variables
```bash
# .env
NEW_CREDENTIAL_SCHEMA_ID=ABC123...
NEW_CREDENTIAL_CRED_DEF_ID=XYZ789...
```

### Step 4: Create Issuance API Route
```typescript
// src/app/api/new-credential/issue/route.ts
export async function POST(request: NextRequest) {
  const credentialDefinitionId = process.env.NEW_CREDENTIAL_CRED_DEF_ID;

  const payload = {
    credentialOffer: [{
      emailId: email,
      attributes: [
        { name: "attribute_1", value: "value1", isRequired: true },
        { name: "attribute_2", value: "value2", isRequired: true },
        // ... all schema attributes
      ]
    }],
    credentialDefinitionId,
    isReuseConnection: true,
  };

  // Send to ConfirmD Platform...
}
```

### Step 5: Create Proof Request Config (Optional)
```json
// config/new-credential-proof-attributes.json
[
  {
    "name": "attribute_1",
    "description": "Description of attribute 1",
    "credential": "New Credential"
  }
]
```

### Step 6: Update Proof Config Mapping
```typescript
// src/lib/proof-config.ts - Add to credential mapping
const credentialSchemaMap: Record<string, CredentialInfo> = {
  "New Credential": {
    schemaId: process.env.NEW_CREDENTIAL_SCHEMA_ID!,
    credDefId: process.env.NEW_CREDENTIAL_CRED_DEF_ID!,
  },
  // ... existing credentials
};
```

---

## Important Notes

### Attribute Order
- Some schemas require attributes in a specific order
- Check your schema definition on ConfirmD Platform
- The order in the issuance route MUST match the schema

### Attribute Types
- All attributes are sent as **strings**
- Dates should be formatted consistently (ISO 8601 recommended)
- Numbers should be converted to strings
- Booleans should be "true"/"false" or "Yes"/"No"

### Default Values
- Use the `ensureValue()` helper to provide defaults
- Prevents null/undefined errors
- Example: `ensureValue(nin, "00000000000")`

### Validation
- ConfirmD Platform validates against the blockchain schema
- Mismatched attributes will cause issuance to fail
- Missing required attributes will be rejected

---

## Database Storage

Credential data is also stored in the database for application logic:

### Prisma Models

```prisma
// Student data
model Student {
  id          String   @id @default(uuid())
  fullName    String
  matricNumber String
  // ... other fields
}

// NYSC Registration
model NYSCRegistration {
  id              String   @id @default(uuid())
  nationalIdNumber String
  surname         String
  othernames      String
  // ... credential attributes
  proofData       String?  // JSON of verified proof data
}
```

**Note:** Database storage is separate from credentials. The database stores:
- Application state
- User selections
- Proof verification results
- **NOT the actual credentials** (those are in user wallets)

---

## Summary

| Storage Type | Purpose | Format | Examples |
|--------------|---------|--------|----------|
| **Environment Variables** | Schema/CredDef IDs | Key-Value | `STUDENT_CARD_CRED_DEF_ID=ABC...` |
| **Issuance Routes** | Runtime attribute values | TypeScript/JSON | `{name: "surname", value: "Johnson"}` |
| **Proof Config Files** | Verification requirements | JSON Arrays | `[{name: "surname", credential: "Student Card"}]` |
| **Database** | Application data | Prisma Models | Student, NYSCRegistration tables |

All three work together to enable the complete credential lifecycle: **Issue → Store → Verify**.
