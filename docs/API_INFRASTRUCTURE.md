# Confirmd API Infrastructure Documentation

## Overview

This document describes the well-architected Confirmd Platform API integration infrastructure built for the NELFUND Demo application.

## Architecture Principles

The infrastructure follows these key principles:

1. **No Hardcoding** - All configuration comes from environment variables
2. **Type Safety** - Comprehensive TypeScript interfaces for all API interactions
3. **Error Handling** - Robust error handling with retry logic
4. **Logging** - Structured logging for debugging and monitoring
5. **Caching** - Token caching with automatic refresh
6. **Separation of Concerns** - Clear separation between auth, client, types, and utilities

## Directory Structure

```
src/lib/api/
├── types.ts                    # TypeScript type definitions
├── constants.ts                # Configuration constants
├── logger.ts                   # Logging utility
├── confirmd-auth.ts            # OAuth authentication
├── confirmd-client.ts          # API client
└── error-handler.ts            # Error handling utilities

src/app/api/confirmd/
├── token/route.ts              # Token management endpoint
├── organization/route.ts       # Organization endpoints
├── wallet/
│   ├── connect/route.ts        # Wallet connection
│   ├── request-data/route.ts   # Wallet data requests
│   └── verify-signature/route.ts # Signature verification
└── students/
    ├── register/route.ts       # Student registration
    └── authenticate/route.ts   # Student authentication
```

## Core Components

### 1. Type Definitions (`types.ts`)

Comprehensive TypeScript interfaces for:
- **Authentication**: `ConfirmdTokenResponse`, `ConfirmdAuthConfig`, `TokenCacheEntry`
- **API Responses**: `ConfirmdApiResponse`, `ConfirmdPlatformResponse`, `ApiError`
- **Organization**: `Organization`, `OrgAgent`, `Ledger`, `DidDocument`
- **Students**: `StudentRegistrationData`, `StudentProfile`
- **Wallet**: `WalletConnectionRequest`, `WalletDataRequest`, `WalletSignatureRequest`

### 2. Constants (`constants.ts`)

Centralized configuration without hardcoded values:

```typescript
export const API_CONFIG = {
  PLATFORM_URL: process.env.PLATFORM_URL,
  CONFIRMD_API_URL: process.env.CONFIRMD_API_URL,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  ORGANIZATION_ID: process.env.ORGANIZATION_ID,
};

export const TIMEOUTS = {
  DEFAULT: 30000,           // 30 seconds
  AUTHENTICATION: 15000,    // 15 seconds
  LONG_RUNNING: 60000,      // 60 seconds
};

export const TOKEN_CONFIG = {
  EXPIRY_BUFFER: 60000,     // 60 seconds before expiry
  DEFAULT_LIFETIME: 900000, // 15 minutes
};
```

### 3. Logger (`logger.ts`)

Structured logging with configurable levels:

```typescript
logger.debug("Debug message", { context });
logger.info("Info message", { context });
logger.warn("Warning message", { context });
logger.error("Error message", { context });

// Specialized loggers
logger.apiRequest("GET", "/orgs/123");
logger.apiResponse("GET", "/orgs/123", 200);
logger.token("Fetching new token");
logger.auth("Authentication successful");
```

**Configuration:**
- `LOG_LEVEL`: debug | info | warn | error (default: info)
- `LOG_FORMAT`: json | text (default: text)
- Automatically disabled in test environment

### 4. Authentication Service (`confirmd-auth.ts`)

OAuth 2.0 client credentials flow with token caching:

```typescript
// Get access token (cached or fresh)
const token = await getAccessToken();

// Fetch new token
const tokenResponse = await fetchAccessToken();

// Get cached token info
const tokenInfo = getTokenInfo();

// Invalidate cache
invalidateToken();
```

**Features:**
- In-memory token caching
- Automatic expiration checking (60s buffer)
- Structured error handling
- Comprehensive logging

### 5. API Client (`confirmd-client.ts`)

Type-safe HTTP client with automatic authentication:

```typescript
// Organization methods
const org = await confirmdClient.getCurrentOrganization();
const org = await confirmdClient.getOrganizationById(id);

// Student methods
const student = await confirmdClient.registerStudent(data);
const auth = await confirmdClient.authenticateStudent(wallet, sig);
const profile = await confirmdClient.getStudentProfile(id);
const updated = await confirmdClient.updateStudentProfile(id, updates);

// Wallet methods
const verified = await confirmdClient.verifyWalletConnection(request);
const data = await confirmdClient.requestWalletData(request);
const valid = await confirmdClient.verifyWalletSignature(request);
```

**Features:**
- Automatic Bearer token injection
- Token refresh on 401 errors
- Request/response logging
- 30-second default timeout
- Comprehensive error handling

### 6. Error Handler (`error-handler.ts`)

Utilities for error handling and retry logic:

```typescript
// Format error for display
const message = formatApiError(error);

// Check if error is retryable
if (isRetryableError(error)) {
  const delay = getRetryDelay(error, attemptNumber);
}

// Retry with exponential backoff
const result = await retryWithBackoff(fn, maxRetries, onError);

// Validate required fields
const validation = validateRequiredFields(data, requiredFields);
```

## Environment Variables

Required variables in `.env`:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Confirmd Platform
ORGANIZATION_ID=eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95
CLIENT_ID=eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95
CLIENT_SECRET=9tdL08bIpJv1OTUz5g3OYhj8edg9OtX4
PLATFORM_URL=https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token
CONFIRMD_API_URL=https://platform.confamd.com

# Optional: Logging
LOG_LEVEL=info
LOG_FORMAT=text
```

## API Endpoints

### Next.js API Routes

All routes are under `/api/confirmd/*`:

#### Token Management
- `GET /api/confirmd/token` - Get token info (without exposing token)
- `POST /api/confirmd/token` - Force fetch new token
- `DELETE /api/confirmd/token` - Invalidate cached token

#### Organization
- `GET /api/confirmd/organization` - Get current organization
- `GET /api/confirmd/organization/[id]` - Get organization by ID

#### Wallet
- `POST /api/confirmd/wallet/connect` - Initiate wallet connection
- `POST /api/confirmd/wallet/request-data` - Request data from wallet
- `POST /api/confirmd/wallet/verify-signature` - Verify wallet signature

#### Students
- `POST /api/confirmd/students/register` - Register new student
- `POST /api/confirmd/students/authenticate` - Authenticate student

## Usage Examples

### Server-Side

```typescript
import { confirmdClient } from '@/lib/api/confirmd-client';

// In a Server Component or API Route
export default async function Page() {
  const result = await confirmdClient.getCurrentOrganization();

  if (!result.success) {
    return <Error message={formatApiError(result.error)} />;
  }

  return <OrganizationView data={result.data} />;
}
```

### Client-Side

```typescript
// From React component
const response = await fetch('/api/confirmd/organization');
const { data, success, error } = await response.json();

if (!success) {
  console.error('Error:', error);
  return;
}

console.log('Organization:', data);
```

## Testing

### Manual Test Script

Run the included test script:

```bash
./test-api.sh
```

This tests:
1. OAuth token retrieval
2. Organization details fetch
3. Displays results with formatting

### Programmatic Test

```typescript
import { getAccessToken } from '@/lib/api/confirmd-auth';
import { confirmdClient } from '@/lib/api/confirmd-client';

async function test() {
  try {
    // Test authentication
    const token = await getAccessToken();
    console.log('Token:', token.substring(0, 20) + '...');

    // Test organization fetch
    const org = await confirmdClient.getCurrentOrganization();
    console.log('Organization:', org.data);
  } catch (error) {
    console.error('Test failed:', error);
  }
}
```

## Error Handling

### Error Types

All errors follow the `ApiError` interface:

```typescript
interface ApiError {
  error: string;              // Error code
  error_description?: string; // Human-readable description
  status?: number;            // HTTP status code
}
```

### Common Error Codes

- `network_error` - Cannot connect to API
- `authentication_failed` - Invalid credentials
- `invalid_token` - Token is invalid or expired
- `unauthorized` - Not authorized for resource
- `not_found` - Resource not found
- `validation_error` - Invalid input data
- `server_error` - Internal server error

### Retry Logic

Retryable errors (with exponential backoff):
- Network errors
- 5xx server errors
- 429 Rate limit exceeded
- 408 Request timeout

Non-retryable errors:
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 400 Bad Request

## Security Considerations

1. **Token Security**
   - Tokens never exposed in client-side code
   - Cached in memory (server-side only)
   - Automatic expiration and refresh

2. **Environment Variables**
   - Sensitive credentials in `.env` file
   - Never committed to version control
   - Validated on startup

3. **API Routes**
   - Protected by middleware
   - Input validation on all endpoints
   - Rate limiting ready (add if needed)

4. **CORS**
   - Configured in middleware
   - Restrictive headers in production

## Performance Optimizations

1. **Token Caching** - Reduces auth requests by ~99%
2. **Connection Pooling** - Axios instance reuses connections
3. **Timeout Configuration** - Prevents hanging requests
4. **Retry Logic** - Handles transient failures

## Monitoring & Debugging

### Enable Debug Logging

```bash
LOG_LEVEL=debug npm run dev
```

### JSON Logging (for log aggregation)

```bash
LOG_FORMAT=json npm run dev
```

### Check Token Status

```bash
curl http://localhost:3300/api/confirmd/token
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure external token cache (Redis)
- [ ] Set appropriate `LOG_LEVEL` (warn or error)
- [ ] Enable JSON logging (`LOG_FORMAT=json`)
- [ ] Configure rate limiting
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Review CORS configuration
- [ ] Verify timeout values for production load
- [ ] Set up health check endpoints
- [ ] Configure log aggregation service

## Future Enhancements

1. **Redis Token Cache** - For distributed systems
2. **Rate Limiting** - Protect against abuse
3. **Metrics Collection** - Track API performance
4. **Circuit Breaker** - Handle downstream failures gracefully
5. **Request Queuing** - Handle high load
6. **Webhook Support** - Real-time notifications
7. **GraphQL Layer** - Optional GraphQL wrapper

## Support

For issues or questions:
1. Check the logs (`LOG_LEVEL=debug`)
2. Verify environment variables
3. Test with `./test-api.sh`
4. Review error codes in constants.ts

---

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Maintainer:** NELFUND Development Team
