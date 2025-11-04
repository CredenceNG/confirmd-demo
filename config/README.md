# Proof Request Configuration

This directory contains configuration files for proof requests.

## proof-attributes.json

Defines the attributes to request in credential presentations.

### Structure

```json
[
  {
    "name": "attribute_name",
    "description": "Human-readable description",
    "predicate": ">=",
    "value": 18,
    "comment": "Optional comment about why this predicate is used"
  }
]
```

### Fields

- **name** (required): The attribute name as defined in the credential schema
- **description** (optional): Human-readable description for documentation
- **predicate** (optional): Comparison operator: `>`, `<`, `>=`, `<=`
- **value** (optional): Value to compare against (required if predicate is set)
- **comment** (optional): Explanation of the predicate's purpose

### Examples

#### Simple Attribute Request (reveals value)

```json
{
  "name": "full_name",
  "description": "Student's full name"
}
```

This requests the actual value of the `full_name` attribute. The user's wallet will reveal the value.

#### Predicate Request (proves condition without revealing value)

```json
{
  "name": "age",
  "description": "Student's age",
  "predicate": ">",
  "value": 18,
  "comment": "Verify student is over 18 without knowing exact age"
}
```

This verifies that `age > 18` using zero-knowledge proof. The verifier only learns that the condition is true, not the actual age.

### Complete Example

```json
[
  {
    "name": "student_id",
    "description": "Unique student identifier"
  },
  {
    "name": "graduation_year",
    "description": "Year of graduation",
    "predicate": ">=",
    "value": 2020,
    "comment": "Verify graduated in 2020 or later"
  },
  {
    "name": "gpa",
    "description": "Grade Point Average",
    "predicate": ">=",
    "value": 2.5,
    "comment": "Verify minimum GPA requirement"
  },
  {
    "name": "full_name",
    "description": "Student's full name"
  }
]
```

## Configuration Priority

The system loads attributes in this order:

1. **Config file** (`config/proof-attributes.json`) - Primary source
2. **Environment variable** (`PROOF_ATTRIBUTES`) - Fallback
3. **Error** if neither is configured

## Environment Variable Fallback

If you prefer not to use the config file, you can set the `PROOF_ATTRIBUTES` environment variable:

### Simple format (no predicates)

```bash
PROOF_ATTRIBUTES=student_id,full_name,graduation_year
```

### JSON format (with predicates)

```bash
PROOF_ATTRIBUTES=[{"name":"student_id"},{"name":"age","predicate":">","value":18}]
```

## Editing the Configuration

1. Open `config/proof-attributes.json`
2. Add, remove, or modify attribute objects
3. Restart the development server to apply changes

The server will automatically reload the configuration when it restarts.

## Privacy Best Practices

1. **Use predicates when possible**: If you only need to verify a condition (e.g., age > 18), use a predicate instead of requesting the actual value.

2. **Minimize data collection**: Only request attributes you actually need for your application logic.

3. **Document your requests**: Use the `description` field to explain why each attribute is needed.

4. **Test predicates**: Ensure predicates work correctly by testing with real credentials.

## Schema and Credential Definition

The schema ID and credential definition ID are configured in environment variables:

```bash
PROOF_SCHEMA_ID=L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0
PROOF_CRED_DEF_ID=L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance
```

These must match the schema used to issue the credentials you're requesting.

## Related Documentation

- [PROOF_ATTRIBUTES_CONFIGURATION.md](../docs/PROOF_ATTRIBUTES_CONFIGURATION.md) - Detailed configuration guide
- [PROOF_REQUEST_IMPLEMENTATION.md](../docs/PROOF_REQUEST_IMPLEMENTATION.md) - Implementation guide
