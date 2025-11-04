# Webhook Implementation Guide

## Overview

This document provides comprehensive documentation on the webhook infrastructure built for receiving real-time connection status updates from the Confirmd Platform.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Webhook Flow](#webhook-flow)
3. [Implementation Details](#implementation-details)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Security](#security)

---

## Architecture Overview

```
┌──────────────────┐
│  Confirmd        │
│  Platform        │
│  (External)      │
└────────┬─────────┘
         │ Webhook (HTTPS POST)
         │ X-API-Key: your-secret
         ▼
┌──────────────────────────────────────────┐
│  NELFUND Application                     │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ POST /api/webhooks/confirmd        │ │
│  │ - Verifies X-API-Key               │ │
│  │ - Validates payload                │ │
│  │ - Stores webhook event             │ │
│  └─────────────┬──────────────────────┘ │
│                │                          │
│                ▼                          │
│  ┌────────────────────────────────────┐ │
│  │ processWebhookEvent()              │ │
│  │ - Updates ConnectionSession        │ │
│  │ - Broadcasts via WebSocket         │ │
│  └─────────────┬──────────────────────┘ │
│                │                          │
│       ┌────────┴────────┐                │
│       ▼                 ▼                │
│  ┌─────────┐      ┌──────────┐          │
│  │Database │      │WebSocket │          │
│  │(SQLite) │      │Manager   │          │
│  └─────────┘      └────┬─────┘          │
│                         │                │
└─────────────────────────┼────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Frontend     │
                   │ Receives     │
                   │ Updates      │
                   └──────────────┘
```

---

## Webhook Flow

### 1. **Connection Initiation**

**User Action**: Student clicks "Connect Wallet" on registration page

```typescript
// Frontend: /register/connect
const initiateConnection = async () => {
  // Create connection session
  const response = await fetch('/api/connections/session', {
    method: 'POST',
    body: JSON.stringify({ requestType: 'registration' }),
  });

  const { sessionId, invitationUrl } = await response.json();

  // Display QR code with invitationUrl
  // Connect to WebSocket for real-time updates
};
```

**Database State**:
```sql
INSERT INTO ConnectionSession (
  sessionId,
  invitationId,
  invitationUrl,
  status,              -- "invitation"
  requestType,         -- "registration"
  expiresAt            -- NOW() + 15 minutes
);
```

### 2. **QR Code Scan**

**User Action**: Student scans QR code with ConfirmD App

**ConfirmD App**:
- Parses DIDComm invitation from QR code
- Establishes connection with organization's agent
- Sends connection request

**Platform Action**:
- Creates DIDComm connection
- Transitions connection state: `invitation` → `request` → `response` → `active`

### 3. **Webhook Delivery**

**Confirmd Platform** sends webhook to your application:

```http
POST https://your-domain.com/api/webhooks/confirmd
Content-Type: application/json
X-API-Key: your-secure-webhook-secret-from-env

{
  "webhookId": "wh_123456789",
  "topic": "connections.active",
  "timestamp": "2025-10-31T21:30:00.000Z",
  "organizationId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
  "agentId": "agent_abc123",
  "data": {
    "connectionId": "conn_xyz789",
    "state": "active",
    "invitationId": "inv-1234567890",
    "theirDid": "did:peer:2.Vz6Mk...",
    "theirLabel": "John's Wallet"
  }
}
```

### 4. **Webhook Processing**

**Application** ([/api/webhooks/confirmd/route.ts](src/app/api/webhooks/confirmd/route.ts)):

```typescript
export async function POST(request: NextRequest) {
  // 1. Verify X-API-Key authentication
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse webhook payload
  const payload: WebhookPayload = await request.json();

  // 3. Process the event
  await processWebhookEvent(payload);

  // 4. Return 200 to acknowledge receipt
  return NextResponse.json({ received: true });
}
```

**Event Processing** ([connection-service.ts](src/lib/api/connection-service.ts:122-210)):

```typescript
export async function processWebhookEvent(payload: WebhookPayload) {
  // 1. Store webhook event in database
  await prisma.webhookEvent.create({
    data: {
      webhookId: payload.webhookId,
      topic: payload.topic,
      payload: JSON.stringify(payload),
    },
  });

  // 2. Find and update connection session
  const session = await prisma.connectionSession.findFirst({
    where: { connectionId: payload.data.connectionId },
  });

  if (session) {
    await prisma.connectionSession.update({
      where: { id: session.id },
      data: {
        status: payload.data.state,
        connectionId: payload.data.connectionId,
      },
    });

    // 3. Broadcast update via WebSocket
    wsManager.broadcastStatusUpdate(
      session.sessionId,
      payload.data.state,
      { connectionId: payload.data.connectionId }
    );
  }

  // 4. Mark webhook as processed
  await prisma.webhookEvent.updateMany({
    where: { webhookId: payload.webhookId },
    data: { processed: true, processedAt: new Date() },
  });
}
```

### 5. **Frontend Update**

**WebSocket** delivers instant update to frontend (< 100ms):

```typescript
// Frontend receives via WebSocket
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: "status_update", status: "active", ... }

  if (data.status === "active") {
    setConnectionStatus("connected");
    // Proceed to request credentials
  }
};
```

---

## Implementation Details

### Database Schema

**ConnectionSession Table** ([schema.prisma](prisma/schema.prisma:38-59)):

```prisma
model ConnectionSession {
  id             String   @id @default(uuid())
  sessionId      String   @unique
  invitationId   String
  invitationUrl  String
  status         String   // invitation, request, response, active, completed, error, abandoned
  connectionId   String?
  theirDid       String?
  theirLabel     String?
  requestType    String?  // registration, authentication
  userAgent      String?
  ipAddress      String?
  userId         String?
  metadata       String?  // JSON
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  expiresAt      DateTime

  @@index([sessionId])
  @@index([connectionId])
  @@index([status])
}
```

**WebhookEvent Table** ([schema.prisma](prisma/schema.prisma:61-76)):

```prisma
model WebhookEvent {
  id             String   @id @default(uuid())
  webhookId      String   @unique
  topic          String
  organizationId String
  agentId        String
  connectionId   String?
  payload        String   // JSON
  processed      Boolean  @default(false)
  processedAt    DateTime?
  createdAt      DateTime @default(now())

  @@index([connectionId])
  @@index([processed])
  @@index([createdAt])
}
```

### Webhook Topics

The Confirmd Platform sends webhooks for different event types:

| Topic | Description | When Triggered |
|-------|-------------|----------------|
| `connections.invitation` | Invitation created | Organization creates invitation |
| `connections.request` | Connection request received | Wallet scans QR code |
| `connections.response` | Connection response sent | Agent responds to request |
| `connections.active` | Connection established | Both parties connected |
| `connections.completed` | Connection fully established | Handshake complete |
| `credentials.offer` | Credential offered | Organization offers credential |
| `credentials.request` | Credential requested | Wallet requests credential |
| `credentials.issued` | Credential issued | Credential sent to wallet |
| `proofs.request` | Proof requested | Organization requests presentation |
| `proofs.presentation` | Proof presented | Wallet sends proof |
| `proofs.verified` | Proof verified | Proof verified successfully |

### Connection Status State Machine

```
invitation → request → response → active → completed
     ↓          ↓          ↓         ↓         ↓
     └──────────┴──────────┴─────────┴─→ abandoned (timeout/error)
```

**Status Descriptions**:

- **invitation**: Invitation URL created, QR code displayed
- **request**: Wallet scanned QR, sent connection request
- **response**: Agent sent connection response
- **active**: Connection established, ready for credential exchange
- **completed**: Full handshake complete, all exchanges done
- **error**: Connection failed due to error
- **abandoned**: Connection expired or cancelled

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Webhook Configuration
WEBHOOK_SECRET=your-secure-webhook-secret-minimum-32-chars

# Organization Details (already configured)
ORGANIZATION_ID=eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95
CLIENT_ID=eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95
CLIENT_SECRET=9tdL08bIpJv1OTUz5g3OYhj8edg9OtX4
```

**Generate Secure Webhook Secret**:

```bash
# Linux/macOS
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Register Webhook in Confirmd Platform

You need to create a webhook app in the Confirmd Platform to start receiving webhooks.

**Step 1: Get Access Token**

```bash
curl -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  -d 'client_id=eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95' \
  -d 'client_secret=9tdL08bIpJv1OTUz5g3OYhj8edg9OtX4' \
  https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token
```

**Step 2: Create Webhook App**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "NELFUND Production Webhook",
    "description": "Webhook receiver for NELFUND student registration",
    "webhookUrl": "https://your-domain.com/api/webhooks/confirmd",
    "webhookSecret": "your-secure-webhook-secret-from-env",
    "clientContext": {
      "environment": "production",
      "purpose": "student-registration"
    }
  }' \
  https://platform.confamd.com/orgs/eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95/apps
```

**Response**:

```json
{
  "statusCode": 201,
  "message": "App successfully created",
  "data": {
    "id": "app-uuid-here",
    "orgId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
    "name": "NELFUND Production Webhook",
    "webhookUrl": "https://your-domain.com/api/webhooks/confirmd",
    "isActive": true,
    "createDateTime": "2025-10-31T21:00:00.000Z"
  }
}
```

**Important**: The `webhookSecret` is stored encrypted and will NOT be returned. Make sure you keep your secret safe!

### Development Webhook URL

For local development, you'll need to expose your local server to the internet. Use one of these tools:

**Option 1: ngrok (Recommended)**

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Expose port 3300
ngrok http 3300

# Use the HTTPS URL in your webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/confirmd
```

**Option 2: Cloudflare Tunnel**

```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3300
```

**Option 3: localtunnel**

```bash
# Install
npm install -g localtunnel

# Expose
lt --port 3300
```

---

## Testing

### 1. Test Webhook Endpoint

**Health Check**:

```bash
curl http://localhost:3300/api/webhooks/confirmd
```

Expected response:
```json
{
  "status": "ok",
  "message": "Confirmd webhook endpoint is active",
  "timestamp": "2025-10-31T21:30:00.000Z"
}
```

### 2. Test Webhook Authentication

**Without X-API-Key** (should fail):

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  http://localhost:3300/api/webhooks/confirmd
```

Expected response (401):
```json
{
  "error": "Unauthorized"
}
```

**With Valid X-API-Key** (should succeed):

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-webhook-secret-from-env" \
  -d '{
    "webhookId": "test-webhook-123",
    "topic": "connections.active",
    "timestamp": "2025-10-31T21:30:00.000Z",
    "organizationId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
    "agentId": "test-agent",
    "data": {
      "connectionId": "test-conn-123",
      "state": "active"
    }
  }' \
  http://localhost:3300/api/webhooks/confirmd
```

Expected response (200):
```json
{
  "received": true,
  "webhookId": "test-webhook-123",
  "timestamp": "2025-10-31T21:30:00.000Z"
}
```

### 3. Test Webhook Processing

**Create a test session first**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"requestType": "registration"}' \
  http://localhost:3300/api/connections/session
```

Save the `sessionId` from the response.

**Send test webhook with connection update**:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-webhook-secret" \
  -d '{
    "webhookId": "test-webhook-456",
    "topic": "connections.active",
    "timestamp": "2025-10-31T21:30:00.000Z",
    "organizationId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
    "agentId": "test-agent",
    "data": {
      "connectionId": "test-conn-456",
      "state": "active",
      "invitationId": "YOUR_INVITATION_ID_HERE"
    }
  }' \
  http://localhost:3300/api/webhooks/confirmd
```

**Check if session was updated**:

```bash
curl "http://localhost:3300/api/connections/session?sessionId=YOUR_SESSION_ID"
```

Should show `status: "active"`.

### 4. Test Platform Webhook with Confirmd

After registering your webhook URL with Confirmd Platform, you can test the webhook delivery:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventType": "Credential"}' \
  https://platform.confamd.com/orgs/eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95/apps/YOUR_APP_ID/test
```

This sends a test webhook to your configured URL.

---

## Monitoring

### View Webhook Delivery Logs

**Check recent webhooks in database**:

```sql
SELECT
  webhookId,
  topic,
  connectionId,
  processed,
  processedAt,
  createdAt
FROM WebhookEvent
ORDER BY createdAt DESC
LIMIT 10;
```

**Or via Prisma Studio**:

```bash
npx prisma studio
```

Navigate to `WebhookEvent` table.

### Application Logs

All webhook events are logged using the structured logger:

```typescript
// Check logs for webhook processing
logger.info("Processing webhook event", {
  topic: payload.topic,
  connectionId: payload.data.connectionId,
});
```

**Log Locations**:
- Console output in development
- Can be configured for production (file, CloudWatch, etc.)

### Webhook Statistics

Create an admin endpoint to view statistics:

```typescript
// src/app/api/admin/webhook-stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const [
    total,
    processed,
    pending,
    last24h,
    byTopic
  ] = await Promise.all([
    prisma.webhookEvent.count(),
    prisma.webhookEvent.count({ where: { processed: true } }),
    prisma.webhookEvent.count({ where: { processed: false } }),
    prisma.webhookEvent.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.webhookEvent.groupBy({
      by: ['topic'],
      _count: true,
    }),
  ]);

  return NextResponse.json({
    total,
    processed,
    pending,
    last24h,
    byTopic: byTopic.map(t => ({
      topic: t.topic,
      count: t._count,
    })),
  });
}
```

Access: `http://localhost:3300/api/admin/webhook-stats`

### Monitor Webhook Delivery in Confirmd Platform

Check webhook delivery logs in Confirmd Platform:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  "https://platform.confamd.com/orgs/YOUR_ORG_ID/apps/YOUR_APP_ID/deliveries?limit=20"
```

Response shows delivery status, HTTP status codes, and response times.

---

## Troubleshooting

### Webhook Not Received

**Symptom**: No webhooks arriving at your endpoint

**Checklist**:

1. **Verify webhook URL is accessible**:
   ```bash
   curl https://your-domain.com/api/webhooks/confirmd
   ```
   Should return 200 with health check message.

2. **Check webhook app status**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://platform.confamd.com/orgs/YOUR_ORG_ID/apps/YOUR_APP_ID
   ```
   Verify `isActive: true`.

3. **Check firewall/security groups**:
   - Ensure port 443 (HTTPS) is open
   - Allow Confirmd Platform IP addresses
   - Check if reverse proxy (nginx, etc.) is configured correctly

4. **Test with ngrok** (development):
   ```bash
   ngrok http 3300
   # Update webhook URL in Confirmd Platform to ngrok URL
   ```

5. **Check application logs**:
   Look for webhook processing logs or errors.

### Webhook Authentication Fails

**Symptom**: Webhooks return 401 Unauthorized

**Solutions**:

1. **Verify webhook secret matches**:
   ```bash
   # Check .env file
   cat .env | grep WEBHOOK_SECRET

   # Compare with secret used when creating app
   ```

2. **Check X-API-Key header**:
   The Confirmd Platform sends the webhook secret as `X-API-Key` header.

   Verify in your endpoint:
   ```typescript
   const apiKey = request.headers.get("x-api-key");
   console.log("Received API Key:", apiKey ? "present" : "missing");
   ```

3. **Rotate webhook secret** if compromised:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"newSecret": "new-secure-secret-here"}' \
     https://platform.confamd.com/orgs/YOUR_ORG_ID/apps/YOUR_APP_ID/rotate-secret
   ```

### Session Not Updated

**Symptom**: Webhook received but connection session not updated

**Debug Steps**:

1. **Check webhook payload**:
   ```typescript
   // Add logging in processWebhookEvent
   console.log("Webhook payload:", JSON.stringify(payload, null, 2));
   ```

2. **Verify session exists**:
   ```sql
   SELECT * FROM ConnectionSession
   WHERE connectionId = 'conn-from-webhook'
   OR invitationId = 'inv-from-webhook';
   ```

3. **Check topic matching**:
   Only `connections.*` topics update sessions.
   ```typescript
   if (payload.topic.startsWith("connections.") && payload.data.connectionId) {
     // Session update logic
   }
   ```

4. **Verify database update**:
   Check if `updatedAt` timestamp changed in `ConnectionSession` table.

### WebSocket Not Broadcasting

**Symptom**: Session updated but frontend doesn't receive update

**Solutions**:

1. **Check WebSocket connection**:
   Open browser DevTools → Network → WS tab
   Should see: `ws://localhost:3300/ws/connections?sessionId=xxx`

2. **Verify WebSocket server is running**:
   ```bash
   # Should see "WebSocket server initialized" in logs
   npm run dev
   ```

3. **Check broadcast logic**:
   ```typescript
   // Ensure this is called in processWebhookEvent
   wsManager.broadcastStatusUpdate(
     session.sessionId,
     payload.data.state,
     { connectionId: payload.data.connectionId }
   );
   ```

4. **Test WebSocket manually**:
   Use a WebSocket client (e.g., wscat):
   ```bash
   npm install -g wscat
   wscat -c "ws://localhost:3300/ws/connections?sessionId=test-123"
   # Send test message
   {"type": "ping"}
   ```

---

## Security

### Webhook Secret Management

**Best Practices**:

1. **Use strong secrets** (32+ characters):
   ```bash
   openssl rand -hex 32
   ```

2. **Never commit secrets** to git:
   - Add `.env` to `.gitignore`
   - Use environment variables in production
   - Rotate secrets regularly

3. **Different secrets per environment**:
   ```bash
   # Development
   WEBHOOK_SECRET=dev-secret-12345...

   # Staging
   WEBHOOK_SECRET=staging-secret-67890...

   # Production
   WEBHOOK_SECRET=prod-secret-abcdef...
   ```

4. **Use secret management services** (production):
   - AWS Secrets Manager
   - Google Cloud Secret Manager
   - Azure Key Vault
   - HashiCorp Vault

### HTTPS Requirements

**Production**:
- ✅ **MUST use HTTPS** for webhook URL
- ✅ Valid SSL certificate (not self-signed)
- ✅ TLS 1.2 or higher

**Development**:
- ℹ️ HTTP acceptable for localhost
- ℹ️ Use ngrok for HTTPS testing locally

### Request Validation

The webhook endpoint validates:

1. **Authentication**: X-API-Key header must match `WEBHOOK_SECRET`
2. **Payload format**: Must be valid JSON
3. **Required fields**: `webhookId`, `topic`, `organizationId`, `data`

**Additional validation you can add**:

```typescript
// Verify organization ID
if (payload.organizationId !== process.env.ORGANIZATION_ID) {
  return NextResponse.json({ error: "Invalid organization" }, { status: 403 });
}

// Verify timestamp is recent (prevent replay attacks)
const webhookTime = new Date(payload.timestamp).getTime();
const now = Date.now();
const fiveMinutes = 5 * 60 * 1000;

if (Math.abs(now - webhookTime) > fiveMinutes) {
  return NextResponse.json({ error: "Webhook too old" }, { status: 400 });
}
```

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// Simple in-memory rate limiting
const webhookRateLimits = new Map<string, number[]>();

function checkRateLimit(organizationId: string): boolean {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  const maxRequests = 100; // 100 requests per minute

  const timestamps = webhookRateLimits.get(organizationId) || [];
  const recentTimestamps = timestamps.filter(t => now - t < oneMinute);

  if (recentTimestamps.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  recentTimestamps.push(now);
  webhookRateLimits.set(organizationId, recentTimestamps);
  return true;
}
```

### Idempotency

Webhooks may be delivered multiple times. Ensure idempotent processing:

```typescript
// Check if webhook already processed
const existing = await prisma.webhookEvent.findUnique({
  where: { webhookId: payload.webhookId },
});

if (existing) {
  logger.info("Webhook already processed", { webhookId: payload.webhookId });
  return NextResponse.json({ received: true, duplicate: true });
}
```

---

## Summary

### Key Files

| File | Purpose |
|------|---------|
| [/api/webhooks/confirmd/route.ts](src/app/api/webhooks/confirmd/route.ts) | Webhook endpoint |
| [connection-service.ts](src/lib/api/connection-service.ts) | Webhook processing logic |
| [schema.prisma](prisma/schema.prisma) | Database schema |
| [types.ts](src/lib/api/types.ts) | TypeScript interfaces |
| [.env](.env) | Configuration |

### Webhook Topics Reference

| Topic | Status | Description |
|-------|--------|-------------|
| `connections.invitation` | invitation | Invitation created |
| `connections.request` | request | Connection requested |
| `connections.response` | response | Connection responded |
| `connections.active` | active | Connection active ✅ |
| `connections.completed` | completed | Connection complete ✅ |
| `credentials.offer` | - | Credential offered |
| `credentials.issued` | - | Credential issued ✅ |
| `proofs.request` | - | Proof requested |
| `proofs.verified` | - | Proof verified ✅ |

### Configuration Checklist

- [x] Database schema created (`npx prisma migrate dev`)
- [ ] Webhook secret generated and added to `.env`
- [ ] Webhook URL exposed (ngrok for dev, HTTPS for prod)
- [ ] Webhook app created in Confirmd Platform
- [ ] Webhook app activated (`isActive: true`)
- [ ] Test webhook delivery successful
- [ ] WebSocket server running (optional but recommended)
- [ ] Monitoring and logging configured

### Next Steps

1. **Configure Webhook in Confirmd Platform** using the API calls above
2. **Test End-to-End Flow**:
   - Visit `/register/intro`
   - Click "Proceed to Connect"
   - Scan QR code with ConfirmD App
   - Verify webhook is received
   - Confirm session status updates
   - Check WebSocket delivers update to frontend

3. **Production Deployment**:
   - Deploy to HTTPS domain
   - Update webhook URL in Confirmd Platform
   - Configure production webhook secret
   - Set up monitoring and alerts
   - Enable logging to CloudWatch/similar

---

**Last Updated**: October 31, 2025
**Version**: 1.0
**Status**: ✅ Implementation Complete
