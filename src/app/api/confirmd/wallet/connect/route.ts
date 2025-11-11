import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/confirmd/wallet/connect
 * Initiate wallet connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, walletAddress } = body;

    if (!sessionId || !walletAddress) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "sessionId and walletAddress are required",
        },
        { status: 400 }
      );
    }

    const result = await confirmdClient.verifyWalletConnection({
      sessionId,
      walletAddress,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.error || "connection_failed",
          message:
            result.error?.error_description ||
            "Failed to connect to wallet",
        },
        { status: result.error?.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "server_error",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
