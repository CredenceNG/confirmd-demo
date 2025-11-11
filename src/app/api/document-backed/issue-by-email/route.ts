/**
 * Document-Backed Credentials - Issue Credential by Email API
 *
 * Issues a driver's license verifiable credential via Out-of-Band (OOB) email delivery
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import axios from "axios";

/**
 * POST /api/document-backed/issue-by-email
 * Issue driver's license credential via email (OOB)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, email, licenseData } = body;

    if (!applicationId || !email || !licenseData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "applicationId, email, and licenseData are required",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Document-Backed: Issuing driver's license credential by email", {
      applicationId,
      email,
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

    // Generate license number if not provided
    const licenseNumber = licenseData.licenseNumber || `LAG-${Date.now().toString().slice(-8)}`;
    const issueDate = licenseData.issueDate || new Date().toISOString().slice(0, 10);
    const expiryDate = licenseData.expiryDate || new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Prepare driver's license credential attributes
    const payload = {
      credentialData: [
        {
          email, // Use email for OOB delivery
          attributes: [
            {
              name: "license_number",
              value: ensureValue(licenseNumber),
            },
            {
              name: "full_name",
              value: ensureValue(licenseData.fullName),
            },
            {
              name: "date_of_birth",
              value: ensureValue(licenseData.dateOfBirth),
            },
            {
              name: "address",
              value: ensureValue(licenseData.address),
            },
            {
              name: "issue_date",
              value: ensureValue(issueDate),
            },
            {
              name: "expiry_date",
              value: ensureValue(expiryDate),
            },
            {
              name: "license_class",
              value: ensureValue(licenseData.licenseClass),
            },
            {
              name: "state",
              value: ensureValue(licenseData.stateOfResidence || licenseData.state, "Lagos"),
            },
          ],
        },
      ],
      credentialDefinitionId,
      orgId,
    };

    // Make API call to issue driver's license credential via OOB email
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;

    logger.info("Document-Backed: Issuing driver's license credential via email", {
      email,
      apiUrl,
    });

    console.log("[Driver's License OOB API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("Document-Backed: Driver's license issued successfully via email", {
      responseData: response.data,
    });

    return NextResponse.json({
      success: true,
      data: {
        credentialIssued: true,
        credentialData: response.data,
        email,
        applicationId,
        message: `Driver's License credential sent to ${email}`,
      },
    });
  } catch (error: any) {
    logger.error("Document-Backed: Error issuing driver's license via email", {
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
