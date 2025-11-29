/**
 * NYSC Certificate Issuance API
 *
 * Issues NYSC Certificate of National Service to corps members who have completed their service year
 * This is Phase 4 of the NYSC demo - final credential in the lifecycle
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import axios from "axios";

/**
 * POST /api/nysc/certificate/issue
 * Issue NYSC Certificate credential via email-based OOB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phoneNumber,
      fullName,
      callUpNumber,
      startDate,
      endDate,
      issuedDate,
      certificateNumber,
    } = body;

    // Validate required fields
    if (!email || !phoneNumber || !fullName || !callUpNumber || !startDate || !endDate || !issuedDate || !certificateNumber) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "All fields are required: email, phoneNumber, fullName, callUpNumber, startDate, endDate, issuedDate, certificateNumber",
          },
        },
        { status: 400 }
      );
    }

    logger.info("NYSC Certificate: Issuing certificate", {
      email,
      fullName,
      callUpNumber,
      certificateNumber,
    });

    // Get access token for NYSC organization
    let token;
    try {
      token = await getAccessToken();
    } catch (authError: any) {
      logger.error("NYSC Certificate: Authentication failed", { error: authError });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "authentication_failed",
            error_description: "Unable to authenticate with ConfirmD Platform",
            details: authError.error_description || authError.message,
          },
        },
        { status: 401 }
      );
    }

    // Get organization ID - use CONFIRMD_ORG_ID for all issuance
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

    // Get NYSC Certificate credential definition ID with fallback
    const credentialDefinitionId =
      process.env.NYSC_CERTIFICATE_CRED_DEF_ID ||
      process.env.ISSUE_CRED_DEF_ID;

    if (!credentialDefinitionId || credentialDefinitionId.includes("PLACEHOLDER")) {
      logger.warn("NYSC_CERTIFICATE_CRED_DEF_ID not configured, using fallback", {
        credentialDefinitionId,
      });
    }

    // Helper function to ensure no null/undefined values
    const ensureValue = (value: any, defaultValue: string = "N/A"): string => {
      if (value === undefined || value === null || value === "undefined" || value === "null" || value === "") {
        return defaultValue;
      }
      return String(value);
    };

    // Prepare NYSC Certificate credential attributes
    // Based on actual NYSC Certificate schema attributes:
    // 1. Full Name
    // 2. CallUp Number
    // 3. Start Date
    // 4. End Date
    // 5. Issued Date
    // 6. NYSC Certificate Number
    const payload = {
      credentialOffer: [
        {
          emailId: email,
          attributes: [
            {
              value: ensureValue(fullName),
              name: "full_name",
              isRequired: true,
            },
            {
              value: ensureValue(callUpNumber),
              name: "call_up_number",
              isRequired: true,
            },
            {
              value: ensureValue(startDate),
              name: "start_date",
              isRequired: true,
            },
            {
              value: ensureValue(endDate),
              name: "end_date",
              isRequired: true,
            },
            {
              value: ensureValue(issuedDate),
              name: "issued_date",
              isRequired: true,
            },
            {
              value: ensureValue(certificateNumber),
              name: "certificate_number",
              isRequired: true,
            },
          ],
        },
      ],
      credentialDefinitionId,
      isReuseConnection: true, // Reuse existing connection if available
    };

    // Issue certificate via ConfirmD Platform (email-based OOB)
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;

    logger.info("NYSC Certificate: Calling ConfirmD Platform API", {
      apiUrl,
      email,
      credentialDefinitionId,
    });

    console.log("[NYSC Certificate API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    logger.info("NYSC Certificate: Credential issued successfully", {
      email,
      fullName,
      responseStatus: response.status,
    });

    // Extract credential details from response
    const credentialData = response.data?.data || response.data;
    const credentialId = credentialData?.response?.credentialId ||
                        credentialData?.credentialId ||
                        response.data?.id;
    const invitationUrl = credentialData?.response?.invitationUrl;
    const deepLinkUrl = credentialData?.response?.deepLinkURL;

    logger.info("NYSC Certificate: Credential URLs extracted", {
      hasInvitationUrl: !!invitationUrl,
      hasDeepLinkUrl: !!deepLinkUrl,
      credentialId,
    });

    // TODO: Send email with QR code
    // This would typically integrate with an email service provider (SendGrid, AWS SES, etc.)
    // For now, we rely on ConfirmD Platform's email-based OOB delivery
    logger.info("NYSC Certificate: Email sent via ConfirmD Platform OOB", { email });

    // TODO: Send SMS notification
    // This would typically integrate with an SMS service provider (Twilio, AWS SNS, etc.)
    logger.info("NYSC Certificate: SMS notification pending implementation", { phoneNumber });

    return NextResponse.json({
      success: true,
      data: {
        certificateIssued: true,
        credentialId,
        credentialData: response.data,
        invitationUrl,
        deepLinkUrl,
        email,
        phoneNumber,
        message: "NYSC Certificate issued successfully",
        emailSent: true, // Email sent via ConfirmD Platform OOB
        smsSent: false, // SMS not yet implemented
      },
    });
  } catch (error: any) {
    logger.error("NYSC Certificate: Error issuing certificate", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("NYSC Certificate: API Response Error", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            error: "api_error",
            error_description: error.response?.data?.message || "Failed to issue NYSC Certificate",
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
          error_description: error.message || "Failed to issue NYSC Certificate",
        },
      },
      { status: 500 }
    );
  }
}
