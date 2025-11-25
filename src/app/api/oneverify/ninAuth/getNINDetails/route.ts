/**
 * OneVERIFY Mock API - Get NIN Details
 *
 * POST /api/oneverify/ninAuth/getNINDetails
 *
 * Verifies a NIN and returns the full NIN details from NIMC database
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyNIN } from "@/lib/oneverify";

export async function POST(request: NextRequest) {
  try {
    // Validate headers
    const apiKey = request.headers.get("X-API-KEY");
    const userId = request.headers.get("X-USER-ID");

    if (!apiKey) {
      return NextResponse.json(
        {
          status: 401,
          message: "Missing X-API-KEY header",
          data: null,
        },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        {
          status: 401,
          message: "Missing X-USER-ID header",
          data: null,
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { nin, requestReason } = body;

    if (!nin) {
      return NextResponse.json(
        {
          status: 400,
          message: "NIN is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] getNINDetails:", { nin, requestReason });

    // Call mock client
    const result = await verifyNIN(nin, requestReason);

    return NextResponse.json(result, { status: result.status === 200 ? 200 : result.status });
  } catch (error: any) {
    console.error("[OneVERIFY API] Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
