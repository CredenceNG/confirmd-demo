/**
 * NYSC Portal - Request ID Card for Authentication
 *
 * Sends a proof request for NYSC ID Card credential
 */

import { NextRequest, NextResponse } from "next/server";
import { createProofRequest } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";
import { ProofAttributeRequest } from "@/lib/api/types";

/**
 * POST /api/nysc/portal/request-id-card
 * Send proof request for NYSC ID Card authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, connectionId } = body;

    if (!sessionId || !connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "sessionId and connectionId are required",
          },
        },
        { status: 400 }
      );
    }

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

    logger.info("NYSC Portal: Creating proof request for ID Card authentication", {
      sessionId,
      connectionId,
      orgId,
    });

    // Request NYSC ID Card attributes for authentication
    const idCardAttributes: ProofAttributeRequest[] = [
      {
        attributeName: "surname",
        schemaId: process.env.NYSC_ID_CARD_SCHEMA_ID || "",
        ...(process.env.NYSC_ID_CARD_CRED_DEF_ID && { credDefId: process.env.NYSC_ID_CARD_CRED_DEF_ID }),
      },
      {
        attributeName: "othernames",
        schemaId: process.env.NYSC_ID_CARD_SCHEMA_ID || "",
        ...(process.env.NYSC_ID_CARD_CRED_DEF_ID && { credDefId: process.env.NYSC_ID_CARD_CRED_DEF_ID }),
      },
      {
        attributeName: "id_number",
        schemaId: process.env.NYSC_ID_CARD_SCHEMA_ID || "",
        ...(process.env.NYSC_ID_CARD_CRED_DEF_ID && { credDefId: process.env.NYSC_ID_CARD_CRED_DEF_ID }),
      },
      {
        attributeName: "service_state",
        schemaId: process.env.NYSC_ID_CARD_SCHEMA_ID || "",
        ...(process.env.NYSC_ID_CARD_CRED_DEF_ID && { credDefId: process.env.NYSC_ID_CARD_CRED_DEF_ID }),
      },
      {
        attributeName: "Service_start_date",
        schemaId: process.env.NYSC_ID_CARD_SCHEMA_ID || "",
        ...(process.env.NYSC_ID_CARD_CRED_DEF_ID && { credDefId: process.env.NYSC_ID_CARD_CRED_DEF_ID }),
      },
      {
        attributeName: "service_end_date",
        schemaId: process.env.NYSC_ID_CARD_SCHEMA_ID || "",
        ...(process.env.NYSC_ID_CARD_CRED_DEF_ID && { credDefId: process.env.NYSC_ID_CARD_CRED_DEF_ID }),
      },
    ];

    logger.info("NYSC Portal: ID Card proof attributes", {
      attributeCount: idCardAttributes.length,
      attributes: idCardAttributes.map(attr => attr.attributeName),
    });

    // Create proof request
    const result = await createProofRequest(
      sessionId,
      connectionId,
      orgId,
      idCardAttributes,
      "Please share your NYSC ID Card to access the NYSC Portal"
    );

    if (!result.success) {
      logger.error("NYSC Portal: Failed to create proof request", {
        error: result.error,
      });
      return NextResponse.json(result, { status: 400 });
    }

    logger.info("NYSC Portal: Proof request created successfully", {
      proofId: result.data?.proofId,
      status: result.data?.status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("NYSC Portal: Error creating proof request", {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to create proof request",
        },
      },
      { status: 500 }
    );
  }
}
