# Getting Started with ConfirmD Verifier SDK

This guide will help you integrate verifiable credential verification into your application in under 30 minutes.

## Prerequisites

- Node.js 16 or higher
- NPM or Yarn
- A ConfirmD Platform account with:
  - Organization ID
  - OAuth2 client credentials (client ID and secret)

## Step 1: Installation

Install the SDK via npm:

```bash
npm install @confirmd/verifier-sdk
```

Or with yarn:

```bash
yarn add @confirmd/verifier-sdk
```

## Step 2: Get Your Credentials

1. Log in to [ConfirmD Platform](https://platform.confirmd.com)
2. Navigate to your Organization Settings
3. Copy your **Organization ID**
4. Create or copy your **OAuth2 Client Credentials**:
   - Client ID
   - Client Secret
   - Token URL

## Step 3: Set Up Environment Variables

Create a `.env` file in your project root:

```env
CONFIRMD_ORG_ID=your-organization-id
CONFIRMD_TOKEN_URL=https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token
CONFIRMD_CLIENT_ID=your-client-id
CONFIRMD_CLIENT_SECRET=your-client-secret
```

**IMPORTANT:** Never commit your `.env` file to version control. Add it to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

## Step 4: Initialize the SDK

Create a file `confirmd.ts` (or `confirmd.js` for JavaScript):

```typescript
import { ConfirmDClient } from '@confirmd/verifier-sdk';

// Initialize the client
export const client = new ConfirmDClient({
  organizationId: process.env.CONFIRMD_ORG_ID!,
  auth: {
    tokenUrl: process.env.CONFIRMD_TOKEN_URL!,
    clientId: process.env.CONFIRMD_CLIENT_ID!,
    clientSecret: process.env.CONFIRMD_CLIENT_SECRET!,
  },
});
```

## Step 5: Create Your First Verification Flow

### 5.1 Generate QR Code for Connection

```typescript
import { client } from './confirmd';

async function initiateVerification() {
  // Create connection invitation
  const invitation = await client.connections.createInvitation();

  console.log('Scan this URL with ConfirmD app:');
  console.log(invitation.invitationUrl);

  // Store the invitation ID in your database
  await db.saveSession({
    invitationId: invitation.invitationId,
    userId: currentUser.id,
    expiresAt: invitation.expiresAt,
  });

  return {
    qrCodeUrl: invitation.invitationUrl,
    sessionId: invitation.invitationId,
  };
}
```

### 5.2 Display QR Code in Your Frontend

```typescript
// Using a QR code library like 'qrcode'
import QRCode from 'qrcode';

async function showQRCode(invitationUrl: string) {
  const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl);

  // Display in your HTML
  document.getElementById('qr-code').src = qrCodeDataUrl;
}
```

### 5.3 Set Up Webhook Handler

Create an endpoint to receive webhook notifications:

```typescript
import express from 'express';
import { client } from './confirmd';

const app = express();
app.use(express.json());

app.post('/webhooks/confirmd', async (req, res) => {
  const webhook = req.body;

  // Handle connection established
  if (webhook.type === 'Connection' && webhook.state === 'completed') {
    await handleConnection(webhook.connectionId);
  }

  // Handle proof received
  if (webhook.type === 'Proof' && webhook.state === 'presentation-received') {
    await handleProof(webhook.proofId);
  }

  res.json({ success: true });
});

async function handleConnection(connectionId: string) {
  console.log('Connection established:', connectionId);

  // Update your database
  await db.updateSession({ connectionId, status: 'connected' });

  // Request proof
  const proof = await client.proofs.requestProof({
    connectionId,
    comment: 'Please share your credentials',
    attributes: [
      {
        attributeName: 'name',
        schemaId: 'your-schema-id',
        credDefId: 'your-cred-def-id',
      },
    ],
  });

  await db.updateSession({ proofId: proof.proofId });
}

async function handleProof(proofId: string) {
  console.log('Proof received:', proofId);

  // Verify the proof
  const verified = await client.proofs.verifyProof(proofId);

  if (verified.verified) {
    console.log('Attributes:', verified.attributes);

    // Update your database
    await db.saveVerifiedAttributes({
      proofId,
      attributes: verified.attributes,
      verifiedAt: verified.verifiedAt,
    });

    // Grant access to the user
    await grantAccess(verified.attributes);
  }
}

app.listen(3000);
```

### 5.4 Register Your Webhook

1. Go to ConfirmD Platform Settings
2. Navigate to Webhooks
3. Add your webhook URL: `https://yourdomain.com/webhooks/confirmd`
4. Save the configuration

## Step 6: Test Your Integration

### 6.1 Install the ConfirmD Mobile App

- **iOS:** [Download from App Store](https://apps.apple.com/app/confirmd/id6504173780)
- **Android:** [Download from Google Play](https://play.google.com/store/apps/details?id=ng.credence.confirmd)

### 6.2 Get Test Credentials

1. Open the ConfirmD app
2. Complete onboarding
3. Request test credentials from your issuer or use the sandbox environment

### 6.3 Test the Flow

1. Run your application
2. Generate a QR code using your SDK integration
3. Scan the QR code with the ConfirmD app
4. Accept the connection request
5. Share the requested credentials
6. Verify that your webhook receives the proof
7. Check that attributes are extracted correctly

## Common Integration Patterns

### Pattern 1: Authentication/Login

Use verifiable credentials as a login method:

```typescript
app.post('/auth/login-with-credentials', async (req, res) => {
  const invitation = await client.connections.createInvitation();

  await db.createAuthSession({
    invitationId: invitation.invitationId,
    returnUrl: req.body.returnUrl,
  });

  res.json({ qrCodeUrl: invitation.invitationUrl });
});

// In webhook handler
async function handleVerifiedCredentials(attributes: Record<string, string>) {
  const session = await db.getSessionByProof(proofId);

  // Create JWT or session token
  const token = jwt.sign({
    userId: attributes.user_id,
    verified: true,
  }, process.env.JWT_SECRET!);

  // Notify frontend (via WebSocket, polling, etc.)
  await notifyFrontend(session.invitationId, { token });
}
```

### Pattern 2: KYC Verification

Verify user identity before granting access:

```typescript
async function verifyKYC(userId: string) {
  const invitation = await client.connections.createInvitation();

  await db.createKYCSession({
    userId,
    invitationId: invitation.invitationId,
    status: 'pending',
  });

  return invitation.invitationUrl;
}

// After verification
async function processKYC(verified: VerifiedProof) {
  const session = await db.getKYCSession(proofId);

  await db.updateUser(session.userId, {
    kycStatus: 'verified',
    nationalId: verified.attributes.national_id,
    fullName: verified.attributes.full_name,
    dateOfBirth: verified.attributes.date_of_birth,
  });
}
```

### Pattern 3: Document Verification

Request specific document proofs:

```typescript
async function requestStudentProof(userId: string) {
  const invitation = await client.connections.createInvitation();

  // Wait for connection, then request specific attributes
  const proof = await client.proofs.requestProof({
    connectionId,
    comment: 'Please share your student credentials',
    attributes: [
      {
        attributeName: 'student_id',
        schemaId: 'student-schema-id',
        credDefId: 'student-cred-def-id',
      },
      {
        attributeName: 'graduation_year',
        schemaId: 'student-schema-id',
        credDefId: 'student-cred-def-id',
      },
    ],
  });

  return proof;
}
```

## Troubleshooting

### Issue: "Authentication failed"

**Solution:** Check that your client ID and secret are correct and that the token URL is accessible.

```typescript
// Test authentication separately
import axios from 'axios';

async function testAuth() {
  const response = await axios.post(
    process.env.CONFIRMD_TOKEN_URL!,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.CONFIRMD_CLIENT_ID!,
      client_secret: process.env.CONFIRMD_CLIENT_SECRET!,
    })
  );

  console.log('Auth successful:', response.data);
}
```

### Issue: "Webhook not receiving events"

**Solution:**

1. Verify your webhook URL is publicly accessible
2. Check webhook configuration in ConfirmD Platform
3. Use a service like [ngrok](https://ngrok.com) for local development:

```bash
ngrok http 3000
# Use the generated URL in webhook settings
```

### Issue: "Missing attributes in verified proof"

**Solution:** The SDK automatically handles attribute extraction. If attributes are missing:

1. Verify the attribute names in your proof request match the credential schema
2. Check that the holder actually has credentials with those attributes
3. Enable debug logging:

```typescript
// Add logging to see raw proof data
client.on('proof:verified', (proof) => {
  console.log('Raw proof data:', JSON.stringify(proof, null, 2));
});
```

## Next Steps

- Read the [Full API Reference](./README.md#api-reference)
- Explore [Complete Examples](./examples/)
- Learn about [Best Practices](./README.md#best-practices)
- Join our [Developer Community](https://discord.gg/confirmd)

## Getting Help

- **Documentation:** https://docs.confirmd.com
- **GitHub Issues:** https://github.com/confirmd/verifier-sdk/issues
- **Discord Community:** https://discord.gg/confirmd
- **Email Support:** support@confirmd.com

## What's Next?

Now that you have a basic integration:

1. **Add error handling** - Implement retry logic and user-friendly error messages
2. **Improve UX** - Show real-time status updates using WebSockets
3. **Add more attributes** - Request additional credential attributes as needed
4. **Implement caching** - Cache verified credentials to reduce API calls
5. **Set up monitoring** - Track verification success rates and errors
6. **Go to production** - Move from sandbox to production credentials

Happy coding! 🎉
