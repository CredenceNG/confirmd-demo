# OneVERIFY Mock Service

A mock implementation of the OneVERIFY identity verification API for development and testing purposes.

Based on the Postman collection at: https://documenter.getpostman.com/view/43842592/2sB2cVfhHc

## Overview

This mock service simulates the OneVERIFY API endpoints for Nigerian identity verification, including NIN, BVN, passport, driver's license, bank account, and PVC verification.

## Library Files

| File | Description |
|------|-------------|
| `types.ts` | TypeScript types for all request/response formats |
| `mock-data.ts` | Mock database with Nigerian identity records (NIN, BVN, Phone) |
| `client.ts` | Mock client class with verification methods |
| `index.ts` | Central export file |

## API Endpoints

All endpoints are located at `/api/oneverify/` and require the following headers:

```
X-API-KEY: <your-api-key>
X-USER-ID: <your-user-id>
Accept: application/json
```

### NIN Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oneverify/ninAuth/getNINDetails` | POST | Verify NIN by NIN number |
| `/api/oneverify/ninAuth/getNINDetailsWithPhone` | POST | Verify NIN by phone number |
| `/api/oneverify/ninAuth/getNinDetailsWithDemography` | POST | Verify NIN by demographics (name, DOB, gender) |
| `/api/oneverify/ninAuth/verifyNinDetailsWithFacial` | POST | Verify NIN with facial recognition |

### BVN Verification Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oneverify/bvn/getBVNDetails` | POST | Verify BVN by BVN number |
| `/api/oneverify/verify/verifyBVN` | GET | Verify BVN (query param: `?bvn=<number>`) |

### Other Verification Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oneverify/verify/verifyPassport` | POST | Verify Nigerian passport |
| `/api/oneverify/verify/verifyLicense` | GET | Verify driver's license (`?id=<number>`) |
| `/api/oneverify/verify/verifyAccount` | GET | Verify bank account (`?accountId=<number>&bankCode=<code>`) |
| `/api/oneverify/verify/verifyPVC` | GET | Verify Permanent Voter's Card (`?pvc=<number>`) |

## Test Data

### NIN Records

| NIN | Name | Phone | State |
|-----|------|-------|-------|
| `12345678901` | Oluwaseun Adebayo Johnson | 08012345678 | Lagos |
| `23456789012` | Chioma Adanna Nwosu | 08098765432 | Anambra |
| `34567890123` | Ibrahim Abubakar Mohammed | 08087654321 | Kaduna |
| `45678901234` | Ngozi Chidinma Okeke | 08076543210 | Rivers |
| `56789012345` | Babatunde Oluwole Bakare | 08065432109 | Oyo |

### BVN Records

| BVN | Linked NIN | Bank |
|-----|------------|------|
| `22123456789` | 12345678901 | GTBank |
| `22234567890` | 23456789012 | Access Bank |
| `22345678901` | 34567890123 | Zenith Bank |
| `22456789012` | 45678901234 | UBA |
| `22567890123` | 56789012345 | First Bank |

### Phone Numbers

| Phone | Linked NIN | Carrier |
|-------|------------|---------|
| `08012345678` | 12345678901 | MTN |
| `08098765432` | 23456789012 | Airtel |
| `08087654321` | 34567890123 | MTN |
| `08076543210` | 45678901234 | Glo |
| `08065432109` | 56789012345 | 9mobile |

### Other Test Records

- **Passport:** `A02745229`, `A12345678`
- **Driver's License:** `75222761530`, `82134567890`
- **PVC:** `90F5AFEC12295412458`, `80A3BCDE98765432109`
- **Bank Account:** `0221416896` (GTBank - 058), `0123456789` (Access - 044)

## Usage Examples

### Verify NIN by Number

```bash
curl -X POST http://localhost:3000/api/oneverify/ninAuth/getNINDetails \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id" \
  -H "Content-Type: application/json" \
  -d '{"nin": "12345678901", "requestReason": "kycVerification"}'
```

### Verify NIN by Phone

```bash
curl -X POST http://localhost:3000/api/oneverify/ninAuth/getNINDetailsWithPhone \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id" \
  -H "Content-Type: application/json" \
  -d '{"phone": "08012345678", "requestReason": "kycVerification"}'
```

### Verify NIN by Demographics

```bash
curl -X POST http://localhost:3000/api/oneverify/ninAuth/getNinDetailsWithDemography \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Oluwaseun",
    "lastName": "Johnson",
    "dateOfBirth": "15-05-1990",
    "gender": "m",
    "requestReason": "kycVerification"
  }'
```

### Verify NIN with Facial Recognition

```bash
curl -X POST http://localhost:3000/api/oneverify/ninAuth/verifyNinDetailsWithFacial \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id" \
  -H "Content-Type: application/json" \
  -d '{
    "nin": "12345678901",
    "selfieImage": {"image": "data:image/jpeg;base64,..."},
    "requestReason": "kycVerification"
  }'
```

### Verify BVN

```bash
# POST method
curl -X POST http://localhost:3000/api/oneverify/bvn/getBVNDetails \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id" \
  -H "Content-Type: application/json" \
  -d '{"bvn": "22123456789"}'

# GET method
curl "http://localhost:3000/api/oneverify/verify/verifyBVN?bvn=22123456789" \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id"
```

### Verify Driver's License

```bash
curl "http://localhost:3000/api/oneverify/verify/verifyLicense?id=75222761530" \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id"
```

### Verify Bank Account

```bash
curl "http://localhost:3000/api/oneverify/verify/verifyAccount?accountId=0221416896&bankCode=058" \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id"
```

### Verify Passport

```bash
curl -X POST http://localhost:3000/api/oneverify/verify/verifyPassport \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id" \
  -H "Content-Type: application/json" \
  -d '{
    "passportId": "A02745229",
    "firstname": "Sade",
    "lastname": "David",
    "dob": "1992-03-09"
  }'
```

### Verify PVC

```bash
curl "http://localhost:3000/api/oneverify/verify/verifyPVC?pvc=90F5AFEC12295412458" \
  -H "X-API-KEY: test-api-key" \
  -H "X-USER-ID: test-user-id"
```

## Response Format

All endpoints return responses in the following format:

```json
{
  "status": 200,
  "message": "Verification successful",
  "data": {
    // Verification data
  }
}
```

### Error Responses

```json
{
  "status": 400,
  "message": "Error description",
  "data": null
}
```

## Using the Client Library

```typescript
import { verifyNIN, verifyBVN, verifyNINByPhone } from "@/lib/oneverify";

// Verify NIN
const ninResult = await verifyNIN("12345678901", "kycVerification");

// Verify BVN
const bvnResult = await verifyBVN("22123456789", "kycVerification");

// Verify NIN by phone
const phoneResult = await verifyNINByPhone("08012345678", "kycVerification");
```

## Environment Variables (Optional)

For production use, configure these environment variables:

```bash
ONEVERIFY_BASE_URL=https://api.oneverify.ng
ONEVERIFY_API_KEY=your-api-key
ONEVERIFY_USER_ID=your-user-id
```

## Notes

- This is a **mock service** for development and testing only
- All data is simulated and does not represent real individuals
- API delays are simulated (800ms-1500ms) to mimic real API behavior
- Face matching always returns successful matches in the mock
