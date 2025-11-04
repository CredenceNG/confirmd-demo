# ConfirmD Platform Integration Guide

A comprehensive guide to integrating verifiable credential proof requests and verification with the ConfirmD Platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Setup & Configuration](#setup--configuration)
5. [Core Concepts](#core-concepts)
6. [Implementation Guide](#implementation-guide)
7. [Code Examples](#code-examples)
8. [API Reference](#api-reference)
9. [Common Pitfalls](#common-pitfalls)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This integration enables your application to:
- Request verifiable credentials from users via their digital wallets
- Verify proof presentations using the ConfirmD Platform
- Extract and use verified attributes in your application
- Provide real-time updates via WebSockets

### What You'll Build

```
User Wallet App  ←→  Your Application  ←→  ConfirmD Platform
                         ↓
                  Database (Prisma)
                         ↓
                  Your Business Logic
```

---

## Architecture

### High-Level Flow

```
1. User initiates connection request
   └─→ Your App creates QR code/deep link
       └─→ User scans with wallet app
           └─→ Connection established

2. Your App requests proof of credentials
   └─→ ConfirmD sends request to user's wallet
       └─→ User presents credentials
           └─→ ConfirmD verifies and sends webhook

3. Your App extracts verified attributes
   └─→ Stores in database
       └─→ Uses in application logic
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React/Next.js)                                   │
│  ├─ Connection UI (QR Code)                                 │
│  ├─ WebSocket Client (Real-time updates)                    │
│  └─ Form Pre-fill (Verified attributes)                     │
├─────────────────────────────────────────────────────────────┤
│  Backend API Routes                                          │
│  ├─ POST /api/connections/session      (Create connection)  │
│  ├─ POST /api/proofs/request           (Request proof)      │
│  ├─ POST /api/proofs/verify            (Verify proof)       │
│  └─ POST /api/webhooks/confirmd        (Receive webhooks)   │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                               │
│  ├─ ConfirmD Client (API calls)                             │
│  ├─ Auth Service (OAuth2 tokens)                            │
│  ├─ Connection Service (Manage connections)                 │
│  ├─ Proof Service (Handle proof requests)                   │
│  └─ WebSocket Manager (Real-time comms)                     │
├─────────────────────────────────────────────────────────────┤
│  Database (Prisma + SQLite/PostgreSQL)                      │
│  ├─ ConnectionSession                                        │
│  ├─ ProofRequest                                             │
│  └─ WebhookEvent                                             │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│              ConfirmD Platform API                           │
│  ├─ POST /orgs/{orgId}/invitations                          │
│  ├─ POST /orgs/{orgId}/proofs                               │
│  ├─ POST /orgs/{orgId}/proofs/{proofId}/verify              │
│  ├─ GET  /orgs/{orgId}/verified-proofs/{proofId}            │
│  └─ Webhooks → POST /api/webhooks/confirmd                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### 1. ConfirmD Platform Account
- Organization ID
- Client ID and Secret (OAuth2 credentials)
- Schema ID (for the credential type you want to verify)
- Credential Definition ID (optional, for specific issuers)

### 2. Technical Requirements
- Node.js 18+
- Next.js 15+
- Prisma ORM
- SQLite or PostgreSQL database
- Public HTTPS endpoint (for webhooks)

### 3. Knowledge Requirements
- Understanding of OAuth2 Client Credentials flow
- Basic knowledge of Verifiable Credentials (Indy/AnonCreds)
- Next.js API Routes
- WebSocket basics

---

## Setup & Configuration

### Step 1: Environment Variables

Create a `.env` file:

```bash
# ConfirmD Platform Configuration
CONFIRMD_ORG_ID=your-org-id-here
CONFIRMD_CLIENT_ID=your-client-id-here
CONFIRMD_CLIENT_SECRET=your-client-secret-here
CONFIRMD_AUTH_URL=https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token
CONFIRMD_BASE_URL=https://platform.confamd.com

# Webhook Configuration
WEBHOOK_SECRET=your-strong-random-secret

# Proof Request Configuration
PROOF_SCHEMA_ID=L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0
PROOF_CRED_DEF_ID=L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance

# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3300
```

### Step 2: Database Schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // or "postgresql"
  url      = env("DATABASE_URL")
}

// Connection tracking
model ConnectionSession {
  id             String   @id @default(uuid())
  sessionId      String   @unique
  invitationId   String
  invitationUrl  String
  status         String   // invitation, response, active, error
  connectionId   String?
  theirDid       String?
  theirLabel     String?
  requestType    String?  // registration, authentication
  metadata       String?  // JSON string
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  expiresAt      DateTime

  @@index([sessionId])
  @@index([connectionId])
  @@index([status])
}

// Proof request tracking
model ProofRequest {
  id                  String   @id @default(uuid())
  sessionId           String   @unique
  proofId             String?  @unique
  connectionId        String
  status              String   // request-sent, presentation-received, done
  comment             String?
  requestedAttributes String   // JSON array
  presentedAttributes String?  // JSON object
  verified            Boolean  @default(false)
  verifiedAt          DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([sessionId])
  @@index([proofId])
  @@index([connectionId])
  @@index([status])
}

// Webhook event logging
model WebhookEvent {
  id             String   @id @default(uuid())
  webhookId      String   @unique
  topic          String
  organizationId String
  agentId        String
  connectionId   String?
  proofId        String?
  payload        String   // JSON string
  processed      Boolean  @default(false)
  processedAt    DateTime?
  createdAt      DateTime @default(now())

  @@index([connectionId])
  @@index([proofId])
  @@index([processed])
}
```

Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 3: Attribute Configuration

Create `config/proof-attributes.json`:

```json
[
  {
    "name": "admission_number",
    "description": "Student admission number"
  },
  {
    "name": "programme",
    "description": "Academic programme/course of study"
  },
  {
    "name": "graduation_year",
    "description": "Year of graduation"
  },
  {
    "name": "surname",
    "description": "Student's surname/family name"
  },
  {
    "name": "school_name",
    "description": "Name of educational institution"
  }
]
```

---

## Core Concepts

### 1. Connection Establishment

Before requesting proofs, you must establish a connection with the user's wallet:

```typescript
// Connection Flow:
1. Create invitation (QR code)
2. User scans QR with wallet app
3. Wallet sends connection response
4. ConfirmD sends webhook: state = "response-sent"
5. Connection completes
6. ConfirmD sends webhook: state = "completed"
```

### 2. Proof Request Lifecycle

```typescript
// Proof Flow:
1. Send proof request to established connection
2. ConfirmD sends webhook: state = "request-sent"
3. User presents credentials from wallet
4. ConfirmD sends webhook: state = "presentation-received"
5. Verify the proof presentation
6. Extract verified attributes
7. Store in database for use in application
```

### 3. Webhook Events

ConfirmD sends webhooks for important events:

```typescript
// Connection Webhooks
{
  "type": "Connection",
  "connectionId": "...",
  "state": "response-sent" | "completed",
  "theirLabel": "User's wallet name",
  "orgId": "...",
  "timestamp": "2025-11-01T19:13:32.066Z"
}

// Proof Webhooks
{
  "type": "Proof",
  "id": "proof-id",
  "connectionId": "...",
  "state": "request-sent" | "presentation-received" | "done",
  "orgId": "...",
  "timestamp": "2025-11-01T19:13:43.946Z"
}
```

### 4. Attribute Extraction

**CRITICAL**: The ConfirmD Platform returns attributes in a unique structure:

```typescript
// API Response Structure
{
  "success": true,
  "data": [
    {
      "admission_number": "930930ee",
      "schemaId": "...",
      "credDefId": "..."
    },
    {
      "programme": "Accounting",
      "schemaId": "...",
      "credDefId": "..."
    }
    // ... one object per attribute
  ]
}

// You need to extract and merge all attributes:
let attributes = {};
data.forEach((item) => {
  const { schemaId, credDefId, ...attribute } = item;
  Object.assign(attributes, attribute);
});

// Result:
{
  "admission_number": "930930ee",
  "programme": "Accounting",
  ...
}
```

---

## Implementation Guide

### Phase 1: Authentication Setup

#### 1.1 Create OAuth2 Client

`src/lib/api/confirmd-auth.ts`:

```typescript
interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

export async function getAccessToken(): Promise<string> {
  // Check cache
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  // Fetch new token
  const authUrl = process.env.CONFIRMD_AUTH_URL!;
  const clientId = process.env.CONFIRMD_CLIENT_ID!;
  const clientSecret = process.env.CONFIRMD_CLIENT_SECRET!;

  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch access token");
  }

  const data: TokenResponse = await response.json();

  // Cache with buffer (expire 60s early)
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}
```

#### 1.2 Create ConfirmD API Client

`src/lib/api/confirmd-client.ts`:

```typescript
import { getAccessToken } from "./confirmd-auth";

const BASE_URL = process.env.CONFIRMD_BASE_URL!;
const ORG_ID = process.env.CONFIRMD_ORG_ID!;

export class ConfirmdClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getAccessToken();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ConfirmD API Error: ${response.status} ${error}`);
    }

    return response.json();
  }

  // Create invitation for connection
  async createInvitation() {
    return this.makeRequest(`/orgs/${ORG_ID}/invitations`, {
      method: "POST",
      body: JSON.stringify({
        autoAcceptConnection: true,
        multiUseInvitation: false,
      }),
    });
  }

  // Send proof request
  async sendProofRequest(connectionId: string, attributes: any[]) {
    return this.makeRequest(`/orgs/${ORG_ID}/proofs?requestType=indy`, {
      method: "POST",
      body: JSON.stringify({
        connectionId,
        comment: "Please share your credentials",
        orgId: ORG_ID,
        proofFormats: {
          indy: {
            attributes,
          },
        },
      }),
    });
  }

  // Verify proof
  async verifyProof(proofId: string) {
    return this.makeRequest(
      `/orgs/${ORG_ID}/proofs/${proofId}/verify`,
      { method: "POST" }
    );
  }

  // Get verified proof details (extract attributes)
  async getProofDetails(proofId: string) {
    return this.makeRequest(`/orgs/${ORG_ID}/verified-proofs/${proofId}`);
  }
}

export const confirmdClient = new ConfirmdClient();
```

### Phase 2: Connection Management

#### 2.1 Create Connection Session

`src/app/api/connections/session/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmdClient } from "@/lib/api/confirmd-client";

export async function POST(request: NextRequest) {
  try {
    // Generate unique session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create invitation via ConfirmD
    const invitation = await confirmdClient.createInvitation();

    // Store in database
    const session = await prisma.connectionSession.create({
      data: {
        sessionId,
        invitationId: invitation.data.id,
        invitationUrl: invitation.data.invitationUrl,
        status: "invitation",
        requestType: "registration",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      invitationUrl: session.invitationUrl,
    });
  } catch (error) {
    console.error("Connection session error:", error);
    return NextResponse.json(
      { error: "Failed to create connection" },
      { status: 500 }
    );
  }
}
```

#### 2.2 Handle Connection Webhooks

`src/app/api/webhooks/confirmd/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        webhookId: `wh-${Date.now()}`,
        topic: payload.type,
        organizationId: payload.orgId,
        agentId: payload.agentId || "unknown",
        connectionId: payload.connectionId,
        proofId: payload.id,
        payload: JSON.stringify(payload),
      },
    });

    // Handle Connection webhooks
    if (payload.type === "Connection") {
      await handleConnectionWebhook(payload);
    }

    // Handle Proof webhooks
    if (payload.type === "Proof") {
      await handleProofWebhook(payload);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleConnectionWebhook(payload: any) {
  const connectionId = payload.connectionId;
  const state = payload.state;

  // Find session by connectionId or by latest invitation
  let session = await prisma.connectionSession.findFirst({
    where: { connectionId },
  });

  if (!session) {
    // Match to most recent invitation session
    session = await prisma.connectionSession.findFirst({
      where: {
        status: "invitation",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!session) {
    console.warn("No matching session for connection webhook");
    return;
  }

  // Update session status
  const statusMap: Record<string, string> = {
    "response-sent": "response",
    "completed": "active",
  };

  await prisma.connectionSession.update({
    where: { id: session.id },
    data: {
      status: statusMap[state] || state,
      connectionId: payload.connectionId,
      theirLabel: payload.theirLabel,
      theirDid: payload.theirDid,
    },
  });

  // Broadcast update via WebSocket (if implemented)
  // broadcastToSession(session.sessionId, { status: statusMap[state] });
}

async function handleProofWebhook(payload: any) {
  // Implementation in Phase 3
}
```

### Phase 3: Proof Request & Verification

#### 3.1 Configure Proof Attributes

`src/lib/proof-config.ts`:

```typescript
import * as fs from "fs";
import * as path from "path";

interface AttributeConfig {
  name: string;
  description?: string;
  predicate?: ">" | "<" | ">=" | "<=";
  value?: number;
}

export function getProofAttributes(): AttributeConfig[] {
  const configPath = path.join(process.cwd(), "config", "proof-attributes.json");

  if (fs.existsSync(configPath)) {
    const fileContent = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(fileContent);
  }

  throw new Error("proof-attributes.json not found");
}

export function buildProofAttributeRequests() {
  const schemaId = process.env.PROOF_SCHEMA_ID!;
  const credDefId = process.env.PROOF_CRED_DEF_ID;
  const attributes = getProofAttributes();

  return attributes.map((attr) => ({
    attributeName: attr.name,
    schemaId,
    ...(credDefId && { credDefId }),
    ...(attr.predicate && { condition: attr.predicate }),
    ...(attr.value !== undefined && { value: Number(attr.value) }),
  }));
}
```

#### 3.2 Send Proof Request

`src/app/api/proofs/request/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmdClient } from "@/lib/api/confirmd-client";
import { buildProofAttributeRequests } from "@/lib/proof-config";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    // Get connection session
    const session = await prisma.connectionSession.findUnique({
      where: { sessionId },
    });

    if (!session || !session.connectionId) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Build attribute requests from config
    const attributes = buildProofAttributeRequests();

    // Send proof request via ConfirmD
    const response = await confirmdClient.sendProofRequest(
      session.connectionId,
      attributes
    );

    // Store proof request in database
    const proofRequest = await prisma.proofRequest.create({
      data: {
        sessionId: session.sessionId,
        connectionId: session.connectionId,
        status: "request-sent",
        requestedAttributes: JSON.stringify(attributes),
        comment: "Please share your credentials",
      },
    });

    return NextResponse.json({
      success: true,
      proofRequestId: proofRequest.id,
    });
  } catch (error) {
    console.error("Proof request error:", error);
    return NextResponse.json(
      { error: "Failed to create proof request" },
      { status: 500 }
    );
  }
}
```

#### 3.3 Handle Proof Webhooks

Add to `src/app/api/webhooks/confirmd/route.ts`:

```typescript
async function handleProofWebhook(payload: any) {
  const proofId = payload.id;
  const state = payload.state;

  // Find proof request by connectionId
  const proofRequest = await prisma.proofRequest.findFirst({
    where: { connectionId: payload.connectionId },
    orderBy: { createdAt: "desc" },
  });

  if (!proofRequest) {
    console.warn("No matching proof request for webhook");
    return;
  }

  // Map webhook state to our status
  const statusMap: Record<string, string> = {
    "request-sent": "request-sent",
    "presentation-received": "presentation-received",
    "done": "done",
  };

  // If presentation received, extract attributes
  let attributes = null;
  if (state === "presentation-received") {
    const proofDetails = await confirmdClient.getProofDetails(proofId);
    attributes = extractAttributes(proofDetails.data);
  }

  // Update proof request
  await prisma.proofRequest.update({
    where: { id: proofRequest.id },
    data: {
      status: statusMap[state] || state,
      proofId,
      ...(attributes && { presentedAttributes: JSON.stringify(attributes) }),
      ...(state === "done" && { verifiedAt: new Date() }),
    },
  });

  // Broadcast update via WebSocket
  // broadcastToSession(proofRequest.sessionId, { status: statusMap[state] });
}

function extractAttributes(data: any[]): Record<string, string> {
  const attributes: Record<string, string> = {};

  // CRITICAL: Each array item contains ONE attribute
  data.forEach((item) => {
    // Remove metadata, keep only the attribute
    const { schemaId, credDefId, ...attribute } = item;
    Object.assign(attributes, attribute);
  });

  return attributes;
}
```

#### 3.4 Verify Proof

`src/app/api/proofs/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmdClient } from "@/lib/api/confirmd-client";

export async function POST(request: NextRequest) {
  try {
    const { proofId } = await request.json();

    // Verify proof with ConfirmD
    const verifyResult = await confirmdClient.verifyProof(proofId);

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: "Proof verification failed" },
        { status: 400 }
      );
    }

    // Get verified proof details and extract attributes
    const proofDetails = await confirmdClient.getProofDetails(proofId);
    const attributes = extractAttributes(proofDetails.data);

    // Update database
    await prisma.proofRequest.update({
      where: { proofId },
      data: {
        verified: true,
        verifiedAt: new Date(),
        presentedAttributes: JSON.stringify(attributes),
        status: "done",
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      attributes,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

function extractAttributes(data: any[]): Record<string, string> {
  const attributes: Record<string, string> = {};

  // CRITICAL: ConfirmD returns array where EACH object has ONE attribute
  data.forEach((item) => {
    const { schemaId, credDefId, ...attribute } = item;
    Object.assign(attributes, attribute);
  });

  return attributes;
}
```

### Phase 4: Frontend Integration

#### 4.1 Connection Component

`src/components/ConnectionFlow.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode.react";

export default function ConnectionFlow() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  // Create connection session
  const initiateConnection = async () => {
    const response = await fetch("/api/connections/session", {
      method: "POST",
    });

    const data = await response.json();
    setSessionId(data.sessionId);
    setInvitationUrl(data.invitationUrl);
    setStatus("waiting");
  };

  // Poll for connection status (or use WebSocket)
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      const response = await fetch(
        `/api/connections/status?sessionId=${sessionId}`
      );
      const data = await response.json();

      setStatus(data.status);

      if (data.status === "active") {
        clearInterval(interval);
        // Connection established, request proof
        await requestProof(sessionId);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const requestProof = async (sessionId: string) => {
    await fetch("/api/proofs/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    setStatus("proof-requested");
  };

  return (
    <div>
      <h2>Connect Your Wallet</h2>

      {status === "idle" && (
        <button onClick={initiateConnection}>
          Request Student Clearance
        </button>
      )}

      {invitationUrl && status === "waiting" && (
        <div>
          <p>Scan this QR code with your wallet app:</p>
          <QRCode value={invitationUrl} size={256} />
        </div>
      )}

      {status === "active" && <p>Connection established!</p>}
      {status === "proof-requested" && <p>Please present your credentials...</p>}
      {status === "done" && <p>Verification complete!</p>}
    </div>
  );
}
```

#### 4.2 Use Verified Attributes

`src/app/application/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ApplicationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadVerifiedData() {
      if (!sessionId) return;

      const response = await fetch(
        `/api/proofs/request?sessionId=${sessionId}`
      );
      const data = await response.json();

      if (data.presentedAttributes) {
        const attributes = JSON.parse(data.presentedAttributes);
        setFormData(attributes);
      }
    }

    loadVerifiedData();
  }, [sessionId]);

  return (
    <form>
      <h2>Loan Application</h2>

      <label>
        Admission Number:
        <input
          type="text"
          value={formData.admission_number || ""}
          readOnly
        />
      </label>

      <label>
        Programme:
        <input
          type="text"
          value={formData.programme || ""}
          readOnly
        />
      </label>

      <label>
        Graduation Year:
        <input
          type="text"
          value={formData.graduation_year || ""}
          readOnly
        />
      </label>

      {/* Add more fields as needed */}

      <button type="submit">Submit Application</button>
    </form>
  );
}
```

---

## API Reference

### ConfirmD Platform Endpoints

#### 1. Create Invitation

```
POST /orgs/{orgId}/invitations
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "autoAcceptConnection": true,
  "multiUseInvitation": false
}

Response:
{
  "statusCode": 201,
  "message": "Invitation created successfully",
  "data": {
    "id": "invitation-id",
    "invitationUrl": "didcomm://...",
    "state": "initial"
  }
}
```

#### 2. Send Proof Request

```
POST /orgs/{orgId}/proofs?requestType=indy
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "connectionId": "connection-id",
  "comment": "Please share your credentials",
  "orgId": "org-id",
  "proofFormats": {
    "indy": {
      "attributes": [
        {
          "attributeName": "admission_number",
          "schemaId": "schema-id",
          "credDefId": "cred-def-id"
        }
      ]
    }
  }
}

Response:
{
  "statusCode": 201,
  "message": "Proof request sent successfully",
  "data": {
    "id": "proof-id",
    "state": "request-sent",
    "connectionId": "connection-id"
  }
}
```

#### 3. Verify Proof

```
POST /orgs/{orgId}/proofs/{proofId}/verify
Authorization: Bearer {access_token}

Response:
{
  "statusCode": 200,
  "message": "Proof verified successfully",
  "data": {
    "id": "proof-id",
    "state": "done",
    "verified": true
  }
}
```

#### 4. Get Verified Proof Details

```
GET /orgs/{orgId}/verified-proofs/{proofId}
Authorization: Bearer {access_token}

Response:
{
  "statusCode": 200,
  "success": true,
  "data": [
    {
      "admission_number": "930930ee",
      "schemaId": "...",
      "credDefId": "..."
    },
    {
      "programme": "Accounting",
      "schemaId": "...",
      "credDefId": "..."
    }
    // ... one object per attribute
  ]
}
```

---

## Common Pitfalls

### 1. Incorrect Attribute Extraction

**WRONG:**
```typescript
// Only gets first attribute!
const attributes = proofDetails.data[0];
```

**CORRECT:**
```typescript
// Extracts ALL attributes
const attributes = {};
proofDetails.data.forEach((item) => {
  const { schemaId, credDefId, ...attribute } = item;
  Object.assign(attributes, attribute);
});
```

### 2. Token Caching Issues

**Problem:** Making too many auth requests.

**Solution:** Cache tokens with proper expiry:
```typescript
if (tokenCache && Date.now() < tokenCache.expiresAt) {
  return tokenCache.token; // Use cached token
}
```

### 3. Webhook Matching

**Problem:** Can't match webhook to session.

**Solution:** Store connectionId when received:
```typescript
// First webhook has connectionId, use it to update session
await prisma.connectionSession.update({
  where: { id: session.id },
  data: { connectionId: payload.connectionId }
});
```

### 4. Async Webhook Processing

**Problem:** Webhook handler times out.

**Solution:** Return 200 immediately, process async:
```typescript
export async function POST(request: NextRequest) {
  const payload = await request.json();

  // Return immediately
  NextResponse.json({ received: true });

  // Process async (don't await)
  processWebhook(payload).catch(console.error);
}
```

### 5. Missing Schema ID

**Problem:** Proof request fails with "missing schemaId".

**Solution:** Always include schemaId in attribute requests:
```typescript
{
  attributeName: "admission_number",
  schemaId: process.env.PROOF_SCHEMA_ID,  // Required!
  credDefId: process.env.PROOF_CRED_DEF_ID  // Optional
}
```

---

## Troubleshooting

### Debugging Checklist

1. **OAuth Token Issues**
   ```bash
   # Test token endpoint
   curl -X POST "$CONFIRMD_AUTH_URL" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials" \
     -d "client_id=$CLIENT_ID" \
     -d "client_secret=$CLIENT_SECRET"
   ```

2. **Webhook Not Received**
   - Verify webhook URL is publicly accessible (HTTPS)
   - Check webhook logs in database
   - Ensure webhook secret matches (if implemented)
   - Test with ngrok or similar tool

3. **Connection Not Completing**
   - Check wallet app is on same network
   - Verify QR code is valid
   - Check connection timeout (15 minutes default)

4. **Attributes Not Extracted**
   - Log raw API response to see structure
   - Verify schemaId matches your credential
   - Check attribute names match config file

5. **Enable Debug Logging**
   ```typescript
   // Add extensive logging
   console.log("Proof details:", JSON.stringify(proofDetails, null, 2));
   console.log("Extracted attributes:", attributes);
   console.log("Attribute count:", Object.keys(attributes).length);
   ```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid OAuth token | Verify client credentials |
| `404 Not Found` | Invalid org/proof ID | Check environment variables |
| `400 Bad Request` | Missing required fields | Validate request payload |
| `Connection timeout` | User didn't scan QR | Increase timeout, retry |
| `Proof verification failed` | Invalid presentation | Check credential validity |

---

## Next Steps

1. **Add WebSocket Support** for real-time updates
2. **Implement Error Handling** with retry logic
3. **Add Security** (webhook signature verification)
4. **Set Up Monitoring** and logging
5. **Test Edge Cases** (expired credentials, network failures)
6. **Production Hardening** (rate limiting, timeouts)

---

## Resources

- [ConfirmD Platform Documentation](https://docs.confirmd.com)
- [Verifiable Credentials Overview](https://www.w3.org/TR/vc-data-model/)
- [Indy/AnonCreds Specification](https://hyperledger.github.io/anoncreds-spec/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma ORM Documentation](https://www.prisma.io/docs/)

---

**Version:** 1.0.0
**Last Updated:** November 2025
**Maintainer:** Your Organization
