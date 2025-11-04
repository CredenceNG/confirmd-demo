# Webhook Setup Guide

This guide walks you through configuring webhooks for real-time connection notifications from the Confirmd Platform.

## Overview

The webhook system enables real-time notifications when users:
- Scan QR codes with the ConfirmD App
- Establish wallet connections
- Complete connection handshakes

## Prerequisites

1. ✅ Dev server running with WebSocket support
2. ✅ ngrok tunnel active (or similar tunneling service)
3. ✅ WEBHOOK_SECRET configured in `.env`
4. ✅ Confirmd Platform credentials configured

## Current Configuration

Based on your setup:
- **ngrok URL**: `https://c0d08bbf42e2.ngrok-free.app`
- **Webhook endpoint**: `https://c0d08bbf42e2.ngrok-free.app/api/webhooks/confirmd`
- **Dev server**: Running on `http://localhost:3300` with WebSocket support ✅

## Step 1: Verify Environment Variables

Check your `.env` file has:

```bash
# Confirmd Platform API
CONFIRMD_API_URL=https://manager.credence.ng
CONFIRMD_CLIENT_ID=your-client-id
CONFIRMD_CLIENT_SECRET=your-client-secret
ORGANIZATION_ID=your-org-id

# Webhook Configuration
WEBHOOK_SECRET=your-secure-webhook-secret-change-this-in-production
```

## Step 2: Register Webhook with Confirmd Platform

Run the webhook registration script:

```bash
npm run webhook:register
```

This script will:
1. Authenticate with Confirmd Platform using OAuth
2. Register the webhook URL: `https://c0d08bbf42e2.ngrok-free.app/api/webhooks/confirmd`
3. Subscribe to connection events:
   - `connections.invitation`
   - `connections.request`
   - `connections.response`
   - `connections.active`
   - `connections.completed`

## Step 3: Test the Webhook

### Option A: Scan QR Code (Real Flow)

1. Navigate to http://localhost:3300/register/connect
2. Click "Connect Wallet"
3. Scan the QR code with the ConfirmD App
4. Watch the server logs for webhook notifications

Expected server output:
```
[INFO] Processing webhook event
{
  "topic": "connections.request",
  "connectionId": "...",
  "state": "request"
}
[INFO] Updated session from webhook
{
  "sessionId": "session-...",
  "status": "request",
  "connectionId": "..."
}
WebSocket client connected { sessionId: 'session-...' }
```

### Option B: Manual Webhook Test

Send a test webhook using curl:

```bash
curl -X POST https://c0d08bbf42e2.ngrok-free.app/api/webhooks/confirmd \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-webhook-secret-change-this-in-production" \
  -d '{
    "webhookId": "test-webhook-001",
    "topic": "connections.active",
    "timestamp": "2025-10-31T21:00:00Z",
    "organizationId": "org-123",
    "agentId": "agent-456",
    "data": {
      "connectionId": "conn-789",
      "state": "active",
      "invitationId": "inv-1761947241235-zfxtngsqe",
      "theirDid": "did:peer:...",
      "theirLabel": "ConfirmD Mobile App"
    }
  }'
```

Replace `inv-1761947241235-zfxtngsqe` with the `invitationId` from your current session (visible in server logs).

## Step 4: Monitor Webhook Activity

### Check Server Logs

```bash
# Watch for webhook events
tail -f logs/app.log | grep "webhook"
```

### Check Database

```bash
# View webhook events
npx prisma studio

# Navigate to WebhookEvent table
# Navigate to ConnectionSession table
```

### Check WebSocket Connections

In browser console (http://localhost:3300/register/connect):
```javascript
// Check WebSocket connection status
console.log('WebSocket status:', window.WebSocket);
```

## Troubleshooting

### Webhook Not Received

1. **Check ngrok is running**:
   ```bash
   ngrok http 3300
   ```

2. **Verify webhook endpoint is accessible**:
   ```bash
   curl https://c0d08bbf42e2.ngrok-free.app/api/webhooks/confirmd
   ```
   Expected: `{"status":"ok","message":"Confirmd webhook endpoint is active",...}`

3. **Check Confirmd Platform webhook subscriptions**:
   ```bash
   # List all webhooks
   curl -X GET https://manager.credence.ng/webhooks \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### WebSocket Not Connecting

1. **Verify custom server is running**:
   Server output should show:
   ```
   > Ready on http://localhost:3300 with WebSocket support
   ✓ WebSocket server initialized
   ```

2. **Check WebSocket path**:
   Should be `ws://localhost:3300/ws/connections?sessionId=SESSION_ID`

3. **Restart dev server**:
   ```bash
   # Kill current server
   # Then:
   npm run dev
   ```

### Status Not Updating

1. **Check session ID matches**:
   - Frontend sessionId
   - Webhook invitationId
   - Database ConnectionSession record

2. **Check database for session**:
   ```bash
   npx prisma studio
   # Find session by sessionId
   # Verify status field is updating
   ```

3. **Check polling is working**:
   Server logs should show:
   ```
   GET /api/connections/session?sessionId=... 200 in 20ms
   ```

## Webhook Flow Diagram

```
┌─────────────────┐
│  User scans QR  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ConfirmD App   │
│  Connects to    │
│  Platform       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Confirmd Platform              │
│  Sends webhook to:              │
│  https://c0d08bbf42e2.ngrok-... │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  /api/webhooks/confirmd         │
│  - Validates X-API-Key          │
│  - Stores WebhookEvent          │
│  - Updates ConnectionSession    │
│  - Broadcasts via WebSocket     │
└────────┬────────────────────────┘
         │
         ├─────────────┬────────────────┐
         ▼             ▼                ▼
  ┌──────────┐  ┌──────────┐   ┌──────────┐
  │ Database │  │ WebSocket│   │ Polling  │
  │  Update  │  │ Broadcast│   │  Picks   │
  │          │  │          │   │   Up     │
  └──────────┘  └────┬─────┘   └────┬─────┘
                     │              │
                     ▼              ▼
              ┌─────────────────────────┐
              │   Frontend Updates      │
              │   - Status changes      │
              │   - UI notifications    │
              │   - Progress to next    │
              └─────────────────────────┘
```

## Next Steps

Once webhooks are working:

1. **Test Complete Flow**:
   - Generate QR code
   - Scan with ConfirmD App
   - Verify webhook received
   - Confirm UI updates in real-time

2. **Add Credential Exchange**:
   - Request student data from wallet
   - Receive credential presentation
   - Verify and store data

3. **Production Deployment**:
   - Replace ngrok with permanent domain
   - Update webhook URL in Confirmd Platform
   - Enable SSL/TLS
   - Add monitoring and alerts

## Support

For issues:
- Check server logs: Server output shows all webhook activity
- Check database: `npx prisma studio`
- Review [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md)
- Review [WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md)
