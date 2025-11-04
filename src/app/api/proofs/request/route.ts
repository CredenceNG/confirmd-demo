import { NextRequest, NextResponse } from "next/server";
import { createProofRequest, getProofBySessionId } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";

/**
 * POST /api/proofs/request
 * Create and send a proof request to an established connection
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

    logger.info("API: Creating proof request", {
      sessionId,
      connectionId,
    });

    const result = await createProofRequest(sessionId, connectionId, orgId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("API: Error creating proof request", {
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

/**
 * GET /api/proofs/request?sessionId=xxx
 * Get proof request status by session ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameter",
            error_description: "sessionId parameter is required",
          },
        },
        { status: 400 }
      );
    }

    const result = await getProofBySessionId(sessionId);

    if (!result.success) {
      return NextResponse.json(result, { status: result.error?.error === "proof_not_found" ? 404 : 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("API: Error getting proof request", {
      error: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to get proof request",
        },
      },
      { status: 500 }
    );
  }
}
