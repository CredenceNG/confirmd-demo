/**
 * Professional Job Portal - Request Credentials API
 *
 * Sends a proof request for Statement of Result + NYSC Certificate
 * using professional-specific proof attribute configuration from config/professional-proof-attributes.json
 *
 * USES UNIFIED PROOF CONFIG SYSTEM (proof-config.ts) with credential-based mapping.
 */

import { NextRequest, NextResponse } from "next/server";
import { createProofRequest } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";
import { buildProofAttributeRequests } from "@/lib/proof-config";

/**
 * Professional job portal proof request comment
 */
function getProfessionalProofRequestComment(): string {
  return process.env.PROFESSIONAL_PROOF_REQUEST_COMMENT ||
    "Please share your Statement of Result and NYSC Certificate for employment verification";
}

/**
 * POST /api/professional/request-credentials
 * Send proof request for Statement of Result + NYSC Certificate
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

    logger.info("Professional: Creating proof request for academic and NYSC credentials", {
      sessionId,
      connectionId,
      orgId,
    });

    // Build professional-specific proof attributes from config/professional-proof-attributes.json
    // This requests attributes from 2 credentials: Statement of Results, NYSC Certificate
    // USES UNIFIED buildProofAttributeRequests() with credential-based mapping
    let professionalAttributes;
    let professionalComment;

    try {
      // Use unified proof config system with professional-specific config file
      professionalAttributes = buildProofAttributeRequests("professional-proof-attributes.json");
      professionalComment = getProfessionalProofRequestComment();
      logger.info("Professional: Built proof request with attributes from config", {
        attributeCount: professionalAttributes.length,
      });
    } catch (error: any) {
      logger.error("Professional: Failed to build professional proof attributes", {
        error: error.message,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: `Failed to load professional proof configuration: ${error.message}`,
          },
        },
        { status: 500 }
      );
    }

    // Create proof request using the unified proof service with professional-specific attributes
    const result = await createProofRequest(
      sessionId,
      connectionId,
      orgId,
      professionalAttributes,
      professionalComment
    );

    if (!result.success) {
      logger.error("Professional: Failed to create proof request", {
        error: result.error,
      });
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    logger.info("Professional: Proof request created successfully", {
      proofId: result.data?.proofId,
      status: result.data?.status,
    });

    return NextResponse.json({
      success: true,
      data: {
        proofId: result.data?.proofId,
        status: result.data?.status,
        message: "Proof request sent successfully",
      },
    });
  } catch (error: any) {
    logger.error("Professional: Error in proof request endpoint", {
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
