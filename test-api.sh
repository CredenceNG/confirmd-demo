#!/bin/bash

echo "============================================================"
echo "CONFIRMD API TEST - Complete Flow"
echo "============================================================"
echo ""
echo "📡 Step 1: Fetching Access Token..."
echo "------------------------------------------------------------"

RESPONSE=$(curl -s -X POST 'https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials&client_id=eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95&client_secret=9tdL08bIpJv1OTUz5g3OYhj8edg9OtX4')

TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
EXPIRES_IN=$(echo "$RESPONSE" | grep -o '"expires_in":[0-9]*' | sed 's/"expires_in"://')

echo "✅ Access Token Retrieved Successfully!"
echo "Token (first 50 chars): ${TOKEN:0:50}..."
echo "Token Type: Bearer"
echo "Expires in: $EXPIRES_IN seconds"
echo ""
echo "🏢 Step 2: Fetching Organization Details..."
echo "------------------------------------------------------------"
echo "Organization ID: eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95"
echo "API Base: https://platform.confamd.com"
echo ""

ORG_RESPONSE=$(curl -s -X GET 'https://platform.confamd.com/orgs/eef3cc9f-0cb8-45a7-b7f9-0cfdfded4b95' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json')

echo "✅ Organization Response:"
echo "------------------------------------------------------------"
echo "$ORG_RESPONSE" | jq '.' 2>/dev/null || echo "$ORG_RESPONSE"
echo ""

# Extract and display connection invitation URL
echo "🔗 Step 3: Extracting Connection Invitation Details..."
echo "------------------------------------------------------------"
INVITATION_URL=$(echo "$ORG_RESPONSE" | jq -r '.data.org_agents[0].agent_invitations[0].connectionInvitation' 2>/dev/null)
MULTI_USE=$(echo "$ORG_RESPONSE" | jq -r '.data.org_agents[0].agent_invitations[0].multiUse' 2>/dev/null)
INVITATION_ID=$(echo "$ORG_RESPONSE" | jq -r '.data.org_agents[0].agent_invitations[0].id' 2>/dev/null)
AGENT_DID=$(echo "$ORG_RESPONSE" | jq -r '.data.org_agents[0].orgDid' 2>/dev/null)
WALLET_NAME=$(echo "$ORG_RESPONSE" | jq -r '.data.org_agents[0].walletName' 2>/dev/null)

echo "Agent Details:"
echo "  • Wallet Name: $WALLET_NAME"
echo "  • Organization DID: $AGENT_DID"
echo ""
echo "Connection Invitation:"
echo "  • Invitation ID: $INVITATION_ID"
echo "  • Multi-Use: $MULTI_USE"
echo "  • Invitation URL: $INVITATION_URL"
echo ""

# Optionally fetch the invitation content
if [ "$INVITATION_URL" != "null" ] && [ -n "$INVITATION_URL" ]; then
  echo "📥 Fetching Invitation Content..."
  echo "------------------------------------------------------------"
  INVITATION_CONTENT=$(curl -s "$INVITATION_URL")
  echo "$INVITATION_CONTENT" | jq '.' 2>/dev/null || echo "$INVITATION_CONTENT"
  echo ""
fi

echo "============================================================"
echo "TEST COMPLETE"
echo "============================================================"
