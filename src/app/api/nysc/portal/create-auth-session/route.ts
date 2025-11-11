/**
 * NYSC Portal - Create Authentication Session
 *
 * Creates a connection session for portal authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { createConnectionSession } from "@/lib/api/connection-service";
import { confirmdClient } from "@/lib/api/confirmd-client";
import { logger } from "@/lib/api/logger";

/**
 * POST /api/nysc/portal/create-auth-session
 * Create authentication session for NYSC portal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestType = "nysc-portal-auth", useExistingConnection = false, connectionId: existingConnectionId } = body;

    logger.info("NYSC Portal: Creating authentication session", {
      requestType,
      useExistingConnection,
    });

    // If using existing connection, skip invitation creation
    if (useExistingConnection && existingConnectionId) {
      logger.info("NYSC Portal: Using existing connection", {
        connectionId: existingConnectionId,
      });

      // Generate session ID
      const sessionId = `portal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        requestType: "authentication",
        userAgent,
        ipAddress,
        connectionId: existingConnectionId,
        metadata: {
          createdVia: "nysc-portal",
          portalType: requestType,
          useExistingConnection: true,
        },
      });

      logger.info("NYSC Portal: Created session with existing connection", {
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
    // Create a fresh connection invitation for this session
    logger.info("NYSC Portal: Creating new connection invitation");

    const invitationResult = await confirmdClient.createConnectionInvitation(
      "NYSC Portal Login", // label
      false // single-use invitation
    );

    if (!invitationResult.success || !invitationResult.data) {
      logger.error("NYSC Portal: Failed to create connection invitation", {
        error: invitationResult.error,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "invitation_failed",
            error_description: "Could not create connection invitation for NYSC Portal",
          },
        },
        { status: 500 }
      );
    }

    const invitationUrl = invitationResult.data.invitationUrl;
    const invitationId = invitationResult.data.invitationId;

    // Generate session ID
    const sessionId = `portal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info("NYSC Portal: Retrieved connection invitation", {
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
      requestType: "authentication",
      userAgent,
      ipAddress,
      metadata: {
        createdVia: "nysc-portal",
        portalType: requestType,
      },
    });

    logger.info("NYSC Portal: Session created successfully", {
      sessionId: session.sessionId,
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
    logger.error("NYSC Portal: Error creating session", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "session_creation_failed",
          error_description: error.message || "Failed to create authentication session",
        },
      },
      { status: 500 }
    );
  }
}
