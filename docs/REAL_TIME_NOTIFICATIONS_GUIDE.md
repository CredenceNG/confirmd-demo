# Real-Time Connection Notifications Guide

A comprehensive guide for implementing real-time connection status notifications using webhooks and WebSockets with the ConfirmD Platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Implementation Steps](#implementation-steps)
4. [Common Pitfalls](#common-pitfalls)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Overview

This guide explains how to implement real-time notifications when users connect their digital wallets to your application using the ConfirmD Platform. When a user scans a QR code with their wallet, your frontend will instantly receive status updates without polling.

### What You'll Build

- **Backend**: Webhook endpoint to receive connection events from ConfirmD Platform
- **WebSocket Server**: Real-time bidirectional communication with frontend
- **Frontend**: React hook to receive instant status updates
- **Session Matching**: Logic to match webhook events to user sessions

### Key Challenges Solved

1. **Multi-use Invitation Problem**: All sessions use the same organization invitation URL
2. **Session Matching**: Mapping webhook `connectionId` to local `sessionId`
3. **Real-time Updates**: WebSocket integration with Next.js custom server
4. **Duplicate Webhooks**: Handling multiple events for the same connection

---

## Architecture

### High-Level Flow

```
User Browser                    Your Server                    ConfirmD Platform
     |                               |                                |
     |--1. Create Session----------->|                                |
     |<------sessionId + QR----------|                                |
     |                               |                                |
     |--2. Connect WebSocket-------->|                                |
     |   (with sessionId)            |                                |
     |<-----"connected" message------|                                |
     |                               |                                |
     |  [User scans QR code]         |                                |
     |                               |<--3. Webhook: response-sent----|
     |                               |    (with connectionId)         |
     |                               |                                |
     |                               |--4. Match session------------->|
     |                               |    (by most recent invitation) |
     |                               |                                |
     |                               |--5. Link connectionId--------->|
     |                               |    to sessionId in WS map      |
     |                               |                                |
     |<--6. WebSocket broadcast------|                                |
     |    (status: "response")       |                                |
     |                               |                                |
     |  [Frontend updates UI]        |                                |
     |                               |                                |
     |                               |<--7. Webhook: completed--------|
     |<--8. WebSocket broadcast------|                                |
     |    (status: "active")         |                                |
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  useConnectionWebSocket Hook                        │    │
│  │  - Connects to ws://server/ws/connections          │    │
│  │  - Receives status updates                         │    │
│  │  - Auto-reconnects on disconnect                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │ WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Next.js Server                     │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │  WebSocket Manager      │  │  Webhook Handler        │  │
│  │  - Dual-key tracking    │  │  - Receives events      │  │
│  │  - sessionId → WS       │  │  - Matches sessions     │  │
│  │  - connectionId → WS    │  │  - Updates database     │  │
│  │  - Broadcast updates    │  │  - Triggers broadcasts  │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     ConfirmD Platform                        │
│  - Manages DID connections                                  │
│  - Sends webhooks on state changes                          │
│  - States: response-sent → completed                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Step 1: Set Up Custom Next.js Server

Create a custom server to handle both HTTP and WebSocket connections.

**File: `server.js`**

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3300', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Dual-key tracking: by sessionId (initial) and connectionId (after webhook)
const clients = new Map(); // sessionId or connectionId -> Set<WebSocket>
const sessionMap = new WeakMap(); // WebSocket -> { sessionId, connectionId? }

function registerClient(sessionId, ws) {
  if (!clients.has(sessionId)) {
    clients.set(sessionId, new Set());
  }
  clients.get(sessionId).add(ws);
  sessionMap.set(ws, { sessionId });

  ws.on('close', () => unregisterClient(ws));
  ws.on('error', (error) => {
    console.error('WebSocket error', { sessionId, error: error.message });
    unregisterClient(ws);
  });
}

function unregisterClient(ws) {
  const metadata = sessionMap.get(ws);
  if (metadata) {
    const { sessionId, connectionId } = metadata;

    // Remove from sessionId map
    if (sessionId) {
      const sessionClients = clients.get(sessionId);
      if (sessionClients) {
        sessionClients.delete(ws);
        if (sessionClients.size === 0) {
          clients.delete(sessionId);
        }
      }
    }

    // Remove from connectionId map if exists
    if (connectionId) {
      const connectionClients = clients.get(connectionId);
      if (connectionClients) {
        connectionClients.delete(ws);
        if (connectionClients.size === 0) {
          clients.delete(connectionId);
        }
      }
    }
  }
}

function linkConnectionToSession(sessionId, connectionId) {
  const sessionClients = clients.get(sessionId);
  if (!sessionClients || sessionClients.size === 0) {
    console.log('No WebSocket clients found for session', { sessionId });
    return;
  }

  // Create connectionId entry in map
  if (!clients.has(connectionId)) {
    clients.set(connectionId, new Set());
  }

  // Add all session WebSockets to connectionId map
  sessionClients.forEach((ws) => {
    clients.get(connectionId).add(ws);

    // Update metadata to include connectionId
    const metadata = sessionMap.get(ws);
    if (metadata) {
      metadata.connectionId = connectionId;
    }
  });

  console.log('Linked connectionId to session', {
    sessionId,
    connectionId,
    clientCount: sessionClients.size
  });
}

function broadcastStatusUpdate(sessionIdOrConnectionId, status, data = {}) {
  const clients_set = clients.get(sessionIdOrConnectionId);

  if (!clients_set || clients_set.size === 0) {
    console.log('No clients found for broadcast', {
      key: sessionIdOrConnectionId,
      status
    });
    return;
  }

  const message = JSON.stringify({
    type: 'status_update',
    sessionId: data.sessionId || sessionIdOrConnectionId,
    status,
    timestamp: new Date().toISOString(),
    ...data,
  });

  let sent = 0;
  clients_set.forEach((ws) => {
    if (ws.readyState === 1) { // OPEN
      ws.send(message);
      sent++;
    }
  });

  console.log('Broadcast sent', {
    key: sessionIdOrConnectionId,
    status,
    clientCount: clients_set.size,
    sentCount: sent
  });
}

// Export for use by webhook handler
global.wsManager = {
  broadcastStatusUpdate,
  linkConnectionToSession
};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade
  server.on('upgrade', (request, socket, head) => {
    const { pathname, query } = parse(request.url || '', true);

    if (pathname === '/ws/connections') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Handle WebSocket connections
  wss.on('connection', (ws, request) => {
    const { query } = parse(request.url || '', true);
    const sessionId = query.sessionId;

    if (!sessionId) {
      ws.close(1008, 'Session ID required');
      return;
    }

    registerClient(sessionId, ws);

    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      message: 'Connected to connection status updates',
      timestamp: new Date().toISOString(),
    }));

    console.log('WebSocket client connected', { sessionId });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} with WebSocket support`);
    console.log('✓ WebSocket server initialized');
  });
});
```

**Key Concepts:**

- **Dual-Key Tracking**: Clients tracked by both `sessionId` (initial) and `connectionId` (after webhook)
- **Global Export**: `global.wsManager` makes functions available to webhook handlers
- **WeakMap Metadata**: Stores connection info without preventing garbage collection

### Step 2: Implement Webhook Handler

Create an API route to receive webhooks from ConfirmD Platform.

**File: `src/app/api/webhooks/confirmd/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { processWebhookEvent } from "@/lib/api/connection-service";
import { ConfirmdWebhookPayload } from "@/lib/api/types";

export async function POST(request: NextRequest) {
  try {
    // Validate webhook authentication
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.WEBHOOK_SECRET;

    if (apiKey !== expectedKey) {
      logger.warn("Invalid webhook API key");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse webhook payload (FLAT structure, not nested!)
    const payload: ConfirmdWebhookPayload = await request.json();

    logger.info("Received webhook from Confirmd Platform", {
      type: payload.type,
      connectionId: payload.connectionId,
      state: payload.state,
      theirLabel: payload.theirLabel,
      orgId: payload.orgId,
      timestamp: payload.timestamp,
    });

    // Process the webhook
    await processWebhookEvent(payload);

    return NextResponse.json({
      received: true,
      connectionId: payload.connectionId,
      state: payload.state,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("Error processing webhook", {
      error: error.message,
      stack: error.stack,
    });

    // Return 200 to prevent ConfirmD from retrying
    return NextResponse.json(
      { received: false, error: "Internal processing error" },
      { status: 200 }
    );
  }
}
```

**Important Notes:**

- ConfirmD webhooks use **FLAT payload structure** (not nested with `data` object)
- Always return HTTP 200 to prevent retry storms
- Validate `X-API-Key` header for security

### Step 3: Implement Session Matching Logic

**File: `src/lib/api/connection-service.ts`**

```typescript
import { prisma } from "./prisma";
import { logger } from "../logger";
import { ConfirmdWebhookPayload } from "./types";

export async function processWebhookEvent(
  payload: ConfirmdWebhookPayload
): Promise<void> {
  logger.info("Processing webhook event", {
    type: payload.type,
    connectionId: payload.connectionId,
    state: payload.state,
    theirLabel: payload.theirLabel,
  });

  // Store webhook event (use upsert to handle duplicates)
  await prisma.webhookEvent.upsert({
    where: { webhookId: payload.id },
    create: {
      webhookId: payload.id,
      topic: `connections.${payload.state}`,
      organizationId: payload.orgId,
      agentId: payload.orgId,
      connectionId: payload.connectionId || null,
      payload: JSON.stringify(payload),
      processed: false,
    },
    update: {
      topic: `connections.${payload.state}`,
      connectionId: payload.connectionId || null,
      payload: JSON.stringify(payload),
      processed: false,
    },
  });

  if (payload.type === "Connection" && payload.connectionId) {
    // Strategy 1: Try to find session by connectionId (if already linked)
    let session = await prisma.connectionSession.findFirst({
      where: { connectionId: payload.connectionId },
    });

    // Strategy 2: Find most recent session in "invitation" state
    // This works with multi-use invitations - the newest session
    // without a connectionId is likely the one being connected
    if (!session) {
      session = await prisma.connectionSession.findFirst({
        where: {
          connectionId: null,
          status: "invitation",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (session) {
        logger.info("Matched webhook to most recent invitation session", {
          sessionId: session.sessionId,
          connectionId: payload.connectionId,
        });
      }
    }

    if (session) {
      // Map ConfirmD states to your application states
      const statusMap: Record<string, string> = {
        "response-sent": "response",
        "completed": "active",
        "active": "active",
        "request-sent": "request",
        "invitation": "invitation",
      };

      const mappedStatus = statusMap[payload.state] || payload.state;

      // Update session in database
      await prisma.connectionSession.update({
        where: { id: session.id },
        data: {
          status: mappedStatus,
          connectionId: payload.connectionId,
          theirLabel: payload.theirLabel || session.theirLabel,
          theirDid: payload.theirDid || session.theirDid,
          updatedAt: new Date(),
        },
      });

      logger.info("Updated session from webhook", {
        sessionId: session.sessionId,
        status: mappedStatus,
        connectionId: payload.connectionId,
        theirLabel: payload.theirLabel,
      });

      // Broadcast via WebSocket
      try {
        const wsManager = (global as any).wsManager;
        if (wsManager) {
          // Link connectionId to sessionId in WebSocket manager
          if (typeof wsManager.linkConnectionToSession === 'function') {
            wsManager.linkConnectionToSession(session.sessionId, payload.connectionId);
          }

          // Broadcast using connectionId (preferred) or sessionId (fallback)
          if (typeof wsManager.broadcastStatusUpdate === 'function') {
            wsManager.broadcastStatusUpdate(
              payload.connectionId,
              mappedStatus,
              {
                sessionId: session.sessionId,
                connectionId: payload.connectionId,
                theirLabel: payload.theirLabel,
              }
            );
          }
        }
      } catch (error: any) {
        logger.error("Failed to broadcast WebSocket update", {
          sessionId: session.sessionId,
          error: error.message,
        });
      }
    } else {
      logger.warn("No session found for webhook event", {
        connectionId: payload.connectionId,
        outOfBandId: payload.outOfBandId,
      });
    }
  }
}
```

**Critical Points:**

- **Two-Strategy Matching**: First try by `connectionId`, fallback to most recent invitation
- **Temporal Ordering**: `orderBy: { createdAt: "desc" }` finds newest session
- **Upsert Pattern**: Prevents duplicate webhook errors
- **State Mapping**: ConfirmD states → your application states

### Step 4: Create Frontend WebSocket Hook

**File: `src/hooks/useConnectionWebSocket.ts`**

```typescript
import { useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: 'connected' | 'status_update' | 'error';
  sessionId?: string;
  status?: string;
  connectionId?: string;
  theirLabel?: string;
  message?: string;
  timestamp: string;
}

export function useConnectionWebSocket(sessionId: string | null) {
  const [status, setStatus] = useState<string>('invitation');
  const [connectionData, setConnectionData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/connections?sessionId=${sessionId}`;

      console.log('[WebSocket] Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message);

          if (message.type === 'connected') {
            console.log('[WebSocket] Connection established:', message.message);
          } else if (message.type === 'status_update') {
            console.log('[WebSocket] Status update:', message.status);
            if (message.status) {
              setStatus(message.status);
              setConnectionData({
                connectionId: message.connectionId,
                theirLabel: message.theirLabel,
              });
            }
          } else if (message.type === 'error') {
            console.error('[WebSocket] Error:', message.message);
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  return {
    status,
    connectionData,
    isConnected,
  };
}
```

### Step 5: Use Hook in React Component

**File: `src/app/register/connect/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";

export default function ConnectPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");

  // Use WebSocket for real-time updates
  const { status, connectionData, isConnected } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle status changes
  useEffect(() => {
    if (status === "active" || status === "completed") {
      console.log("Connection established!", connectionData);
      // Proceed to next step
    }
  }, [status, connectionData]);

  const handleConnect = async () => {
    // Create session
    const response = await fetch('/api/connections/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'registration' }),
    });

    const data = await response.json();
    if (data.success) {
      setSessionId(data.data.sessionId);
      setInvitationUrl(data.data.invitationUrl);
      // WebSocket connects automatically via hook
    }
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet</button>
      {invitationUrl && <QRCode value={invitationUrl} />}
      <p>Status: {status}</p>
      <p>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}
```

---

## Common Pitfalls

### 1. **Webhook Payload Structure**

❌ **Wrong**: Assuming nested structure
```typescript
const connectionId = payload.data.connectionId; // undefined!
```

✅ **Correct**: Use flat structure
```typescript
const connectionId = payload.connectionId;
```

### 2. **Session Matching with Multi-Use Invitations**

❌ **Wrong**: Trying to match by `outOfBandId`
```typescript
// All sessions have same outOfBandId!
const session = await prisma.connectionSession.findFirst({
  where: { invitationUrl: { contains: payload.outOfBandId } }
});
```

✅ **Correct**: Use temporal ordering
```typescript
const session = await prisma.connectionSession.findFirst({
  where: { connectionId: null, status: "invitation" },
  orderBy: { createdAt: "desc" }
});
```

### 3. **WebSocket Registration Timing**

❌ **Wrong**: Registering only by connectionId
```typescript
// connectionId not available until webhook arrives!
registerClient(connectionId, ws);
```

✅ **Correct**: Register by sessionId, link connectionId later
```typescript
registerClient(sessionId, ws); // Initial
linkConnectionToSession(sessionId, connectionId); // After webhook
```

### 4. **Duplicate Webhook Handling**

❌ **Wrong**: Using `create()`
```typescript
await prisma.webhookEvent.create({ data: { webhookId: payload.id } });
// Throws: Unique constraint failed
```

✅ **Correct**: Using `upsert()`
```typescript
await prisma.webhookEvent.upsert({
  where: { webhookId: payload.id },
  create: { /* ... */ },
  update: { /* ... */ }
});
```

---

## Testing

### Manual Testing Steps

1. **Start your server**
   ```bash
   npm run dev
   ```

2. **Navigate to connection page**
   ```
   http://localhost:3300/register/connect
   ```

3. **Monitor server logs** (look for):
   - `WebSocket client connected`
   - `Received webhook from Confirmd Platform`
   - `Matched webhook to most recent invitation session`
   - `Linked connectionId to session`
   - `Broadcast sent`

4. **Scan QR code** with ConfirmD mobile app

5. **Verify frontend updates** instantly

### Expected Log Sequence

```
[INFO] Creating connection session { sessionId: "session-xxx" }
WebSocket client connected { sessionId: "session-xxx" }
[INFO] Received webhook { connectionId: "conn-yyy", state: "response-sent" }
[INFO] Matched webhook to most recent invitation session
[INFO] Updated session from webhook { status: "response" }
Linked connectionId to session { clientCount: 1 }
Broadcast sent { sentCount: 1 }
```

### Verification Queries

**Check session status:**
```bash
sqlite3 prisma/dev.db "SELECT sessionId, status, connectionId, theirLabel FROM ConnectionSession WHERE sessionId = 'session-xxx'"
```

**Check webhook events:**
```bash
sqlite3 prisma/dev.db "SELECT webhookId, connectionId, topic, processed FROM WebhookEvent ORDER BY createdAt DESC LIMIT 5"
```

---

## Troubleshooting

### WebSocket Not Connecting

**Symptom**: Frontend shows "Disconnected", no real-time updates

**Check**:
1. Is custom server running? (`node server.js`)
2. Browser console errors?
3. Server logs show "WebSocket client connected"?

**Solution**:
```typescript
// Verify WebSocket URL construction
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws/connections?sessionId=${sessionId}`;
console.log('Connecting to:', wsUrl);
```

### Webhook Not Received

**Symptom**: QR code scanned, no webhook in logs

**Check**:
1. Is webhook registered with correct URL?
2. Is ngrok/tunnel running?
3. Is `X-API-Key` header correct?

**Solution**:
```bash
# Verify webhook registration
curl -X GET https://api.confirmd.com/webhooks \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Test webhook endpoint
curl -X POST http://localhost:3300/api/webhooks/confirmd \
  -H "X-API-Key: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"type":"Connection","connectionId":"test","state":"completed"}'
```

### Session Not Matched

**Symptom**: "No session found for webhook event"

**Check**:
1. Is there a session in "invitation" status?
2. Is session created BEFORE webhook arrives?

**Debug**:
```typescript
logger.info("Looking for session", {
  connectionId: payload.connectionId,
  allInvitationSessions: await prisma.connectionSession.findMany({
    where: { status: "invitation" },
    select: { sessionId: true, createdAt: true }
  })
});
```

### Broadcast Not Sent

**Symptom**: "No clients found for broadcast"

**Check**:
1. Is WebSocket still connected when webhook arrives?
2. Did `linkConnectionToSession()` execute?

**Debug**:
```javascript
console.log('Current clients map:', Array.from(clients.keys()));
console.log('Looking for:', connectionId);
```

---

## Performance Considerations

### Connection Limits

- **Development**: ~100 concurrent WebSocket connections
- **Production**: Use Redis for horizontal scaling

### Memory Management

- Use `WeakMap` for WebSocket metadata (automatic cleanup)
- Clear disconnected clients from map
- Set WebSocket ping/pong for dead connection detection

### Scaling

For production at scale:

1. **Use Redis for WebSocket state**
   ```typescript
   // Store client mappings in Redis
   await redis.sadd(`session:${sessionId}:clients`, clientId);
   await redis.sadd(`connection:${connectionId}:clients`, clientId);
   ```

2. **Use WebSocket clustering**
   ```typescript
   // With Socket.IO Redis adapter
   const io = new Server(server, {
     adapter: createAdapter(pubClient, subClient)
   });
   ```

3. **Implement rate limiting**
   ```typescript
   // Limit webhook processing
   const limiter = rateLimit({
     windowMs: 1000,
     max: 100
   });
   ```

---

## Security Best Practices

1. **Validate Webhook Signatures**
   ```typescript
   const signature = request.headers.get("x-webhook-signature");
   const isValid = verifySignature(payload, signature, WEBHOOK_SECRET);
   ```

2. **Sanitize WebSocket Messages**
   ```typescript
   const sanitized = {
     type: message.type,
     status: message.status?.substring(0, 50),
     // Prevent XSS in frontend
   };
   ```

3. **Implement Connection Timeouts**
   ```typescript
   setTimeout(() => {
     if (session.status === "invitation") {
       updateSession(sessionId, { status: "abandoned" });
     }
   }, 5 * 60 * 1000); // 5 minutes
   ```

4. **Use Environment Variables**
   ```bash
   WEBHOOK_SECRET=generate-random-secret
   CONFIRMD_CLIENT_ID=your-client-id
   CONFIRMD_CLIENT_SECRET=your-client-secret
   ```

---

## Related Documentation

- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md) - Webhook infrastructure
- [WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md) - WebSocket details
- [SESSION_MATCHING_FIX.md](./SESSION_MATCHING_FIX.md) - Session matching deep dive
- [WEBHOOK_SETUP_GUIDE.md](./WEBHOOK_SETUP_GUIDE.md) - Initial webhook setup

---

## Summary

This guide covered:

✅ Custom Next.js server with WebSocket support
✅ Dual-key WebSocket tracking (sessionId + connectionId)
✅ Smart session matching with multi-use invitations
✅ Real-time frontend updates via React hook
✅ Webhook deduplication and error handling
✅ Production-ready architecture patterns

**Key Takeaway**: The dual-key tracking system solves the fundamental challenge of matching ConfirmD webhooks (with `connectionId`) to local sessions (with `sessionId`) when using multi-use organization invitations.
