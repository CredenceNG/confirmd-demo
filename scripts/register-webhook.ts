/**
 * Script to register webhook with Confirmd Platform
 *
 * This script creates a webhook subscription for connection events
 */

import { confirmdClient } from '../src/lib/api/confirmd-client';

const NGROK_URL = 'https://28c5ff3d9edf.ngrok-free.app';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secure-webhook-secret-change-this-in-production';

async function registerWebhook() {
  console.log('🔗 Registering webhook with Confirmd Platform...\n');

  try {
    // The webhook URL where Confirmd Platform will send notifications
    const webhookUrl = `${NGROK_URL}/api/webhooks/confirmd`;

    console.log('Webhook Configuration:');
    console.log('  URL:', webhookUrl);
    console.log('  Secret:', WEBHOOK_SECRET);
    console.log('  Topics: connections.*\n');

    // Create webhook subscription via Confirmd Platform API
    // Note: The actual API endpoint may vary based on Confirmd Platform documentation
    const result = await confirmdClient.createWebhook({
      url: webhookUrl,
      secret: WEBHOOK_SECRET,
      topics: [
        'connections.invitation',
        'connections.request',
        'connections.response',
        'connections.active',
        'connections.completed',
      ],
      enabled: true,
    });

    if (result.success) {
      console.log('✅ Webhook registered successfully!');
      console.log('\nWebhook Details:');
      console.log(JSON.stringify(result.data, null, 2));
      console.log('\n✨ You can now scan QR codes and receive real-time updates!');
    } else {
      console.error('❌ Failed to register webhook');
      console.error('Error:', result.error);
    }
  } catch (error: any) {
    console.error('❌ Error registering webhook:', error.message);
    console.error('\nPlease ensure:');
    console.error('  1. Your ngrok tunnel is running');
    console.error('  2. CONFIRMD_CLIENT_ID and CONFIRMD_CLIENT_SECRET are set in .env');
    console.error('  3. The Confirmd Platform API is accessible');
  }
}

// Run the registration
registerWebhook();
