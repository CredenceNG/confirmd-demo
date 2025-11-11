/**
 * Professional Organizations - Issue Membership Credential API
 *
 * Issues verifiable professional membership credentials via email (OOB)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import axios from "axios";

interface MembershipData {
  email: string;
  title: string;
  surname: string;
  othernames: string;
  membershipNumber: string;
  designation: string;
  organization: string;
  memberSince: string;
  issuedDate: string;
  expiryDate: string;
  goodStanding: string;
}

/**
 * POST /api/professional/issue-membership
 * Issue a professional membership credential to a member
 */
export async function POST(request: NextRequest) {
  try {
    const body: MembershipData = await request.json();
    const {
      email,
      title,
      surname,
      othernames,
      membershipNumber,
      designation,
      organization,
      memberSince,
      issuedDate,
      expiryDate,
      goodStanding,
    } = body;

    // Validate required fields
    if (!email || !title || !surname || !othernames || !membershipNumber || !designation || !organization || !memberSince || !issuedDate || !expiryDate) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_required_fields",
          message: "All membership fields are required",
        },
        { status: 400 }
      );
    }

    const fullName = `${title} ${othernames} ${surname}`;
    logger.info("[Professional Membership API] Processing credential issuance for:", { fullName });

    // Get organization ID and credential definition ID
    const orgId = process.env.CONFIRMD_ORG_ID;
    const credDefId = process.env.ISSUE_CRED_DEF_ID;

    if (!orgId || !credDefId) {
      logger.error("[Professional Membership API] Missing configuration");
      return NextResponse.json(
        {
          success: false,
          error: "configuration_error",
          message: "Organization or credential definition not configured",
        },
        { status: 500 }
      );
    }

    logger.info("[Professional Membership API] Using Organization ID:", { orgId });
    logger.info("[Professional Membership API] Using Credential Definition ID:", { credDefId });

    // Authenticate with ConfirmD Platform
    logger.info("[Professional Membership API] Authenticating with ConfirmD Platform...");
    const token = await getAccessToken();

    // Prepare credential offer payload
    const payload = {
      credentialOffer: [
        {
          emailId: email,
          attributes: [
            {
              value: title,
              name: "title",
              isRequired: true,
            },
            {
              value: surname,
              name: "surname",
              isRequired: true,
            },
            {
              value: othernames,
              name: "othernames",
              isRequired: true,
            },
            {
              value: membershipNumber,
              name: "membership_number",
              isRequired: true,
            },
            {
              value: designation,
              name: "designation",
              isRequired: true,
            },
            {
              value: organization,
              name: "organization",
              isRequired: true,
            },
            {
              value: memberSince,
              name: "member_since",
              isRequired: true,
            },
            {
              value: issuedDate,
              name: "issued_date",
              isRequired: true,
            },
            {
              value: expiryDate,
              name: "expiry_date",
              isRequired: true,
            },
            {
              value: goodStanding,
              name: "good_standing",
              isRequired: true,
            },
          ],
        },
      ],
      credentialDefinitionId: credDefId,
      isReuseConnection: true,
    };

    // Issue credential via ConfirmD Platform
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;

    logger.info("[Professional Membership API] Issuing credential to:", { email });
    logger.info("[Professional Membership API] API URL:", { apiUrl });
    logger.info("[Professional Membership API] Payload:", { payload: JSON.stringify(payload, null, 2) });

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("[Professional Membership API] Credential issued successfully");

    return NextResponse.json(
      {
        success: true,
        data: {
          email,
          fullName,
          membershipNumber,
          designation,
          organization,
          message: "Professional membership credential issued successfully",
          response: response.data,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("[Professional Membership API] Error issuing credential:", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("[Professional Membership API] API Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: "api_error",
          message: error.response?.data?.message || "Failed to issue membership credential",
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: error.message || "Failed to issue membership credential",
      },
      { status: 500 }
    );
  }
}
