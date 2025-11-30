# Claude Code Development Guide

This document contains important architectural decisions and patterns used in this project. It serves as a reference for Claude Code and developers working on this codebase.

## Table of Contents

- [Authentication Architecture](#authentication-architecture)
- [Connection Pattern (Single-Use Invitations)](#connection-pattern-single-use-invitations)
- [Proof Request Configuration (UNIFIED SYSTEM)](#proof-request-configuration-unified-system)
- [Credential Issuance Patterns](#credential-issuance-patterns)
- [Error Handling Standards](#error-handling-standards)
- [API Endpoint Conventions](#api-endpoint-conventions)
- [Demo Session Management](#demo-session-management)
- [UI Demo Badge System](#ui-demo-badge-system)
- [Demo Testing Status](#demo-testing-status)

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

## Connection Pattern (Single-Use Invitations)

### Recommended Pattern: Single-Use Invitations Only

**All new demos SHOULD use single-use invitations** for the cleanest, most reliable connection flow.

#### Why Single-Use Invitations?

✅ **No connection ID conflicts** between different demos
✅ **No localStorage pollution** or cross-demo contamination
✅ **Simpler state management** - each session is truly independent
✅ **Cleaner user experience** - no confusing "Already Connected" button
✅ **Better security** - fresh connection per demo session

#### Standard Connection Flow

```typescript
// 1. User clicks "Connect Wallet" button
const initiateConnection = async () => {
  setIsLoadingInvitation(true);

  // Create a new single-use connection session
  const response = await fetch('/api/connections/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType: 'onboarding' }), // or 'loan', 'nysc', etc.
  });

  const data = await response.json();

  if (data.success && data.data) {
    setSessionId(data.data.sessionId);
    setInvitationUrl(data.data.invitationUrl);
    setConnectionStatus("connecting");
    // WebSocket will automatically connect via useConnectionWebSocket hook
  }
};

// 2. Display QR code with the invitationUrl
<QRCodeSVG value={invitationUrl} size={320} level="H" />

// 3. WebSocket handles connection status updates
const { status: wsStatus, connectionData } = useConnectionWebSocket(sessionId);

// 4. When connection is established, automatically send proof request
useEffect(() => {
  if (wsStatus === "active" && connectionData?.connectionId) {
    sendProofRequest(sessionId, connectionData.connectionId);
  }
}, [wsStatus, connectionData]);
```

#### What NOT to Do

❌ **Don't use "Already Connected" buttons** - they cause cross-demo contamination
❌ **Don't store connectionId in localStorage** - creates confusion between demos
❌ **Don't reuse connections** across different demo types
❌ **Don't implement connection pooling** - single-use is cleaner

#### Reference Implementation

See [src/app/finance/onboarding-ekyc/connect/page.tsx](src/app/finance/onboarding-ekyc/connect/page.tsx) for the clean single-use invitation pattern.

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

### API Error Response Handling (Connection & Proof Request Pages)

**IMPORTANT**: When handling error responses from API endpoints, always extract error details properly to show meaningful error messages to users.

#### Standard Error Extraction Pattern

```typescript
// ❌ WRONG - Logs raw error which may be empty object or string
console.error('[Demo] Failed:', data.error);

// ✅ CORRECT - Extract structured error details
const errorType = data.error?.error || data.error || 'unknown_error';
const errorDescription = data.error?.error_description || data.message || 'Operation failed';

console.error('[Demo] Failed', {
  error: errorType,
  description: errorDescription,
  fullError: data.error,
  fullResponse: data
});

// Show user-friendly error message based on error type
if (errorType === 'network_error' || errorDescription.includes('socket hang up')) {
  setErrorMessage(
    "⚠️ Connection Error: Unable to reach ConfirmD Platform. " +
    "This is usually temporary. Please wait a moment and try again."
  );
} else if (errorType === 'invalid_connection') {
  setErrorMessage(
    "⚠️ Previous connection is no longer valid. " +
    "Please use 'Connect Wallet' to create a new connection."
  );
} else if (errorType === 'proof_request_failed') {
  setErrorMessage(`Failed to request credentials: ${errorDescription}`);
} else {
  setErrorMessage(`Error: ${errorDescription}`);
}
```

#### Error Types to Handle

| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| `network_error` | Connection error - temporary issue | Wait and retry |
| `invalid_connection` | Previous connection invalid | Create new connection |
| `proof_request_failed` | Failed to request credentials | Show error description |
| `configuration_error` | Missing configuration | Show config instructions |
| `authentication_failed` | Authentication error | Check credentials |

#### Network Error Handling in Catch Block

```typescript
} catch (error: any) {
  console.error('[Demo] Network/Parse error:', {
    message: error.message,
    stack: error.stack,
    error
  });
  setErrorMessage(
    "⚠️ Network Error: Unable to connect to the server. " +
    "Please check your internet connection and try again."
  );
}
```

### Frontend Error Handling Pattern (Credential Issuance Pages)

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
❌ Include attribution footer in git commit messages (no Claude Code links or Co-Authored-By tags)

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

## Demo Session Management

### Overview

All demos use an intentional session management system that tracks user demo sessions from start to finish. This prevents connection mismatches between the browser and wallet app, and provides a clean demo experience.

**Key Features:**
- Hybrid session tracking (session cookie + device ID)
- Database-backed session persistence
- Explicit "Leave Demo" workflow
- Pre-demo wallet cleanup checklist
- Connection lifecycle management

### Architecture

#### Hybrid Session Tracking

The system uses a **hybrid approach** combining two identifiers:

1. **Session Cookie (`confirmd_demo_session`)**
   - Scope: Current browser session
   - Lifetime: Cleared on browser close
   - Purpose: Track active demo session
   - Storage: HTTP cookie (SameSite=Strict)

2. **Device ID (`confirmd_device_id`)**
   - Scope: Device/browser (persistent)
   - Lifetime: Persists across browser sessions
   - Purpose: Session recovery and analytics
   - Storage: localStorage

**Benefits:**
- Works across page refreshes
- Allows session recovery after browser restart
- Privacy-friendly (no fingerprinting)
- Handles edge cases (localStorage unavailable, cookie cleared)

#### Database Model

Session state is persisted in the `DemoSession` model:

```prisma
model DemoSession {
  id             String   @id @default(uuid())
  sessionId      String   // Browser session ID (from cookie)
  deviceId       String   // Device ID (from localStorage)
  connectionId   String?  // ConfirmD connection ID
  demoType       String   // "loan", "nysc", "course-registration", etc.
  status         String   @default("active") // active, completed, abandoned, expired
  startedAt      DateTime @default(now())
  endedAt        DateTime?
  lastActivityAt DateTime @default(now())
  metadata       String?  // JSON for demo-specific data

  @@index([sessionId, demoType])
  @@index([deviceId, status])
  @@index([connectionId])
}
```

### Core Components

#### 1. Session Utilities (`src/lib/utils/demo-session.ts`)

**Client-Side Functions:**

```typescript
import {
  getSessionInfo,
  checkActiveDemoSession,
  endDemoSession,
  clearSessionInfo,
  clearStoredConnection
} from "@/lib/utils/demo-session";

// Get or create session identifiers
const { sessionId, deviceId } = getSessionInfo();

// Check for existing active session
const { hasActiveSession, sessionData } = await checkActiveDemoSession('loan');

// End a demo session (marks as completed in DB, clears local data)
const { success } = await endDemoSession('loan');

// Clear session cookie (called automatically by endDemoSession)
clearSessionInfo();

// Clear stored connection from localStorage
clearStoredConnection();
```

**Server-Side Functions:**

```typescript
import { getSessionInfoFromRequest } from "@/lib/utils/demo-session";

// Extract session info from Next.js API request
export async function POST(request: NextRequest) {
  const { sessionId, deviceId } = getSessionInfoFromRequest(request);
  // Use for database queries...
}
```

#### 2. API Endpoints

All demo session management is handled via three API routes:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/demo/session/check` | POST | Check if user has active demo session |
| `/api/demo/session/start` | POST | Create new or resume existing session |
| `/api/demo/session/end` | POST | Mark session as completed, clear data |

**Example: Start/Resume Session**

```typescript
const { sessionId, deviceId } = getSessionInfo();

const response = await fetch('/api/demo/session/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Device-Id': deviceId,
  },
  body: JSON.stringify({
    demoType: 'loan',
    connectionId: 'abc123', // ConfirmD connection ID
  }),
});

const data = await response.json();
// data.data contains the DemoSession record
```

#### 3. Leave Demo Button (`src/components/LeaveDemoButton.tsx`)

A reusable component that:
- Shows a red "Leave Demo" button
- Displays confirmation modal with warnings
- Calls `endDemoSession()` API
- Redirects to home page on success
- Instructs user to delete wallet connection

**Usage:**

```typescript
import LeaveDemoButton from "@/components/LeaveDemoButton";

<LeaveDemoButton
  demoType="loan"
  demoName="Loan Application"
/>
```

#### 4. Pre-Demo Checklist (`src/components/PreDemoChecklist.tsx`)

A component that displays wallet cleanup instructions and prerequisites before starting a demo:

**Features:**
- 3-step checklist (clear connections, check credentials, prepare wallet)
- Required credentials list
- Confirmation checkbox
- Disabled "Continue" button until confirmed
- User-friendly instructions

**Usage:**

```typescript
import PreDemoChecklist from "@/components/PreDemoChecklist";

const [isChecklistCompleted, setIsChecklistCompleted] = useState(false);

{!isChecklistCompleted ? (
  <PreDemoChecklist
    demoName="Loan Application"
    requiredCredentials={[
      "Student Card (with matriculation number)",
      "Statement of Results (academic transcript)",
    ]}
    onConfirm={() => setIsChecklistCompleted(true)}
    isVisible={true}
  />
) : (
  // Show connection buttons...
)}
```

### Integration Guide

To integrate demo session management into a new demo:

#### Step 1: Add Imports

```typescript
import { getSessionInfo } from "@/lib/utils/demo-session";
import LeaveDemoButton from "@/components/LeaveDemoButton";
import PreDemoChecklist from "@/components/PreDemoChecklist";
```

#### Step 2: Add State Management

```typescript
const [isChecklistCompleted, setIsChecklistCompleted] = useState(false);
```

#### Step 3: Add Pre-Demo Checklist

Replace or wrap your "Connect Wallet" section:

```typescript
{connectionStatus === "disconnected" && (
  <div className="py-8">
    <div className="max-w-3xl mx-auto">
      {!isChecklistCompleted ? (
        <PreDemoChecklist
          demoName="Your Demo Name"
          requiredCredentials={[
            "Credential 1 (description)",
            "Credential 2 (description)",
          ]}
          onConfirm={() => setIsChecklistCompleted(true)}
          isVisible={true}
        />
      ) : (
        // Your existing connection UI...
        <button onClick={initiateConnection}>
          Connect Wallet
        </button>
      )}
    </div>
  </div>
)}
```

#### Step 4: Start Session on Connection

When connection is established, start/update the demo session:

```typescript
const startDemoSession = async (connectionId: string) => {
  try {
    const { sessionId, deviceId } = getSessionInfo();

    const response = await fetch('/api/demo/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
      },
      body: JSON.stringify({
        demoType: 'your-demo-type', // e.g., 'loan', 'nysc', 'course-registration'
        connectionId,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('[YourDemo] Session started:', data.data);
    }
  } catch (error) {
    console.error('[YourDemo] Failed to start session:', error);
  }
};

// Call when connection is established
useEffect(() => {
  if (wsStatus === "active" && connectionData?.connectionId) {
    startDemoSession(connectionData.connectionId);
  }
}, [wsStatus, connectionData]);
```

#### Step 5: Add Leave Demo Button

Add to your demo header/navigation:

```typescript
<div className="flex items-center gap-3">
  <LeaveDemoButton demoType="your-demo-type" demoName="Your Demo Name" />
  <Link href="/" className="text-white hover:text-gray-100">
    Back
  </Link>
</div>
```

### Session Lifecycle

```
1. User visits demo page
   ↓
2. PreDemoChecklist displayed
   ↓
3. User confirms checklist
   ↓
4. Connection buttons enabled
   ↓
5. User connects wallet → Session created/updated (status: active)
   ↓
6. User completes demo flow
   ↓
7. User clicks "Leave Demo" → Session marked completed, connection cleared
   ↓
8. User redirected to home page
```

### Session Status States

| Status | Description | When Set |
|--------|-------------|----------|
| `active` | Demo session in progress | On connection establishment |
| `completed` | User clicked "Leave Demo" | On explicit demo exit |
| `abandoned` | User left without completing | (Future: cleanup job) |
| `expired` | Session timeout reached | (Future: cleanup job) |

### Lookup Strategy

When checking for active sessions, the system:

1. Tries to find session by **sessionId** (from cookie)
2. Falls back to **deviceId** (from localStorage) if cookie was cleared
3. Updates sessionId if found by deviceId (session recovery)
4. Returns most recent active session by `lastActivityAt`

This ensures users can resume demos even after:
- Browser restart (cookie cleared, but deviceId persists)
- Cookie deletion
- Multiple browser tabs

### Best Practices

#### DO:

✅ Always show PreDemoChecklist before allowing connection
✅ Call `startDemoSession()` when connection is established
✅ Add LeaveDemoButton to demo header for easy exit
✅ Use consistent demoType identifiers across your demo
✅ Log session operations for debugging
✅ Handle session API failures gracefully

#### DON'T:

❌ Skip the pre-demo checklist (users need to clear wallet connections)
❌ Create session before connection is established
❌ Use different demoType strings in the same demo
❌ Forget to add Leave Demo button (users need explicit exit)
❌ Store sensitive data in session metadata without encryption

### Troubleshooting

**Problem:** Session not found after browser restart

**Solution:** System automatically recovers via deviceId. Check that:
- deviceId is being stored in localStorage
- API endpoint is checking both sessionId AND deviceId
- Database indexes are in place for efficient queries

**Problem:** Multiple active sessions for same demo

**Solution:** The system should prevent this by:
- Checking for existing active session before creating new one
- Using `OR` query to match either sessionId or deviceId
- Returning most recent session by `lastActivityAt`

**Problem:** Connection mismatch between browser and wallet

**Solution:** Pre-demo checklist instructs users to:
1. Delete existing wallet connections before starting
2. Close and reopen wallet app
3. Only proceed when checklist is confirmed

### Reference Implementation

See the Loan demo for a complete reference implementation:
- **Connect Page:** [src/app/loan/connect/page.tsx](src/app/loan/connect/page.tsx)
- **Session Utilities:** [src/lib/utils/demo-session.ts](src/lib/utils/demo-session.ts)
- **API Endpoints:** [src/app/api/demo/session/](src/app/api/demo/session/)
- **Components:** [src/components/LeaveDemoButton.tsx](src/components/LeaveDemoButton.tsx), [src/components/PreDemoChecklist.tsx](src/components/PreDemoChecklist.tsx)

---

## UI Demo Badge System

### Tested Badge Pattern

All demos in the application UI ([src/app/page.tsx](src/app/page.tsx:11-473)) support a "Tested" badge that appears next to the category badge. This provides visual confirmation that a demo has been end-to-end tested.

#### Adding the Tested Badge

When a demo has been successfully tested end-to-end:

1. **Update the demo object** in `src/app/page.tsx`:
   ```typescript
   {
     id: "course-registration",
     title: "Course Registration",
     description: "...",
     href: "/education/course-registration",
     status: "active",
     icon: "📝",
     category: "Education",
     tested: true,  // Add this property
     features: [...]
   }
   ```

2. **Update the Demo Testing Status section** in `CLAUDE.md`:
   ```markdown
   | **Course Registration** | ✅ Tested | 2025-11-12 | End-to-end proof request and verification flow validated. |
   ```

3. **Badge appears automatically** - The UI will display a green checkmark badge with "Tested" text next to the category badge.

#### Badge Styling

The tested badge uses:
- **Background**: `bg-green-100` (light green)
- **Text**: `text-green-700 text-xs font-medium` (dark green, small, medium weight)
- **Icon**: SVG checkmark icon from Heroicons
- **Placement**: Appears to the right of the category badge

#### Example Badge Appearance

```
[Education] [✓ Tested]
```

#### When to Mark as Tested

Mark a demo as `tested: true` when:
- ✅ All critical user flows have been validated end-to-end
- ✅ Credential issuance works correctly
- ✅ Proof requests are properly formed
- ✅ Proof verification completes successfully
- ✅ Data is correctly stored in the database
- ✅ Webhooks are processed without errors
- ✅ UI states update correctly (loading, success, error)

#### When NOT to Mark as Tested

Do not mark as tested if:
- ❌ Only partial testing has been done
- ❌ Critical bugs remain unresolved
- ❌ Credential issuance fails
- ❌ Proof requests don't match credentials in wallet
- ❌ Verification doesn't complete
- ❌ Webhooks are not being received

---

## Demo Testing Status

### Education Category

| Demo | Status | Last Tested | Notes |
|------|--------|-------------|-------|
| **Course Registration** | ✅ Tested | 2025-11-12 | End-to-end proof request and verification flow validated. Requires credentials to be fully stored in wallet app (not just pending state). |
| **Student Card Issuance** | ✅ Tested | 2025-11-11 | Credential issuance working correctly with email-based OOB delivery. |
| **Statement of Results Issuance** | ✅ Tested | 2025-11-10 | Schema attributes aligned (year_end, issued_date, Faculty). |
| **Medical Fitness Issuance** | ✅ Tested | 2025-11-10 | Medical fitness certificate issuance operational. |

### Government Category

| Demo | Status | Last Tested | Notes |
|------|--------|-------------|-------|
| **NYSC Registration** | ✅ Tested | 2025-11-10 | Multi-credential proof request (Student Card, Statement of Results, Medical Fitness). All 4 phases operational. |
| **NYSC Green Card Issuance** | ✅ Tested | 2025-11-10 | Phase 2 - Green card issued after successful verification. |
| **NYSC Certificate Issuance** | ✅ Tested | 2025-11-10 | Phase 4 - Certificate issued via email OOB. |

### Professional Category

| Demo | Status | Last Tested | Notes |
|------|--------|-------------|-------|
| **Professional Licensing** | ✅ Tested | 2025-11-11 | Proof request endpoint fixed, attributes aligned with schemas. |
| **Professional Members** | ✅ Tested | 2025-11-30 | End-to-end verification using Statement of Results + NYSC Certificate. Uses /verified-proofs endpoint for attribute extraction. Discount based on class of degree. |

### Finance Category

| Demo | Status | Last Tested | Notes |
|------|--------|-------------|-------|
| **Student Loan Application** | ✅ Tested | 2025-11-12 | New `POST /orgs/{orgId}/connections` endpoint working. Connection reuse functional. Proof request and verification flow operational. |
| **Issue eKYC** | ✅ Tested | 2025-11-12 | eKYC credential issuance working with 2-step NIN/BVN verification flow. Email-based OOB delivery operational. |
| **Onboarding with eKYC** | 🔄 Ready for Testing | 2025-11-12 | Complete demo implementation with single-use invitation pattern. Config file uses correct eKYC Schema ID and Cred Def ID. Clean connection flow without "Already Connected" button. |
| **Reuse eKYC** | 📋 Planned | - | Explanation page created. |

### Common Troubleshooting Notes

**Wallet Cannot Match Credential Issue**:
- **Symptom**: Wallet shows "no matching credentials" despite correct Schema/Cred Def IDs
- **Root Cause**: Credentials not fully stored/finalized in wallet app (stuck in pending state)
- **Solution**: Delete credential from wallet and re-issue. Ensure credential reaches "stored" state before attempting proof requests.
- **Affected Demos**: Course Registration, NYSC Registration (resolved 2025-11-12)

**Diagnostic Tools Available**:
- `test-proof-config.js` - Verifies proof request configuration
- `diagnose-proof-request.js` - Comprehensive proof request diagnostic tool

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-05 | Initial documentation - JWT authentication standardization across all demos |
| 1.1.0 | 2025-11-08 | **UNIFIED PROOF CONFIGURATION SYSTEM** - All demos now use single proof-config.ts with credential-based mapping. Eliminates duplicate nysc-proof-config.ts module. |
| 1.2.0 | 2025-11-10 | **NYSC CERTIFICATE ISSUANCE** - Completed Phase 4 of NYSC demo. Added `/api/nysc/certificate/issue` endpoint with email-based OOB delivery. Full 4-phase credential lifecycle now operational. |
| 1.3.0 | 2025-11-11 | **CREDENTIAL SCHEMA ALIGNMENT & PROFESSIONAL DEMO FIXES** - Fixed Statement of Results schema attributes (year_end, issued_date), removed fallback logic for credential definitions, fixed professional application page API endpoint, aligned professional proof attributes with actual credential schemas. All credential definitions now use unified org prefix. |
| 1.4.0 | 2025-11-12 | **SINGLE-USE INVITATION PATTERN** - Established single-use invitations as the recommended connection pattern. Removed "Already Connected" functionality from onboarding-ekyc demo to eliminate cross-demo connection conflicts. Updated documentation with clean connection flow best practices. Reference implementation: [src/app/finance/onboarding-ekyc/connect/page.tsx](src/app/finance/onboarding-ekyc/connect/page.tsx) |

---

*This document is maintained and should be updated whenever authentication patterns or architectural decisions change.*
