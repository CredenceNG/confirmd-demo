# ConfirmD Verifier SDK

Official TypeScript/JavaScript SDK for building verifier applications with ConfirmD Platform. This SDK simplifies the integration of verifiable credential verification into your applications.

## Features

- **Simple API**: Intuitive, promise-based API for all verifier operations
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Automatic Authentication**: Built-in OAuth2 client credentials flow with token refresh
- **Connection Management**: Easy QR code generation and connection handling
- **Proof Verification**: Request and verify credentials with full attribute extraction
- **Error Handling**: Comprehensive error types and handling
- **Event System**: Listen to connection and proof state changes

## Installation

```bash
npm install @confirmd/verifier-sdk
```

## Quick Start

```typescript
import { ConfirmDClient } from '@confirmd/verifier-sdk';

// Initialize the client
const client = new ConfirmDClient({
  organizationId: 'your-org-id',
  auth: {
    tokenUrl: 'https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
  },
});

// Create a connection invitation
const invitation = await client.connections.createInvitation();
console.log('QR Code URL:', invitation.invitationUrl);

// Request proof of credentials
const proof = await client.proofs.requestProof({
  connectionId: 'connection-id',
  comment: 'Please share your student credentials',
  attributes: [
    {
      attributeName: 'name',
      schemaId: 'L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0',
      credDefId: 'L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance',
    },
    {
      attributeName: 'student_id',
      schemaId: 'L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0',
      credDefId: 'L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance',
    },
  ],
});

// Verify the proof
const verified = await client.proofs.verifyProof(proof.proofId);
console.log('Verified:', verified.verified);
console.log('Attributes:', verified.attributes);
```

## Core Concepts

### 1. Connections

Before you can request credentials, you need to establish a connection with the holder's wallet.

```typescript
// Create invitation
const invitation = await client.connections.createInvitation();

// Display QR code to user
// The holder scans this with their ConfirmD wallet app

// Check connection status
const connection = await client.connections.getConnection(connectionId);
console.log('Connection state:', connection.state);
```

### 2. Proof Requests

Once connected, you can request verifiable credentials from the holder.

```typescript
const proof = await client.proofs.requestProof({
  connectionId: 'connection-id',
  comment: 'Please share your credentials for verification',
  attributes: [
    {
      attributeName: 'name',
      schemaId: 'your-schema-id',
      credDefId: 'your-cred-def-id',
    },
  ],
});
```

### 3. Verification

After the holder responds, verify the proof and extract attributes.

```typescript
const verified = await client.proofs.verifyProof(proof.proofId);

if (verified.verified) {
  console.log('Name:', verified.attributes.name);
  console.log('Student ID:', verified.attributes.student_id);
} else {
  console.error('Verification failed');
}
```

## API Reference

### ConfirmDClient

Main SDK client class.

#### Constructor

```typescript
new ConfirmDClient(config: ConfirmDConfig)
```

**Parameters:**
- `config.organizationId` (string): Your ConfirmD organization ID
- `config.auth.tokenUrl` (string): OAuth2 token endpoint URL
- `config.auth.clientId` (string): OAuth2 client ID
- `config.auth.clientSecret` (string): OAuth2 client secret
- `config.baseUrl` (string, optional): ConfirmD Platform API base URL (default: https://platform.confirmd.com)
- `config.timeout` (number, optional): HTTP request timeout in milliseconds (default: 30000)

### Connections API

#### createInvitation()

Create a new connection invitation.

```typescript
const invitation = await client.connections.createInvitation();
```

**Returns:** `Promise<ConnectionInvitation>`

```typescript
interface ConnectionInvitation {
  invitationId: string;
  invitationUrl: string;  // For QR code or deep link
  expiresAt: Date;
}
```

#### getConnection(connectionId)

Get connection details by ID.

```typescript
const connection = await client.connections.getConnection(connectionId);
```

**Returns:** `Promise<Connection>`

```typescript
interface Connection {
  connectionId: string;
  state: ConnectionState;
  theirLabel?: string;
  theirDid?: string;
  createdAt: Date;
  updatedAt: Date;
}

type ConnectionState = 'invitation' | 'request' | 'response' | 'active' | 'completed' | 'error' | 'abandoned';
```

#### listConnections(state?)

List all connections, optionally filtered by state.

```typescript
const connections = await client.connections.listConnections('active');
```

### Proofs API

#### requestProof(options)

Send a proof request to a connected holder.

```typescript
const proof = await client.proofs.requestProof({
  connectionId: 'connection-id',
  comment: 'Please share your credentials',
  attributes: [
    {
      attributeName: 'name',
      schemaId: 'schema-id',
      credDefId: 'cred-def-id',
    },
  ],
});
```

**Parameters:**

```typescript
interface ProofRequestOptions {
  connectionId: string;
  comment?: string;
  attributes: AttributeRequest[];
}

interface AttributeRequest {
  attributeName: string;
  schemaId: string;
  credDefId: string;
  restrictions?: Record<string, any>;
}
```

**Returns:** `Promise<ProofRequest>`

#### verifyProof(proofId)

Verify a received proof presentation and extract attributes.

```typescript
const verified = await client.proofs.verifyProof(proofId);
```

**Returns:** `Promise<VerifiedProof>`

```typescript
interface VerifiedProof {
  proofId: string;
  verified: boolean;
  state: ProofState;
  attributes: Record<string, string>;  // Key-value pairs of verified attributes
  metadata: ProofMetadata[];
  verifiedAt: Date;
}
```

**IMPORTANT:** The SDK automatically handles the critical attribute extraction pattern where ConfirmD Platform returns attributes as an array with one attribute per item. The SDK merges all attributes into a single key-value object for easy access.

#### getProof(proofId)

Get proof request details.

```typescript
const proof = await client.proofs.getProof(proofId);
```

## Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import {
  ConfirmDError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from '@confirmd/verifier-sdk';

try {
  const verified = await client.proofs.verifyProof(proofId);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found:', error.message);
  } else if (error instanceof ConfirmDError) {
    console.error('ConfirmD error:', error.message, error.statusCode);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Event System

Listen to state changes and errors:

```typescript
// Connection state changes
client.on('connection:state-changed', (connection) => {
  console.log('Connection state:', connection.state);
});

// Proof state changes
client.on('proof:state-changed', (proof) => {
  console.log('Proof state:', proof.state);
});

// Proof verified
client.on('proof:verified', (verified) => {
  console.log('Proof verified:', verified.attributes);
});

// Errors
client.on('error', (error) => {
  console.error('SDK error:', error);
});
```

## Examples

See the [examples](./examples) directory for complete working examples:

- [Basic Verification](./examples/basic-verification.ts) - Simple credential verification flow
- [Student Loan Application](./examples/student-loan.ts) - Complete student verification for loan applications
- [Express.js Integration](./examples/express-server.ts) - RESTful API with webhook handling
- [Next.js Integration](./examples/nextjs-app.ts) - Full Next.js application example

## Best Practices

### 1. Environment Variables

Store sensitive credentials in environment variables:

```typescript
const client = new ConfirmDClient({
  organizationId: process.env.CONFIRMD_ORG_ID!,
  auth: {
    tokenUrl: process.env.CONFIRMD_TOKEN_URL!,
    clientId: process.env.CONFIRMD_CLIENT_ID!,
    clientSecret: process.env.CONFIRMD_CLIENT_SECRET!,
  },
});
```

### 2. Connection State Management

Store connection IDs and states in your database:

```typescript
// When creating invitation
const invitation = await client.connections.createInvitation();
await db.saveConnectionSession({
  invitationId: invitation.invitationId,
  userId: user.id,
  status: 'invitation',
});
```

### 3. Webhook Integration

Use webhooks to receive real-time updates instead of polling:

```typescript
app.post('/webhooks/confirmd', async (req, res) => {
  const webhook = req.body;

  if (webhook.type === 'Proof' && webhook.state === 'presentation-received') {
    // Verify the proof
    const verified = await client.proofs.verifyProof(webhook.proofId);

    // Update your application state
    await processVerifiedCredentials(verified.attributes);
  }

  res.json({ success: true });
});
```

### 4. Attribute Extraction

The SDK handles attribute extraction correctly, but you should validate the data:

```typescript
const verified = await client.proofs.verifyProof(proofId);

// Validate required attributes exist
if (!verified.attributes.name || !verified.attributes.student_id) {
  throw new Error('Missing required attributes');
}

// Validate attribute format
if (!/^[A-Z]{3}\d{6}$/.test(verified.attributes.student_id)) {
  throw new Error('Invalid student ID format');
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions. Enable strict mode for the best experience:

```typescript
import type {
  Connection,
  ProofRequest,
  VerifiedProof,
  AttributeRequest,
} from '@confirmd/verifier-sdk';
```

## Testing

```bash
npm test
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT

## Support

- Documentation: https://docs.confirmd.com
- GitHub Issues: https://github.com/confirmd/verifier-sdk/issues
- Email: support@confirmd.com

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
