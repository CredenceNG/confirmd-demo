/**
 * Diagnostic Script for NYSC ID Card Issuance Issue
 *
 * This script helps diagnose why "Unable to create offer" error occurs
 * when issuing NYSC ID Card credentials.
 */

require('dotenv').config();

console.log('\n=== NYSC ID CARD ISSUANCE DIAGNOSTIC ===\n');

// 1. Check environment variables
console.log('1. Checking Environment Variables:');
console.log('   NYSC_ORG_ID:', process.env.NYSC_ORG_ID ? '✓ Set' : '✗ NOT SET');
console.log('   NYSC_ID_CARD_CRED_DEF_ID:', process.env.NYSC_ID_CARD_CRED_DEF_ID || 'NOT SET');
console.log('   NYSC_ID_CARD_SCHEMA_ID:', process.env.NYSC_ID_CARD_SCHEMA_ID || 'NOT SET');
console.log('   CONFIRMD_BASE_URL:', process.env.CONFIRMD_BASE_URL || 'NOT SET');
console.log('');

// 2. Validate credential definition ID format
const credDefId = process.env.NYSC_ID_CARD_CRED_DEF_ID;
if (credDefId) {
  console.log('2. Validating Credential Definition ID Format:');
  const credDefRegex = /^[A-Za-z0-9]+:3:CL:\d+:.+$/;
  const isValid = credDefRegex.test(credDefId);
  console.log('   Format:', isValid ? '✓ Valid' : '✗ INVALID');
  console.log('   Pattern: DID:3:CL:SeqNo:Tag');

  // Extract components
  const parts = credDefId.split(':');
  if (parts.length >= 5) {
    console.log('   Components:');
    console.log('     - DID:', parts[0]);
    console.log('     - Type: CL (should be "CL")');
    console.log('     - Schema Seq No:', parts[3]);
    console.log('     - Tag:', parts.slice(4).join(':'));
  }
  console.log('');
}

// 3. Check schema ID format
const schemaId = process.env.NYSC_ID_CARD_SCHEMA_ID;
if (schemaId) {
  console.log('3. Validating Schema ID Format:');
  const schemaRegex = /^[A-Za-z0-9]+:2:.+:\d+\.\d+$/;
  const isValid = schemaRegex.test(schemaId);
  console.log('   Format:', isValid ? '✓ Valid' : '✗ INVALID');
  console.log('   Pattern: DID:2:SchemaName:Version');

  // Extract components
  const parts = schemaId.split(':');
  if (parts.length >= 4) {
    console.log('   Components:');
    console.log('     - DID:', parts[0]);
    console.log('     - Schema Name:', parts[2]);
    console.log('     - Version:', parts[3]);
  }
  console.log('');
}

// 4. Expected attributes for NYSC ID Card
console.log('4. Expected NYSC ID Card Attributes (based on CREDENTIAL_ATTRIBUTES.md):');
const expectedAttributes = [
  'surname',
  'othernames',
  'id_number',
  'service_state',
  'service_start_date', // Note: lowercase 's'
  'service_end_date',
  'issued_date',
  'expiry_date'
];

expectedAttributes.forEach((attr, index) => {
  console.log(`   ${index + 1}. ${attr}`);
});
console.log('');

// 5. Sample payload structure
console.log('5. Sample Payload Structure for NYSC ID Card:');
const samplePayload = {
  credentialData: [
    {
      connectionId: '<connection-id>',
      attributes: expectedAttributes.map(name => ({
        name,
        value: name === 'id_number' ? 'NYSC-1234567890' :
               name.includes('date') ? '2024-03-01' :
               name === 'service_state' ? 'Lagos' :
               'Sample Value'
      }))
    }
  ],
  credentialDefinitionId: credDefId,
  orgId: process.env.NYSC_ORG_ID
};

console.log(JSON.stringify(samplePayload, null, 2));
console.log('');

// 6. Common issues and resolutions
console.log('6. Common Issues and Resolutions:');
console.log('   Issue: "Unable to create offer"');
console.log('   Possible Causes:');
console.log('   a) Credential Definition ID belongs to different organization');
console.log('      → Verify NYSC_ID_CARD_CRED_DEF_ID was created by NYSC_ORG_ID');
console.log('');
console.log('   b) Attribute names don\'t match schema definition');
console.log('      → Verify schema attributes using ConfirmD Platform UI');
console.log('      → Check for typos and case sensitivity (e.g., "Service_start_date" vs "service_start_date")');
console.log('');
console.log('   c) Connection is not in "active" state');
console.log('      → Verify connectionId is valid and active');
console.log('');
console.log('   d) Missing required attributes');
console.log('      → Ensure all 8 required attributes are present');
console.log('');

// 7. Action items
console.log('7. Recommended Actions:');
console.log('   □ Log in to ConfirmD Platform');
console.log('   □ Navigate to Schemas section');
console.log('   □ Find "NYSC ID CARD" schema');
console.log('   □ Verify actual attribute names (check for case sensitivity)');
console.log('   □ Compare with attributes being sent in payload');
console.log('   □ Check if credential definition belongs to correct organization');
console.log('');

console.log('=== END OF DIAGNOSTIC ===\n');
