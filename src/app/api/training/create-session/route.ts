/**
 * Training Certifications - Create Session API
 *
 * Creates a connection session for verifying training certification credentials
 */

import { NextRequest, NextResponse } from "next/server";
import { createConnectionSession } from "@/lib/api/connection-service";
import { logger } from "@/lib/api/logger";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/training/create-session
 * Create connection session for training certification verification
 */
export async function POST(request: NextRequest) {
  logger.info("[Training Session] Creating verification session");

  try {
    const body = await request.json();
    const { requestType = "training-verification" } = body;

    // Create a new single-use connection invitation (recommended pattern)
    logger.info("[Training Session] Creating single-use connection invitation...");
    const invitationResult = await confirmdClient.createConnectionInvitation(
      "Training Certification Verification",
      false // single-use invitation
    );

    logger.info("[Training Session] Connection invitation result:", {
      success: invitationResult.success,
      hasData: !!invitationResult.data,
      error: invitationResult.error,
    });

    if (!invitationResult.success || !invitationResult.data) {
      logger.error("[Training Session] Failed to create connection invitation", {
        success: invitationResult.success,
        error: invitationResult.error,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            error: "failed_to_create_session",
            error_description: "Could not create connection invitation from platform",
            details: invitationResult.error,
          },
        },
        { status: 500 }
      );
    }

    const { invitationId, invitationUrl } = invitationResult.data;

    // Generate session ID for tracking
    const sessionId = `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info("[Training Session] Retrieved organization invitation", {
      sessionId,
      invitationId,
    });

    // Get client information
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      undefined;

    // Create connection session
    const session = await createConnectionSession({
      invitationId,
      invitationUrl,
      requestType: requestType as "registration" | "authentication",
      userAgent,
      ipAddress,
      metadata: {
        createdVia: "training-certification-api",
        phase: "verification",
      },
    });

    logger.info("[Training Session] Created training certification connection session", {
      sessionId: session.sessionId,
      requestType,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        invitationUrl: session.invitationUrl,
        status: session.status,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error: any) {
    logger.error("[Training Session] Error creating session", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to create training verification session",
        },
      },
      { status: 500 }
    );
  }
}
