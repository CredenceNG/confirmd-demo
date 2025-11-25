/**
 * OneVERIFY Mock API - Verify BVN (GET method)
 *
 * GET /api/oneverify/verify/verifyBVN?bvn=<bvnNumber>
 *
 * Verifies a BVN and returns the BVN details from NIBSS database
 */

import { NextRequest, NextResponse } from "next/server";
import { getBVNDetails } from "@/lib/oneverify";

export async function GET(request: NextRequest) {
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

    // Get BVN from query params
    const { searchParams } = new URL(request.url);
    const bvn = searchParams.get("bvn");

    if (!bvn) {
      return NextResponse.json(
        {
          status: 400,
          message: "BVN query parameter is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] verifyBVN (GET):", { bvn });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Look up BVN
    const bvnDetails = getBVNDetails(bvn);

    if (!bvnDetails) {
      return NextResponse.json(
        {
          status: 404,
          message: "BVN not found in NIBSS database",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "BVN verification successful",
      data: bvnDetails,
    });
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
