import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getTokenInfo, invalidateToken } from "@/lib/api/confirmd-auth";

/**
 * GET /api/confirmd/token
 * Get current token info (without exposing the actual token)
 */
export async function GET() {
  try {
    const tokenInfo = getTokenInfo();

    if (!tokenInfo) {
      return NextResponse.json(
        {
          error: "no_token",
          message: "No valid token available",
        },
        { status: 404 }
      );
    }

    // Return token info without exposing the actual token
    return NextResponse.json({
      expires_at: tokenInfo.expires_at,
      token_type: tokenInfo.token_type,
      is_valid: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "token_error",
        message: error.message || "Failed to get token info",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/confirmd/token
 * Force fetch a new token
 */
export async function POST() {
  try {
    // Invalidate current token
    invalidateToken();

    // Fetch new token
    const token = await getAccessToken();

    return NextResponse.json({
      success: true,
      message: "New token fetched successfully",
      expires_at: Date.now() + 3600 * 1000, // Approximate
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.error || "token_error",
        message: error.error_description || "Failed to fetch new token",
      },
      { status: error.status || 500 }
    );
  }
}

/**
 * DELETE /api/confirmd/token
 * Invalidate the current token
 */
export async function DELETE() {
  try {
    invalidateToken();

    return NextResponse.json({
      success: true,
      message: "Token invalidated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "token_error",
        message: error.message || "Failed to invalidate token",
      },
      { status: 500 }
    );
  }
}
