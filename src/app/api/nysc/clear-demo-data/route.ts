/**
 * Clear NYSC Demo Data
 *
 * Clears all demo data from the database to allow starting fresh
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/api/logger";

/**
 * POST /api/nysc/clear-demo-data
 * Clear all NYSC-related demo data
 */
export async function POST(request: NextRequest) {
  try {
    logger.info("Clearing NYSC demo data");

    // Delete all NYSC registration records
    const deletedRegistrations = await prisma.nYSCRegistration.deleteMany({});

    logger.info("NYSC demo data cleared", {
      deletedRegistrations: deletedRegistrations.count,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Demo data cleared successfully",
        deletedRecords: {
          registrations: deletedRegistrations.count,
        },
      },
    });
  } catch (error: any) {
    logger.error("Error clearing NYSC demo data", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "clear_failed",
          error_description: error.message || "Failed to clear demo data",
        },
      },
      { status: 500 }
    );
  }
}
