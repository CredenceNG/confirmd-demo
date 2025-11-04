import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/confirmd/wallet/verify-signature
 * Verify wallet signature for authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, message } = body;

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "walletAddress, signature, and message are required",
        },
        { status: 400 }
      );
    }

    const result = await confirmdClient.verifyWalletSignature(
      walletAddress,
      signature,
      message
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.error || "verification_failed",
          message:
            result.error?.error_description ||
            "Failed to verify wallet signature",
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
