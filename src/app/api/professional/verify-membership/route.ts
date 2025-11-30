/**
 * Professional Conference - Verify Membership API
 *
 * Verifies the submitted professional membership proof presentation
 * and returns the verified membership data including designation for discount calculation
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import { getConnectionSession } from "@/lib/api/connection-service";
import axios from "axios";

/**
 * POST /api/professional/verify-membership
 * Verify professional membership proof presentation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofId, sessionId } = body;

    if (!proofId || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "proofId and sessionId are required",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Professional Conference: Verifying membership proof", {
      proofId,
      sessionId,
    });

    // Get the connectionId from the session
    const session = await getConnectionSession(sessionId);

    if (!session) {
      logger.error("Failed to retrieve session", { sessionId });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "session_not_found",
            error_description: "Could not find session",
          },
        },
        { status: 404 }
      );
    }

    const connectionId = session.connectionId;

    if (!connectionId) {
      logger.error("No connectionId found in session", { sessionId });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "no_connection",
            error_description: "No active connection found for this session",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Found connectionId from session", { connectionId });

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

    // Fetch the proof presentation details from the API
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/proofs/${proofId}`;

    logger.info("Professional Conference: Fetching proof details", {
      proofId,
      apiUrl,
    });

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("Professional Conference: Proof details retrieved", {
      status: response.data.status,
      state: response.data.state,
      hasPresentation: !!response.data.presentation,
      hasRequestedProof: !!response.data.presentation?.requested_proof,
    });

    // Log raw response structure for debugging
    logger.info("Professional Conference: RAW PROOF RESPONSE", {
      proofId,
      state: response.data.state,
      presentationKeys: response.data.presentation ? Object.keys(response.data.presentation) : [],
      requestedProofKeys: response.data.presentation?.requested_proof ? Object.keys(response.data.presentation.requested_proof) : [],
      rawResponse: JSON.stringify(response.data).substring(0, 2000), // First 2000 chars
    });

    // Check if proof is verified
    if (response.data.state !== "done" && response.data.state !== "presentation-received") {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "proof_not_ready",
            error_description: `Proof is in state: ${response.data.state}`,
          },
        },
        { status: 400 }
      );
    }

    // Extract the revealed attributes from the proof
    const presentation = response.data.presentation;

    if (!presentation || !presentation.requested_proof || !presentation.requested_proof.revealed_attrs) {
      logger.error("Professional Conference: No revealed attributes in proof", {
        hasPresentation: !!presentation,
        hasRequestedProof: !!presentation?.requested_proof,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "invalid_proof",
            error_description: "Proof does not contain revealed attributes",
          },
        },
        { status: 400 }
      );
    }

    // Extract membership data from revealed attributes
    const revealedAttrs = presentation.requested_proof.revealed_attrs;

    // Log revealed attributes for debugging
    logger.info("Professional Conference: REVEALED ATTRIBUTES", {
      proofId,
      revealedAttrKeys: Object.keys(revealedAttrs),
      revealedAttrCount: Object.keys(revealedAttrs).length,
      rawRevealedAttrs: JSON.stringify(revealedAttrs),
    });

    const extractAttributeValue = (attrName: string): string => {
      // Find the attribute in the revealed_attrs object
      const attrKey = Object.keys(revealedAttrs).find(key =>
        key.includes(attrName) || revealedAttrs[key]?.name === attrName
      );

      const value = attrKey && revealedAttrs[attrKey]
        ? revealedAttrs[attrKey].raw || revealedAttrs[attrKey].value || "N/A"
        : "N/A";

      // Log each attribute extraction
      logger.info("Professional Conference: EXTRACT_ATTRIBUTE", {
        proofId,
        requestedAttr: attrName,
        foundKey: attrKey || "NOT_FOUND",
        extractedValue: value,
        rawAttrData: attrKey ? JSON.stringify(revealedAttrs[attrKey]) : null,
      });

      return value;
    };

    const membershipData = {
      memberName: extractAttributeValue("member_name"),
      email: extractAttributeValue("email"),
      registrationNumber: extractAttributeValue("registration_number"),
      designation: extractAttributeValue("designation"),
      membershipStatus: extractAttributeValue("membership_status"),
      issueDate: extractAttributeValue("issue_date"),
    };

    // Log final extracted membership data
    logger.info("Professional Conference: EXTRACTED MEMBERSHIP DATA", {
      proofId,
      membershipData: JSON.stringify(membershipData),
      hasValidData: Object.values(membershipData).some(v => v !== "N/A"),
      naCount: Object.values(membershipData).filter(v => v === "N/A").length,
      totalFields: Object.keys(membershipData).length,
    });

    logger.info("Professional Conference: Membership verified successfully", {
      memberName: membershipData.memberName,
      designation: membershipData.designation,
      registrationNumber: membershipData.registrationNumber,
    });

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        membership: membershipData,
        proofId,
        message: "Professional membership verified successfully",
      },
    });
  } catch (error: any) {
    logger.error("Professional Conference: Error verifying proof", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("Professional Conference: API Response Error", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            error: "api_error",
            error_description: error.response?.data?.message || "Failed to verify proof",
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
          error_description: error.message || "Failed to verify proof",
        },
      },
      { status: 500 }
    );
  }
}
