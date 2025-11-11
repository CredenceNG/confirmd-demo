/**
 * Document-Backed Credentials - Create Verification Session API
 *
 * Creates a connection session for relying parties to verify driver's license credentials
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createConnectionSession,
} from "@/lib/api/connection-service";
import { logger } from "@/lib/api/logger";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/document-backed/create-verification-session
 * Create a new connection session for driver's license verification (Relying Party)
 */
export async function POST(request: NextRequest) {
  console.log("========================================");
  console.log("=== INSURANCE VERIFICATION SESSION CREATION ===");
  console.log("========================================");

  try {
    const body = await request.json();
    const { requestType = "insurance-verification", useExistingConnection = false, connectionId: existingConnectionId } = body;

    console.log("Request body:", body);

    // If using existing connection, skip invitation creation
    if (useExistingConnection && existingConnectionId) {
      logger.info("Using existing connection for insurance verification", {
        connectionId: existingConnectionId,
      });

      // Generate session ID for tracking
      const sessionId = `insurance-verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get client information
      const userAgent = request.headers.get("user-agent") || undefined;
      const ipAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        undefined;

      // Create connection session with existing connectionId
      const session = await createConnectionSession({
        invitationId: sessionId,
        invitationUrl: "",
        requestType: requestType as "registration" | "authentication",
        userAgent,
        ipAddress,
        connectionId: existingConnectionId,
        metadata: {
          createdVia: "insurance-verification-api",
          phase: "verification",
          useExistingConnection: true,
        },
      });

      logger.info("Created insurance verification session with existing connection", {
        sessionId: session.sessionId,
        connectionId: existingConnectionId,
      });

      return NextResponse.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          connectionId: existingConnectionId,
          status: "completed",
          message: "Using existing connection",
        },
      });
    }

    // Otherwise, create new connection invitation
    logger.info("Requesting connection invitation from Platform...");
    const invitationResult = await confirmdClient.getConnectionInvitation();

    logger.info("Connection invitation result:", {
      success: invitationResult.success,
      hasData: !!invitationResult.data,
      error: invitationResult.error,
    });

    if (!invitationResult.success || !invitationResult.data) {
      logger.error("Failed to get connection invitation", {
        success: invitationResult.success,
        error: invitationResult.error,
      });

      return NextResponse.json(
        {
          error: "failed_to_create_session",
          message: "Could not retrieve connection invitation from platform",
          details: invitationResult.error,
        },
        { status: 500 }
      );
    }

    const invitationUrl = invitationResult.data;

    // Generate session ID for tracking
    const sessionId = `insurance-verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const invitationId = sessionId;

    logger.info("Retrieved organization invitation", {
      sessionId,
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
        createdVia: "insurance-verification-api",
        phase: "verification",
      },
    });

    logger.info("Created insurance verification connection session", {
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
    logger.error("Error creating insurance verification session", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "internal_error",
        message: "Failed to create insurance verification session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
