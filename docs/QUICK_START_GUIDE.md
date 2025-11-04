# Quick Start Guide: Real-Time Connection Notifications

A condensed guide to get real-time notifications working in under 30 minutes.

## Prerequisites

- Next.js 15+ application
- Prisma with database setup
- ConfirmD Platform account
- Node.js 18+

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install ws
npm install --save-dev @types/ws
```

### 2. Update package.json

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  }
}
```

### 3. Create Custom Server

Create `server.js` in project root:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname: 'localhost', port: 3300 });
const handle = app.getRequestHandler();

// WebSocket state
const clients = new Map();
const sessionMap = new WeakMap();

function linkConnectionToSession(sessionId, connectionId) {
  const sessionClients = clients.get(sessionId);
  if (!sessionClients) return;

  if (!clients.has(connectionId)) {
    clients.set(connectionId, new Set());
  }

  sessionClients.forEach((ws) => {
    clients.get(connectionId).add(ws);
    const metadata = sessionMap.get(ws);
    if (metadata) metadata.connectionId = connectionId;
  });
}

function broadcastStatusUpdate(key, status, data = {}) {
  const clientSet = clients.get(key);
  if (!clientSet) return;

  const message = JSON.stringify({
    type: 'status_update',
    status,
    timestamp: new Date().toISOString(),
    ...data,
  });

  clientSet.forEach((ws) => {
    if (ws.readyState === 1) ws.send(message);
  });
}

global.wsManager = { broadcastStatusUpdate, linkConnectionToSession };

app.prepare().then(() => {
  const server = createServer(handle);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url || '', true);
    if (pathname === '/ws/connections') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request) => {
    const { query } = parse(request.url || '', true);
    const sessionId = query.sessionId;

    if (!sessionId) {
      ws.close(1008, 'Session ID required');
      return;
    }

    if (!clients.has(sessionId)) {
      clients.set(sessionId, new Set());
    }
    clients.get(sessionId).add(ws);
    sessionMap.set(ws, { sessionId });

    ws.send(JSON.stringify({ type: 'connected', sessionId }));

    ws.on('close', () => {
      const metadata = sessionMap.get(ws);
      if (metadata) {
        [metadata.sessionId, metadata.connectionId].forEach(key => {
          if (key && clients.has(key)) {
            clients.get(key).delete(ws);
            if (clients.get(key).size === 0) clients.delete(key);
          }
        });
      }
    });
  });

  server.listen(3300, () => {
    console.log('> Ready on http://localhost:3300 with WebSocket support');
  });
});
```

### 4. Create Webhook Handler

Create `src/app/api/webhooks/confirmd/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  // Store webhook (upsert to handle duplicates)
  await prisma.webhookEvent.upsert({
    where: { webhookId: payload.id },
    create: {
      webhookId: payload.id,
      topic: `connections.${payload.state}`,
      connectionId: payload.connectionId,
      payload: JSON.stringify(payload),
    },
    update: {
      payload: JSON.stringify(payload),
    },
  });

  if (payload.type === "Connection" && payload.connectionId) {
    // Find session (by connectionId or most recent invitation)
    let session = await prisma.connectionSession.findFirst({
      where: { connectionId: payload.connectionId },
    });

    if (!session) {
      session = await prisma.connectionSession.findFirst({
        where: { connectionId: null, status: "invitation" },
        orderBy: { createdAt: "desc" },
      });
    }

    if (session) {
      const statusMap = {
        "response-sent": "response",
        "completed": "active",
      };
      const status = statusMap[payload.state] || payload.state;

      // Update database
      await prisma.connectionSession.update({
        where: { id: session.id },
        data: {
          status,
          connectionId: payload.connectionId,
          theirLabel: payload.theirLabel,
        },
      });

      // Broadcast via WebSocket
      const wsManager = (global as any).wsManager;
      if (wsManager) {
        wsManager.linkConnectionToSession(session.sessionId, payload.connectionId);
        wsManager.broadcastStatusUpdate(payload.connectionId, status, {
          sessionId: session.sessionId,
          connectionId: payload.connectionId,
          theirLabel: payload.theirLabel,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
```

### 5. Create WebSocket Hook

Create `src/hooks/useConnectionWebSocket.ts`:

```typescript
import { useEffect, useRef, useState } from 'react';

export function useConnectionWebSocket(sessionId: string | null) {
  const [status, setStatus] = useState('invitation');
  const [connectionData, setConnectionData] = useState(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/ws/connections?sessionId=${sessionId}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'status_update') {
        setStatus(message.status);
        setConnectionData({
          connectionId: message.connectionId,
          theirLabel: message.theirLabel,
        });
      }
    };

    ws.onclose = () => {
      setTimeout(() => {
        // Reconnect after 3 seconds
        ws.close();
      }, 3000);
    };

    wsRef.current = ws;

    return () => ws.close();
  }, [sessionId]);

  return { status, connectionData };
}
```

### 6. Use in Component

```typescript
"use client";

import { useState, useEffect } from "react";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";

export default function ConnectPage() {
  const [sessionId, setSessionId] = useState("");
  const { status, connectionData } = useConnectionWebSocket(sessionId);

  useEffect(() => {
    if (status === "active") {
      console.log("Connected!", connectionData);
    }
  }, [status]);

  const createSession = async () => {
    const res = await fetch('/api/connections/session', {
      method: 'POST',
      body: JSON.stringify({ requestType: 'registration' }),
    });
    const data = await res.json();
    setSessionId(data.data.sessionId);
  };

  return (
    <div>
      <button onClick={createSession}>Connect</button>
      <p>Status: {status}</p>
    </div>
  );
}
```

## Environment Variables

Add to `.env`:

```bash
WEBHOOK_SECRET=your-webhook-secret-here
CONFIRMD_CLIENT_ID=your-client-id
CONFIRMD_CLIENT_SECRET=your-client-secret
```

## Test It

1. **Start server:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:3300/register/connect`

3. **Watch logs for:**
   - `WebSocket client connected`
   - `Received webhook from Confirmd Platform`
   - `Broadcast sent`

4. **Scan QR code** and see instant updates!

## Common Issues

### WebSocket Won't Connect
- Check if custom server is running (not `next dev`)
- Verify browser console for errors
- Ensure sessionId is passed in URL

### Webhook Not Received
- Register webhook with ngrok/tunnel URL
- Verify `X-API-Key` header matches `WEBHOOK_SECRET`
- Check webhook is registered: `https://api.confirmd.com/webhooks`

### Session Not Matched
- Ensure session exists BEFORE scanning QR
- Check session has `status: "invitation"`
- Verify database has `connectionId` column

## Next Steps

- Read [REAL_TIME_NOTIFICATIONS_GUIDE.md](./REAL_TIME_NOTIFICATIONS_GUIDE.md) for deep dive
- See [SESSION_MATCHING_FIX.md](./SESSION_MATCHING_FIX.md) for session matching details
- Review [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md) for webhook setup

## Key Concepts

1. **Dual-Key Tracking**: WebSocket clients tracked by `sessionId` (initial) and `connectionId` (after webhook)
2. **Temporal Matching**: Find most recent "invitation" session when connectionId not yet linked
3. **Upsert Pattern**: Handle duplicate webhooks gracefully
4. **Flat Payload**: ConfirmD webhooks use flat structure (not `payload.data.connectionId`)

## Architecture Overview

```
Browser → WebSocket → Server → Webhook ← ConfirmD
   ↓                     ↓
sessionId           connectionId
   └─────── Linked ──────┘
```

That's it! You now have real-time connection notifications. 🎉
