/**
 * Test script to verify Confirmd API integration
 * This tests:
 * 1. Getting an access token
 * 2. Fetching organization details
 */

import { getAccessToken, getTokenInfo } from "./src/lib/api/confirmd-auth";
import { confirmdClient } from "./src/lib/api/confirmd-client";

async function testConfirmdAPI() {
  console.log("=".repeat(60));
  console.log("CONFIRMD API TEST");
  console.log("=".repeat(60));
  console.log("");

  try {
    // Step 1: Get Access Token
    console.log("📡 Step 1: Fetching Access Token...");
    console.log("-".repeat(60));

    const token = await getAccessToken();

    console.log("✅ Access Token Retrieved Successfully!");
    console.log(`Token (first 20 chars): ${token.substring(0, 20)}...`);
    console.log(`Token length: ${token.length} characters`);

    // Get token info
    const tokenInfo = getTokenInfo();
    if (tokenInfo) {
      const expiresIn = Math.round((tokenInfo.expires_at - Date.now()) / 1000);
      console.log(`Token Type: ${tokenInfo.token_type}`);
      console.log(`Expires in: ${expiresIn} seconds`);
      console.log(`Expires at: ${new Date(tokenInfo.expires_at).toISOString()}`);
    }

    console.log("");

    // Step 2: Get Organization Details
    console.log("🏢 Step 2: Fetching Organization Details...");
    console.log("-".repeat(60));

    const orgId = process.env.ORGANIZATION_ID;
    console.log(`Organization ID: ${orgId}`);
    console.log("");

    const result = await confirmdClient.getCurrentOrganization();

    if (result.success && result.data) {
      console.log("✅ Organization Details Retrieved Successfully!");
      console.log("");
      console.log("Organization Data:");
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.log("❌ Failed to fetch organization details");
      console.log("Error:", result.error);
    }

  } catch (error: any) {
    console.log("");
    console.log("❌ TEST FAILED");
    console.log("-".repeat(60));
    console.log("Error:", error.message || error);

    if (error.error) {
      console.log("Error Code:", error.error);
      console.log("Description:", error.error_description);
      console.log("Status:", error.status);
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("TEST COMPLETE");
  console.log("=".repeat(60));
}

// Run the test
testConfirmdAPI();
