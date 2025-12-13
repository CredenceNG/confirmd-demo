# NYSC ID Card Issuance Troubleshooting Guide

## ✅ RESOLVED: "Unable to create offer" Error

**Error Message:** `Unable to create offer`
**Root Cause:** Attribute name mismatch - code used `Service_start_date` (capital S) but schema expects `service_start_date` (lowercase s)
**Status:** Fixed in commit (2024-12-13)
**Location:** [src/app/nysc/onboarding/page.tsx:219](../src/app/nysc/onboarding/page.tsx#L219)
**API Endpoint:** `/api/nysc/onboarding/issue-id-card`

---

## Fix Applied

The attribute name has been corrected from `Service_start_date` to `service_start_date` in:
- ✅ [src/app/api/nysc/onboarding/issue-id-card/route.ts](../src/app/api/nysc/onboarding/issue-id-card/route.ts#L351)
- ✅ [CREDENTIAL_ATTRIBUTES.md](../CREDENTIAL_ATTRIBUTES.md#L120)
- ✅ [scripts/diagnose-id-card-issue.js](../scripts/diagnose-id-card-issue.js#L68)

---

## Problem Analysis

The error "Unable to create offer" is returned by the ConfirmD Platform API when attempting to issue an NYSC ID Card credential after successful verification of the Green Card proof.

### Error Flow

```
Frontend (NYSC Onboarding Page)
  ↓
  verifyAndIssueIDCard(proofId) function
  ↓
  POST /api/nysc/onboarding/issue-id-card
  ↓
  ConfirmD Platform API: POST /orgs/{orgId}/credentials/offer?credentialType=indy
  ↓
  ❌ Platform returns: "Unable to create offer"
```

---

## Diagnostic Information

### Environment Configuration

| Variable | Value | Status |
|----------|-------|--------|
| `NYSC_ORG_ID` | `67953cea-68c7-464b-b7a3-99a10856e22b` | ✓ Set |
| `NYSC_ID_CARD_CRED_DEF_ID` | `NxbvVcdwR5a2oyiYa6UbPP:3:CL:2973715:NYSC ID CARD Credential` | ✓ Valid Format |
| `NYSC_ID_CARD_SCHEMA_ID` | `GRGDLMFpSpRSnwUTgW55Mf:2:NYSC ID CARD:0.1` | ✓ Valid Format |
| `CONFIRMD_BASE_URL` | `https://platform.confamd.com` | ✓ Set |

### Expected Schema Attributes

According to [CREDENTIAL_ATTRIBUTES.md](../CREDENTIAL_ATTRIBUTES.md#5-nysc-id-card-phase-2), the NYSC ID Card credential should have these **8 attributes**:

| # | Attribute Name | Type | Example Value |
|---|----------------|------|---------------|
| 1 | `surname` | string | Bakare |
| 2 | `othernames` | string | Babatunde Oluwole |
| 3 | `id_number` | string | NYSC-1704470400000 |
| 4 | `service_state` | string | Lagos |
| 5 | `service_start_date` | date | 2024-03-01 |
| 6 | `service_end_date` | date | 2025-02-28 |
| 7 | `issued_date` | date | 2024-03-01 |
| 8 | `expiry_date` | date | 2026-02-28 |

**⚠️ IMPORTANT:** All attribute names use lowercase (e.g., `service_start_date`). Case sensitivity is critical.

### Current Payload Structure

The API currently sends this payload format:

```json
{
  "credentialData": [
    {
      "connectionId": "<active-connection-id>",
      "attributes": [
        { "name": "surname", "value": "..." },
        { "name": "othernames", "value": "..." },
        { "name": "id_number", "value": "NYSC-<timestamp>" },
        { "name": "service_state", "value": "Lagos" },
        { "name": "service_start_date", "value": "2024-12-13" },
        { "name": "service_end_date", "value": "2025-12-13" },
        { "name": "issued_date", "value": "2024-12-13" },
        { "name": "expiry_date", "value": "2026-12-13" }
      ]
    }
  ],
  "credentialDefinitionId": "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2973715:NYSC ID CARD Credential",
  "orgId": "67953cea-68c7-464b-b7a3-99a10856e22b"
}
```

---

## Root Cause Hypotheses

### 1. **Attribute Name Mismatch** ⚠️ MOST LIKELY

The attribute names in the code might not exactly match the schema definition in the ConfirmD Platform.

**Check:**
- Log in to ConfirmD Platform → Schemas → "NYSC ID CARD"
- Verify the exact attribute names (case-sensitive)
- Common issues:
  - `Service_start_date` vs `service_start_date` (capital S?)
  - Extra spaces or special characters
  - Different attribute order

**Test:**
Run the diagnostic script:
```bash
node scripts/diagnose-id-card-issue.js
```

### 2. **Credential Definition Ownership**

The credential definition might belong to a different organization than `NYSC_ORG_ID`.

**Check:**
- ConfirmD Platform → Credential Definitions
- Find: `NxbvVcdwR5a2oyiYa6UbPP:3:CL:2973715:NYSC ID CARD Credential`
- Verify it belongs to organization: `67953cea-68c7-464b-b7a3-99a10856e22b`

### 3. **Connection State**

The `connectionId` might not be in the correct state to receive credential offers.

**Check:**
- Look at server logs for the actual `connectionId` being used
- ConfirmD Platform → Connections → Search for the connection
- Verify state is `active` or `completed` (not `invitation`, `request`, or `response`)

### 4. **Missing Required Attributes**

Some attributes might be marked as required in the schema but not provided in the payload.

**Check:**
- ConfirmD Platform → Schemas → "NYSC ID CARD"
- Check which attributes are marked as "required"
- Ensure all required attributes are in the payload with non-empty values

### 5. **Schema Version Mismatch**

The schema version might have changed since the credential definition was created.

**Check:**
- Schema ID shows version `0.1`
- Credential Definition references schema seq number `2973715`
- Verify these match in the Platform UI

---

## Debugging Steps

### Step 1: Enable Detailed Logging

The code now includes enhanced logging. When you trigger the error:

1. Check your Next.js server console for:
   ```
   [NYSC ID Card API] Full Request Details: { ... }
   [NYSC ID Card API] Full Payload: { ... }
   [NYSC ID Card API] DETAILED ERROR: { ... }
   ```

2. Look for the `responseData` field in the error log - this contains the exact error from ConfirmD Platform

### Step 2: Verify Schema Attributes

1. Log in to the ConfirmD Platform
2. Navigate to: **Schemas** section
3. Find: **"NYSC ID CARD"** schema
4. Compare the attribute names in the schema with the payload

**Create a comparison table:**

| Schema Attribute | Code Attribute | Match? |
|------------------|----------------|--------|
| ??? | `surname` | ? |
| ??? | `othernames` | ? |
| ??? | `id_number` | ? |
| ??? | `service_state` | ? |
| ??? | `Service_start_date` | ? |
| ??? | `service_end_date` | ? |
| ??? | `issued_date` | ? |
| ??? | `expiry_date` | ? |

### Step 3: Test with Minimal Payload

Create a test script to try issuing a credential with minimal attributes:

```javascript
// scripts/test-id-card-issuance.js
const axios = require('axios');

async function testIDCardIssuance() {
  const payload = {
    credentialData: [{
      connectionId: 'YOUR_ACTIVE_CONNECTION_ID', // Replace with actual ID
      attributes: [
        { name: 'surname', value: 'TestSurname' },
        { name: 'othernames', value: 'TestOthernames' },
        { name: 'id_number', value: 'TEST-123456' },
        { name: 'service_state', value: 'Lagos' },
        { name: 'Service_start_date', value: '2024-01-01' },
        { name: 'service_end_date', value: '2025-01-01' },
        { name: 'issued_date', value: '2024-01-01' },
        { name: 'expiry_date', value: '2026-01-01' }
      ]
    }],
    credentialDefinitionId: process.env.NYSC_ID_CARD_CRED_DEF_ID,
    orgId: process.env.NYSC_ORG_ID
  };

  // Get token and make request...
}
```

### Step 4: Check ConfirmD Platform Logs

If you have access to ConfirmD Platform admin panel:

1. Navigate to: **Logs** or **Activity** section
2. Filter by: Organization ID `67953cea-68c7-464b-b7a3-99a10856e22b`
3. Look for failed credential offer attempts
4. Check the detailed error message

---

## Quick Fixes to Try

### Fix 1: Verify Attribute Case Sensitivity

The most common issue is case sensitivity in attribute names. Try changing line 351 in [issue-id-card/route.ts](../src/app/api/nysc/onboarding/issue-id-card/route.ts#L351):

**If the schema uses lowercase:**
```typescript
{
  name: "service_start_date",  // lowercase 's'
  value: serviceStartDate,
},
```

**If the schema uses capital S (current):**
```typescript
{
  name: "Service_start_date",  // capital 'S'
  value: serviceStartDate,
},
```

### Fix 2: Use Different Credential Definition

If the credential definition belongs to the wrong organization, update `.env`:

```bash
# Try using the fallback credential definition
NYSC_ID_CARD_CRED_DEF_ID=<correct-cred-def-id>
```

### Fix 3: Validate Connection First

Add connection validation before attempting credential offer:

```typescript
// Before issuing credential, verify connection is active
const connectionResponse = await axios.get(
  `${API_CONFIG.BASE_URL}/orgs/${orgId}/connections/${connectionId}`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

const connectionState = connectionResponse.data?.data?.state;
if (connectionState !== 'active' && connectionState !== 'completed') {
  throw new Error(`Connection is not active. Current state: ${connectionState}`);
}
```

---

## Success Criteria

You'll know the issue is resolved when:

1. ✅ No "Unable to create offer" error in logs
2. ✅ API returns `{ success: true, data: { idCardIssued: true } }`
3. ✅ Webhook event received with `eventType: "credential"` and `status: "offer-sent"`
4. ✅ Credential offer appears in user's wallet app
5. ✅ User can accept the NYSC ID Card credential

---

## Related Files

- API Route: [src/app/api/nysc/onboarding/issue-id-card/route.ts](../src/app/api/nysc/onboarding/issue-id-card/route.ts)
- Frontend: [src/app/nysc/onboarding/page.tsx](../src/app/nysc/onboarding/page.tsx)
- Schema Reference: [CREDENTIAL_ATTRIBUTES.md](../CREDENTIAL_ATTRIBUTES.md)
- Diagnostic Script: [scripts/diagnose-id-card-issue.js](../scripts/diagnose-id-card-issue.js)

---

## Contact for Support

If none of the above fixes work:

1. **Check ConfirmD Platform Documentation** for the `/credentials/offer` endpoint
2. **Contact ConfirmD Support** with:
   - Organization ID
   - Credential Definition ID
   - Full error response from Platform API
   - Timestamp of failed request

---

**Last Updated:** 2024-12-13
**Status:** Under Investigation
