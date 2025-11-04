# Digital Wallet Integration Guide

This document explains how to integrate the digital wallet service with the NELFUND registration system.

## Overview

The registration page uses a QR code-based connection system where students scan a QR code with their digital wallet app to automatically share their registration information.

## Integration Flow

### 1. Initiate Connection
When a student clicks "Connect Wallet", the system should:

```typescript
// File: src/app/register/page.tsx - Line 24
const initiateConnection = async () => {
  const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // TODO: Replace with your API call
  const response = await fetch('/api/wallet/create-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: newSessionId,
      requestType: 'registration',
      timestamp: new Date().toISOString(),
    })
  });

  const data = await response.json();
  setSessionId(data.sessionId);
  setConnectionStatus("connecting");
};
```

**API Endpoint**: `POST /api/wallet/create-session`

**Request Body**:
```json
{
  "sessionId": "string",
  "requestType": "registration",
  "timestamp": "ISO 8601 datetime"
}
```

**Response**:
```json
{
  "sessionId": "string",
  "deepLink": "nelfund://connect?sessionId={sessionId}&requestType=registration",
  "expiresAt": "ISO 8601 datetime"
}
```

### 2. Generate QR Code
The QR code should contain a deep link that opens the wallet app:

```
nelfund://connect?sessionId={sessionId}&requestType=registration
```

This deep link should be registered with the wallet app so it can handle the connection request.

### 3. Monitor Connection Status
Use WebSocket or polling to check if the wallet has connected:

```typescript
// WebSocket approach (recommended)
const ws = new WebSocket('wss://your-api.com/wallet/connect');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.sessionId === sessionId && data.status === 'connected') {
    handleWalletConnected();
  }
};

// OR Polling approach
const pollConnection = setInterval(async () => {
  const response = await fetch(`/api/wallet/session-status/${sessionId}`);
  const data = await response.json();

  if (data.status === 'connected') {
    clearInterval(pollConnection);
    handleWalletConnected();
  }
}, 2000);
```

**API Endpoint**: `GET /api/wallet/session-status/{sessionId}`

**Response**:
```json
{
  "sessionId": "string",
  "status": "pending" | "connected" | "expired",
  "walletId": "string",
  "connectedAt": "ISO 8601 datetime"
}
```

### 4. Request Student Data
Once connected, request the student's information:

```typescript
// File: src/app/register/page.tsx - Line 38
const requestStudentData = async () => {
  setConnectionStatus("requesting");

  // TODO: Replace with your API call
  const response = await fetch('/api/wallet/request-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId,
      dataFields: [
        'firstName',
        'lastName',
        'middleName',
        'email',
        'phoneNumber',
        'dateOfBirth',
        'nin',
        'bvn',
        'gender',
        'stateOfOrigin',
        'lga',
        'address'
      ]
    })
  });

  const data = await response.json();

  if (data.status === 'approved') {
    setStudentData(data.studentData);
    setConnectionStatus("connected");
  } else if (data.status === 'rejected') {
    alert('Data request was rejected by the wallet');
    setConnectionStatus("connecting");
  }
};
```

**API Endpoint**: `POST /api/wallet/request-data`

**Request Body**:
```json
{
  "sessionId": "string",
  "dataFields": ["array", "of", "field", "names"]
}
```

**Response** (when approved):
```json
{
  "status": "approved",
  "studentData": {
    "firstName": "string",
    "lastName": "string",
    "middleName": "string",
    "email": "string",
    "phoneNumber": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "nin": "string",
    "bvn": "string",
    "gender": "Male" | "Female",
    "stateOfOrigin": "string",
    "lga": "string",
    "address": "string"
  }
}
```

**Response** (when rejected):
```json
{
  "status": "rejected",
  "reason": "User declined data sharing request"
}
```

### 5. Submit Registration
Once the student reviews and confirms their data:

```typescript
// File: src/app/register/page.tsx - Line 74
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  // TODO: Replace with your API call
  const response = await fetch('/api/students/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...studentData,
      sessionId: sessionId,
      registrationMethod: 'wallet',
      timestamp: new Date().toISOString(),
    })
  });

  if (response.ok) {
    const data = await response.json();
    // Show success message and redirect
    alert('Registration successful!');
    window.location.href = '/dashboard';
  } else {
    const error = await response.json();
    alert(`Registration failed: ${error.message}`);
  }

  setIsSubmitting(false);
};
```

**API Endpoint**: `POST /api/students/register`

**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "middleName": "string",
  "email": "string",
  "phoneNumber": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "nin": "string",
  "bvn": "string",
  "gender": "string",
  "stateOfOrigin": "string",
  "lga": "string",
  "address": "string",
  "sessionId": "string",
  "registrationMethod": "wallet",
  "timestamp": "ISO 8601 datetime"
}
```

**Response**:
```json
{
  "success": true,
  "studentId": "string",
  "message": "Registration successful",
  "nextSteps": "Check your email for confirmation"
}
```

## Wallet App Requirements

Your digital wallet app should:

1. **Handle Deep Links**: Register the URL scheme `nelfund://` to handle connection requests
2. **Display Data Request**: Show the user which data fields are being requested
3. **User Consent**: Allow the user to approve or reject the data sharing request
4. **Secure Communication**: Use HTTPS and proper authentication
5. **Data Validation**: Validate that the session is legitimate before sharing data

## Security Considerations

1. **Session Expiration**: Sessions should expire after 5-10 minutes
2. **One-Time Use**: Each session should only be used once
3. **Data Encryption**: All data should be encrypted in transit (HTTPS/WSS)
4. **Authentication**: Verify the wallet's identity before accepting data
5. **Rate Limiting**: Implement rate limiting on session creation
6. **Audit Logging**: Log all connection attempts and data requests

## Testing

For development/testing, you can simulate the wallet connection:

```typescript
// Click "Simulate Wallet Connection (Demo)" button
// This bypasses the actual wallet and populates with mock data
```

## Next Steps

1. Replace the TODO comments in [src/app/register/page.tsx](src/app/register/page.tsx) with your actual API calls
2. Implement the backend API endpoints listed above
3. Set up WebSocket or polling for real-time connection status
4. Test with your digital wallet app
5. Add error handling and retry logic
6. Implement proper authentication and authorization

## Contact

For questions about the integration, please contact the development team.

---

# Wallet Authentication (Sign In)

## Overview

Returning users can sign in using their digital wallet for passwordless authentication. The login page ([src/app/login/page.tsx](src/app/login/page.tsx)) offers two authentication methods:

1. **Wallet Authentication** (Recommended) - Quick, secure, passwordless sign-in via QR code
2. **Traditional Authentication** - Email and password fallback option

## Wallet Authentication Flow

### 1. Initiate Wallet Authentication

When a returning user clicks "Sign In with Wallet":

```typescript
// File: src/app/login/page.tsx - Line 15
const initiateWalletAuth = async () => {
  const newSessionId = `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // TODO: Replace with your API call
  const response = await fetch('/api/wallet/create-auth-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: newSessionId,
      requestType: 'authentication',
      timestamp: new Date().toISOString(),
    })
  });

  const data = await response.json();
  setSessionId(data.sessionId);
  setConnectionStatus("connecting");
};
```

**API Endpoint**: `POST /api/wallet/create-auth-session`

**Request Body**:
```json
{
  "sessionId": "string",
  "requestType": "authentication",
  "timestamp": "ISO 8601 datetime"
}
```

**Response**:
```json
{
  "sessionId": "string",
  "deepLink": "nelfund://auth?sessionId={sessionId}&requestType=login",
  "expiresAt": "ISO 8601 datetime",
  "challenge": "string (random challenge for signature verification)"
}
```

### 2. Generate QR Code for Authentication

The QR code should contain:
```
nelfund://auth?sessionId={sessionId}&requestType=login
```

### 3. Monitor Authentication Status

Use WebSocket or polling to check authentication status:

```typescript
// WebSocket approach
const ws = new WebSocket('wss://your-api.com/wallet/auth');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.sessionId === sessionId && data.status === 'authenticated') {
    handleAuthenticated(data.authToken, data.user);
  }
};

// Polling approach
const pollAuth = setInterval(async () => {
  const response = await fetch(`/api/wallet/auth-status/${sessionId}`);
  const data = await response.json();

  if (data.status === 'authenticated') {
    clearInterval(pollAuth);
    handleAuthenticated(data.authToken, data.user);
  }
}, 2000);
```

**API Endpoint**: `GET /api/wallet/auth-status/{sessionId}`

**Response**:
```json
{
  "sessionId": "string",
  "status": "pending" | "authenticated" | "rejected" | "expired",
  "authToken": "JWT token (if authenticated)",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  },
  "authenticatedAt": "ISO 8601 datetime"
}
```

### 4. Verify Wallet Signature

When the wallet app responds, verify the signature:

```typescript
const authenticateWithWallet = async () => {
  // TODO: Replace with your API call
  const response = await fetch('/api/wallet/verify-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: sessionId,
      walletAddress: 'user_wallet_address',
      signature: 'signed_challenge',
      timestamp: new Date().toISOString(),
    })
  });

  const data = await response.json();

  if (data.authenticated) {
    // Store auth token
    localStorage.setItem('authToken', data.authToken);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
};
```

**API Endpoint**: `POST /api/wallet/verify-auth`

**Request Body**:
```json
{
  "sessionId": "string",
  "walletAddress": "string (user's wallet address)",
  "signature": "string (signed challenge)",
  "timestamp": "ISO 8601 datetime"
}
```

**Response**:
```json
{
  "authenticated": true,
  "authToken": "JWT token",
  "refreshToken": "string",
  "expiresIn": 3600,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "walletAddress": "string"
  }
}
```

## Traditional Password Authentication

For users who prefer traditional login or as a fallback:

```typescript
// File: src/app/login/page.tsx - Line 47
const handlePasswordLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // TODO: Replace with your API call
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      password: password,
      rememberMe: rememberMe,
    })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('authToken', data.authToken);
    window.location.href = '/dashboard';
  }
};
```

**API Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "string",
  "password": "string",
  "rememberMe": boolean
}
```

**Response**:
```json
{
  "success": true,
  "authToken": "JWT token",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

## Security Considerations for Authentication

1. **Challenge-Response**: Use cryptographic challenge-response for wallet authentication
2. **Session Expiration**: Authentication sessions should expire after 5 minutes
3. **Rate Limiting**: Limit authentication attempts per IP address
4. **Token Security**: Use HTTPOnly cookies or secure localStorage for auth tokens
5. **Multi-Factor**: Consider adding 2FA for sensitive operations
6. **Audit Logging**: Log all authentication attempts (successful and failed)
7. **Signature Verification**: Verify wallet signatures server-side using the user's public key

## Wallet App Requirements for Authentication

The wallet app should:

1. **Handle Auth Deep Links**: Register `nelfund://auth` URL scheme
2. **Sign Challenge**: Sign the provided challenge with the user's private key
3. **Display Auth Request**: Show which account is being authenticated
4. **User Confirmation**: Require explicit user approval before signing
5. **Timeout Handling**: Handle expired authentication sessions gracefully

## Testing

For development/testing:

```typescript
// Simulate wallet authentication (bypass real wallet)
// Click "Simulate Wallet Auth (Demo)" button in the UI
```

## Comparison: Registration vs Authentication

| Feature | Registration | Authentication |
|---------|-------------|----------------|
| Purpose | Create new account | Sign in existing user |
| Data Shared | Full profile (NIN, BVN, etc.) | Only wallet address |
| User Action | Approve data sharing | Sign challenge |
| QR Code | `nelfund://connect?sessionId=...&requestType=registration` | `nelfund://auth?sessionId=...&requestType=login` |
| Session Type | Data sharing session | Authentication session |
| Fallback | N/A (registration requires wallet) | Email/Password login |

## Implementation Checklist

- [ ] Create authentication session endpoint
- [ ] Implement QR code generation for auth
- [ ] Set up WebSocket/polling for auth status
- [ ] Implement signature verification
- [ ] Create JWT token generation and validation
- [ ] Add refresh token mechanism
- [ ] Implement traditional password login fallback
- [ ] Add "Forgot Password" flow
- [ ] Set up session management
- [ ] Implement logout functionality
- [ ] Add authentication middleware for protected routes
- [ ] Test both authentication methods thoroughly

## Next Steps

1. Implement the backend endpoints listed above
2. Set up JWT token generation and validation
3. Add authentication middleware to protected routes
4. Test wallet authentication flow end-to-end
5. Implement refresh token mechanism
6. Add password reset functionality

## Support

For questions about authentication integration, contact the development team.
