/**
 * NYSC Onboarding - Request Green Card API
 *
 * Sends a proof request for Green Card credential + Student Card + Statement of Results + Medical Fitness
 *
 * USES UNIFIED PROOF CONFIG SYSTEM (proof-config.ts) with credential-based mapping.
 */

import { NextRequest, NextResponse } from "next/server";
import { createProofRequest } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";
import { buildProofAttributeRequests } from "@/lib/proof-config";

/**
 * Comprehensive onboarding proof request comment
 */
function getComprehensiveOnboardingComment(): string {
  return process.env.COMPREHENSIVE_ONBOARDING_COMMENT ||
    "Please share your NYSC Green Card, Student credentials, academic results, and medical fitness certificate for comprehensive verification";
}

/**
 * POST /api/nysc/onboarding/request-green-card
 * Send proof request for Green Card credential
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

    logger.info("NYSC Onboarding: Creating comprehensive proof request for all 4 credentials", {
      sessionId,
      connectionId,
      orgId,
    });

    // Build comprehensive proof attributes from ALL 4 required credentials:
    // - NYSC Green Card, Student Card, Statement of Results, Medical Fitness
    // USES UNIFIED buildProofAttributeRequests() with credential-based mapping
    const comprehensiveAttributes = buildProofAttributeRequests("comprehensive-onboarding-proof-attributes.json");
    const comment = getComprehensiveOnboardingComment();

    logger.info("NYSC Onboarding: Comprehensive proof attributes built", {
      attributeCount: comprehensiveAttributes.length,
      attributes: comprehensiveAttributes.map(attr => attr.attributeName),
      credDefIds: [...new Set(comprehensiveAttributes.map(attr => attr.credDefId).filter(Boolean))],
      schemaIds: [...new Set(comprehensiveAttributes.map(attr => attr.schemaId).filter(Boolean))],
    });

    // Create proof request with all 4 credentials
    const result = await createProofRequest(
      sessionId,
      connectionId,
      orgId,
      comprehensiveAttributes,
      comment
    );

    if (!result.success) {
      logger.error("NYSC Onboarding: Failed to create proof request", {
        error: result.error,
      });
      return NextResponse.json(result, { status: 400 });
    }

    logger.info("NYSC Onboarding: Proof request created successfully", {
      proofId: result.data?.proofId,
      status: result.data?.status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("NYSC Onboarding: Error creating proof request", {
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
