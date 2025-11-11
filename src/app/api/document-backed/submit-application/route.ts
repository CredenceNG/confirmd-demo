/**
 * Document-Backed Credentials - Submit Application API
 *
 * Handles driver's license application submissions from citizens/holders
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/api/logger";

// In-memory storage for demo purposes (in production, use a database)
const applications: any[] = [];

/**
 * POST /api/document-backed/submit-application
 * Submit a driver's license application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      dateOfBirth,
      address,
      phoneNumber,
      stateOfResidence,
      licenseClass,
    } = body;

    // Validate required fields
    if (!fullName || !email || !dateOfBirth || !address || !phoneNumber || !stateOfResidence || !licenseClass) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "All application fields are required",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Document-Backed: Receiving driver's license application", {
      fullName,
      email,
      licenseClass,
    });

    // Generate application ID
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create application object
    const application = {
      applicationId,
      fullName,
      email,
      dateOfBirth,
      address,
      phoneNumber,
      stateOfResidence,
      licenseClass,
      status: "pending", // pending, approved, rejected
      submittedAt: new Date().toISOString(),
      metadata: {
        userAgent: request.headers.get("user-agent") || undefined,
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          undefined,
      },
    };

    // Store application (in production, save to database)
    applications.push(application);

    logger.info("Document-Backed: Application submitted successfully", {
      applicationId,
      email,
    });

    return NextResponse.json({
      success: true,
      data: {
        applicationId,
        status: "pending",
        message: "Application submitted successfully. You will receive an email once approved.",
      },
    });
  } catch (error: any) {
    logger.error("Document-Backed: Error submitting application", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to submit application",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/document-backed/submit-application
 * Get all pending applications (for FRSC issuers to review)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    // Filter applications by status
    const filteredApplications = applications.filter(
      (app) => app.status === status
    );

    logger.info("Document-Backed: Fetching applications", {
      status,
      count: filteredApplications.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        applications: filteredApplications,
        count: filteredApplications.length,
      },
    });
  } catch (error: any) {
    logger.error("Document-Backed: Error fetching applications", {
      error: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: "Failed to fetch applications",
        },
      },
      { status: 500 }
    );
  }
}
