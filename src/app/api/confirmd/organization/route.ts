import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * GET /api/confirmd/organization
 * Get current organization details from ORGANIZATION_ID in .env
 */
export async function GET() {
  try {
    const result = await confirmdClient.getCurrentOrganization();

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.error || "organization_fetch_failed",
          message:
            result.error?.error_description ||
            "Failed to fetch organization details",
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
