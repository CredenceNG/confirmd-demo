/**
 * Test script to fetch organization data and show raw response
 */
require('dotenv').config();
const axios = require('axios');

async function getAccessToken() {
  const tokenUrl = process.env.CONFIRMD_AUTH_URL;
  const clientId = process.env.CONFIRMD_CLIENT_ID;
  const clientSecret = process.env.CONFIRMD_CLIENT_SECRET;

  console.log('Fetching access token...');
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  const response = await axios.post(tokenUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  console.log('Token fetched successfully\n');
  return response.data.access_token;
}

async function fetchOrganization() {
  try {
    const token = await getAccessToken();
    const orgId = process.env.CONFIRMD_ORG_ID;
    const baseUrl = process.env.CONFIRMD_BASE_URL;

    console.log('='.repeat(80));
    console.log('FETCHING ORGANIZATION DATA');
    console.log('='.repeat(80));
    console.log('Organization ID:', orgId);
    console.log('Base URL:', baseUrl);
    console.log('Endpoint:', `/orgs/${orgId}`);
    console.log('='.repeat(80));
    console.log();

    const response = await axios.get(`${baseUrl}/orgs/${orgId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('='.repeat(80));
    console.log('RAW ORGANIZATION API RESPONSE');
    console.log('='.repeat(80));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('='.repeat(80));
    console.log();

    // Check for agents
    const org = response.data.data;
    console.log('Organization Info:');
    console.log('  - ID:', org.id);
    console.log('  - Name:', org.name);
    console.log('  - Has org_agents?', !!org.org_agents);
    console.log('  - org_agents type:', typeof org.org_agents);
    console.log('  - org_agents length:', org.org_agents?.length);
    console.log();

    if (org.org_agents && org.org_agents.length > 0) {
      console.log('First Agent:');
      const agent = org.org_agents[0];
      console.log('  - ID:', agent.id);
      console.log('  - Has agent_invitations?', !!agent.agent_invitations);
      console.log('  - agent_invitations length:', agent.agent_invitations?.length);
      console.log();

      if (agent.agent_invitations && agent.agent_invitations.length > 0) {
        console.log('First Invitation:');
        const invitation = agent.agent_invitations[0];
        console.log('  - ID:', invitation.id);
        console.log('  - multiUse:', invitation.multiUse);
        console.log('  - connectionInvitation:', invitation.connectionInvitation);
      } else {
        console.log('NO INVITATIONS FOUND IN AGENT');
      }
    } else {
      console.log('NO AGENTS FOUND IN ORGANIZATION');
    }

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

fetchOrganization();
