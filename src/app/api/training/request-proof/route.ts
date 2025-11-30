/**
 * Training Certifications - Request Proof API
 *
 * Sends a proof request for Training Certification credentials
 * using training-specific proof attribute configuration from config/training-certification-proof-attributes.json
 *
 * USES UNIFIED PROOF CONFIG SYSTEM (proof-config.ts) with credential-based mapping.
 */

import { NextRequest, NextResponse } from "next/server";
import { createProofRequest } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";
import { buildProofAttributeRequests } from "@/lib/proof-config";

/**
 * POST /api/training/request-proof
 * Send proof request for Training Certification
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

    logger.info("[Training Proof] Creating proof request for certification verification", {
      sessionId,
      connectionId,
      orgId,
    });

    // Build training certification proof attributes from config/training-certification-proof-attributes.json
    // USES UNIFIED buildProofAttributeRequests() with credential-based mapping
    let trainingAttributes;
    let proofRequestComment;

    try {
      // Use unified proof config system with training-specific config file
      trainingAttributes = buildProofAttributeRequests("training-certification-proof-attributes.json");
      proofRequestComment = "Please share your Training Certification credential for verification";
      logger.info("[Training Proof] Built proof request with attributes from config", {
        attributeCount: trainingAttributes.length,
      });
    } catch (error: any) {
      logger.error("[Training Proof] Failed to build training proof attributes", {
        error: error.message,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: `Failed to load training proof configuration: ${error.message}`,
          },
        },
        { status: 500 }
      );
    }

    // Create proof request using the unified proof service with training-specific attributes
    const result = await createProofRequest(
      sessionId,
      connectionId,
      orgId,
      trainingAttributes,
      proofRequestComment
    );

    if (!result.success) {
      logger.error("[Training Proof] Failed to create proof request", {
        error: result.error,
      });
      return NextResponse.json(result, { status: 400 });
    }

    logger.info("[Training Proof] Proof request created successfully", {
      proofId: result.data?.proofId,
      status: result.data?.status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("[Training Proof] Error creating proof request", {
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
