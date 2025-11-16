/**
 * Check for Active Demo Session API
 *
 * Checks if the user has an active demo session for the specified demo type
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionInfoFromRequest } from "@/lib/utils/demo-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { demoType, sessionId: clientSessionId } = body;

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

    console.log('[DemoSession] Checking for active session', {
      demoType,
      sessionId: clientSessionId || sessionId,
      deviceId,
    });

    // Look for active session by sessionId OR deviceId
    const activeSession = await prisma.demoSession.findFirst({
      where: {
        demoType,
        status: 'active',
        OR: [
          { sessionId: clientSessionId || sessionId },
          { deviceId },
        ],
      },
      orderBy: {
        lastActivityAt: 'desc',
      },
    });

    if (activeSession) {
      // Update lastActivityAt
      await prisma.demoSession.update({
        where: { id: activeSession.id },
        data: {
          lastActivityAt: new Date(),
          // Update sessionId if it changed (e.g., cookie was cleared)
          sessionId: clientSessionId || sessionId,
        },
      });

      console.log('[DemoSession] Found active session', {
        id: activeSession.id,
        connectionId: activeSession.connectionId,
      });

      return NextResponse.json({
        success: true,
        data: activeSession,
        message: 'Active session found',
      });
    }

    console.log('[DemoSession] No active session found');

    return NextResponse.json({
      success: true,
      data: null,
      message: 'No active session',
    });
  } catch (error: any) {
    console.error('[DemoSession] Error checking session:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_error",
          error_description: error.message || "Failed to check session",
        },
      },
      { status: 500 }
    );
  }
}
