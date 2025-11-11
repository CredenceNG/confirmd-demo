# Claude Code Development Guide

This document contains important architectural decisions and patterns used in this project. It serves as a reference for Claude Code and developers working on this codebase.

## Table of Contents

- [Authentication Architecture](#authentication-architecture)
- [Proof Request Configuration (UNIFIED SYSTEM)](#proof-request-configuration-unified-system)
- [Credential Issuance Patterns](#credential-issuance-patterns)
- [Error Handling Standards](#error-handling-standards)
- [API Endpoint Conventions](#api-endpoint-conventions)

---

## Authentication Architecture

### JWT-Based Authentication (OAuth2 Client Credentials)

**All demos and API endpoints use JWT-based authentication** via the centralized authentication module.

#### Core Module: `src/lib/api/confirmd-auth.ts`

```typescript
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
```

**Key Functions:**
- `getAccessToken()` - Returns a valid JWT token (cached or fetches new)
- `fetchAccessToken()` - Fetches new OAuth2 token from ConfirmD Platform
- `invalidateToken()` - Clears cached token (useful for testing/recovery)

**Authentication Flow:**
1. Check if cached token is valid (with expiry buffer)
2. If valid, return cached token
3. If expired, fetch new token using OAuth2 client credentials flow
4. Cache token with expiration time
5. Return token for API requests

#### Configuration

All authentication credentials are stored in environment variables:

```bash
# ConfirmD Platform OAuth2 Credentials
CONFIRMD_ORG_ID=your-org-id
CONFIRMD_CLIENT_ID=your-client-id
CONFIRMD_CLIENT_SECRET=your-client-secret
CONFIRMD_AUTH_URL=https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token
CONFIRMD_BASE_URL=https://platform.confamd.com
```

These are accessed via `API_CONFIG` constants in `src/lib/api/constants.ts`.

---

## Proof Request Configuration

### Unified System

All demos use `src/lib/proof-config.ts` for proof requests.

```typescript
import { buildProofAttributeRequests } from "@/lib/proof-config";

const attributes = buildProofAttributeRequests(); // Uses config/proof-attributes.json
const attributes = buildProofAttributeRequests("nysc-proof-attributes.json"); // Custom config
```

### Config File Format

Use `"credential"` field to reference credential types in JSON config files:

```json
[
  {"name": "surname", "credential": "Student Card"},
  {"name": "class_of_degree", "credential": "Statement of Results"}
]
```

**Supported credential types:**
- `"Student Card"` - Maps to `STUDENT_CARD_SCHEMA_ID` and `STUDENT_CARD_CRED_DEF_ID`
- `"Statement of Results"` - Maps to `STATEMENT_OF_RESULT_SCHEMA_ID` and `STATEMENT_OF_RESULT_CRED_DEF_ID`
- `"Medical Fitness Certificate"` - Maps to `MEDICAL_FITNESS_SCHEMA_ID` and `MEDICAL_FITNESS_CRED_DEF_ID`
- `"NYSC Green Card"` - Maps to `NYSC_GREEN_CARD_SCHEMA_ID` and `NYSC_GREEN_CARD_CRED_DEF_ID`

---

## Credential Issuance Patterns

### Standard Pattern for Credential Issuance APIs

All credential issuance endpoints follow this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const { email, phoneNumber, fullName, /* other fields */ } = body;

    if (!email || !phoneNumber || !fullName) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Email, phone number, and full name are required",
        },
        { status: 400 }
      );
    }

    // 2. Get JWT access token
    let token;
    try {
      token = await getAccessToken();
    } catch (authError: any) {
      console.error("[API] Authentication failed:", authError);
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Unable to authenticate with ConfirmD Platform",
          details: authError.error_description || authError.message,
        },
        { status: 401 }
      );
    }

    const orgId = API_CONFIG.ORG_ID;

    // 3. Get credential definition ID with fallback
    const credentialDefinitionId =
      process.env.SPECIFIC_CRED_DEF_ID ||
      process.env.ISSUE_CRED_DEF_ID ||
      "default-cred-def-id";

    // 4. Prepare credential payload
    const payload = {
      credentialOffer: [
        {
          emailId: email,
          attributes: [
            { value: fullName, name: "full_name", isRequired: true },
            // ... other attributes
          ],
        },
      ],
      credentialDefinitionId,
      isReuseConnection: true,
    };

    // 5. Issue credential via ConfirmD Platform
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 6. Return success response
    return NextResponse.json({
      success: true,
      message: "Credential issued successfully",
      data: response.data,
    });

  } catch (error: any) {
    // Comprehensive error handling
    console.error("[API] Error:", error);

    return NextResponse.json(
      {
        error: "Issuance failed",
        message: error.message || "Failed to issue credential",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
```

### Active Credential Issuance Endpoints

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/api/student-card/issue` | Issue Student Card credentials | ✅ Active |
| `/api/statement-of-results/issue` | Issue Statement of Results (academic transcripts) | ✅ Active |
| `/api/medical-fitness/issue` | Issue Medical Fitness Certificates | ✅ Active |
| `/api/nysc/registration/issue-green-card` | Issue NYSC Green Card after verification (Phase 1) | ✅ Active |
| `/api/nysc/onboarding/issue-id-card` | Issue NYSC ID Card after onboarding (Phase 2) | ✅ Active |
| `/api/nysc/certificate/issue` | Issue NYSC Certificate of National Service (Phase 4) | ✅ Active |

All endpoints:
- Use `getAccessToken()` for JWT authentication
- Use `API_CONFIG.BASE_URL` for API URL
- Follow the standard error handling pattern
- Return consistent response formats

---

## Error Handling Standards

### Frontend Error Handling Pattern

All issuing pages (the processing/issuing flow) follow this error handling pattern:

```typescript
useEffect(() => {
  const issueCredential = async () => {
    try {
      // 1. Validate URL parameters
      const studentData = searchParams.get("data");
      if (!studentData) {
        setError("No student data provided. Please go back and fill out the form.");
        updateStepStatus("authenticate", "error", "Missing student data");
        return;
      }

      // 2. Parse data safely
      let data;
      try {
        data = JSON.parse(decodeURIComponent(studentData));
      } catch (parseError) {
        console.error("Failed to parse student data:", parseError);
        setError("Invalid student data format. Please try again.");
        updateStepStatus("authenticate", "error", "Invalid data format");
        return;
      }

      // 3. Make API request with network error handling
      let response;
      let result;

      try {
        response = await fetch("/api/credential/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        result = await response.json();
      } catch (fetchError: any) {
        console.error("Network error:", fetchError);
        updateStepStatus("issue", "error", "Network error - unable to connect to server");
        setError("Network error: Unable to connect to the server. Please check your connection and try again.");
        return;
      }

      // 4. Handle API errors with specific error types
      if (!response.ok) {
        if (result.error === "Configuration Error") {
          setIsConfigError(true);
          updateStepStatus("issue", "error", "Configuration required - see instructions below");
        } else if (result.error === "Authentication failed") {
          updateStepStatus("issue", "error", "Failed to authenticate with ConfirmD Platform");
        } else {
          updateStepStatus("issue", "error", result.message || "Failed to issue credential");
        }

        const errorMessage = result.message || result.error || "Failed to issue credential";
        console.error("API Error:", {
          status: response.status,
          error: result.error,
          message: result.message,
          details: result.details,
        });

        setError(errorMessage);
        return;
      }

      // 5. Success flow continues...

    } catch (err: any) {
      console.error("Unexpected error:", err);
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);

      const issueStep = steps.find(s => s.id === "issue");
      if (issueStep && issueStep.status !== "error") {
        updateStepStatus("issue", "error", errorMessage);
      }
    }
  };

  issueCredential();
}, []);
```

### Error Types Handled

1. **Missing Data Errors** - URL parameter validation
2. **Parse Errors** - JSON parsing failures
3. **Network Errors** - Connection failures
4. **Configuration Errors** - Missing environment variables
5. **Authentication Errors** - JWT token failures
6. **API Errors** - ConfirmD Platform errors
7. **Unexpected Errors** - Catch-all for runtime errors

### User-Friendly Error Display

Configuration errors show helpful instructions:

```typescript
{isConfigError && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <h4 className="font-semibold text-yellow-900 mb-3">⚙️ Configuration Required</h4>
    <ol className="list-decimal ml-5 space-y-2">
      <li>Open your <code>.env</code> file</li>
      <li>Add or update: <code>CREDENTIAL_DEF_ID=your-credential-definition-id</code></li>
      <li>Restart the development server</li>
    </ol>
  </div>
)}
```

---

## API Endpoint Conventions

### URL Structure

All ConfirmD Platform API requests use this URL format:

```
{BASE_URL}/orgs/{orgId}/credentials/oob/email?credentialType=indy
```

**Example:**
```typescript
const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;
```

### Request Headers

All authenticated requests include:

```typescript
headers: {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
}
```

### Credential Payload Format

Standard Indy credential offer format:

```typescript
{
  credentialOffer: [
    {
      emailId: "student@example.com",
      attributes: [
        {
          value: "attribute-value",
          name: "attribute_name",
          isRequired: true
        },
        // ... more attributes
      ]
    }
  ],
  credentialDefinitionId: "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2968758:Current Student Credential",
  isReuseConnection: true
}
```

### Response Format

Successful responses:

```json
{
  "success": true,
  "message": "Credential issued successfully",
  "data": {
    // ConfirmD Platform response data
  }
}
```

Error responses:

```json
{
  "error": "Error type",
  "message": "User-friendly error message",
  "details": "Technical error details"
}
```

---

## ConfirmD Client for Advanced Use Cases

For proof requests and verification, use the ConfirmD Client which includes automatic token injection:

```typescript
import { confirmdClient } from "@/lib/api/confirmd-client";

// The client automatically adds JWT token to all requests
const response = await confirmdClient.post("/endpoint", payload);
```

**Features:**
- Axios interceptors for automatic token injection
- Automatic retry on 401 (token refresh)
- Comprehensive error handling
- Request/response logging

---

## Best Practices

### DO:

✅ Always use `getAccessToken()` for JWT authentication
✅ Use `API_CONFIG` constants for configuration
✅ Handle errors at multiple levels (network, API, parse)
✅ Log errors with context for debugging
✅ Return proper HTTP status codes
✅ Provide user-friendly error messages
✅ Use try-catch blocks for async operations
✅ Validate input data before API calls

### DON'T:

❌ Create custom authentication logic
❌ Store credentials in code
❌ Use different authentication methods per demo
❌ Ignore error handling
❌ Return generic error messages
❌ Skip input validation
❌ Use hard-coded URLs
❌ Forget to log errors

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Student Card │  │ Statement of │  │ Medical      │     │
│  │    Demo      │  │   Results    │  │ Fitness Demo │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         API Routes (Server Components)            │      │
│  │  /api/student-card/issue                          │      │
│  │  /api/statement-of-results/issue                  │      │
│  │  /api/medical-fitness/issue                       │      │
│  └──────────────────────┬────────────────────────────┘      │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ▼
           ┌──────────────────────────────┐
           │  confirmd-auth.ts            │
           │  - getAccessToken()          │
           │  - Token caching             │
           │  - OAuth2 flow               │
           └──────────────┬───────────────┘
                          │
                          ▼ JWT Token
           ┌──────────────────────────────┐
           │   ConfirmD Platform API      │
           │   - Credential issuance      │
           │   - Proof requests           │
           │   - Verification             │
           └──────────────────────────────┘
```

---

## Debugging Tips

### Enable Verbose Logging

The `confirmd-client` logs all requests and responses. Check console for:

```
=== AXIOS REQUEST ===
{
  method: "POST",
  url: "/orgs/{orgId}/credentials/oob/email",
  fullURL: "https://platform.confamd.com/orgs/{orgId}/credentials/oob/email",
  data: { ... }
}
```

### Check Token Cache

```typescript
import { getTokenInfo } from "@/lib/api/confirmd-auth";

const tokenInfo = getTokenInfo();
console.log("Cached token:", tokenInfo);
```

### Invalidate Token (Force Refresh)

```typescript
import { invalidateToken } from "@/lib/api/confirmd-auth";

invalidateToken(); // Next request will fetch new token
```

---

## NYSC Certificate Issuance (Phase 4)

### Overview

The NYSC Certificate issuance is the final phase (Phase 4) of the NYSC credential lifecycle demo. It demonstrates how NYSC administrators can issue digital certificates of national service to corps members who have completed their service year.

### API Endpoint

**POST** `/api/nysc/certificate/issue`

Issues an NYSC Certificate of National Service credential via email-based out-of-band (OOB) delivery.

### Request Body

```typescript
{
  // Communication fields (not included in certificate)
  email: string;              // Corps member's email for delivery
  phoneNumber: string;        // Corps member's phone number for delivery

  // Certificate attributes (6 attributes)
  fullName: string;           // Full name
  callUpNumber: string;       // NYSC call-up number
  startDate: string;          // Service start date
  endDate: string;            // Service end date
  issuedDate: string;         // Certificate issuance date
  certificateNumber: string;  // NYSC Certificate number
}
```

### Certificate Attributes

The NYSC Certificate credential includes the following **6 attributes**:

| # | Attribute | Description | Required |
|---|-----------|-------------|----------|
| 1 | `full_name` | Corps member's full name | Yes |
| 2 | `call_up_number` | NYSC call-up number | Yes |
| 3 | `start_date` | Service start date | Yes |
| 4 | `end_date` | Service end date | Yes |
| 5 | `issued_date` | Certificate issuance date | Yes |
| 6 | `certificate_number` | NYSC Certificate number | Yes |

**Note:** Email and phone number are used for credential delivery but are not included as certificate attributes.

### Environment Variables

```bash
# NYSC Organization credentials
NYSC_ORG_ID=your-nysc-org-id
NYSC_CLIENT_ID=your-client-id
NYSC_CLIENT_SECRET=your-client-secret

# NYSC Credential Definition IDs (4-phase lifecycle)
NYSC_GREEN_CARD_CRED_DEF_ID=your-green-card-cred-def-id
NYSC_ID_CARD_CRED_DEF_ID=your-id-card-cred-def-id
NYSC_CERTIFICATE_CRED_DEF_ID=your-certificate-cred-def-id
```

### Implementation Pattern

The certificate issuance follows the standard email-based OOB pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import axios from "axios";

export async function POST(request: NextRequest) {
  // 1. Parse and validate request
  const body = await request.json();

  // 2. Get JWT token
  const token = await getAccessToken();

  // 3. Get credential definition ID
  const credentialDefinitionId = process.env.NYSC_CERTIFICATE_CRED_DEF_ID;

  // 4. Prepare payload
  const payload = {
    credentialOffer: [{
      emailId: body.email,
      attributes: [
        { value: body.fullName, name: "full_name", isRequired: true },
        { value: body.callUpNumber, name: "call_up_number", isRequired: true },
        // ... more attributes
      ]
    }],
    credentialDefinitionId,
    isReuseConnection: true,
  };

  // 5. Issue via ConfirmD Platform
  const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;
  const response = await axios.post(apiUrl, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json({
    success: true,
    data: response.data,
  });
}
```

### Frontend Flow

The certificate issuance UI consists of three pages:

1. **Selection Page** (`/nysc/certificate/page.tsx`)
   - Admin selects corps members who completed service
   - Edit corps member details before issuance
   - Form validation for all required fields

2. **Processing Page** (`/nysc/certificate/issuing/page.tsx`)
   - Real-time progress display
   - Step-by-step: Authentication → Prepare → Issue → Email → SMS
   - Error handling with user-friendly messages

3. **Success Page** (`/nysc/certificate/success/page.tsx`)
   - Confirmation of successful issuance
   - Email delivery confirmation
   - Instructions for corps member

### NYSC 4-Phase Credential Lifecycle

| Phase | Credential | API Endpoint | Status |
|-------|------------|--------------|--------|
| 1 | NYSC Green Card | `/api/nysc/registration/issue-green-card` | ✅ Complete |
| 2 | NYSC ID Card | `/api/nysc/onboarding/issue-id-card` | ✅ Complete |
| 3 | Portal Access | `/api/nysc/portal/authenticate` | ✅ Complete |
| 4 | NYSC Certificate | `/api/nysc/certificate/issue` | ✅ Complete |

### Key Features

- **Email-based OOB Delivery**: Certificate sent via email with QR code
- **Connection Reuse**: Leverages existing wallet connections when available
- **Comprehensive Validation**: All required fields validated before issuance
- **Error Recovery**: User-friendly error messages and retry capability
- **Admin Interface**: Professional UI for selecting and managing issuances

### Notes

- SMS notifications are not yet implemented (placeholder in UI)
- Email delivery is handled by ConfirmD Platform's OOB system
- Certificate acceptance tracking via webhooks is recommended for production

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-05 | Initial documentation - JWT authentication standardization across all demos |
| 1.1.0 | 2025-11-08 | **UNIFIED PROOF CONFIGURATION SYSTEM** - All demos now use single proof-config.ts with credential-based mapping. Eliminates duplicate nysc-proof-config.ts module. |
| 1.2.0 | 2025-11-10 | **NYSC CERTIFICATE ISSUANCE** - Completed Phase 4 of NYSC demo. Added `/api/nysc/certificate/issue` endpoint with email-based OOB delivery. Full 4-phase credential lifecycle now operational. |
| 1.3.0 | 2025-11-11 | **CREDENTIAL SCHEMA ALIGNMENT & PROFESSIONAL DEMO FIXES** - Fixed Statement of Results schema attributes (year_end, issued_date), removed fallback logic for credential definitions, fixed professional application page API endpoint, aligned professional proof attributes with actual credential schemas. All credential definitions now use unified org prefix. |

---

*This document is maintained and should be updated whenever authentication patterns or architectural decisions change.*
