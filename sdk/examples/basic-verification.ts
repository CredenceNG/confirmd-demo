/**
 * Basic Verification Example
 *
 * This example demonstrates the simplest credential verification flow:
 * 1. Create a connection invitation
 * 2. Wait for holder to connect
 * 3. Request proof of credentials
 * 4. Verify and extract attributes
 */

import { ConfirmDClient } from '../src';

async function basicVerification() {
  // Initialize the SDK client
  const client = new ConfirmDClient({
    organizationId: process.env.CONFIRMD_ORG_ID!,
    auth: {
      tokenUrl: process.env.CONFIRMD_TOKEN_URL!,
      clientId: process.env.CONFIRMD_CLIENT_ID!,
      clientSecret: process.env.CONFIRMD_CLIENT_SECRET!,
    },
  });

  console.log('=== Step 1: Create Connection Invitation ===');

  // Create a connection invitation
  const invitation = await client.connections.createInvitation();

  console.log('Invitation created!');
  console.log('QR Code URL:', invitation.invitationUrl);
  console.log('Expires at:', invitation.expiresAt);
  console.log('\nPlease scan the QR code with your ConfirmD wallet app');

  // In a real application, you would:
  // 1. Display this as a QR code on your website
  // 2. Use webhooks to detect when the connection is established
  // 3. Store the connection ID in your database

  // For this example, we'll wait manually
  console.log('\nWaiting for connection to be established...');

  // Poll for connection status (in production, use webhooks instead)
  let connectionId: string | null = null;
  for (let i = 0; i < 60; i++) {
    await sleep(2000); // Wait 2 seconds

    try {
      // Check if connection is active
      // In a real app, you'd get this from your database via webhook
      const connections = await client.connections.listConnections('active');

      if (connections.length > 0) {
        connectionId = connections[0].connectionId;
        console.log('Connection established!');
        console.log('Connection ID:', connectionId);
        console.log('Holder label:', connections[0].theirLabel);
        break;
      }
    } catch (error) {
      // Continue waiting
    }
  }

  if (!connectionId) {
    throw new Error('Connection timeout. Please try again.');
  }

  console.log('\n=== Step 2: Request Proof ===');

  // Request proof of student credentials
  const proof = await client.proofs.requestProof({
    connectionId,
    comment: 'Please share your student credentials for verification',
    attributes: [
      {
        attributeName: 'surname',
        schemaId: 'L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0',
        credDefId: 'L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance',
      },
      {
        attributeName: 'othernames',
        schemaId: 'L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0',
        credDefId: 'L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance',
      },
      {
        attributeName: 'matric_number',
        schemaId: 'L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0',
        credDefId: 'L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance',
      },
      {
        attributeName: 'school_name',
        schemaId: 'L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0',
        credDefId: 'L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance',
      },
    ],
  });

  console.log('Proof request sent!');
  console.log('Proof ID:', proof.proofId);
  console.log('\nWaiting for holder to respond...');

  // Wait for holder to respond (in production, use webhooks)
  for (let i = 0; i < 60; i++) {
    await sleep(2000);

    try {
      const proofStatus = await client.proofs.getProof(proof.proofId);

      if (proofStatus.state === 'presentation-received' || proofStatus.state === 'done') {
        console.log('Proof presentation received!');
        break;
      }
    } catch (error) {
      // Continue waiting
    }
  }

  console.log('\n=== Step 3: Verify Proof ===');

  // Verify the proof and extract attributes
  const verified = await client.proofs.verifyProof(proof.proofId);

  console.log('Verification complete!');
  console.log('Verified:', verified.verified);
  console.log('Verified at:', verified.verifiedAt);

  if (verified.verified) {
    console.log('\n=== Extracted Attributes ===');
    console.log('Full Name:', `${verified.attributes.surname} ${verified.attributes.othernames}`);
    console.log('Matriculation Number:', verified.attributes.matric_number);
    console.log('School:', verified.attributes.school_name);

    console.log('\n=== All Attributes ===');
    console.log(JSON.stringify(verified.attributes, null, 2));

    console.log('\n=== Metadata ===');
    console.log('Schema ID:', verified.metadata[0].schemaId);
    console.log('Credential Definition ID:', verified.metadata[0].credDefId);

    return verified.attributes;
  } else {
    throw new Error('Proof verification failed');
  }
}

// Helper function
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the example
if (require.main === module) {
  basicVerification()
    .then((attributes) => {
      console.log('\n✅ Verification successful!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

export { basicVerification };
