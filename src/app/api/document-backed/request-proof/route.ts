/**
 * Document-Backed Credentials - Request Proof API
 *
 * Sends a proof request for driver's license credential verification
 */

import { NextRequest, NextResponse } from "next/server";
import { createProofRequest } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";

/**
 * POST /api/document-backed/request-proof
 * Send proof request for driver's license credential
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, connectionId } = body;

    if (!sessionId || !connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "sessionId and connectionId are required",
          },
        },
        { status: 400 }
      );
    }

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

    logger.info("Insurance Verification: Creating proof request for driver's license", {
      sessionId,
      connectionId,
      orgId,
    });

    // Define attributes we want to request from the driver's license credential
    // These should match the attributes we issued in the credential
    const driverLicenseAttributes = [
      {
        attributeName: "license_number",
      },
      {
        attributeName: "full_name",
      },
      {
        attributeName: "date_of_birth",
      },
      {
        attributeName: "address",
      },
      {
        attributeName: "issue_date",
      },
      {
        attributeName: "expiry_date",
      },
      {
        attributeName: "license_class",
      },
      {
        attributeName: "state",
      },
    ];

    const proofRequestComment = "Please share your driver's license credential for insurance verification";

    // Create proof request using the existing proof service
    const result = await createProofRequest(
      sessionId,
      connectionId,
      orgId,
      driverLicenseAttributes,
      proofRequestComment
    );

    if (!result.success) {
      logger.error("Insurance Verification: Failed to create proof request", {
        error: result.error,
      });
      return NextResponse.json(result, { status: 400 });
    }

    logger.info("Insurance Verification: Proof request created successfully", {
      proofId: result.data?.proofId,
      status: result.data?.status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("Insurance Verification: Error creating proof request", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to create proof request",
        },
      },
      { status: 500 }
    );
  }
}
