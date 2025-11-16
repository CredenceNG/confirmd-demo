// Test script to verify proof configuration
// Run with: node test-proof-config.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Simulate the proof-config.ts logic
function getCredentialMappings() {
  return {
    "Student Card": {
      schemaId: process.env.STUDENT_CARD_SCHEMA_ID || process.env.PROOF_SCHEMA_ID || "",
      credDefId: process.env.STUDENT_CARD_CRED_DEF_ID,
    },
    "Statement of Results": {
      schemaId: process.env.STATEMENT_OF_RESULT_SCHEMA_ID || "",
      credDefId: process.env.STATEMENT_OF_RESULT_CRED_DEF_ID,
    },
    "Medical Fitness Certificate": {
      schemaId: process.env.MEDICAL_FITNESS_SCHEMA_ID || "",
      credDefId: process.env.MEDICAL_FITNESS_CRED_DEF_ID,
    },
  };
}

function buildProofAttributeRequests(configFileName = "course-registration-proof-attributes.json") {
  const credentialMappings = getCredentialMappings();

  // Load config file
  const configPath = path.join(__dirname, "config", configFileName);
  const fileContent = fs.readFileSync(configPath, "utf-8");
  const attributes = JSON.parse(fileContent);

  return attributes.map((attr) => {
    const request = {
      attributeName: attr.name,
    };

    if (attr.credential) {
      const mapping = credentialMappings[attr.credential];
      if (!mapping) {
        throw new Error(`Unknown credential type: "${attr.credential}"`);
      }
      if (mapping.schemaId) {
        request.schemaId = mapping.schemaId;
      }
      if (mapping.credDefId) {
        request.credDefId = mapping.credDefId;
      }
    }

    return request;
  });
}

console.log("=".repeat(80));
console.log("PROOF CONFIGURATION TEST");
console.log("=".repeat(80));

console.log("\n1. Environment Variables:");
console.log("   STUDENT_CARD_SCHEMA_ID:", process.env.STUDENT_CARD_SCHEMA_ID);
console.log("   STUDENT_CARD_CRED_DEF_ID:", process.env.STUDENT_CARD_CRED_DEF_ID);

console.log("\n2. Credential Mappings:");
console.log(JSON.stringify(getCredentialMappings(), null, 2));

console.log("\n3. Course Registration Proof Attributes:");
const courseRegAttributes = buildProofAttributeRequests("course-registration-proof-attributes.json");
console.log(JSON.stringify(courseRegAttributes, null, 2));

console.log("\n4. NYSC Proof Attributes (for comparison):");
try {
  const nyscAttributes = buildProofAttributeRequests("nysc-proof-attributes.json");
  console.log("   Total attributes:", nyscAttributes.length);
  console.log("   First 3 attributes:");
  console.log(JSON.stringify(nyscAttributes.slice(0, 3), null, 2));
} catch (e) {
  console.log("   Error:", e.message);
}

console.log("\n" + "=".repeat(80));
