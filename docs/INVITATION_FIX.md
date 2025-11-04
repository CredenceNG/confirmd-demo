# Connection Invitation Fix

## The Problem

The original implementation had a fundamental architecture flaw that prevented webhooks from being received when users scanned QR codes:

### What Was Wrong

1. **Multi-Use Invitation**: The application was using `confirmdClient.getConnectionInvitation()`, which retrieves the organization's **multi-use invitation** from `org_agents[0].agent_invitations[0]`

2. **Local Invitation IDs**: The application generated local `invitationId` values (e.g., `inv-1761948403852-yxzrppkr6`) that didn't exist on the Confirmd Platform

3. **No Association**: When users scanned the QR code, the Confirmd Platform had no way to know which application session the connection belonged to

4. **No Webhooks**: The Platform either didn't send webhooks or sent them without identifiers that could be matched to our sessions

### Evidence

- Multiple QR code scans performed by the user
- No `POST /api/webhooks/confirmd` requests received (except manual test)
- All database sessions remained in "invitation" status
- Polling continued indefinitely with no status updates

## The Solution

### Session-Specific Connection Invitations

The fix creates **unique, single-use invitations** for each registration session via the Confirmd Platform API:

#### 1. New Method: `createConnectionInvitation()`

Added to [confirmd-client.ts](../src/lib/api/confirmd-client.ts):

```typescript
async createConnectionInvitation(
  label?: string,
  multiUse: boolean = false
): Promise<ConfirmdApiResponse<{
  invitationId: string;
  invitationUrl: string;
  state: string;
}>>
```

**How it works:**
- Calls `POST /connections/create-invitation` on the Confirmd Platform
- Gets the organization's agent ID
- Creates a new invitation with the specified label
- Returns Platform-generated `invitationId` and `invitationUrl`

#### 2. Updated Session Creation API

Modified [route.ts](../src/app/api/connections/session/route.ts):

**Before:**
```typescript
// Used organization's multi-use invitation
const invitationResult = await confirmdClient.getConnectionInvitation();
const invitationId = `inv-${Date.now()}-...`; // Local ID
```

**After:**
```typescript
// Creates session-specific invitation
const invitationResult = await confirmdClient.createConnectionInvitation(
  "NELFUND Student Registration",
  false // single-use
);
const invitationId = invitation.invitationId; // Platform ID
```

## How It Works Now

### End-to-End Flow

1. **User visits registration page**
   - Browser calls `POST /api/connections/session`

2. **Application creates Platform invitation**
   - Calls `POST /connections/create-invitation` on Confirmd Platform
   - Receives unique `invitationId` and `invitationUrl` from Platform

3. **Session created with Platform invitation**
   - Stores Platform-generated `invitationId` in database
   - Returns QR code with Platform-generated `invitationUrl`

4. **User scans QR code with ConfirmD App**
   - ConfirmD App connects using the Platform invitation
   - Platform knows which invitation was used

5. **Platform sends webhooks**
   - Webhook payload includes the Platform `invitationId`
   - Our webhook handler matches it to the database session
   - Session status updated: `invitation` → `request` → `response` → `active`

6. **Real-time notification**
   - Webhook handler calls `wsManager.broadcastStatusUpdate()`
   - WebSocket pushes update to frontend
   - User sees connection status change instantly

## Benefits

✅ **Session Association**: Each QR code is unique to its session
✅ **Webhook Matching**: Platform can send webhooks with correct `invitationId`
✅ **Single-Use Security**: Invitations can't be reused after connection
✅ **Real-time Updates**: WebSocket notifications work as designed
✅ **Proper Tracking**: Database accurately reflects connection lifecycle

## Testing

### Verification Steps

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to registration:**
   ```
   http://localhost:3000/register/connect
   ```

3. **Monitor server logs:**
   ```bash
   # Look for:
   [INFO] Created connection invitation from Confirmd Platform {
     "invitationId": "Platform-generated-ID",
     "state": "invitation"
   }
   ```

4. **Scan QR code with ConfirmD App**

5. **Watch for webhook:**
   ```bash
   # Should see:
   POST /api/webhooks/confirmd 200
   [INFO] Processing webhook event {
     "topic": "connections.active",
     "connectionId": "conn-xxx",
     "state": "active"
   }
   [INFO] Updated session from webhook {
     "sessionId": "session-xxx",
     "status": "active"
   }
   ```

6. **Verify frontend update:**
   - Status should change from "Waiting for connection..." to "Connected!"
   - Should happen instantly via WebSocket (no polling delay)

## Migration Notes

### Breaking Changes

None - existing sessions will continue to work with polling fallback, but new sessions will use the improved invitation system.

### Deprecated Method

`getConnectionInvitation()` is now deprecated in favor of `createConnectionInvitation()`:

```typescript
/**
 * @deprecated Use createConnectionInvitation() for session-specific invitations
 */
async getConnectionInvitation(): Promise<ConfirmdApiResponse<string>>
```

## Related Files

- [confirmd-client.ts](../src/lib/api/confirmd-client.ts) - New `createConnectionInvitation()` method
- [route.ts](../src/app/api/connections/session/route.ts) - Updated to use new invitation creation
- [connection-service.ts](../src/lib/api/connection-service.ts) - Webhook processing (unchanged)
- [server.js](../server.js) - WebSocket server (unchanged)
- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md) - Webhook infrastructure docs
- [WEBSOCKET_IMPLEMENTATION.md](./WEBSOCKET_IMPLEMENTATION.md) - WebSocket infrastructure docs

## Technical Notes

### API Endpoint

The fix assumes the Confirmd Platform API supports:

```
POST /connections/create-invitation
{
  "agentId": "string",
  "label": "string",
  "multiUse": boolean
}

Response:
{
  "invitationId": "string",
  "invitationUrl": "string",
  "state": "invitation"
}
```

If the actual API endpoint differs, update the endpoint path in [confirmd-client.ts:405](../src/lib/api/confirmd-client.ts#L405).

### Database Schema

No schema changes required - existing `invitationId` field now stores Platform-generated IDs instead of local IDs.

## Next Steps

1. **Test with real QR code scans** to verify webhooks are received
2. **Monitor webhook logs** to confirm Platform sends correct `invitationId`
3. **Update frontend** to use `useConnectionStatus` hook instead of polling
4. **Implement credential exchange** once connection reaches "active" state
