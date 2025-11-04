/**
 * Loan Application Submission API
 *
 * Handles submission of loan applications with verified credentials
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/api/logger";

/**
 * Generate a unique application number
 * Format: NELFUND-YYYY-XXXXXX
 */
function generateApplicationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `NELFUND-${year}-${random}`;
}

/**
 * POST /api/applications/submit
 * Submit a loan application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      contactPhone,
      contactEmail,
    } = body;

    logger.info("Application submission started", { sessionId });

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!contactPhone || !contactEmail) {
      return NextResponse.json(
        { error: "Contact phone and email are required" },
        { status: 400 }
      );
    }

    // Get verified credentials from proof request
    const proofRequest = await prisma.proofRequest.findUnique({
      where: { sessionId },
    });

    if (!proofRequest) {
      return NextResponse.json(
        { error: "Proof request not found" },
        { status: 404 }
      );
    }

    if (!proofRequest.verified || !proofRequest.presentedAttributes) {
      return NextResponse.json(
        { error: "Credentials not verified" },
        { status: 400 }
      );
    }

    // Parse verified credentials
    const credentials = JSON.parse(proofRequest.presentedAttributes);

    logger.info("Verified credentials loaded", {
      sessionId,
      attributeCount: Object.keys(credentials).length,
    });

    // Check if application already exists for this session
    const existingApplication = await prisma.loanApplication.findUnique({
      where: { sessionId },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          error: "Application already submitted for this session",
          applicationNumber: existingApplication.applicationNumber,
        },
        { status: 409 }
      );
    }

    // Generate unique application number
    const applicationNumber = generateApplicationNumber();

    // Create loan application
    const application = await prisma.loanApplication.create({
      data: {
        sessionId,
        applicationNumber,

        // Student information from verified credentials
        admissionNumber: credentials.admission_number,
        programme: credentials.programme,
        graduationYear: credentials.graduation_year,
        surname: credentials.surname,
        othernames: credentials.othernames,
        schoolName: credentials.school_name,
        department: credentials.department,
        matricNumber: credentials.matric_number,
        nationalIdNumber: credentials.national_id_number,
        bankVerificationNumber: credentials.bank_verification_number,
        schoolNucNumber: credentials.school_nuc_number,
        jambNumber: credentials.jamb_number,
        dateOfBirth: credentials.date_of_birth,
        dateIssued: credentials.date_issued,
        dateExpiry: credentials.date_expiry,

        // Contact information
        contactPhone,
        contactEmail,

        // Status
        status: "pending",
        submittedAt: new Date(),

        // Store complete verified credentials
        verifiedCredentials: JSON.stringify(credentials),
        applicationData: JSON.stringify(body),
      },
    });

    logger.info("Application submitted successfully", {
      sessionId,
      applicationNumber: application.applicationNumber,
      applicationId: application.id,
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        submittedAt: application.submittedAt,
        studentName: `${application.surname} ${application.othernames}`,
        programme: application.programme,
      },
    });
  } catch (error) {
    logger.error("Application submission error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications/submit?sessionId={sessionId}
 * Get application status by session ID
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const application = await prisma.loanApplication.findUnique({
      where: { sessionId },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        applicationNumber: application.applicationNumber,
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        reviewNotes: application.reviewNotes,
        approvedAmount: application.approvedAmount,
        studentName: `${application.surname} ${application.othernames}`,
        programme: application.programme,
        schoolName: application.schoolName,
      },
    });
  } catch (error) {
    logger.error("Get application error", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: "Failed to retrieve application" },
      { status: 500 }
    );
  }
}
