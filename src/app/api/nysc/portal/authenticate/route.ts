/**
 * NYSC Portal - Authenticate User
 *
 * Verifies the NYSC ID Card proof and authenticates the user
 */

import { NextRequest, NextResponse } from "next/server";
import { confirmdClient } from "@/lib/api/confirmd-client";
import { logger } from "@/lib/api/logger";

/**
 * POST /api/nysc/portal/authenticate
 * Verify NYSC ID Card proof and authenticate user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofId, sessionId } = body;

    if (!proofId || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "proofId and sessionId are required",
          },
        },
        { status: 400 }
      );
    }

    logger.info("NYSC Portal: Verifying ID Card and authenticating user", {
      proofId,
      sessionId,
    });

    const orgId = process.env.NYSC_ORG_ID || process.env.CONFIRMD_ORG_ID;
    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: "NYSC_ORG_ID not configured",
          },
        },
        { status: 500 }
      );
    }

    // Fetch the NYSC ID Card proof details
    logger.info("NYSC Portal: Fetching ID Card proof details", { proofId, orgId });

    const proofDetailsResponse = await confirmdClient.getProofDetails(orgId, proofId);

    if (!proofDetailsResponse.success || !proofDetailsResponse.data) {
      logger.error("NYSC Portal: Failed to fetch proof details", {
        proofId,
        error: proofDetailsResponse.error,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "proof_fetch_failed",
            error_description: "Could not fetch NYSC ID Card proof details",
          },
        },
        { status: 500 }
      );
    }

    // Extract attributes from the proof
    const proofData = proofDetailsResponse.data;
    const attributes: Record<string, string> = {};

    // Log raw proof data for debugging
    logger.info("NYSC Portal: Raw proof data structure", {
      proofId,
      proofDataType: typeof proofData,
      isArray: Array.isArray(proofData),
      proofDataLength: Array.isArray(proofData) ? proofData.length : 'N/A',
    });

    if (Array.isArray(proofData) && proofData.length > 0) {
      proofData.forEach((credentialData: any, index: number) => {
        const { schemaId, credDefId, ...extractedAttribute } = credentialData;
        Object.assign(attributes, extractedAttribute);
        logger.info(`NYSC Portal: Extracted attributes from credential ${index}:`, { extractedAttribute });
      });
    }

    logger.info("NYSC Portal: Extracted ID Card attributes", {
      proofId,
      attributeCount: Object.keys(attributes).length,
      attributeNames: Object.keys(attributes),
      extractedAttributes: attributes,
    });

    // Validate required attributes
    const surname = attributes.surname;
    const othernames = attributes.othernames;
    const idNumber = attributes.id_number;

    if (!surname || !othernames || !idNumber) {
      logger.error("NYSC Portal: Missing required identity attributes", {
        proofId,
        hasSurname: !!surname,
        hasOthernames: !!othernames,
        hasIdNumber: !!idNumber,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "invalid_credentials",
            error_description: "NYSC ID Card is missing required information",
          },
        },
        { status: 400 }
      );
    }

    // Build corp member profile from verified credentials
    const corpMember = {
      surname,
      othernames,
      idNumber,
      serviceState: attributes.service_state || "Unknown",
      serviceStartDate: attributes.Service_start_date || attributes.service_start_date || "N/A",
      serviceEndDate: attributes.service_end_date || "N/A",
      // Optional attributes that might come from the comprehensive proof
      callUpNumber: attributes.call_up_number,
      phoneNumber: attributes.phone_number,
      school: attributes.school_name,
      programme: attributes.programme,
      bloodGroup: attributes.blood_group,
    };

    logger.info("NYSC Portal: Authentication successful", {
      sessionId,
      idNumber: corpMember.idNumber,
      name: `${corpMember.surname} ${corpMember.othernames}`,
    });

    // In a production system, you would:
    // 1. Create a session token/JWT
    // 2. Store session in database
    // 3. Return secure session token
    // For demo purposes, we'll just return the corp member data

    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        corpMember,
        sessionId, // In production, this would be a secure session token
        message: "Authentication successful",
      },
    });
  } catch (error: any) {
    logger.error("NYSC Portal: Error during authentication", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "authentication_failed",
          error_description: error.message || "Failed to authenticate user",
        },
      },
      { status: 500 }
    );
  }
}
