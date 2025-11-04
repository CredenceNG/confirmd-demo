# API Reference - ConfirmD Platform Integration

Quick reference for all API endpoints and data structures.

## Table of Contents

- [Authentication](#authentication)
- [ConfirmD Platform APIs](#confirmd-platform-apis)
- [Your Application APIs](#your-application-apis)
- [Webhook Payloads](#webhook-payloads)
- [Data Structures](#data-structures)
- [Error Codes](#error-codes)

---

## Authentication

### OAuth2 Token Request

```http
POST /realms/confirmd-bench/protocol/openid-connect/token
Host: manager.credence.ng
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={your_client_id}
&client_secret={your_client_secret}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1...",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

**Token Caching:**
- Cache token for `expires_in - 60` seconds
- Automatically refresh when expired
- Include in all API requests: `Authorization: Bearer {token}`

---

## ConfirmD Platform APIs

Base URL: `https://platform.confamd.com`

### 1. Create Invitation

Generates a QR code/deep link for wallet connection.

```http
POST /orgs/{orgId}/invitations
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "autoAcceptConnection": true,
  "multiUseInvitation": false
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "message": "Invitation created successfully",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "invitationUrl": "didcomm://invite?c_i=eyJAdHlwZSI6...",
    "state": "initial",
    "createdAt": "2025-11-01T19:12:37.766Z"
  }
}
```

---

### 2. Send Proof Request

Requests specific credentials from connected wallet.

```http
POST /orgs/{orgId}/proofs?requestType=indy
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "connectionId": "c6efaab5-e3ad-4f65-8b21-7e372b0e44ff",
  "comment": "Please share your student credentials",
  "orgId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
  "proofFormats": {
    "indy": {
      "attributes": [
        {
          "attributeName": "admission_number",
          "schemaId": "L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0",
          "credDefId": "L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance"
        },
        {
          "attributeName": "programme",
          "schemaId": "L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0",
          "credDefId": "L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance"
        }
      ]
    }
  }
}
```

**Attribute with Predicate (Age Verification):**
```json
{
  "attributeName": "age",
  "schemaId": "...",
  "condition": ">=",
  "value": 18
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "message": "Proof request sent successfully",
  "data": {
    "id": "186c224b-f011-4da4-891e-b64b9f1c4b63",
    "state": "request-sent",
    "connectionId": "c6efaab5-e3ad-4f65-8b21-7e372b0e44ff",
    "threadId": "1a57e361-0026-4238-8b69-3de36812554a",
    "createdAt": "2025-11-01T19:13:35.161Z"
  }
}
```

---

### 3. Verify Proof

Verifies the cryptographic proof of the presentation.

```http
POST /orgs/{orgId}/proofs/{proofId}/verify
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Proof verified successfully",
  "data": {
    "id": "186c224b-f011-4da4-891e-b64b9f1c4b63",
    "state": "done",
    "verified": true,
    "updatedAt": "2025-11-01T19:13:49.282Z"
  }
}
```

---

### 4. Get Verified Proof Details

Extracts the verified attribute values.

```http
GET /orgs/{orgId}/verified-proofs/{proofId}
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "admission_number": "930930ee",
      "credDefId": "L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance",
      "schemaId": "L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0"
    },
    {
      "programme": "Accounting",
      "credDefId": "L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance",
      "schemaId": "L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0"
    },
    {
      "graduation_year": "2028",
      "credDefId": "L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance",
      "schemaId": "L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0"
    }
  ]
}
```

**⚠️ CRITICAL:** Each array item contains ONE attribute. Must iterate and merge:

```typescript
function extractAttributes(data: any[]): Record<string, string> {
  const attributes: Record<string, string> = {};

  data.forEach((item) => {
    const { schemaId, credDefId, ...attribute } = item;
    Object.assign(attributes, attribute);
  });

  return attributes;
}

// Result:
{
  "admission_number": "930930ee",
  "programme": "Accounting",
  "graduation_year": "2028"
}
```

---

## Your Application APIs

### 1. Create Connection Session

```http
POST /api/connections/session
Content-Type: application/json
```

**Response:**
```json
{
  "sessionId": "session-1762024357768-yj60izl0k",
  "invitationUrl": "didcomm://invite?c_i=eyJAdHlwZSI6..."
}
```

---

### 2. Get Connection Status

```http
GET /api/connections/session?sessionId={sessionId}
```

**Response:**
```json
{
  "id": "uuid",
  "sessionId": "session-1762024357768-yj60izl0k",
  "status": "active",
  "connectionId": "c6efaab5-e3ad-4f65-8b21-7e372b0e44ff",
  "theirLabel": "Yoko-4hfxe8s3lc",
  "invitationUrl": "didcomm://...",
  "createdAt": "2025-11-01T19:12:37.768Z",
  "expiresAt": "2025-11-01T19:27:37.768Z"
}
```

**Status Values:**
- `invitation` - QR code generated, waiting for scan
- `response` - User scanned QR, connection in progress
- `active` - Connection established, ready for proof request
- `error` - Connection failed

---

### 3. Request Proof

```http
POST /api/proofs/request
Content-Type: application/json

{
  "sessionId": "session-1762024357768-yj60izl0k"
}
```

**Response:**
```json
{
  "success": true,
  "proofRequestId": "uuid"
}
```

---

### 4. Get Proof Status

```http
GET /api/proofs/request?sessionId={sessionId}
```

**Response:**
```json
{
  "id": "uuid",
  "sessionId": "session-1762024357768-yj60izl0k",
  "proofId": "186c224b-f011-4da4-891e-b64b9f1c4b63",
  "status": "done",
  "verified": true,
  "presentedAttributes": "{\"admission_number\":\"930930ee\",\"programme\":\"Accounting\"}",
  "verifiedAt": "2025-11-01T19:13:50.314Z",
  "createdAt": "2025-11-01T19:13:36.710Z"
}
```

**Status Values:**
- `request-sent` - Proof request sent to wallet
- `presentation-received` - User presented credentials
- `done` - Proof verified and attributes extracted

---

### 5. Verify Proof

```http
POST /api/proofs/verify
Content-Type: application/json

{
  "proofId": "186c224b-f011-4da4-891e-b64b9f1c4b63"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "attributes": {
    "admission_number": "930930ee",
    "programme": "Accounting",
    "graduation_year": "2028"
  }
}
```

---

## Webhook Payloads

ConfirmD sends webhooks to your endpoint: `POST /api/webhooks/confirmd`

### Connection Webhook

**Payload:**
```json
{
  "type": "Connection",
  "connectionId": "c6efaab5-e3ad-4f65-8b21-7e372b0e44ff",
  "state": "response-sent",
  "theirLabel": "Yoko-4hfxe8s3lc",
  "theirDid": "did:peer:...",
  "orgId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
  "agentId": "agent-id",
  "timestamp": "2025-11-01T19:13:32.066Z"
}
```

**State Values:**
- `response-sent` - User scanned QR, connection initiating
- `completed` - Connection fully established

---

### Proof Webhook

**Payload:**
```json
{
  "type": "Proof",
  "id": "186c224b-f011-4da4-891e-b64b9f1c4b63",
  "connectionId": "c6efaab5-e3ad-4f65-8b21-7e372b0e44ff",
  "state": "presentation-received",
  "orgId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
  "agentId": "agent-id",
  "timestamp": "2025-11-01T19:13:43.946Z"
}
```

**State Values:**
- `request-sent` - Proof request sent to wallet
- `presentation-received` - User presented credentials
- `done` - Proof verified

---

## Data Structures

### ConnectionSession (Database)

```typescript
interface ConnectionSession {
  id: string;              // UUID
  sessionId: string;       // Unique session identifier
  invitationId: string;    // ConfirmD invitation ID
  invitationUrl: string;   // Deep link/QR code data
  status: string;          // invitation | response | active | error
  connectionId: string?;   // ConfirmD connection ID
  theirDid: string?;       // User's DID
  theirLabel: string?;     // Wallet name
  requestType: string?;    // registration | authentication
  metadata: string?;       // JSON string
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}
```

---

### ProofRequest (Database)

```typescript
interface ProofRequest {
  id: string;                    // UUID
  sessionId: string;             // Links to ConnectionSession
  proofId: string?;              // ConfirmD proof ID
  connectionId: string;          // ConfirmD connection ID
  status: string;                // request-sent | presentation-received | done
  comment: string?;              // Proof request message
  requestedAttributes: string;   // JSON array of requested attrs
  presentedAttributes: string?;  // JSON object of presented attrs
  verified: boolean;
  verifiedAt: Date?;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### WebhookEvent (Database)

```typescript
interface WebhookEvent {
  id: string;
  webhookId: string;       // Unique webhook identifier
  topic: string;           // Connection | Proof | Credential
  organizationId: string;
  agentId: string;
  connectionId: string?;
  proofId: string?;
  payload: string;         // Full webhook JSON
  processed: boolean;
  processedAt: Date?;
  createdAt: Date;
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Missing required fields, invalid data |
| 401 | Unauthorized | Invalid or expired access token |
| 404 | Not Found | Invalid org/proof/connection ID |
| 500 | Server Error | Internal error, check logs |

---

### ConfirmD Error Responses

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Missing required field: connectionId"
}
```

---

### Common Error Scenarios

#### 1. Authentication Failed

```json
{
  "error": "invalid_client",
  "error_description": "Invalid client credentials"
}
```

**Fix:** Verify `CONFIRMD_CLIENT_ID` and `CONFIRMD_CLIENT_SECRET`

---

#### 2. Connection Not Found

```json
{
  "statusCode": 404,
  "message": "Connection not found"
}
```

**Fix:** Ensure connection is established before requesting proof

---

#### 3. Proof Verification Failed

```json
{
  "statusCode": 400,
  "message": "Proof verification failed",
  "error": "Invalid proof presentation"
}
```

**Fix:** Check credential validity, schema/credDef IDs match

---

#### 4. Expired Session

```json
{
  "error": "Session expired",
  "message": "Connection session has expired"
}
```

**Fix:** Sessions expire after 15 minutes, create new session

---

## Rate Limits

| Endpoint | Limit | Period |
|----------|-------|--------|
| `/invitations` | 100 | per minute |
| `/proofs` | 100 | per minute |
| `/proofs/verify` | 50 | per minute |
| `/verified-proofs` | 100 | per minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

---

## Testing

### Test OAuth Token

```bash
curl -X POST "$CONFIRMD_AUTH_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET"
```

### Test Create Invitation

```bash
TOKEN="your-access-token"
ORG_ID="your-org-id"

curl -X POST "https://platform.confamd.com/orgs/$ORG_ID/invitations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoAcceptConnection": true,
    "multiUseInvitation": false
  }'
```

### Test Webhook Endpoint

```bash
curl -X POST "http://localhost:3300/api/webhooks/confirmd" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "Connection",
    "connectionId": "test-connection-id",
    "state": "completed",
    "orgId": "test-org-id",
    "timestamp": "2025-11-01T19:13:32.066Z"
  }'
```

---

## Environment Variables Reference

```bash
# Required
CONFIRMD_ORG_ID=               # Your organization ID
CONFIRMD_CLIENT_ID=            # OAuth2 client ID
CONFIRMD_CLIENT_SECRET=        # OAuth2 client secret
CONFIRMD_AUTH_URL=             # OAuth2 token endpoint
CONFIRMD_BASE_URL=             # Platform API base URL
PROOF_SCHEMA_ID=               # Credential schema ID

# Optional
PROOF_CRED_DEF_ID=             # Specific credential definition
WEBHOOK_SECRET=                # Webhook signature verification
DATABASE_URL=                  # Database connection string
PORT=                          # Server port (default: 3000)
LOG_LEVEL=                     # Logging level (default: info)
```

---

## Support

- **Documentation:** [CONFIRMD_INTEGRATION_GUIDE.md](./CONFIRMD_INTEGRATION_GUIDE.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **Platform Docs:** https://docs.confirmd.com

---

**Version:** 1.0.0
**Last Updated:** November 2025
