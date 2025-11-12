import { NextRequest, NextResponse } from "next/server";
import { createProofRequest } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";
import { buildProofAttributeRequests } from "@/lib/proof-config";

/**
 * POST /api/finance/onboarding-ekyc/request-proof
 * Create and send a proof request for customer onboarding (eKYC verification)
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

    logger.info("API: Creating proof request for customer onboarding", {
      sessionId,
      connectionId,
    });

    // Build proof attributes from onboarding eKYC config file
    const customAttributes = buildProofAttributeRequests("onboarding-ekyc-proof-attributes.json");
    const customComment = "Customer Onboarding - eKYC Verification";

    const result = await createProofRequest(
      sessionId,
      connectionId,
      orgId,
      customAttributes,
      customComment
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("API: Error creating customer onboarding proof request", {
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
