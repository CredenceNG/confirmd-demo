import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * GET /api/confirmd/invitation
 * Get the connection invitation URL for wallet connections
 *
 * This endpoint retrieves the multi-use DIDComm invitation URL
 * that can be used to generate QR codes for student wallet connections.
 */
export async function GET() {
  try {
    const result = await confirmdClient.getConnectionInvitation();

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.error || "invitation_fetch_failed",
          message:
            result.error?.error_description ||
            "Failed to fetch connection invitation",
        },
        { status: result.error?.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invitationUrl: result.data,
      message: "Connection invitation retrieved successfully",
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
