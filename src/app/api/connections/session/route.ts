/**
 * Connection Session API
 *
 * Handles creation and retrieval of connection sessions for wallet integration
 * Updated: 2025-11-12 - Fixed response mapping for createConnectionInvitation
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

    // If using existing connection, validate it exists first
    if (useExistingConnection && existingConnectionId) {
      logger.info("Attempting to use existing connection", {
        connectionId: existingConnectionId,
      });

      // Validate that the connection exists in the Platform
      try {
        const validationResult = await confirmdClient.validateConnection(existingConnectionId);

        if (!validationResult.success || !validationResult.data?.isValid) {
          logger.warn("Stored connection is no longer valid on Platform", {
            connectionId: existingConnectionId,
            error: validationResult.error,
          });

          return NextResponse.json(
            {
              success: false,
              error: "invalid_connection",
              message: "The stored connection is no longer valid. Please reconnect.",
              shouldClearConnection: true,
            },
            { status: 410 } // 410 Gone - resource no longer available
          );
        }

        logger.info("Connection validated successfully", {
          connectionId: existingConnectionId,
        });
      } catch (validationError: any) {
        logger.error("Failed to validate connection", {
          connectionId: existingConnectionId,
          error: validationError.message,
        });

        // If validation fails, treat as invalid connection
        return NextResponse.json(
          {
            success: false,
            error: "validation_failed",
            message: "Unable to validate connection. Please reconnect.",
            shouldClearConnection: true,
          },
          { status: 410 }
        );
      }

      // Connection is valid, proceed to create session
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
    // Try to create a new connection invitation from the Platform
    logger.info("Creating connection invitation from Platform...");
    const invitationResult = await confirmdClient.createConnectionInvitation(
      undefined, // label - use org default
      false      // multiUseInvitation - single-use per session
    );

    logger.info("Connection invitation result:", {
      success: invitationResult.success,
      hasData: !!invitationResult.data,
      error: invitationResult.error,
    });

    // If creating new invitation fails, fall back to organizational invitation
    if (!invitationResult.success || !invitationResult.data) {
      logger.warn("Failed to create new invitation, falling back to organizational invitation", {
        error: invitationResult.error,
      });

      const fallbackResult = await confirmdClient.getConnectionInvitation();

      if (!fallbackResult.success || !fallbackResult.data) {
        logger.error("Fallback also failed", {
          error: fallbackResult.error,
        });

        return NextResponse.json(
          {
            error: "failed_to_create_session",
            message: "Could not create or retrieve connection invitation from platform",
            details: invitationResult.error,
          },
          { status: 500 }
        );
      }

      const invitationUrl = fallbackResult.data;
      const outOfBandId = (fallbackResult as any).invitationId;
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const invitationId = outOfBandId || sessionId;

      logger.info("Using fallback organizational invitation", {
        outOfBandId,
        sessionId,
        invitationId,
      });

      // Create connection session
      const session = await createConnectionSession({
        invitationId,
        invitationUrl,
        requestType: requestType as "registration" | "authentication",
        userAgent,
        ipAddress,
        metadata: {
          createdVia: "api",
          method: "fallback-organizational",
        },
      });

      logger.info("Created connection session with fallback", {
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
    }

    logger.info("RAW INVITATION RESULT DATA:", {
      fullData: JSON.stringify(invitationResult.data, null, 2),
    });

    const { invitationUrl, invitationId: outOfBandId } = invitationResult.data;

    logger.info("EXTRACTED VALUES:", {
      invitationUrl,
      outOfBandId,
    });

    // Generate session ID that can be tracked
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Use the outOfBandId from the Platform for webhook matching
    const invitationId = outOfBandId;

    logger.info("Using outOfBandId from Platform for webhook matching", {
      outOfBandId,
      sessionId
    });

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
