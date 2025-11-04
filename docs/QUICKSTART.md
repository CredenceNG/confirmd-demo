# Quick Start Guide - ConfirmD Integration

Get your verifiable credential integration up and running in 30 minutes.

## Prerequisites

- Node.js 18+
- ConfirmD Platform account with credentials
- A credential schema ID you want to verify

## Step-by-Step Setup

### 1. Clone & Install (2 minutes)

```bash
# Clone this repository or create new Next.js project
npx create-next-app@latest my-credential-app --typescript --app

cd my-credential-app

# Install dependencies
npm install prisma @prisma/client qrcode.react
npm install -D @types/qrcode.react
```

### 2. Configure Environment (3 minutes)

Create `.env`:

```bash
# ConfirmD Platform Credentials
CONFIRMD_ORG_ID=your-org-id-here
CONFIRMD_CLIENT_ID=your-client-id-here
CONFIRMD_CLIENT_SECRET=your-client-secret-here
CONFIRMD_AUTH_URL=https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token
CONFIRMD_BASE_URL=https://platform.confamd.com

# Your Credential Schema
PROOF_SCHEMA_ID=L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0
PROOF_CRED_DEF_ID=L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance

# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3300
```

### 3. Set Up Database (5 minutes)

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model ConnectionSession {
  id             String   @id @default(uuid())
  sessionId      String   @unique
  invitationId   String
  invitationUrl  String
  status         String
  connectionId   String?
  theirLabel     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  expiresAt      DateTime

  @@index([sessionId])
  @@index([connectionId])
}

model ProofRequest {
  id                  String   @id @default(uuid())
  sessionId           String   @unique
  proofId             String?  @unique
  connectionId        String
  status              String
  requestedAttributes String
  presentedAttributes String?
  verified            Boolean  @default(false)
  verifiedAt          DateTime?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([sessionId])
  @@index([proofId])
}

model WebhookEvent {
  id             String   @id @default(uuid())
  webhookId      String   @unique
  topic          String
  organizationId String
  agentId        String
  connectionId   String?
  proofId        String?
  payload        String
  processed      Boolean  @default(false)
  createdAt      DateTime @default(now())

  @@index([connectionId])
  @@index([proofId])
}
```

Run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Configure Attributes (2 minutes)

Create `config/proof-attributes.json`:

```json
[
  {
    "name": "admission_number",
    "description": "Student admission number"
  },
  {
    "name": "programme",
    "description": "Programme of study"
  },
  {
    "name": "graduation_year",
    "description": "Year of graduation"
  },
  {
    "name": "surname",
    "description": "Student surname"
  },
  {
    "name": "school_name",
    "description": "Name of institution"
  }
]
```

### 5. Copy Core Files (10 minutes)

Copy these essential files from the integration guide:

#### `src/lib/prisma.ts`
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

#### `src/lib/api/confirmd-auth.ts`
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
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const authUrl = process.env.CONFIRMD_AUTH_URL!;
  const clientId = process.env.CONFIRMD_CLIENT_ID!;
  const clientSecret = process.env.CONFIRMD_CLIENT_SECRET!;

  const response = await fetch(authUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}
```

#### `src/lib/api/confirmd-client.ts`
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

  async createInvitation() {
    return this.makeRequest(`/orgs/${ORG_ID}/invitations`, {
      method: "POST",
      body: JSON.stringify({
        autoAcceptConnection: true,
        multiUseInvitation: false,
      }),
    });
  }

  async sendProofRequest(connectionId: string, attributes: any[]) {
    return this.makeRequest(`/orgs/${ORG_ID}/proofs?requestType=indy`, {
      method: "POST",
      body: JSON.stringify({
        connectionId,
        comment: "Please share your credentials",
        orgId: ORG_ID,
        proofFormats: { indy: { attributes } },
      }),
    });
  }

  async verifyProof(proofId: string) {
    return this.makeRequest(`/orgs/${ORG_ID}/proofs/${proofId}/verify`, {
      method: "POST",
    });
  }

  async getProofDetails(proofId: string) {
    return this.makeRequest(`/orgs/${ORG_ID}/verified-proofs/${proofId}`);
  }
}

export const confirmdClient = new ConfirmdClient();
```

#### `src/lib/proof-config.ts`
```typescript
import * as fs from "fs";
import * as path from "path";

interface AttributeConfig {
  name: string;
  description?: string;
}

export function getProofAttributes(): AttributeConfig[] {
  const configPath = path.join(process.cwd(), "config", "proof-attributes.json");
  const fileContent = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(fileContent);
}

export function buildProofAttributeRequests() {
  const schemaId = process.env.PROOF_SCHEMA_ID!;
  const credDefId = process.env.PROOF_CRED_DEF_ID;
  const attributes = getProofAttributes();

  return attributes.map((attr) => ({
    attributeName: attr.name,
    schemaId,
    ...(credDefId && { credDefId }),
  }));
}
```

### 6. Create API Routes (8 minutes)

#### `src/app/api/connections/session/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmdClient } from "@/lib/api/confirmd-client";

export async function POST(request: NextRequest) {
  try {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const invitation = await confirmdClient.createInvitation();

    const session = await prisma.connectionSession.create({
      data: {
        sessionId,
        invitationId: invitation.data.id,
        invitationUrl: invitation.data.invitationUrl,
        status: "invitation",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      invitationUrl: session.invitationUrl,
    });
  } catch (error) {
    console.error("Connection error:", error);
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const session = await prisma.connectionSession.findUnique({
    where: { sessionId },
  });

  return NextResponse.json(session);
}
```

#### `src/app/api/proofs/request/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmdClient } from "@/lib/api/confirmd-client";
import { buildProofAttributeRequests } from "@/lib/proof-config";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    const session = await prisma.connectionSession.findUnique({
      where: { sessionId },
    });

    if (!session?.connectionId) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    const attributes = buildProofAttributeRequests();
    const response = await confirmdClient.sendProofRequest(session.connectionId, attributes);

    const proofRequest = await prisma.proofRequest.create({
      data: {
        sessionId: session.sessionId,
        connectionId: session.connectionId,
        status: "request-sent",
        requestedAttributes: JSON.stringify(attributes),
      },
    });

    return NextResponse.json({ success: true, proofRequestId: proofRequest.id });
  } catch (error) {
    console.error("Proof request error:", error);
    return NextResponse.json({ error: "Failed to create proof request" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const proofRequest = await prisma.proofRequest.findUnique({
    where: { sessionId },
  });

  return NextResponse.json(proofRequest);
}
```

#### `src/app/api/webhooks/confirmd/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmdClient } from "@/lib/api/confirmd-client";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

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

    if (payload.type === "Connection") {
      await handleConnectionWebhook(payload);
    } else if (payload.type === "Proof") {
      await handleProofWebhook(payload);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

async function handleConnectionWebhook(payload: any) {
  const statusMap: Record<string, string> = {
    "response-sent": "response",
    "completed": "active",
  };

  let session = await prisma.connectionSession.findFirst({
    where: { connectionId: payload.connectionId },
  });

  if (!session) {
    session = await prisma.connectionSession.findFirst({
      where: { status: "invitation", expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (session) {
    await prisma.connectionSession.update({
      where: { id: session.id },
      data: {
        status: statusMap[payload.state] || payload.state,
        connectionId: payload.connectionId,
        theirLabel: payload.theirLabel,
      },
    });
  }
}

async function handleProofWebhook(payload: any) {
  const statusMap: Record<string, string> = {
    "request-sent": "request-sent",
    "presentation-received": "presentation-received",
    "done": "done",
  };

  const proofRequest = await prisma.proofRequest.findFirst({
    where: { connectionId: payload.connectionId },
    orderBy: { createdAt: "desc" },
  });

  if (!proofRequest) return;

  let attributes = null;
  if (payload.state === "presentation-received") {
    const proofDetails = await confirmdClient.getProofDetails(payload.id);
    attributes = extractAttributes(proofDetails.data);
  }

  await prisma.proofRequest.update({
    where: { id: proofRequest.id },
    data: {
      status: statusMap[payload.state] || payload.state,
      proofId: payload.id,
      ...(attributes && { presentedAttributes: JSON.stringify(attributes) }),
      ...(payload.state === "done" && { verifiedAt: new Date() }),
    },
  });
}

function extractAttributes(data: any[]): Record<string, string> {
  const attributes: Record<string, string> = {};

  // CRITICAL: Each array item contains ONE attribute
  data.forEach((item) => {
    const { schemaId, credDefId, ...attribute } = item;
    Object.assign(attributes, attribute);
  });

  return attributes;
}
```

### 7. Create Frontend Component (5 minutes)

#### `src/app/page.tsx`
```typescript
"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  const initiateConnection = async () => {
    const response = await fetch("/api/connections/session", { method: "POST" });
    const data = await response.json();

    setSessionId(data.sessionId);
    setInvitationUrl(data.invitationUrl);
    setStatus("waiting");
  };

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      const response = await fetch(`/api/connections/session?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.status === "active") {
        clearInterval(interval);

        // Request proof
        await fetch("/api/proofs/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        setStatus("proof-requested");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (status !== "proof-requested" || !sessionId) return;

    const interval = setInterval(async () => {
      const response = await fetch(`/api/proofs/request?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.status === "presentation-received" || data.status === "done") {
        clearInterval(interval);
        router.push(`/application?sessionId=${sessionId}`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, sessionId, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Verifiable Credentials Demo</h1>

      {status === "idle" && (
        <button
          onClick={initiateConnection}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet & Verify Credentials
        </button>
      )}

      {invitationUrl && status === "waiting" && (
        <div className="text-center">
          <p className="mb-4">Scan this QR code with your wallet app:</p>
          <QRCode value={invitationUrl} size={256} />
        </div>
      )}

      {status === "proof-requested" && (
        <p className="text-xl">Please present your credentials from your wallet...</p>
      )}
    </main>
  );
}
```

#### `src/app/application/page.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ApplicationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      if (!sessionId) return;

      const response = await fetch(`/api/proofs/request?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.presentedAttributes) {
        setAttributes(JSON.parse(data.presentedAttributes));
      }
    }

    loadData();
  }, [sessionId]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Verified Application</h1>

      <div className="w-full max-w-md space-y-4">
        {Object.entries(attributes).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">
              {key.replace(/_/g, " ").toUpperCase()}
            </label>
            <input
              type="text"
              value={value}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 px-3 py-2"
            />
          </div>
        ))}
      </div>
    </main>
  );
}
```

### 8. Run the Application

```bash
npm run dev
```

Open http://localhost:3300 in your browser.

## Testing Your Integration

1. **Click "Connect Wallet & Verify Credentials"**
2. **Scan QR code** with a wallet app that has the credential
3. **Wait for connection** to establish (few seconds)
4. **Present credentials** when prompted in wallet
5. **View pre-filled form** with verified attributes

## Next Steps

- [ ] Set up public webhook endpoint (ngrok for testing)
- [ ] Add WebSocket for real-time updates
- [ ] Implement proper error handling
- [ ] Add loading states and UI polish
- [ ] Review full integration guide in `docs/CONFIRMD_INTEGRATION_GUIDE.md`

## Common Issues

### "Failed to fetch access token"
- Check your `CONFIRMD_CLIENT_ID` and `CONFIRMD_CLIENT_SECRET`
- Verify the `CONFIRMD_AUTH_URL` is correct

### "Connection not found"
- User may not have scanned QR code yet
- Connection may have expired (15 min timeout)

### "Only 1 attribute extracted"
- Check the `extractAttributes` function in webhook handler
- Ensure you're iterating through ALL array items

### Webhooks not received
- Use ngrok to expose your local server: `ngrok http 3300`
- Configure webhook URL in ConfirmD Platform dashboard

## Support

For detailed documentation, see:
- [Full Integration Guide](./CONFIRMD_INTEGRATION_GUIDE.md)
- [ConfirmD Platform Docs](https://docs.confirmd.com)

---

**Happy Building! 🚀**
