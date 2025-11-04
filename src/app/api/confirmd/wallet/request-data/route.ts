import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * POST /api/confirmd/wallet/request-data
 * Request data from connected wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, dataFields } = body;

    if (!sessionId || !dataFields || !Array.isArray(dataFields)) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "sessionId and dataFields (array) are required",
        },
        { status: 400 }
      );
    }

    const result = await confirmdClient.requestWalletData(
      sessionId,
      dataFields
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.error || "request_failed",
          message:
            result.error?.error_description ||
            "Failed to request data from wallet",
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
