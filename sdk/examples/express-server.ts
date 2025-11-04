/**
 * Express.js Integration Example
 *
 * This example shows how to build a RESTful API with webhook handling
 * for credential verification in an Express.js application.
 */

import express from 'express';
import { ConfirmDClient, WebhookPayload } from '../src';

const app = express();
app.use(express.json());

// Initialize SDK
const client = new ConfirmDClient({
  organizationId: process.env.CONFIRMD_ORG_ID!,
  auth: {
    tokenUrl: process.env.CONFIRMD_TOKEN_URL!,
    clientId: process.env.CONFIRMD_CLIENT_ID!,
    clientSecret: process.env.CONFIRMD_CLIENT_SECRET!,
  },
});

// In-memory storage (use a real database in production)
interface Session {
  sessionId: string;
  userId: string;
  connectionId?: string;
  proofId?: string;
  status: string;
  attributes?: Record<string, string>;
}

const sessions = new Map<string, Session>();

/**
 * POST /api/auth/initiate
 * Initiate credential verification flow
 */
app.post('/api/auth/initiate', async (req, res) => {
  try {
    const { userId } = req.body;

    // Create connection invitation
    const invitation = await client.connections.createInvitation();

    // Store session
    const sessionId = invitation.invitationId;
    sessions.set(sessionId, {
      sessionId,
      userId,
      status: 'invitation-created',
    });

    res.json({
      success: true,
      sessionId,
      invitationUrl: invitation.invitationUrl,
      expiresAt: invitation.expiresAt,
    });
  } catch (error: any) {
    console.error('Error initiating auth:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/status/:sessionId
 * Check verification status
 */
app.get('/api/auth/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      status: session.status,
      attributes: session.attributes,
    });
  } catch (error: any) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /webhooks/confirmd
 * Webhook handler for ConfirmD Platform events
 */
app.post('/webhooks/confirmd', async (req, res) => {
  try {
    const webhook: WebhookPayload = req.body;

    console.log('Received webhook:', webhook.type, webhook.state);

    // Handle connection events
    if (webhook.type === 'Connection') {
      await handleConnectionWebhook(webhook);
    }

    // Handle proof events
    if (webhook.type === 'Proof') {
      await handleProofWebhook(webhook);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Handle connection webhooks
 */
async function handleConnectionWebhook(webhook: WebhookPayload) {
  const { connectionId, state } = webhook;

  if (state === 'completed' || state === 'active') {
    // Find session by checking recent invitations
    // In production, match by invitation ID stored in your database
    for (const [sessionId, session] of sessions.entries()) {
      if (!session.connectionId) {
        session.connectionId = connectionId!;
        session.status = 'connected';

        console.log('Connection established for session:', sessionId);

        // Automatically request proof
        await requestProof(session);
        break;
      }
    }
  }
}

/**
 * Handle proof webhooks
 */
async function handleProofWebhook(webhook: WebhookPayload) {
  const { proofId, state } = webhook;

  if (state === 'presentation-received') {
    // Find session by proof ID
    for (const [sessionId, session] of sessions.entries()) {
      if (session.proofId === proofId) {
        console.log('Proof received for session:', sessionId);

        // Verify the proof
        const verified = await client.proofs.verifyProof(proofId!);

        if (verified.verified) {
          session.status = 'verified';
          session.attributes = verified.attributes;

          console.log('Verification successful for user:', session.userId);
          console.log('Attributes:', verified.attributes);

          // In a real application, you would:
          // 1. Create a session/JWT token
          // 2. Update user record with verified attributes
          // 3. Send notification to frontend via WebSocket
        } else {
          session.status = 'verification-failed';
          console.error('Verification failed for session:', sessionId);
        }
        break;
      }
    }
  }
}

/**
 * Request proof from connected holder
 */
async function requestProof(session: Session) {
  if (!session.connectionId) {
    throw new Error('No connection established');
  }

  const proof = await client.proofs.requestProof({
    connectionId: session.connectionId,
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
      {
        attributeName: 'programme',
        schemaId: 'L6U1iAVkCBNnqemWJAQZ93:2:Student Clearance:2.0',
        credDefId: 'L6U1iAVkCBNnqemWJAQZ93:3:CL:2955060:UNILAG Student Clearance',
      },
    ],
  });

  session.proofId = proof.proofId;
  session.status = 'proof-requested';

  console.log('Proof requested for session:', session.sessionId);
}

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', error);
  res.status(500).json({ error: error.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhooks/confirmd`);
  console.log('\nRegister this webhook URL in your ConfirmD Platform settings');
});

export default app;
