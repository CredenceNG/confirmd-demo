/**
 * Check for ANY Active Demo Session API
 *
 * Checks if the user has any active demo session (across all demo types)
 * Since all demos use the same agent, only one session can be truly active at a time
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionInfoFromRequest } from "@/lib/utils/demo-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId: clientSessionId } = body;

    // Get session info from request
    const { sessionId, deviceId } = getSessionInfoFromRequest(request);

    console.log('[DemoSession] Checking for any active session', {
      sessionId: clientSessionId || sessionId,
      deviceId,
    });

    // Look for ANY active session by sessionId OR deviceId (most recent)
    const activeSession = await prisma.demoSession.findFirst({
      where: {
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
        demoType: activeSession.demoType,
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
    console.error('[DemoSession] Error checking for any active session:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_error",
          error_description: error.message || "Failed to check for active session",
        },
      },
      { status: 500 }
    );
  }
}
