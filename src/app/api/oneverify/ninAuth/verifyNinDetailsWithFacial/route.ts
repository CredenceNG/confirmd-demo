/**
 * OneVERIFY Mock API - Verify NIN Details With Facial
 *
 * POST /api/oneverify/ninAuth/verifyNinDetailsWithFacial
 *
 * Verifies a NIN using facial recognition (selfie image comparison)
 */

import { NextRequest, NextResponse } from "next/server";
import { oneVerifyClient, getNINDetails } from "@/lib/oneverify";

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
    const { nin, selfieImage, requestReason } = body;

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

    if (!selfieImage?.image) {
      return NextResponse.json(
        {
          status: 400,
          message: "Selfie image is required",
          data: null,
        },
        { status: 400 }
      );
    }

    console.log("[OneVERIFY API] verifyNinDetailsWithFacial:", {
      nin,
      hasImage: !!selfieImage?.image,
      requestReason,
    });

    // First, verify the NIN exists
    const ninDetails = getNINDetails(nin);

    if (!ninDetails) {
      return NextResponse.json(
        {
          status: 404,
          message: "NIN not found in NIMC database",
          data: null,
        },
        { status: 404 }
      );
    }

    // Simulate face match (in real implementation, this would do actual comparison)
    // For mock, we always return successful match with the NIN details
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing time

    return NextResponse.json({
      status: 200,
      message: "NIN Auth verification successful",
      data: ninDetails,
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
