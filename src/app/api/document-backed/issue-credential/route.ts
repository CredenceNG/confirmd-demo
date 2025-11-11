/**
 * Document-Backed Credentials - Issue Credential API
 *
 * Issues a driver's license verifiable credential after document verification
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import { getConnectionSession } from "@/lib/api/connection-service";
import axios from "axios";

/**
 * POST /api/document-backed/issue-credential
 * Issue driver's license credential
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, connectionId, licenseData } = body;

    if (!sessionId || !connectionId || !licenseData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "sessionId, connectionId, and licenseData are required",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Document-Backed: Issuing driver's license credential", {
      sessionId,
      connectionId,
    });

    // Get access token
    const token = await getAccessToken();
    const orgId = process.env.CONFIRMD_ORG_ID;

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: "CONFIRMD_ORG_ID not configured",
          },
        },
        { status: 500 }
      );
    }

    // Get driver's license credential definition ID
    // TODO: Create a specific credential definition for driver's license
    const credentialDefinitionId =
      process.env.DRIVERS_LICENSE_CRED_DEF_ID ||
      process.env.ISSUE_CRED_DEF_ID; // Fallback for demo

    if (!credentialDefinitionId || credentialDefinitionId.includes("PLACEHOLDER")) {
      logger.warn("DRIVERS_LICENSE_CRED_DEF_ID not configured, using fallback");
    }

    // Helper function to ensure no null/undefined values
    const ensureValue = (value: any, defaultValue: string = "N/A"): string => {
      if (value === undefined || value === null || value === "undefined" || value === "null" || value === "") {
        return defaultValue;
      }
      return String(value);
    };

    // Prepare driver's license credential attributes
    const payload = {
      credentialData: [
        {
          connectionId,
          attributes: [
            {
              name: "license_number",
              value: ensureValue(licenseData.licenseNumber, `LIC-${Date.now()}`),
            },
            {
              name: "full_name",
              value: ensureValue(licenseData.fullName, "John Doe"),
            },
            {
              name: "date_of_birth",
              value: ensureValue(licenseData.dateOfBirth, "1990-01-01"),
            },
            {
              name: "address",
              value: ensureValue(licenseData.address, "123 Main Street"),
            },
            {
              name: "issue_date",
              value: ensureValue(licenseData.issueDate, new Date().toISOString().slice(0, 10)),
            },
            {
              name: "expiry_date",
              value: ensureValue(licenseData.expiryDate, new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)),
            },
            {
              name: "license_class",
              value: ensureValue(licenseData.licenseClass, "C"),
            },
            {
              name: "state",
              value: ensureValue(licenseData.state, "Lagos"),
            },
          ],
        },
      ],
      credentialDefinitionId,
      orgId,
    };

    // Make API call to issue driver's license credential
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/offer?credentialType=indy`;

    logger.info("Document-Backed: Issuing driver's license credential", {
      connectionId,
      apiUrl,
    });

    console.log("[Driver's License API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("Document-Backed: Driver's license issued successfully", {
      responseData: response.data,
    });

    return NextResponse.json({
      success: true,
      data: {
        credentialIssued: true,
        credentialData: response.data,
        message: "Driver's License credential issued successfully",
      },
    });
  } catch (error: any) {
    logger.error("Document-Backed: Error issuing driver's license", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("Document-Backed: API Response Error", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            error: "api_error",
            error_description: error.response?.data?.message || "Failed to issue driver's license credential",
            details: error.response?.data,
          },
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to issue driver's license credential",
        },
      },
      { status: 500 }
    );
  }
}
