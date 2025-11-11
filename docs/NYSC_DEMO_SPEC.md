# NYSC Demo Specification

## Overview
The NYSC (National Youth Service Corps) demo showcases a complete credential lifecycle with multiple verification stages and credential issuance flows.

## Demo Flow Architecture

### Phase 1: Student Registration for NYSC
**Goal**: Graduating students register for NYSC by proving their academic credentials and providing additional registration details

**Prerequisites**:
- Student must have three credentials in their wallet:
  1. **Student Card Credential** (issued by School)
  2. **Statement of Result Credential** (issued by School)
  3. **Medical Fitness Certificate** (issued by Medical Center)

**Flow**:
1. Student visits NYSC Registration page
2. Scans QR code (NYSC_ORG_ID) to connect wallet
3. NYSC sends **one proof request** requesting attributes from all 3 credentials:
   - **Student Card attributes**: name, matric number, school name, programme, date of birth, gender
   - **Statement of Result attributes**: CGPA, degree classification, year of graduation, certificate number
   - **Medical Fitness Certificate attributes**: fitness declaration, examination date, medical center name, examining doctor
4. Student shares credentials from wallet (all 3 credentials in single proof response)
5. NYSC verifies the proofs cryptographically ✅
6. Student fills registration form with additional details:
   - Call-up number
   - Contact phone number
   - Contact address
   - Service personnel status (Yes/No) with type if applicable
   - Emergency contact (full name, phone number, relationship, address)
7. Student submits registration form
8. NYSC issues **Green Card Credential** to student's wallet with all registration data

**Green Card Attributes**:
- Full Name (from verified proof)
- Matric Number (from verified proof)
- School Name (from verified proof)
- Programme Completed (from verified proof)
- Graduation Year (from verified proof)
- Call-up Number (from registration form)
- Call-up Batch Number
- State of Deployment
- Green Card Number
- Issue Date
- Expiry Date
- Contact Phone (from registration form)
- Contact Address (from registration form)
- Is Service Personnel (from registration form)
- Service Personnel Type (from registration form, if applicable)
- Emergency Contact Name (from registration form)
- Emergency Contact Phone (from registration form)
- Emergency Contact Relationship (from registration form)
- Emergency Contact Address (from registration form)

---

### Phase 2: NYSC Camp Onboarding
**Goal**: Student presents Green Card at NYSC camp for verification and receives NYSC ID

**Prerequisites**:
- Student must have **Green Card Credential** in wallet (from Phase 1)

**Flow**:
1. Student visits NYSC Onboarding page (at camp)
2. Scans QR code to connect wallet
3. NYSC Camp requests proof of Green Card
4. Student shares Green Card from wallet
5. NYSC verifies the Green Card
6. If verified ✅ → NYSC issues **NYSC ID Card Credential**

**NYSC ID Card Attributes**:
- Full Name
- NYSC ID Number
- Call-up Number
- Batch
- State Code
- Place of Primary Assignment (PPA)
- Date of Posting
- Expected Date of Completion
- Photograph
- Issue Date

---

## Technical Implementation

### Environment Variables Required

```env
# School Organization (issues Student Card & Statement of Result)
SCHOOL_ORG_ID=<school-org-uuid>
SCHOOL_CLIENT_ID=<school-client-id>
SCHOOL_CLIENT_SECRET=<school-secret>

# NYSC Organization (verification & issuance)
NYSC_ORG_ID=<nysc-org-uuid>
NYSC_CLIENT_ID=<nysc-client-id>
NYSC_CLIENT_SECRET=<nysc-secret>

# Credential Definition IDs
NYSC_GREEN_CARD_CRED_DEF_ID=<cred-def-id>
NYSC_ID_CARD_CRED_DEF_ID=<cred-def-id>
STATEMENT_OF_RESULT_CRED_DEF_ID=<cred-def-id>
```

### Page Structure

```
/nysc (intro page - describes the demo)
├── /nysc/registration (Phase 1: Student registration)
│   ├── Connect wallet
│   ├── Request proof (Student Card + Statement of Result)
│   ├── Verify credentials
│   └── Issue Green Card
├── /nysc/registration/success (Green Card issued successfully)
├── /nysc/onboarding (Phase 2: Camp onboarding)
│   ├── Connect wallet
│   ├── Request proof (Green Card)
│   ├── Verify Green Card
│   └── Issue NYSC ID Card
└── /nysc/onboarding/success (NYSC ID issued successfully)
```

### API Endpoints Required

1. **POST /api/nysc/registration/create-proof-request**
   - Creates connection session for NYSC registration
   - Returns invitation URL and session ID

2. **POST /api/nysc/registration/request-credentials**
   - Sends proof request for Student Card + Statement of Results + Medical Fitness Certificate
   - Uses NYSC-specific proof configuration from `config/nysc-proof-attributes.json`
   - Returns proof request ID

3. **POST /api/nysc/registration/issue-green-card**
   - Accepts proof ID, session ID, and registration form data
   - Verifies submitted proofs from all 3 credentials
   - Issues Green Card credential with verified data + form data
   - Returns success/failure

4. **POST /api/nysc/onboarding/create-proof-request**
   - Creates proof request for Green Card
   - Returns invitation URL

5. **POST /api/nysc/onboarding/issue-id-card**
   - Verifies Green Card proof
   - Issues NYSC ID Card
   - Returns success/failure

---

## Demo User Journey

### Journey 1: Happy Path (Student Has All Credentials)

1. **Start**: Student has Student Card + Statement of Results + Medical Fitness Certificate in wallet
2. **Registration**:
   - Student scans QR code → connects wallet
   - Shares credentials from all 3 credentials in one proof response
   - Fills registration form with call-up number, contact details, and emergency contact
   - Submits form → receives Green Card with all registration data
3. **Onboarding**:
   - Student scans QR → shares Green Card → receives NYSC ID
4. **End**: Student has NYSC ID for service year

### Journey 2: Incomplete Credentials

1. **Start**: Student doesn't have one or more required credentials (Student Card, Statement of Results, or Medical Fitness Certificate)
2. **Registration**:
   - Student scans QR → proof request fails (missing credentials)
   - Show error: "You need Student Card, Statement of Results, and Medical Fitness Certificate"
   - Links provided to:
     - School demo to get Student Card and Statement of Results
     - Medical center demo to get Medical Fitness Certificate
3. **Redirect**: Student goes to respective demos, gets missing credentials
4. **Return**: Student completes registration with all credentials and form submission

---

## Key Learning Points

This demo teaches users about:
1. **Multi-step verification workflows** - credentials unlock access to new credentials
2. **Proof requests with multiple credentials** - requesting data from different sources
3. **Credential chaining** - one credential is prerequisite for another
4. **Real-world government use case** - realistic NYSC registration process
5. **Privacy preservation** - school doesn't know about NYSC registration
6. **Selective disclosure** - only share required attributes, not entire credential

---

## Implementation Status

### Phase 1: NYSC Registration
- [x] Environment variables added to .env
- [x] NYSC proof attributes configuration (`config/nysc-proof-attributes.json`)
- [x] NYSC-specific proof config library (`src/lib/nysc-proof-config.ts`)
- [x] Enhanced proof-config.ts to support custom config files
- [x] Enhanced proof-service.ts to accept custom attributes
- [x] Connection session API (`/api/nysc/registration/create-proof-request`)
- [x] Multi-credential proof request API (`/api/nysc/registration/request-credentials`)
- [x] Registration page UI with form
- [x] Green Card issuance API with form data handling
- [ ] NYSC intro page updated
- [ ] Error handling for missing credentials on frontend

### Phase 2: NYSC Onboarding
- [ ] Onboarding page (Phase 2)
- [ ] NYSC ID Card issuance API
- [ ] Success pages with educational content

---

## Next Steps

1. **Replace placeholders** in .env with actual organization IDs
2. **Create credential definitions** for Green Card and NYSC ID on ConfirmD Platform
3. **Implement registration page** with proof request flow
4. **Implement onboarding page** with Green Card verification
5. **Update NYSC intro page** to explain the two-phase flow
6. **Add demo to landing page** as "active" demo
