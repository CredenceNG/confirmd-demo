# Documentation Index

Complete documentation for implementing real-time connection notifications with the ConfirmD Platform.

## 📖 Documentation Structure

### 🚀 Getting Started

**[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)**
- **Who**: Developers wanting to get started quickly
- **Time**: 30 minutes
- **What**: Condensed step-by-step guide to implement real-time notifications
- **Includes**:
  - 5-minute setup
  - Minimal code examples
  - Common issues and solutions
  - Quick testing steps

### 📚 Complete Implementation

**[REAL_TIME_NOTIFICATIONS_GUIDE.md](./REAL_TIME_NOTIFICATIONS_GUIDE.md)**
- **Who**: Developers implementing production systems
- **Time**: 2-3 hours
- **What**: Comprehensive guide covering all aspects of the implementation
- **Includes**:
  - Architecture diagrams
  - Complete code examples
  - Common pitfalls (with ❌ wrong and ✅ correct examples)
  - Testing procedures
  - Troubleshooting guide
  - Performance considerations
  - Security best practices
  - Production deployment strategies

### 🔧 Technical Deep Dives

#### Session Matching

**[SESSION_MATCHING_FIX.md](./SESSION_MATCHING_FIX.md)**
- **Focus**: Dual-key WebSocket tracking system
- **Problem Solved**: Matching webhooks to sessions with multi-use invitations
- **Key Topics**:
  - Multi-use invitation challenge
  - Two-strategy session matching
  - Temporal ordering approach
  - Socket map pattern
  - End-to-end flow diagrams
  - Verification steps

#### Webhook Infrastructure

**[WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md)**
- **Focus**: Webhook endpoint and processing
- **Key Topics**:
  - Webhook endpoint setup
  - Authentication and security
  - Event processing
  - Database integration
  - Error handling

**[WEBHOOK_SETUP_GUIDE.md](./WEBHOOK_SETUP_GUIDE.md)**
- **Focus**: Initial webhook registration
- **Key Topics**:
  - ngrok tunnel setup
  - Webhook registration scripts
  - Testing webhook delivery
  - Debugging webhook issues

#### WebSocket Infrastructure

**[WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md)**
- **Focus**: Real-time communication setup
- **Key Topics**:
  - Custom Next.js server
  - WebSocket connection management
  - Client registration
  - Broadcasting mechanisms
  - Connection lifecycle

#### Legacy Documentation

**[INVITATION_FIX.md](./INVITATION_FIX.md)**
- **Focus**: Previous attempt using createConnectionInvitation
- **Status**: Deprecated (endpoint doesn't exist)
- **Value**: Understanding what didn't work and why

---

## 🎯 Choose Your Path

### Path 1: I Want to Get Started Quickly
1. Read [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
2. Follow the 5-minute setup
3. Test with your first connection
4. Refer to [REAL_TIME_NOTIFICATIONS_GUIDE.md](./REAL_TIME_NOTIFICATIONS_GUIDE.md) for troubleshooting

### Path 2: I Need to Understand Everything
1. Start with [REAL_TIME_NOTIFICATIONS_GUIDE.md](./REAL_TIME_NOTIFICATIONS_GUIDE.md) - Architecture section
2. Read [SESSION_MATCHING_FIX.md](./SESSION_MATCHING_FIX.md) - Understand the core challenge
3. Implement following [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
4. Deep dive into specifics:
   - [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md)
   - [WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md)
   - [WEBHOOK_SETUP_GUIDE.md](./WEBHOOK_SETUP_GUIDE.md)

### Path 3: I'm Debugging an Issue
1. Check [REAL_TIME_NOTIFICATIONS_GUIDE.md](./REAL_TIME_NOTIFICATIONS_GUIDE.md) - Troubleshooting section
2. Review logs against [SESSION_MATCHING_FIX.md](./SESSION_MATCHING_FIX.md) - Testing section
3. Verify webhook setup in [WEBHOOK_SETUP_GUIDE.md](./WEBHOOK_SETUP_GUIDE.md)

---

## 🔑 Core Concepts

### The Problem
When using ConfirmD Platform with **multi-use organization invitations**:
- All sessions share the same `outOfBandId`
- Webhooks arrive with `connectionId` (not `sessionId`)
- No direct way to match webhook to specific session
- WebSocket clients registered by `sessionId` (local ID)

### The Solution: Dual-Key Tracking

**Phase 1: Initial Registration**
```
User Session Created → WebSocket Connects
sessionId: "session-123" → clients.set("session-123", ws)
```

**Phase 2: Webhook Arrives**
```
Webhook with connectionId: "conn-456"
↓
Match to session (temporal: most recent "invitation" session)
↓
Link: clients.set("conn-456", ws)  ← Add second key
↓
Metadata: { sessionId: "session-123", connectionId: "conn-456" }
```

**Phase 3: Subsequent Webhooks**
```
Webhook with connectionId: "conn-456"
↓
Direct match: clients.get("conn-456")  ← Instant lookup
↓
Broadcast to all clients in set
```

### Session Matching Strategies

**Strategy 1: Direct Match (Subsequent Webhooks)**
```typescript
const session = await prisma.connectionSession.findFirst({
  where: { connectionId: payload.connectionId }
});
```

**Strategy 2: Temporal Match (First Webhook)**
```typescript
const session = await prisma.connectionSession.findFirst({
  where: {
    connectionId: null,
    status: "invitation"
  },
  orderBy: { createdAt: "desc" }  // ← Key: Most recent
});
```

### State Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                    │
│                                                          │
│  1. Create Session                                       │
│     POST /api/connections/session                        │
│     ← sessionId, invitationUrl                          │
│                                                          │
│  2. Connect WebSocket                                    │
│     ws://server/ws/connections?sessionId=xxx            │
│     ← {"type": "connected"}                             │
│                                                          │
│  3. Display QR Code                                      │
│     [QR with invitationUrl]                             │
│                                                          │
│  4. Receive Status Update (via WebSocket)               │
│     ← {"type": "status_update", "status": "active"}    │
│                                                          │
│  5. Update UI                                            │
│     "Connected!" ✅                                      │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ WebSocket
                         │
┌─────────────────────────────────────────────────────────┐
│                   Custom Server (Node)                   │
│                                                          │
│  WebSocket Manager                                       │
│  ┌────────────────────────────────────────────┐        │
│  │ clients: Map                                │        │
│  │  "session-123" → Set<WebSocket>            │        │
│  │  "conn-456"    → Set<WebSocket> (same)     │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Webhook Handler (/api/webhooks/confirmd)               │
│  1. Receive webhook with connectionId                   │
│  2. Match session (Strategy 1 or 2)                     │
│  3. Update database                                      │
│  4. linkConnectionToSession(sessionId, connectionId)    │
│  5. broadcastStatusUpdate(connectionId, status)         │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ HTTPS Webhook
                         │
┌─────────────────────────────────────────────────────────┐
│               ConfirmD Platform                          │
│                                                          │
│  User Scans QR → Connection Established                 │
│  ↓                                                       │
│  Send Webhook:                                           │
│  {                                                       │
│    "type": "Connection",                                │
│    "connectionId": "conn-456",                          │
│    "state": "response-sent",                            │
│    "theirLabel": "User's Wallet"                        │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Quick Reference

### WebSocket Message Types

```typescript
// Connection established
{
  "type": "connected",
  "sessionId": "session-xxx",
  "message": "Connected to connection status updates",
  "timestamp": "2025-11-01T05:27:23.000Z"
}

// Status update (what frontend receives)
{
  "type": "status_update",
  "sessionId": "session-xxx",
  "status": "active",
  "connectionId": "conn-yyy",
  "theirLabel": "Yoko-4hfxe8s3lc",
  "timestamp": "2025-11-01T05:27:23.000Z"
}
```

### Webhook Payload Structure

```typescript
// FLAT structure (not nested!)
{
  "type": "Connection",
  "id": "webhook-id",
  "connectionId": "conn-yyy",
  "state": "response-sent",  // or "completed"
  "theirLabel": "User's Wallet",
  "theirDid": "did:peer:...",
  "outOfBandId": "123825dd-f80b-4784-9287-4a7386c7fa94",
  "orgId": "eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95",
  "timestamp": "2025-11-01T05:27:23.000Z"
}
```

### State Mapping

| ConfirmD State | Your App State | Meaning |
|---------------|---------------|---------|
| `invitation` | `invitation` | Waiting for user to scan |
| `response-sent` | `response` | User scanned, responding |
| `completed` | `active` | Connection established |
| `active` | `active` | Connection active |

### Expected Log Sequence

```
[INFO] Creating connection session { sessionId: "session-xxx" }
WebSocket client connected { sessionId: "session-xxx" }

[User scans QR code]

[INFO] Received webhook { connectionId: "conn-yyy", state: "response-sent" }
[INFO] Matched webhook to most recent invitation session
[INFO] Updated session { status: "response" }
Linked connectionId to session { clientCount: 1 }
Broadcast sent { sentCount: 1 }

[INFO] Received webhook { connectionId: "conn-yyy", state: "completed" }
[INFO] Updated session { status: "active" }
Linked connectionId to session { clientCount: 1 }
Broadcast sent { sentCount: 1 }
```

---

## 🛠️ Common Commands

### Development
```bash
# Start development server
npm run dev

# View database
npx prisma studio

# Check webhook registration
curl -X GET https://api.confirmd.com/webhooks \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Testing
```bash
# Test webhook endpoint
curl -X POST http://localhost:3300/api/webhooks/confirmd \
  -H "X-API-Key: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"type":"Connection","connectionId":"test","state":"completed"}'

# Check session in database
sqlite3 prisma/dev.db "SELECT sessionId, status, connectionId FROM ConnectionSession"
```

### Debugging
```bash
# Watch server logs
npm run dev | grep -E "WebSocket|webhook|Broadcast"

# Check WebSocket connection in browser console
ws = new WebSocket('ws://localhost:3300/ws/connections?sessionId=test')
ws.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## 📝 Best Practices

### ✅ Do
- Use `upsert()` for webhook storage to handle duplicates
- Validate `X-API-Key` header for webhook security
- Return HTTP 200 for all webhooks (even errors) to prevent retries
- Log extensively during development
- Use temporal ordering for session matching
- Clean up disconnected WebSocket clients

### ❌ Don't
- Don't assume nested webhook payload structure (`payload.data.X`)
- Don't match sessions only by `outOfBandId` (all sessions share it)
- Don't register WebSocket clients by `connectionId` initially
- Don't use `create()` for webhooks (duplicates will error)
- Don't return 4xx/5xx for webhook errors (causes retry storms)

---

## 🆘 Getting Help

### When You're Stuck

1. **Check logs first**: Most issues are visible in server logs
2. **Verify WebSocket**: Browser console should show connection
3. **Test webhook**: Use curl to manually trigger webhook
4. **Check database**: Verify session exists and has correct status

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| "No clients found for broadcast" | WebSocket not connected | Check browser console, verify sessionId in URL |
| "No session found for webhook" | Session doesn't exist or wrong status | Verify session created before scanning |
| Webhook 401 error | Wrong API key | Check `X-API-Key` header matches `WEBHOOK_SECRET` |
| Frontend not updating | WebSocket not connected | Ensure using custom server (not `next dev`) |

---

## 🚀 Next Steps

After implementing real-time notifications:

1. **Add credential issuance** - Request and verify credentials
2. **Implement proof requests** - Request proof of credentials
3. **Add error recovery** - Handle connection timeouts and errors
4. **Scale with Redis** - For production multi-instance deployment
5. **Add monitoring** - Track connection success rates and latency

---

## 📄 License

ISC

## 🤝 Contributing

For issues and contributions, please visit the [GitHub repository](https://github.com/CredenceNG/nelfund-demo).

---

**Last Updated**: November 1, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
