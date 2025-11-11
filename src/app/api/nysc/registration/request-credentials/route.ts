/**
 * NYSC Registration - Request Credentials API
 *
 * Sends a proof request for Student Card + Statement of Result + Medical Fitness Certificate
 * using NYSC-specific proof attribute configuration from config/nysc-proof-attributes.json
 *
 * USES UNIFIED PROOF CONFIG SYSTEM (proof-config.ts) with credential-based mapping.
 */

import { NextRequest, NextResponse } from "next/server";
import { createProofRequest } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";
import { buildProofAttributeRequests } from "@/lib/proof-config";

/**
 * NYSC-specific proof request comment
 */
function getNyscProofRequestComment(): string {
  return process.env.NYSC_PROOF_REQUEST_COMMENT ||
    "Please share your student credentials, academic results, and medical fitness certificate for NYSC registration verification";
}

/**
 * POST /api/nysc/registration/request-credentials
 * Send proof request for Student Card + Statement of Result + Medical Fitness Certificate
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

    // TODO: Use NYSC organization ID from environment
    const orgId = process.env.NYSC_ORG_ID || process.env.CONFIRMD_ORG_ID;
    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: "NYSC_ORG_ID not configured",
          },
        },
        { status: 500 }
      );
    }

    logger.info("NYSC Registration: Creating proof request for academic credentials", {
      sessionId,
      connectionId,
      orgId,
    });

    // Build NYSC-specific proof attributes from config/nysc-proof-attributes.json
    // This requests attributes from 3 credentials: Student Card, Statement of Results, Medical Fitness Certificate
    // USES UNIFIED buildProofAttributeRequests() with credential-based mapping
    let nyscAttributes;
    let nyscComment;

    try {
      // Use unified proof config system with NYSC-specific config file
      nyscAttributes = buildProofAttributeRequests("nysc-proof-attributes.json");
      nyscComment = getNyscProofRequestComment();
      logger.info("NYSC Registration: Built proof request with attributes from config", {
        attributeCount: nyscAttributes.length,
      });
    } catch (error: any) {
      logger.error("NYSC Registration: Failed to build NYSC proof attributes", {
        error: error.message,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: `Failed to load NYSC proof configuration: ${error.message}`,
          },
        },
        { status: 500 }
      );
    }

    // Create proof request using the unified proof service with NYSC-specific attributes
    const result = await createProofRequest(
      sessionId,
      connectionId,
      orgId,
      nyscAttributes,
      nyscComment
    );

    if (!result.success) {
      logger.error("NYSC Registration: Failed to create proof request", {
        error: result.error,
      });
      return NextResponse.json(result, { status: 400 });
    }

    logger.info("NYSC Registration: Proof request created successfully", {
      proofId: result.data?.proofId,
      status: result.data?.status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("NYSC Registration: Error creating proof request", {
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
