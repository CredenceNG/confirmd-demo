/**
 * End Demo Session API
 *
 * Marks a demo session as completed and clears the connection
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

    console.log('[DemoSession] Ending demo session', {
      demoType,
      sessionId: clientSessionId || sessionId,
      deviceId,
    });

    // Find active session
    const activeSession = await prisma.demoSession.findFirst({
      where: {
        demoType,
        status: 'active',
        OR: [
          { sessionId: clientSessionId || sessionId },
          { deviceId },
        ],
      },
    });

    if (!activeSession) {
      console.log('[DemoSession] No active session found to end');

      return NextResponse.json({
        success: true,
        message: 'No active session to end',
      });
    }

    // Mark session as completed
    const completedSession = await prisma.demoSession.update({
      where: { id: activeSession.id },
      data: {
        status: 'completed',
        endedAt: new Date(),
      },
    });

    console.log('[DemoSession] Session ended', {
      id: completedSession.id,
      duration: completedSession.endedAt && completedSession.startedAt
        ? Math.round((completedSession.endedAt.getTime() - completedSession.startedAt.getTime()) / 1000)
        : 0,
    });

    return NextResponse.json({
      success: true,
      data: completedSession,
      message: 'Demo session ended successfully',
    });
  } catch (error: any) {
    console.error('[DemoSession] Error ending session:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_error",
          error_description: error.message || "Failed to end session",
        },
      },
      { status: 500 }
    );
  }
}
