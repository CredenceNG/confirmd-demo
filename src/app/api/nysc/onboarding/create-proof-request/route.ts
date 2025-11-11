/**
 * NYSC Onboarding - Create Proof Request API
 *
 * Creates a connection session for NYSC camp onboarding
 * This will be used to request Green Card credential
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createConnectionSession,
} from "@/lib/api/connection-service";
import { logger } from "@/lib/api/logger";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/nysc/onboarding/create-proof-request
 * Create a new connection session for NYSC onboarding proof request
 */
export async function POST(request: NextRequest) {
  console.log("========================================");
  console.log("=== NYSC ONBOARDING SESSION CREATION ===");
  console.log("========================================");

  try {
    const body = await request.json();
    const { requestType = "nysc-onboarding", useExistingConnection = false, connectionId: existingConnectionId } = body;

    console.log("Request body:", body);

    // If using existing connection, skip invitation creation
    if (useExistingConnection && existingConnectionId) {
      logger.info("Using existing connection for NYSC onboarding", {
        connectionId: existingConnectionId,
      });

      // Generate session ID for tracking
      const sessionId = `nysc-onboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
          createdVia: "nysc-onboarding-api",
          phase: "onboarding",
          useExistingConnection: true,
        },
      });

      logger.info("Created NYSC onboarding session with existing connection", {
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
    logger.info("Creating new connection invitation for NYSC onboarding...");

    const invitationResult = await confirmdClient.createConnectionInvitation(
      "NYSC Camp Onboarding", // label
      false // single-use invitation
    );

    logger.info("Connection invitation result:", {
      success: invitationResult.success,
      hasData: !!invitationResult.data,
      error: invitationResult.error,
    });

    if (!invitationResult.success || !invitationResult.data) {
      logger.error("Failed to create connection invitation", {
        success: invitationResult.success,
        error: invitationResult.error,
      });

      return NextResponse.json(
        {
          error: "failed_to_create_session",
          message: "Could not create connection invitation for NYSC onboarding",
          details: invitationResult.error,
        },
        { status: 500 }
      );
    }

    const invitationUrl = invitationResult.data.invitationUrl;
    const invitationId = invitationResult.data.invitationId;

    // Generate session ID for tracking
    const sessionId = `nysc-onboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logger.info("Retrieved NYSC camp organization invitation", {
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
        createdVia: "nysc-onboarding-api",
        phase: "onboarding",
      },
    });

    logger.info("Created NYSC onboarding connection session", {
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
    logger.error("Error creating NYSC onboarding session", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: "internal_error",
        message: "Failed to create NYSC onboarding session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
