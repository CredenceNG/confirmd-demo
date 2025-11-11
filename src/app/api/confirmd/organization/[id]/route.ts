import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";

/**
 * GET /api/confirmd/organization/[id]
 * Get organization details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: organizationId } = await params;

    if (!organizationId) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: "Organization ID is required",
        },
        { status: 400 }
      );
    }

    const result = await confirmdClient.getOrganizationById(organizationId);

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
