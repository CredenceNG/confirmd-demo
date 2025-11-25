/**
 * OneVERIFY Mock API - Get NIN Details With Phone
 *
 * POST /api/oneverify/ninAuth/getNINDetailsWithPhone
 *
 * Looks up NIN details using a phone number linked to the NIN
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyNINByPhone } from "@/lib/oneverify";

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
    const { phone, requestReason } = body;

    if (!phone) {
      return NextResponse.json(
        {
          status: 400,
          message: "Phone number is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] getNINDetailsWithPhone:", { phone, requestReason });

    // Call mock client
    const result = await verifyNINByPhone(phone, requestReason);

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
