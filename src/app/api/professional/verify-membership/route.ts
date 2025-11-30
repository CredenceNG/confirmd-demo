/**
 * Professional Conference - Verify Membership API
 *
 * Verifies the submitted professional membership proof presentation
 * and returns the verified membership data including designation for discount calculation
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import { getConnectionSession } from "@/lib/api/connection-service";
import axios from "axios";

/**
 * POST /api/professional/verify-membership
 * Verify professional membership proof presentation
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

    logger.info("Professional Conference: Verifying membership proof", {
      proofId,
      sessionId,
    });

    // Get the connectionId from the session
    const session = await getConnectionSession(sessionId);

    if (!session) {
      logger.error("Failed to retrieve session", { sessionId });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "session_not_found",
            error_description: "Could not find session",
          },
        },
        { status: 404 }
      );
    }

    const connectionId = session.connectionId;

    if (!connectionId) {
      logger.error("No connectionId found in session", { sessionId });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "no_connection",
            error_description: "No active connection found for this session",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Found connectionId from session", { connectionId });

    // Get access token
    const token = await getAccessToken();
    const orgId = process.env.CONFIRMD_ORG_ID;

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: "CONFIRMD_ORG_ID not configured",
          },
        },
        { status: 500 }
      );
    }

    // Fetch the verified proof details with attributes from the API
    // NOTE: Use /verified-proofs endpoint (not /proofs) to get the revealed attributes
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/verified-proofs/${proofId}`;

    logger.info("Professional Conference: Fetching verified proof details", {
      proofId,
      apiUrl,
    });

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    // Log raw response structure for debugging
    logger.info("Professional Conference: RAW VERIFIED PROOF RESPONSE", {
      proofId,
      statusCode: response.data.statusCode,
      message: response.data.message,
      dataType: typeof response.data.data,
      isArray: Array.isArray(response.data.data),
      dataLength: Array.isArray(response.data.data) ? response.data.data.length : 0,
      rawResponse: JSON.stringify(response.data).substring(0, 2000), // First 2000 chars
    });

    // The /verified-proofs endpoint returns attributes as an array
    // Each object contains one attribute + schemaId/credDefId metadata
    const proofData = response.data.data;

    if (!proofData || !Array.isArray(proofData) || proofData.length === 0) {
      logger.error("Professional Conference: No attributes in verified proof", {
        hasData: !!proofData,
        isArray: Array.isArray(proofData),
        dataLength: Array.isArray(proofData) ? proofData.length : 0,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "invalid_proof",
            error_description: "Proof does not contain revealed attributes",
          },
        },
        { status: 400 }
      );
    }

    // Convert array of single-attribute objects into a flat attributes object
    const attributes: Record<string, string> = {};
    proofData.forEach((item: any) => {
      // Remove schemaId and credDefId, keep only the attribute
      const { schemaId, credDefId, ...attr } = item;
      Object.assign(attributes, attr);
    });

    // Log extracted attributes
    logger.info("Professional Conference: EXTRACTED ATTRIBUTES", {
      proofId,
      attributeKeys: Object.keys(attributes),
      attributeCount: Object.keys(attributes).length,
      rawAttributes: JSON.stringify(attributes),
    });

    const extractAttributeValue = (attrName: string): string => {
      // Direct lookup in the attributes object
      const value = attributes[attrName] || "N/A";

      // Log each attribute extraction
      logger.info("Professional Conference: EXTRACT_ATTRIBUTE", {
        proofId,
        requestedAttr: attrName,
        found: attrName in attributes,
        extractedValue: value,
      });

      return value;
    };

    // Map the actual credential attributes to membership data
    // Using attributes from Statement of Results + NYSC Certificate
    const membershipData = {
      // From Statement of Results
      surname: extractAttributeValue("surname"),
      othernames: extractAttributeValue("othernames"),
      matricNumber: extractAttributeValue("matric_number"),
      programme: extractAttributeValue("programme"),
      classOfDegree: extractAttributeValue("class_of_degree"),
      yearEnd: extractAttributeValue("year_end"),
      awardedDegree: extractAttributeValue("awarded_degree"),
      // From NYSC Certificate
      fullname: extractAttributeValue("fullname"),
      callUpNumber: extractAttributeValue("call_up_number"),
      startDate: extractAttributeValue("start_date"),
      endDate: extractAttributeValue("end_date"),
      certificateNumber: extractAttributeValue("certificate_number"),
      issuedDate: extractAttributeValue("issued_date"),
    };

    // Log final extracted membership data
    logger.info("Professional Conference: EXTRACTED MEMBERSHIP DATA", {
      proofId,
      membershipData: JSON.stringify(membershipData),
      hasValidData: Object.values(membershipData).some(v => v !== "N/A"),
      naCount: Object.values(membershipData).filter(v => v === "N/A").length,
      totalFields: Object.keys(membershipData).length,
    });

    logger.info("Professional Conference: Membership verified successfully", {
      fullname: membershipData.fullname,
      surname: membershipData.surname,
      programme: membershipData.programme,
      classOfDegree: membershipData.classOfDegree,
      certificateNumber: membershipData.certificateNumber,
    });

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        membership: membershipData,
        proofId,
        message: "Professional membership verified successfully",
      },
    });
  } catch (error: any) {
    logger.error("Professional Conference: Error verifying proof", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("Professional Conference: API Response Error", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            error: "api_error",
            error_description: error.response?.data?.message || "Failed to verify proof",
            details: error.response?.data,
          },
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to verify proof",
        },
      },
      { status: 500 }
    );
  }
}
