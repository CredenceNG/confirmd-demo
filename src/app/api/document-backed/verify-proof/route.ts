/**
 * Document-Backed Credentials - Verify Proof API
 *
 * Verifies the submitted driver's license proof presentation
 * and returns the verified credential data
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import { getConnectionSession } from "@/lib/api/connection-service";
import axios from "axios";

/**
 * POST /api/document-backed/verify-proof
 * Verify driver's license proof presentation
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

    logger.info("Insurance Verification: Verifying driver's license proof", {
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

    logger.info("Insurance Verification: Fetching proof details", {
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

    logger.info("Insurance Verification: Proof details retrieved", {
      status: response.data.status,
      state: response.data.state,
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
      logger.error("Insurance Verification: No revealed attributes in proof", {
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

    // Extract driver's license data from revealed attributes
    const revealedAttrs = presentation.requested_proof.revealed_attrs;

    const extractAttributeValue = (attrName: string): string => {
      // Find the attribute in the revealed_attrs object
      const attrKey = Object.keys(revealedAttrs).find(key =>
        key.includes(attrName) || revealedAttrs[key]?.name === attrName
      );

      if (attrKey && revealedAttrs[attrKey]) {
        return revealedAttrs[attrKey].raw || revealedAttrs[attrKey].value || "N/A";
      }
      return "N/A";
    };

    const driverLicenseData = {
      licenseNumber: extractAttributeValue("license_number"),
      fullName: extractAttributeValue("full_name"),
      dateOfBirth: extractAttributeValue("date_of_birth"),
      address: extractAttributeValue("address"),
      issueDate: extractAttributeValue("issue_date"),
      expiryDate: extractAttributeValue("expiry_date"),
      licenseClass: extractAttributeValue("license_class"),
      state: extractAttributeValue("state"),
    };

    logger.info("Insurance Verification: Driver's license verified successfully", {
      licenseNumber: driverLicenseData.licenseNumber,
      fullName: driverLicenseData.fullName,
    });

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        credentials: driverLicenseData,
        proofId,
        message: "Driver's license verified successfully",
      },
    });
  } catch (error: any) {
    logger.error("Insurance Verification: Error verifying proof", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("Insurance Verification: API Response Error", {
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
