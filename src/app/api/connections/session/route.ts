/**
 * Connection Session API
 *
 * Handles creation and retrieval of connection sessions for wallet integration
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createConnectionSession,
  getConnectionSession,
} from "@/lib/api/connection-service";
import { logger } from "@/lib/api/logger";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/connections/session
 * Create a new connection session with the organization's invitation
 */
export async function POST(request: NextRequest) {
  console.log("========================================");
  console.log("=== SESSION CREATION API CALLED ===");
  console.log("========================================");

  try {
    const body = await request.json();
    const { requestType = "registration", useExistingConnection = false, connectionId: existingConnectionId } = body;

    console.log("Request body:", body);

    // If using existing connection, skip invitation creation
    if (useExistingConnection && existingConnectionId) {
      logger.info("Using existing connection for NELFUND", {
        connectionId: existingConnectionId,
      });

      // Generate session ID for tracking
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
          createdVia: "api",
          useExistingConnection: true,
        },
      });

      logger.info("Created session with existing connection", {
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
    // Get organization connection invitation
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
        fullResult: JSON.stringify(invitationResult),
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

    // Get the outOfBandId from the invitation result for precise webhook matching
    // This is the ID that will appear in webhook payloads from the Platform
    const outOfBandId = (invitationResult as any).invitationId;

    // Generate session ID that can be tracked
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Use outOfBandId if available, otherwise fall back to sessionId
    const invitationId = outOfBandId || sessionId;

    if (outOfBandId) {
      logger.info("Using outOfBandId from Platform for webhook matching", {
        outOfBandId,
        sessionId
      });
    } else {
      logger.warn("No outOfBandId available, using sessionId as invitationId", {
        sessionId,
      });
    }

    logger.info("Retrieved organization invitation", {
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
        createdVia: "api",
      },
    });

    logger.info("Created connection session", {
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
    logger.error("Error creating connection session", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to create connection session",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/connections/session?sessionId={sessionId}
 * Get the current status of a connection session
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          error: "missing_session_id",
          message: "Session ID is required",
        },
        { status: 400 }
      );
    }

    const session = await getConnectionSession(sessionId);

    if (!session) {
      return NextResponse.json(
        {
          error: "session_not_found",
          message: "Connection session not found or expired",
        },
        { status: 404 }
      );
    }

    // Check if session has expired
    const now = new Date();
    if (session.expiresAt < now && session.status === "invitation") {
      return NextResponse.json({
        success: true,
        data: {
          sessionId: session.sessionId,
          status: "abandoned",
          message: "Session has expired",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        connectionId: session.connectionId,
        theirLabel: session.theirLabel,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error: any) {
    logger.error("Error retrieving connection session", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "internal_server_error",
        message: "Failed to retrieve connection session",
      },
      { status: 500 }
    );
  }
}
