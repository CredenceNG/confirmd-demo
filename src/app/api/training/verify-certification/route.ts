/**
 * Training Certifications - Verify Certification API
 *
 * Verifies the submitted training certification proof presentation
 * and returns the verified certification data
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import { getConnectionSession } from "@/lib/api/connection-service";
import axios from "axios";

/**
 * POST /api/training/verify-certification
 * Verify training certification proof presentation
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

    logger.info("[Training Verify] Verifying certification proof", {
      proofId,
      sessionId,
    });

    // Get the connectionId from the session
    const session = await getConnectionSession(sessionId);

    if (!session) {
      logger.error("[Training Verify] Failed to retrieve session", { sessionId });
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
      logger.error("[Training Verify] No connectionId found in session", { sessionId });
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

    logger.info("[Training Verify] Found connectionId from session", { connectionId });

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

    logger.info("[Training Verify] Fetching verified proof details", {
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
    logger.info("[Training Verify] RAW VERIFIED PROOF RESPONSE", {
      proofId,
      statusCode: response.data.statusCode,
      message: response.data.message,
      dataType: typeof response.data.data,
      isArray: Array.isArray(response.data.data),
      dataLength: Array.isArray(response.data.data) ? response.data.data.length : 0,
      rawResponse: JSON.stringify(response.data).substring(0, 2000),
    });

    // The /verified-proofs endpoint returns attributes as an array
    // Each object contains one attribute + schemaId/credDefId metadata
    const proofData = response.data.data;

    if (!proofData || !Array.isArray(proofData) || proofData.length === 0) {
      logger.error("[Training Verify] No attributes in verified proof", {
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
    logger.info("[Training Verify] EXTRACTED ATTRIBUTES", {
      proofId,
      attributeKeys: Object.keys(attributes),
      attributeCount: Object.keys(attributes).length,
      rawAttributes: JSON.stringify(attributes),
    });

    const extractAttributeValue = (attrName: string): string => {
      const value = attributes[attrName] || "";
      return value;
    };

    // Map the credential attributes to certification data
    // Using snake_case attribute names as defined in the schema
    const certificationData = {
      surname: extractAttributeValue("surname"),
      othernames: extractAttributeValue("othernames"),
      nationalIdNumber: extractAttributeValue("national_id_number"),
      certificationTitle: extractAttributeValue("certification_title"),
      trainingOrganization: extractAttributeValue("training_organization"),
      courseCode: extractAttributeValue("course_code"),
      completionDate: extractAttributeValue("completion_date"),
      issueDate: extractAttributeValue("issue_date"),
      expiryDate: extractAttributeValue("expiry_date"),
      grade: extractAttributeValue("grade"),
      credentialNumber: extractAttributeValue("credential_number"),
      skills: extractAttributeValue("skills"),
    };

    // Log final extracted certification data
    logger.info("[Training Verify] EXTRACTED CERTIFICATION DATA", {
      proofId,
      certificationData: JSON.stringify(certificationData),
      hasValidData: Object.values(certificationData).some(v => v !== ""),
    });

    logger.info("[Training Verify] Certification verified successfully", {
      surname: certificationData.surname,
      certificationTitle: certificationData.certificationTitle,
      trainingOrganization: certificationData.trainingOrganization,
      credentialNumber: certificationData.credentialNumber,
    });

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        certification: certificationData,
        proofId,
        message: "Training certification verified successfully",
      },
    });
  } catch (error: any) {
    logger.error("[Training Verify] Error verifying proof", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("[Training Verify] API Response Error", {
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
