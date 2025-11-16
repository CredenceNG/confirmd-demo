#!/usr/bin/env node
/**
 * Diagnostic Tool: Proof Request Analyzer
 *
 * This script helps diagnose proof request issues by:
 * 1. Showing the exact payload being sent to ConfirmD Platform
 * 2. Comparing it with credential issuance configuration
 * 3. Checking for any mismatches or formatting issues
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log("═".repeat(80));
console.log(" PROOF REQUEST DIAGNOSTIC TOOL");
console.log("═".repeat(80));

// Step 1: Get credential mappings
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
    "NYSC Green Card": {
      schemaId: process.env.NYSC_GREEN_CARD_SCHEMA_ID || "",
      credDefId: process.env.NYSC_GREEN_CARD_CRED_DEF_ID,
    },
    "NYSC Certificate": {
      schemaId: process.env.NYSC_CERTIFICATE_SCHEMA_ID || "",
      credDefId: process.env.NYSC_CERTIFICATE_CRED_DEF_ID,
    },
  };
}

// Step 2: Build proof request attributes
function buildProofAttributeRequests(configFileName = "course-registration-proof-attributes.json") {
  const credentialMappings = getCredentialMappings();
  const configPath = path.join(__dirname, "config", configFileName);

  if (!fs.existsSync(configPath)) {
    console.error(`\n❌ Config file not found: ${configPath}`);
    return [];
  }

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

// Step 3: Simulate the actual API payload sent to ConfirmD Platform
function simulateProofRequestPayload(configFileName, requestType) {
  const attributes = buildProofAttributeRequests(configFileName);
  const orgId = process.env.CONFIRMD_ORG_ID;

  return {
    connectionId: "<connection-id-from-wallet>",
    comment: `${requestType} - Student Verification`,
    orgId: orgId,
    proofFormats: {
      indy: {
        attributes: attributes,
      },
    },
  };
}

// Main diagnostic output
console.log("\n1️⃣  ENVIRONMENT CHECK");
console.log("─".repeat(80));
console.log("Organization ID:", process.env.CONFIRMD_ORG_ID || "❌ NOT SET");
console.log("Student Card Schema ID:", process.env.STUDENT_CARD_SCHEMA_ID || "❌ NOT SET");
console.log("Student Card Cred Def ID:", process.env.STUDENT_CARD_CRED_DEF_ID || "❌ NOT SET");
console.log("Issue Cred Def ID:", process.env.ISSUE_CRED_DEF_ID || "❌ NOT SET");

console.log("\n2️⃣  COURSE REGISTRATION DEMO");
console.log("─".repeat(80));
try {
  const courseRegPayload = simulateProofRequestPayload("course-registration-proof-attributes.json", "Course Registration");
  console.log("✅ Proof Request Payload:");
  console.log(JSON.stringify(courseRegPayload, null, 2));

  console.log("\n📋 Attributes Summary:");
  courseRegPayload.proofFormats.indy.attributes.forEach((attr, i) => {
    console.log(`   ${i + 1}. ${attr.attributeName}`);
    console.log(`      Schema ID: ${attr.schemaId}`);
    console.log(`      Cred Def ID: ${attr.credDefId}`);
  });
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\n3️⃣  NYSC REGISTRATION DEMO");
console.log("─".repeat(80));
try {
  const nyscPayload = simulateProofRequestPayload("nysc-proof-attributes.json", "NYSC Registration");
  console.log("✅ Proof Request Payload (first 3 attributes):");
  const nyscPreview = { ...nyscPayload };
  nyscPreview.proofFormats.indy.attributes = nyscPayload.proofFormats.indy.attributes.slice(0, 3);
  console.log(JSON.stringify(nyscPreview, null, 2));

  console.log("\n📋 Total attributes:", nyscPayload.proofFormats.indy.attributes.length);
  console.log("📋 Credentials used:");
  const credentialTypes = [...new Set(
    JSON.parse(fs.readFileSync(path.join(__dirname, "config", "nysc-proof-attributes.json"), "utf-8"))
      .map(attr => attr.credential)
  )];
  credentialTypes.forEach(cred => console.log(`   - ${cred}`));
} catch (error) {
  console.error("❌ Error:", error.message);
}

console.log("\n4️⃣  CREDENTIAL ISSUANCE CHECK");
console.log("─".repeat(80));
const issueCredDefId = process.env.ISSUE_CRED_DEF_ID || process.env.STUDENT_CARD_CRED_DEF_ID;
const proofCredDefId = process.env.STUDENT_CARD_CRED_DEF_ID;

console.log("Issuance Cred Def ID:", issueCredDefId);
console.log("Proof Request Cred Def ID:", proofCredDefId);

if (issueCredDefId === proofCredDefId) {
  console.log("✅ MATCH - Credential issuance and proof request use the SAME Cred Def ID");
} else {
  console.log("❌ MISMATCH - Credential issuance and proof request use DIFFERENT Cred Def IDs");
  console.log("\n🔧 RECOMMENDED FIX:");
  console.log("   Set ISSUE_CRED_DEF_ID to match STUDENT_CARD_CRED_DEF_ID in .env file");
}

console.log("\n5️⃣  DIAGNOSTIC SUMMARY");
console.log("─".repeat(80));

// Check for common issues
const issues = [];
const warnings = [];

if (!process.env.CONFIRMD_ORG_ID) {
  issues.push("CONFIRMD_ORG_ID is not set");
}

if (!process.env.STUDENT_CARD_SCHEMA_ID) {
  issues.push("STUDENT_CARD_SCHEMA_ID is not set");
}

if (!process.env.STUDENT_CARD_CRED_DEF_ID) {
  issues.push("STUDENT_CARD_CRED_DEF_ID is not set");
}

if (issueCredDefId !== proofCredDefId) {
  warnings.push("Issuance and proof request use different Cred Def IDs");
}

if (issues.length === 0 && warnings.length === 0) {
  console.log("✅ Configuration appears correct");
  console.log("\n💡 TROUBLESHOOTING NEXT STEPS:");
  console.log("   1. Verify the credential in your wallet was issued with the same Cred Def ID");
  console.log("   2. Check if the wallet app has been updated recently");
  console.log("   3. Try deleting and re-issuing the credential");
  console.log("   4. Check ConfirmD Platform logs for any errors");
  console.log("   5. Contact ConfirmD Platform support if issue persists");
} else {
  if (issues.length > 0) {
    console.log("❌ CRITICAL ISSUES FOUND:");
    issues.forEach(issue => console.log(`   - ${issue}`));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  WARNINGS:");
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
}

console.log("\n" + "═".repeat(80));
console.log(" END OF DIAGNOSTIC");
console.log("═".repeat(80));
