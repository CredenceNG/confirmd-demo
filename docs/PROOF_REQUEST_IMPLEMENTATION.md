# Proof Request Implementation Guide

Complete implementation for requesting and verifying student credentials after connection establishment.

## Overview

After a successful connection is established, the system automatically:
1. Sends a proof request to the connected wallet
2. Receives and verifies the proof presentation
3. Extracts student attributes
4. Auto-fills the application form

## Completed Infrastructure

### ✅ Backend Layer

1. **Types** ([src/lib/api/types.ts](../src/lib/api/types.ts))
   - `ProofRequestType` enum
   - `ProofAttributeRequest`, `CreateProofRequestPayload`
   - `ProofRecord`, `VerifiedProofDetails`
   - `StudentCredentialAttributes` (15 attributes)

2. **API Client** ([src/lib/api/confirmd-client.ts](../src/lib/api/confirmd-client.ts))
   - `createProofRequest()` - POST /orgs/{orgId}/proofs?requestType=INDY
   - `getProofDetails()` - GET /orgs/{orgId}/verified-proofs/{proofId}
   - `verifyProof()` - POST /orgs/{orgId}/proofs/{proofId}/verify
   - `getProofRecord()` - GET /orgs/{orgId}/proofs/{proofId}

3. **Service Layer** ([src/lib/api/proof-service.ts](../src/lib/api/proof-service.ts))
   - `createProofRequest()` - Create and send proof request
   - `getProofBySessionId()` - Get proof by session
   - `processProofWebhookEvent()` - Handle proof webhooks
   - `extractStudentAttributes()` - Parse attributes
   - `verifyProofPresentation()` - Verify proof

4. **Configuration** ([src/lib/proof-config.ts](../src/lib/proof-config.ts))
   - `buildProofAttributeRequests()` - Build from env
   - `getProofAttributes()` - Parse comma-separated list
   - `validateProofConfig()` - Validate configuration

5. **Database** ([prisma/schema.prisma](../prisma/schema.prisma))
   - `ProofRequest` model with all fields
   - Migration applied successfully

6. **API Endpoints**
   - POST /api/proofs/request - Send proof request
   - GET /api/proofs/request?sessionId=xxx - Get proof status
   - Webhook handler updated to process proof events

## Remaining Implementation Tasks

### 1. Update Connection Page

**File**: `src/app/register/connect/page.tsx`

**Changes needed**:

```typescript
// Add proof status state
const [proofStatus, setProofStatus] = useState<string | null>(null);
const [isRequestingProof, setIsRequestingProof] = useState(false);

// Update WebSocket status handler to send proof request
useEffect(() => {
  if (connectionStatus === "connecting" && wsStatus) {
    console.log('[Page] WebSocket status update:', wsStatus);

    if (wsStatus === "active" || wsStatus === "completed") {
      setConnectionStatus("connected");
      setConnectionMessage(`Connection established! Requesting credentials...`);
      // Send proof request automatically
      sendProofRequest();
    }
  }
}, [wsStatus, connectionStatus, connectionData]);

// Add function to send proof request
const sendProofRequest = async () => {
  if (!sessionId || !connectionData?.connectionId) return;

  setIsRequestingProof(true);
  setConnectionMessage("Requesting your student credentials...");

  try {
    const response = await fetch('/api/proofs/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        connectionId: connectionData.connectionId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      setConnectionMessage("Please approve the credential request in your wallet...");
      setProofStatus("request-sent");
    } else {
      setConnectionMessage("Failed to request credentials. Please try again.");
    }
  } catch (error) {
    console.error('Error sending proof request:', error);
    setConnectionMessage("Error requesting credentials.");
  } finally {
    setIsRequestingProof(false);
  }
};

// Update WebSocket hook to handle proof status updates
const { status, connectionData, isConnected } = useConnectionWebSocket(sessionId);

// Listen for proof updates via WebSocket
useEffect(() => {
  // WebSocket messages with type: "proof" will arrive here
  // When status === "done", navigate to application form
  if (proofStatus === "done") {
    // Navigate to application form
    window.location.href = `/register/application?sessionId=${sessionId}`;
  }
}, [proofStatus, sessionId]);
```

### 2. Update WebSocket Hook

**File**: `src/hooks/useConnectionWebSocket.ts`

**Add proof status tracking**:

```typescript
export function useConnectionWebSocket(sessionId: string | null) {
  const [status, setStatus] = useState('invitation');
  const [connectionData, setConnectionData] = useState(null);
  const [proofStatus, setProofStatus] = useState<string | null>(null); // Add
  const [isConnected, setIsConnected] = useState(false);

  // ... existing code ...

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === 'status_update') {
        // Check if it's a proof update or connection update
        if (message.proofId || message.type === 'proof') {
          setProofStatus(message.status);
          console.log('[WebSocket] Proof status:', message.status);
        } else {
          setStatus(message.status);
          setConnectionData({
            connectionId: message.connectionId,
            theirLabel: message.theirLabel,
          });
        }
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  };

  return {
    status,
    connectionData,
    proofStatus, // Add to return
    isConnected,
  };
}
```

### 3. Create Application Form Page

**File**: `src/app/register/application/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";

export default function ApplicationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    // Fetch proof details
    fetchProofData();
  }, [sessionId]);

  const fetchProofData = async () => {
    try {
      const response = await fetch(`/api/proofs/request?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const proof = data.data;

        if (proof.status === "done" && proof.verified && proof.presentedAttributes) {
          // Parse and set form data
          const attributes = JSON.parse(proof.presentedAttributes);

          // Map attribute names to form fields
          const mappedData = {
            admissionNumber: attributes.admission_number?.raw || '',
            programme: attributes.programme?.raw || '',
            graduationYear: attributes.graduation_year?.raw || '',
            surname: attributes.surname?.raw || '',
            othernames: attributes.othernames?.raw || '',
            schoolName: attributes.school_name?.raw || '',
            nationalIdNumber: attributes.national_id_number?.raw || '',
            department: attributes.department?.raw || '',
            matricNumber: attributes.matric_number?.raw || '',
            dateOfBirth: attributes.date_of_birth?.raw || '',
            bvn: attributes.bank_verification_number?.raw || '',
            jambNumber: attributes.jamb_number?.raw || '',
            schoolNucNumber: attributes.school_nuc_number?.raw || '',
            dateIssued: attributes.date_issued?.raw || '',
            dateExpiry: attributes.date_expiry?.raw || '',
          };

          setFormData(mappedData);
        } else {
          setError("Proof not yet verified or incomplete");
        }
      } else {
        setError(data.error?.error_description || "Failed to load proof data");
      }
    } catch (err) {
      console.error("Error fetching proof:", err);
      setError("Failed to load application data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit application
    console.log("Submitting application:", formData);
    // TODO: Call API to submit registration
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your application...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Application</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">Student Loan Application</h2>
              <p className="text-green-100 mt-1">
                Your credentials have been verified. Please review and submit.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surname
                    </label>
                    <input
                      type="text"
                      value={formData.surname}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Names
                    </label>
                    <input
                      type="text"
                      value={formData.othernames}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={formData.dateOfBirth}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      National ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.nationalIdNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BVN
                    </label>
                    <input
                      type="text"
                      value={formData.bvn}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School NUC Number
                    </label>
                    <input
                      type="text"
                      value={formData.schoolNucNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      value={formData.admissionNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matric Number
                    </label>
                    <input
                      type="text"
                      value={formData.matricNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programme
                    </label>
                    <input
                      type="text"
                      value={formData.programme}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={formData.graduationYear}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JAMB Number
                    </label>
                    <input
                      type="text"
                      value={formData.jambNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  All information has been verified via your digital credentials
                </p>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
```

## Environment Variables

Add to `.env`:

```bash
# Proof Configuration
PROOF_SCHEMA_ID=your-schema-id-here
PROOF_CRED_DEF_ID=your-cred-def-id-here
PROOF_ATTRIBUTES=admission_number,programme,graduation_year,surname,school_name,national_id_number,department,othernames,matric_number,date_issued,date_expiry,bank_verification_number,school_nuc_number,jamb_number,date_of_birth
PROOF_REQUEST_COMMENT=Please share your student credentials for loan application verification
```

## Testing Flow

1. **Start server**: `npm run dev`
2. **Navigate**: `http://localhost:3300/register/connect`
3. **Create session**: Click "Connect Wallet"
4. **Scan QR code**: With ConfirmD mobile app
5. **Watch logs**: Connection established → Proof request sent
6. **Approve proof** in mobile app
7. **Auto-navigate** to application form with pre-filled data
8. **Submit** application

## State Flow

```
User Action                Server Event              Frontend State
-----------                ------------              --------------
Click Connect      →       Create Session            "connecting"
Scan QR           →        Webhook: active           "connected"
                  →        Send Proof Request        "requesting-proof"
                  →        Webhook: request-sent     proofStatus="request-sent"
Approve in App    →        Webhook: presentation-    proofStatus="presentation-
                           received                  received"
                  →        Verify & Extract          proofStatus="done"
                  →        Attributes
Navigate          →        GET /api/proofs/request   Show form with data
Submit Form       →        POST /api/applications    Success!
```

## Summary

**Completed** ✅:
- All backend infrastructure
- API endpoints
- Database schema
- Service layers
- Configuration utilities
- Webhook processing

**Remaining** (Quick implementation):
- Update connect page (add proof request trigger)
- Update WebSocket hook (add proof status)
- Create application form page (copy code above)
- Test end-to-end flow

All the heavy lifting is done. The remaining tasks are mostly UI updates and connecting the existing pieces together!
