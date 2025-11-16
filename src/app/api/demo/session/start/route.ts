/**
 * Start Demo Session API
 *
 * Creates a new demo session or returns existing active session
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionInfoFromRequest } from "@/lib/utils/demo-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { demoType, connectionId } = body;

    if (!demoType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameter",
            error_description: "demoType is required",
          },
        },
        { status: 400 }
      );
    }

    // Get session info from request
    const { sessionId, deviceId } = getSessionInfoFromRequest(request);

    console.log('[DemoSession] Starting demo session', {
      demoType,
      sessionId,
      deviceId,
      connectionId,
    });

    // Check for existing active session
    const existingSession = await prisma.demoSession.findFirst({
      where: {
        demoType,
        status: 'active',
        OR: [
          { sessionId },
          { deviceId },
        ],
      },
      orderBy: {
        lastActivityAt: 'desc',
      },
    });

    if (existingSession) {
      // Update existing session
      const updatedSession = await prisma.demoSession.update({
        where: { id: existingSession.id },
        data: {
          sessionId, // Update to current sessionId
          lastActivityAt: new Date(),
          ...(connectionId && { connectionId }), // Update connectionId if provided
        },
      });

      console.log('[DemoSession] Resuming existing session', {
        id: updatedSession.id,
      });

      return NextResponse.json({
        success: true,
        data: updatedSession,
        message: 'Resumed existing session',
      });
    }

    // Create new session
    const newSession = await prisma.demoSession.create({
      data: {
        sessionId,
        deviceId,
        demoType,
        status: 'active',
        connectionId: connectionId || null,
      },
    });

    console.log('[DemoSession] Created new session', {
      id: newSession.id,
    });

    return NextResponse.json({
      success: true,
      data: newSession,
      message: 'New session created',
    });
  } catch (error: any) {
    console.error('[DemoSession] Error starting session:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_error",
          error_description: error.message || "Failed to start session",
        },
      },
      { status: 500 }
    );
  }
}
