# Proof Attributes Configuration Guide

This guide explains how to configure proof request attributes with and without predicates.

## Overview

The `PROOF_ATTRIBUTES` environment variable supports two formats:

1. **Simple Format**: Comma-separated list (no predicates)
2. **JSON Format**: Array of objects with predicate support

## Format 1: Simple Comma-Separated List

Use this format when you only need to request attribute values without conditions.

### Syntax

```bash
PROOF_ATTRIBUTES=attr1,attr2,attr3
```

### Example

```bash
PROOF_ATTRIBUTES=admission_number,programme,graduation_year,surname,school_name,national_id_number,department,othernames,matric_number,date_issued,date_expiry,bank_verification_number,school_nuc_number,jamb_number,date_of_birth
```

### What This Does

Each attribute will be requested with:
- The attribute name
- The schema ID from `PROOF_SCHEMA_ID`
- The credential definition ID from `PROOF_CRED_DEF_ID` (if provided)

## Format 2: JSON Array with Predicates

Use this format when you need to verify conditions (predicates) on specific attributes.

### Syntax

```bash
PROOF_ATTRIBUTES=[{"name":"attr1"},{"name":"attr2","predicate":">=","value":18}]
```

### Supported Predicates

- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal to
- `<=` - Less than or equal to

### Example: Mixed Attributes and Predicates

```bash
PROOF_ATTRIBUTES=[{"name":"admission_number"},{"name":"programme"},{"name":"graduation_year","predicate":">=","value":2020},{"name":"age","predicate":">","value":18},{"name":"surname"},{"name":"school_name"}]
```

### What This Does

For each object in the array:

**Without predicate** (`{"name":"admission_number"}`):
- Requests the actual value of the attribute
- User's wallet will reveal the value

**With predicate** (`{"name":"graduation_year","predicate":">=","value":2020}`):
- Verifies the condition WITHOUT revealing the actual value
- User's wallet proves the condition is true using zero-knowledge proof
- The verifier only learns that `graduation_year >= 2020`, not the exact year

## Use Cases for Predicates

### Age Verification

```bash
# Verify user is over 18 without knowing their exact age
{"name":"age","predicate":">","value":18}
```

### Graduation Year

```bash
# Verify graduated after 2020 without revealing exact year
{"name":"graduation_year","predicate":">=","value":2020}
```

### Account Balance

```bash
# Verify balance is above threshold without revealing exact amount
{"name":"account_balance","predicate":">=","value":10000}
```

### Expiry Date

```bash
# Verify credential hasn't expired
{"name":"expiry_timestamp","predicate":">","value":1704067200}
```

## Complete Configuration Example

### .env File

```bash
# Proof Request Configuration
PROOF_SCHEMA_ID=L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0
PROOF_CRED_DEF_ID=L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance

# Request all attributes without predicates (simple format)
PROOF_ATTRIBUTES=admission_number,programme,graduation_year,surname,school_name,national_id_number,department,othernames,matric_number,date_issued,date_expiry,bank_verification_number,school_nuc_number,jamb_number,date_of_birth

# OR use JSON format with predicates
# PROOF_ATTRIBUTES=[{"name":"admission_number"},{"name":"programme"},{"name":"graduation_year","predicate":">=","value":2020},{"name":"surname"},{"name":"school_name"},{"name":"national_id_number"},{"name":"department"},{"name":"othernames"},{"name":"matric_number"},{"name":"date_issued"},{"name":"date_expiry"},{"name":"bank_verification_number"},{"name":"school_nuc_number"},{"name":"jamb_number"},{"name":"date_of_birth"}]

PROOF_REQUEST_COMMENT=Please share your student credentials for NELFUND loan application verification
```

## How It Works Internally

The `buildProofAttributeRequests()` function in [src/lib/proof-config.ts](../src/lib/proof-config.ts) processes the configuration:

### Simple Format Processing

```typescript
// Input: "name,age,email"
// Output:
[
  { attributeName: "name", schemaId: "...", credDefId: "..." },
  { attributeName: "age", schemaId: "...", credDefId: "..." },
  { attributeName: "email", schemaId: "...", credDefId: "..." }
]
```

### JSON Format Processing

```typescript
// Input: [{"name":"age","predicate":">","value":18},{"name":"name"}]
// Output:
[
  {
    attributeName: "age",
    schemaId: "...",
    credDefId: "...",
    condition: ">",
    value: 18
  },
  {
    attributeName: "name",
    schemaId: "...",
    credDefId: "..."
  }
]
```

## API Request Format

The proof request sent to ConfirmD Platform:

```json
{
  "connectionId": "...",
  "comment": "Please share your student credentials...",
  "orgId": "...",
  "proofFormats": {
    "indy": {
      "attributes": [
        {
          "attributeName": "admission_number",
          "schemaId": "L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0",
          "credDefId": "L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance"
        },
        {
          "attributeName": "graduation_year",
          "schemaId": "L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0",
          "credDefId": "L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance",
          "condition": ">=",
          "value": 2020
        }
      ]
    }
  }
}
```

## Privacy Considerations

### Attributes WITHOUT Predicates
- **What the user shares**: The actual attribute value
- **What you learn**: The exact value (e.g., "2019" for graduation year)
- **Privacy**: Low - you see the exact data

### Attributes WITH Predicates
- **What the user shares**: A cryptographic proof that the condition is true
- **What you learn**: Only that the condition is satisfied (e.g., graduation_year >= 2020)
- **Privacy**: High - you never see the actual value

## Best Practices

1. **Use Predicates When Possible**: If you only need to verify a condition (e.g., age > 18), use a predicate instead of requesting the actual value.

2. **Minimize Data Collection**: Only request attributes you actually need for your application logic.

3. **Document Requirements**: Clearly explain to users why each attribute is being requested.

4. **Test Both Formats**: Make sure your configuration works by testing with actual credentials.

5. **JSON Escaping**: When using JSON format in .env files, ensure proper escaping if needed by your deployment environment.

## Switching Between Formats

You can switch between formats at any time:

```bash
# Currently using simple format
PROOF_ATTRIBUTES=name,age,email

# Switch to JSON format for predicates
PROOF_ATTRIBUTES=[{"name":"name"},{"name":"age","predicate":">","value":18},{"name":"email"}]
```

The system automatically detects the format by checking if the value starts with `[`.

## Troubleshooting

### Error: "Invalid PROOF_ATTRIBUTES JSON format"

**Cause**: Malformed JSON
**Solution**: Validate your JSON using a JSON validator

```bash
# Invalid
PROOF_ATTRIBUTES=[{name:"age"}]  # Missing quotes around "name"

# Valid
PROOF_ATTRIBUTES=[{"name":"age"}]
```

### Error: "PROOF_ATTRIBUTES is not configured"

**Cause**: Missing environment variable
**Solution**: Add `PROOF_ATTRIBUTES` to your .env file

### Predicates Not Working

**Cause**: Using simple format instead of JSON format
**Solution**: Switch to JSON format with predicate objects

```bash
# Won't work - simple format doesn't support predicates
PROOF_ATTRIBUTES=age>18,name

# Works - JSON format with predicate
PROOF_ATTRIBUTES=[{"name":"age","predicate":">","value":18},{"name":"name"}]
```

## Related Files

- [src/lib/proof-config.ts](../src/lib/proof-config.ts) - Configuration parsing logic
- [src/lib/api/types.ts](../src/lib/api/types.ts) - TypeScript type definitions
- [.env.example](../.env.example) - Example configuration
- [docs/PROOF_REQUEST_IMPLEMENTATION.md](./PROOF_REQUEST_IMPLEMENTATION.md) - Full proof request implementation guide
