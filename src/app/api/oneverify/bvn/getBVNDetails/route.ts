/**
 * OneVERIFY Mock API - Get BVN Details
 *
 * POST /api/oneverify/bvn/getBVNDetails
 *
 * Verifies a BVN and returns the full BVN details from NIBSS database
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyBVN } from "@/lib/oneverify";

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
    const { bvn, requestReason } = body;

    if (!bvn) {
      return NextResponse.json(
        {
          status: 400,
          message: "BVN is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] getBVNDetails:", { bvn, requestReason });

    // Call mock client
    const result = await verifyBVN(bvn, requestReason);

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
