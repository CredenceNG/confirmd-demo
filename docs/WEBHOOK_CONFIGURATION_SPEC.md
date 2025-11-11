# ConfirmD Platform Webhook Configuration Specification

**Document Purpose:** This document provides the exact specifications needed to configure webhooks on the ConfirmD Platform for the NELFUND demo application.

**Date:** 2025-11-04
**Application:** NELFUND Demo - Student Loan Verification System
**Server:** https://28c5ff3d9edf.ngrok-free.app (current ngrok tunnel)

---

## 1. Webhook Endpoint Configuration

### Primary Webhook URL
```
https://28c5ff3d9edf.ngrok-free.app/api/webhooks/confirmd
```

### Method
```
POST
```

### Content-Type
```
application/json
```

### Authentication
The webhook endpoint expects the following header:
```
x-api-key: MoinMoin...
```
(Use the API key configured in your ConfirmD Platform organization settings)

---

## 2. Required Webhook Events

Configure the Platform to send webhooks for **ALL** the following events:

### Connection Events
These webhooks notify when wallet connections are established:

1. **connection.request-received**
   - Triggered when: A wallet scans the QR code and initiates connection
   - Payload type: `Connection`
   - State: `request-received`
   - **REQUIRED**: Yes

2. **connection.response-sent**
   - Triggered when: Platform responds to the connection request
   - Payload type: `Connection`
   - State: `response-sent`
   - **REQUIRED**: Yes

3. **connection.completed**
   - Triggered when: Connection is fully established
   - Payload type: `Connection`
   - State: `completed`
   - **REQUIRED**: Yes (triggers automatic proof request)

### Proof Events
These webhooks notify about credential presentation requests and responses:

4. **proof.request-sent**
   - Triggered when: A proof request is sent to the wallet
   - Payload type: `Proof` OR `Connection` (with proof data nested)
   - State: `request-sent`
   - **REQUIRED**: Yes

5. **proof.presentation-received**
   - Triggered when: User approves and presents credentials from wallet
   - Payload type: `Proof` OR `Connection` (with proof presentation data)
   - State: `presentation-received`
   - **REQUIRED**: Yes (critical for verification flow)
   - **Note**: When this webhook is received, the application automatically calls the Platform API to retrieve proof details including the `verified` status and presented attributes

6. **proof.done**
   - Triggered when: Proof verification is complete
   - Payload type: `Proof` OR `Connection`
   - State: `done`
   - **REQUIRED**: Optional (nice to have)
   - **Note**: Verification status is already captured from `presentation-received` webhook, so this is primarily for completion tracking

7. **proof.abandoned**
   - Triggered when: User rejects or abandons the proof request
   - Payload type: `Proof` OR `Connection`
   - State: `abandoned`
   - **REQUIRED**: Optional (nice to have)

### Credential Events (Optional)
These webhooks notify about credential issuance:

8. **credential.done**
   - Triggered when: A credential has been successfully issued
   - Payload type: `Credential`
   - State: `done`
   - **REQUIRED**: No (not used in current flow)

---

## 3. Expected Webhook Payload Structure

The ConfirmD Platform sends webhooks with a **nested structure** where important fields are inside a `data` object:

```json
{
  "type": "Connection",
  "timestamp": "2025-11-03T23:34:23.252Z",
  "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b",
  "tenantId": "64eaee65-3495-4516-851e-548099b04a30",
  "data": {
    "_tags": {},
    "metadata": {},
    "id": "dbbbb4ca-0580-43ae-a0a2-bf94961475cc",
    "createdAt": "2025-11-03T23:34:21.434Z",
    "state": "completed",
    "role": "responder",
    "connectionId": "dbbbb4ca-0580-43ae-a0a2-bf94961475cc",
    "theirDid": "did:peer:1zQmViZha5KQhFt2MtKR19mD3qX7oa8LD33qQF2yAjGcmjmU",
    "theirLabel": "Yoko-4hfxe8s3lc",
    "autoAcceptConnection": true,
    "threadId": "460b34ac-c4fc-4f11-bfb4-4ee9b04b7d88",
    "protocol": "https://didcomm.org/didexchange/1.x",
    "updatedAt": "2025-11-03T23:34:26.068Z",
    "contextCorrelationId": "64eaee65-3495-4516-851e-548099b04a30"
  },
  "clientContext": {}
}
```

**Note:** The webhook handler automatically flattens this structure by merging the `data` object fields into the top level for easier processing.

### Critical Payload Fields

The following fields MUST be present in ALL webhook payloads:

#### Top Level (Always Present)
- **type** (string): Event type - "Connection", "Proof", or "Credential"
- **timestamp** (ISO 8601 string): When the event occurred
- **orgId** (UUID): Your ConfirmD organization ID
- **tenantId** (UUID): Your tenant ID

#### Inside `data` Object
- **id** (UUID): Unique identifier for the connection or proof
- **state** (string): Current state of the connection/proof (e.g., "completed", "presentation-received")
- **connectionId** (UUID): The connection identifier (for proof events, may be same as id for connections)
- **role** (string): Role in the interaction (e.g., "responder", "verifier")
- **createdAt** / **updatedAt** (ISO 8601 string): Timestamps

---

## 4. Organization Configuration

### Organization ID
```
67953cea-68c7-464b-b7a3-99a10856e22b
```

### Tenant ID
```
64eaee65-3495-4516-851e-548099b04a30
```

Ensure the webhook configuration is set at the **organization level** for this specific organization.

---

## 5. Webhook Delivery Requirements

### Retry Policy
Configure the Platform to retry failed webhook deliveries with:
- **Initial retry:** After 5 seconds
- **Max retries:** 3 attempts
- **Backoff:** Exponential (5s, 25s, 125s)

### Timeout
- **Request timeout:** 10 seconds maximum

### Expected Response
The webhook endpoint will respond with:
```json
{
  "received": true,
  "type": "Connection",
  "connectionId": "dbbbb4ca-0580-43ae-a0a2-bf94961475cc",
  "state": "completed",
  "timestamp": "2025-11-03T23:34:27.542Z"
}
```

HTTP Status: **200 OK**

---

## 6. Webhook Flow Sequence

For a typical user journey, webhooks should be sent in this order:

### Step 1: User Scans QR Code
```
1. connection.request-received
2. connection.response-sent
3. connection.completed
```

### Step 2: Proof Request Sent (Automatic)
```
4. proof.request-sent
```

### Step 3: User Approves in Wallet
```
5. proof.presentation-received
```

### Step 4: Verification Complete
```
6. proof.done
```

---

## 7. Testing Webhook Configuration

After configuring webhooks on the Platform, test with this sequence:

### Test 1: Connection Establishment
1. Navigate to: `http://localhost:3300/nelfund/connect`
2. Scan QR code with ConfirmD wallet
3. Accept connection in wallet
4. **Expected Result:** Three webhooks received (request-received, response-sent, completed)

### Test 2: Proof Request Flow
1. After connection completes
2. **Expected Result:** Webhook received (request-sent)
3. Check wallet for proof request
4. Approve proof request in wallet
5. **Expected Result:** Webhook received (presentation-received)

### Test 3: Complete Flow
1. Complete steps from Test 1 and Test 2
2. **Expected Result:** User is redirected to `/nelfund/application` page

---

## 8. Troubleshooting Webhook Delivery

### Verify Webhook URL is Reachable
From the Platform admin panel or your terminal:
```bash
curl -X POST https://28c5ff3d9edf.ngrok-free.app/api/webhooks/confirmd \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "type": "Connection",
    "timestamp": "2025-11-04T00:00:00.000Z",
    "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b",
    "tenantId": "64eaee65-3495-4516-851e-548099b04a30",
    "data": {
      "id": "test-connection-id",
      "state": "completed",
      "connectionId": "test-connection-id",
      "role": "responder",
      "createdAt": "2025-11-04T00:00:00.000Z",
      "updatedAt": "2025-11-04T00:00:00.000Z"
    }
  }'
```

**Expected Response:** HTTP 200 with JSON response

### Check Server Logs
Monitor the NELFUND demo server logs for incoming webhooks:
```bash
# In the project directory
npm run dev

# Watch for webhook events - you should see:
# [INFO] === WEBHOOK REQUEST START ===
# [INFO] RAW WEBHOOK PAYLOAD
# [INFO] WEBHOOK ROUTING DECISION
```

### Common Issues

**Issue 1: Webhooks not arriving**
- ✅ Verify ngrok tunnel is running: `curl http://localhost:4040/api/tunnels`
- ✅ Confirm webhook URL matches current ngrok URL
- ✅ Check Platform webhook configuration is enabled

**Issue 2: 401 Unauthorized**
- ✅ Verify x-api-key header is configured in Platform
- ✅ Check API key matches environment variable

**Issue 3: Connection established but no proof request**
- ✅ Verify "connection.completed" webhook was received
- ✅ Check server logs for "Creating proof request"
- ✅ Confirm proof.request-sent webhook was sent from Platform

---

## 9. Webhook Payload Examples

### Connection Completed Webhook
```json
{
  "type": "Connection",
  "timestamp": "2025-11-03T23:34:27.193Z",
  "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b",
  "tenantId": "64eaee65-3495-4516-851e-548099b04a30",
  "data": {
    "_tags": {
      "did": "did:peer:1zQmaStZxKjrF9uy9tMaLdznQN3xUceZtZbvo19hD4VxbXk5",
      "outOfBandId": "96db4f2a-d0bc-4d89-a39e-fb4ac22e8e2e",
      "role": "responder",
      "state": "response-sent",
      "theirDid": "did:peer:1zQmViZha5KQhFt2MtKR19mD3qX7oa8LD33qQF2yAjGcmjmU",
      "threadId": "460b34ac-c4fc-4f11-bfb4-4ee9b04b7d88"
    },
    "metadata": {},
    "id": "dbbbb4ca-0580-43ae-a0a2-bf94961475cc",
    "createdAt": "2025-11-03T23:34:21.434Z",
    "state": "completed",
    "role": "responder",
    "connectionId": "dbbbb4ca-0580-43ae-a0a2-bf94961475cc",
    "theirDid": "did:peer:1zQmViZha5KQhFt2MtKR19mD3qX7oa8LD33qQF2yAjGcmjmU",
    "theirLabel": "Yoko-4hfxe8s3lc",
    "autoAcceptConnection": true,
    "threadId": "460b34ac-c4fc-4f11-bfb4-4ee9b04b7d88",
    "protocol": "https://didcomm.org/didexchange/1.x",
    "updatedAt": "2025-11-03T23:34:26.068Z"
  },
  "clientContext": {}
}
```

### Proof Request Sent Webhook (Type: Proof)
```json
{
  "type": "Proof",
  "timestamp": "2025-11-01T08:54:38.790Z",
  "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b",
  "tenantId": "64eaee65-3495-4516-851e-548099b04a30",
  "data": {
    "id": "914275f5-2c58-4ce0-acc0-73c9b6b66155",
    "createdAt": "2025-11-01T08:54:38.000Z",
    "protocolVersion": "v1",
    "state": "request-sent",
    "role": "verifier",
    "connectionId": "4a355b36-d242-4e5d-9d85-089f3a01166f",
    "threadId": "e4165af2-9106-429a-ac9b-20df0bf99460",
    "autoAcceptProof": "never",
    "updatedAt": "2025-11-01T08:54:38.835Z"
  },
  "clientContext": {}
}
```

### Proof Presentation Received Webhook (Type: Proof)
```json
{
  "type": "Proof",
  "timestamp": "2025-11-01T08:55:03.035Z",
  "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b",
  "tenantId": "64eaee65-3495-4516-851e-548099b04a30",
  "data": {
    "id": "914275f5-2c58-4ce0-acc0-73c9b6b66155",
    "createdAt": "2025-11-01T08:54:38.000Z",
    "protocolVersion": "v1",
    "state": "presentation-received",
    "role": "verifier",
    "connectionId": "4a355b36-d242-4e5d-9d85-089f3a01166f",
    "threadId": "e4165af2-9106-429a-ac9b-20df0bf99460",
    "autoAcceptProof": "never",
    "updatedAt": "2025-11-01T08:55:03.000Z",
    "isVerified": true
  },
  "clientContext": {}
}
```

**Note:** The actual proof attributes are retrieved separately via the ConfirmD Platform API (`GET /proofs/{proofId}`), not included in the webhook payload. The webhook handler automatically calls this API when receiving `presentation-received` or `done` states.

### Proof Presentation Received Webhook (Type: Connection - Alternative Format)
```json
{
  "type": "Connection",
  "timestamp": "2025-11-03T23:34:39.375Z",
  "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b",
  "tenantId": "64eaee65-3495-4516-851e-548099b04a30",
  "data": {
    "_tags": {
      "connectionId": "dbbbb4ca-0580-43ae-a0a2-bf94961475cc",
      "role": "verifier",
      "state": "request-sent",
      "threadId": "e4165af2-9106-429a-ac9b-20df0bf99460"
    },
    "id": "a91b588a-ccff-4996-a142-5f688a4ab91c",
    "createdAt": "2025-11-03T23:34:30.738Z",
    "protocolVersion": "v1",
    "state": "presentation-received",
    "role": "verifier",
    "connectionId": "dbbbb4ca-0580-43ae-a0a2-bf94961475cc",
    "threadId": "e4165af2-9106-429a-ac9b-20df0bf99460",
    "autoAcceptProof": "never",
    "updatedAt": "2025-11-03T23:34:38.786Z",
    "isVerified": true
  },
  "clientContext": {}
}
```

**Note:** Some proof webhooks may come with `type: "Connection"` instead of `type: "Proof"`. The webhook handler accepts both formats by checking the `state` field for proof-related states.

### Credential Done Webhook (Type: Credential)
```json
{
  "type": "Credential",
  "timestamp": "2025-11-01T08:55:33.743Z",
  "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b",
  "tenantId": "64eaee65-3495-4516-851e-548099b04a30",
  "data": {
    "id": "credential-id-here",
    "createdAt": "2025-11-01T08:55:30.000Z",
    "state": "done",
    "connectionId": "4a355b36-d242-4e5d-9d85-089f3a01166f",
    "role": "issuer"
  },
  "clientContext": {}
}
```

**Note:** The application currently does not process `Credential` type webhooks. These are logged but ignored. If you need credential issuance tracking in the future, additional code will be required.

---

## 10. Important Notes

### Ngrok URL Changes
- The ngrok URL `https://28c5ff3d9edf.ngrok-free.app` is specific to the current session
- If ngrok is restarted, the URL **WILL CHANGE** and you must update the Platform webhook configuration
- Consider using a paid ngrok account for a persistent URL

### Webhook Security
- The endpoint expects the `x-api-key` header for authentication
- Webhooks from unknown sources will be rejected
- The API key is configured in the `.env` file as `CONFIRMD_API_KEY`

### Event Ordering
- Webhooks may arrive out of order due to network conditions
- The application handles this by using state fields rather than event sequence
- Each webhook includes a timestamp for temporal ordering

---

## 11. Quick Setup Checklist

Use this checklist when configuring webhooks on the Platform:

- [ ] Organization ID configured: `67953cea-68c7-464b-b7a3-99a10856e22b`
- [ ] Webhook URL set: `https://28c5ff3d9edf.ngrok-free.app/api/webhooks/confirmd`
- [ ] HTTP Method: POST
- [ ] Content-Type: application/json
- [ ] Authentication header configured: x-api-key
- [ ] Connection events enabled (request-received, response-sent, completed)
- [ ] Proof events enabled (request-sent, presentation-received, done, abandoned)
- [ ] Retry policy configured (3 retries, exponential backoff)
- [ ] Timeout set to 10 seconds
- [ ] Test webhook sent successfully
- [ ] Webhook delivery logs show successful deliveries

---

## 12. Contact Information

**Local Server:** http://localhost:3300
**Ngrok Public URL:** https://28c5ff3d9edf.ngrok-free.app
**Webhook Endpoint:** /api/webhooks/confirmd
**Server Logs:** Console output from `npm run dev`

---

**Last Updated:** 2025-11-04
**Version:** 1.0
**Status:** Active Configuration
