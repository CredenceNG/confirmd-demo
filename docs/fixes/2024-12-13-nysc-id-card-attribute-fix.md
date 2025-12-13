# Fix: NYSC ID Card "Unable to create offer" Error

**Date:** 2024-12-13
**Issue:** NYSC ID Card credential issuance failing with "Unable to create offer"
**Status:** ✅ Resolved

---

## Problem

When attempting to issue an NYSC ID Card credential during the NYSC Onboarding flow (Phase 2), the ConfirmD Platform API returned the error:

```
Unable to create offer
```

The detailed error from the platform logs revealed:

```
The credential preview attributes do not match the schema attributes
(difference is: Service_start_date,service_start_date,
 needs: service_end_date,issued_date,service_start_date,expiry_date,
        service_state,surname,id_number,othernames)
```

## Root Cause

The code was sending the attribute name as **`Service_start_date`** (with capital S), but the NYSC ID CARD schema on the ConfirmD Platform expects **`service_start_date`** (with lowercase s).

This case sensitivity mismatch caused the platform to reject the credential offer.

## Platform Error Details

From the ConfirmD Platform agent logs:

```
platform-admin-agent  | 2025-12-13 20:06:01.145  ERROR [TenantsApi.withTenantAgent]
platform-admin-agent  | Error in tenant agent callback for tenant '492ea2ee-22b3-42da-a22d-849807f6e660'
platform-admin-agent  | {
platform-admin-agent  |   error: CredoError: The credential preview attributes do not match
platform-admin-agent  |   the schema attributes (difference is: Service_start_date,service_start_date,
platform-admin-agent  |   needs: service_end_date,issued_date,service_start_date,expiry_date,
platform-admin-agent  |          service_state,surname,id_number,othernames)
```

## Fix Applied

### 1. API Route Fix

**File:** [src/app/api/nysc/onboarding/issue-id-card/route.ts](../../src/app/api/nysc/onboarding/issue-id-card/route.ts)

**Line 351** - Changed attribute name:

```diff
- {
-   name: "Service_start_date",
-   value: serviceStartDate,
- },
+ {
+   name: "service_start_date",
+   value: serviceStartDate,
+ },
```

### 2. Documentation Updates

**Files Updated:**
- [CREDENTIAL_ATTRIBUTES.md](../../CREDENTIAL_ATTRIBUTES.md#L120) - Updated attribute table
- [scripts/diagnose-id-card-issue.js](../../scripts/diagnose-id-card-issue.js#L68) - Updated diagnostic script
- [docs/NYSC_ID_CARD_TROUBLESHOOTING.md](../NYSC_ID_CARD_TROUBLESHOOTING.md) - Marked issue as resolved

**Changed from:**
```markdown
| 5 | `Service_start_date` | Service start date | 2024-03-01 |
```

**Changed to:**
```markdown
| 5 | `service_start_date` | Service start date | 2024-03-01 |
```

## Verification

After applying the fix, the credential issuance should work correctly. The platform will accept the credential offer and send it to the user's wallet.

### Expected Flow (Post-Fix)

1. User connects wallet during NYSC Onboarding
2. User shares Green Card + other credentials
3. Backend verifies all credentials
4. Backend issues NYSC ID Card with correct attribute names ✅
5. Platform accepts the offer and sends it to wallet
6. User receives and accepts NYSC ID Card credential

### Success Criteria

- ✅ No "Unable to create offer" error
- ✅ Platform logs show successful credential offer
- ✅ Webhook event received: `credential` → `offer-sent`
- ✅ User receives NYSC ID Card in wallet app

## Lessons Learned

### 1. Case Sensitivity Matters

Attribute names in Indy/AnonCreds schemas are **case-sensitive**. Always verify the exact casing of attribute names when:
- Creating schemas
- Issuing credentials
- Requesting proofs

### 2. Platform Logs Are Helpful

The ConfirmD Platform agent logs provided the exact error message, which made debugging much faster. Always check platform logs when credential operations fail.

### 3. Documentation Must Match Reality

The `CREDENTIAL_ATTRIBUTES.md` file had the wrong attribute name (`Service_start_date` instead of `service_start_date`), which led to the code error. Documentation must be updated when schemas are created or changed.

## Related Issues

This same case sensitivity issue could affect:
- NYSC Certificate issuance (verify attribute names)
- Any other credential types using mixed-case attribute names
- Proof requests that reference these attributes

## Prevention

To prevent similar issues in the future:

1. **Always verify schema attributes** in the ConfirmD Platform UI before writing code
2. **Use the diagnostic script** (`scripts/diagnose-id-card-issue.js`) to validate payload structure
3. **Update documentation** when schemas are created or modified
4. **Add attribute validation** in code to catch mismatches early

## Testing

To verify this fix:

1. Go to: `/nysc/onboarding`
2. Connect wallet
3. Share Green Card + Student Card + Statement of Results + Medical Fitness
4. Wait for automatic verification
5. Verify NYSC ID Card offer is sent to wallet
6. Accept the credential in wallet app
7. Confirm redirect to success page

---

**Affected Files:**
- [src/app/api/nysc/onboarding/issue-id-card/route.ts](../../src/app/api/nysc/onboarding/issue-id-card/route.ts#L351)
- [CREDENTIAL_ATTRIBUTES.md](../../CREDENTIAL_ATTRIBUTES.md#L120)
- [scripts/diagnose-id-card-issue.js](../../scripts/diagnose-id-card-issue.js#L68)
- [docs/NYSC_ID_CARD_TROUBLESHOOTING.md](../NYSC_ID_CARD_TROUBLESHOOTING.md)

**References:**
- Platform Error Log: See above
- Schema ID: `GRGDLMFpSpRSnwUTgW55Mf:2:NYSC ID CARD:0.1`
- Credential Definition ID: `NxbvVcdwR5a2oyiYa6UbPP:3:CL:2973715:NYSC ID CARD Credential`
