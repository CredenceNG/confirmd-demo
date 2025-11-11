import { NextRequest, NextResponse } from "next/server";
import { verifyProofPresentation } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";

/**
 * POST /api/proofs/verify
 * Verify a proof presentation after it's been received
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofId } = body;

    if (!proofId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameter",
            error_description: "proofId is required",
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

    logger.proofFlow("VERIFY_START", {
      proofId,
      orgId,
      endpoint: "/api/proofs/verify"
    });

    const result = await verifyProofPresentation(proofId, orgId);

    logger.proofFlow("VERIFY_RESULT", {
      proofId,
      success: result.success,
      hasData: !!result.data,
      verified: result.data?.verified,
    });

    if (!result.success) {
      logger.warn("API: Verification failed", { proofId, error: result.error });
      return NextResponse.json(result, { status: 400 });
    }

    // Fetch proof details with presentation attributes after verification
    if (result.data && result.data.verified) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const { confirmdClient } = await import("@/lib/api/confirmd-client");

        logger.proofFlow("FETCH_ATTRIBUTES_START", {
          proofId,
          orgId,
          endpoint: "/verified-proofs (getProofDetails)"
        });

        // Fetch verified proof details which returns attributes as direct properties
        const proofDetails = await confirmdClient.getProofDetails(orgId, proofId);

        // Log the raw response structure for debugging
        logger.info("RAW VERIFIED PROOF DETAILS RESPONSE", {
          proofId,
          success: proofDetails.success,
          dataType: typeof proofDetails.data,
          isArray: Array.isArray(proofDetails.data),
          dataLength: Array.isArray(proofDetails.data) ? proofDetails.data.length : 0,
          rawData: JSON.stringify(proofDetails.data),
          firstCredential: Array.isArray(proofDetails.data) && proofDetails.data.length > 0
            ? JSON.stringify(proofDetails.data[0])
            : null,
        });

        let attributes: any = {};

        if (proofDetails.success && proofDetails.data) {
          // The ConfirmD Platform API returns attributes as an array where EACH object
          // contains ONE attribute (plus schemaId/credDefId metadata).
          // The API returns exactly the attributes we requested in our proof request.
          if (Array.isArray(proofDetails.data) && proofDetails.data.length > 0) {
            // Iterate through each object and extract its attribute
            proofDetails.data.forEach((credentialData: any) => {
              // Remove schemaId and credDefId metadata, keep only the actual attribute
              const { schemaId, credDefId, ...extractedAttribute } = credentialData;
              // Merge this attribute into the attributes object
              Object.assign(attributes, extractedAttribute);
            });

            logger.proofFlow("FETCH_ATTRIBUTES_RESULT", {
              proofId,
              success: true,
              hasData: true,
              hasAttributes: Object.keys(attributes).length > 0,
              attributeCount: Object.keys(attributes).length,
              attributeNames: Object.keys(attributes),
            });
          } else {
            logger.proofFlow("FETCH_ATTRIBUTES_RESULT", {
              proofId,
              success: proofDetails.success,
              hasData: true,
              hasAttributes: false,
              dataStructure: "not an array or empty array",
            });
          }
        } else {
          logger.proofFlow("FETCH_ATTRIBUTES_RESULT", {
            proofId,
            success: proofDetails.success,
            hasData: !!proofDetails.data,
            error: proofDetails.error,
          });
        }

        if (attributes && Object.keys(attributes).length > 0) {
          logger.attributes("EXTRACTED", {
            proofId,
            attributeCount: Object.keys(attributes).length,
            attributeNames: Object.keys(attributes),
            sampleAttribute: Object.entries(attributes)[0],
          });

          // Update proof request with attributes
          await prisma.proofRequest.update({
            where: { proofId },
            data: {
              presentedAttributes: JSON.stringify(attributes),
              verified: true,
              status: "done",
              verifiedAt: new Date(),
              updatedAt: new Date(),
            },
          });

          logger.proofFlow("DATABASE_UPDATED", {
            proofId,
            attributeCount: Object.keys(attributes).length,
            status: "done",
            verified: true,
          });
        } else {
          logger.warn("No attributes found in verified proof details", {
            proofId,
            success: proofDetails.success,
            hasData: !!proofDetails.data,
            dataType: typeof proofDetails.data,
            isArray: Array.isArray(proofDetails.data),
            error: proofDetails.error,
          });
        }
      } catch (dbError: any) {
        logger.error("Failed to fetch or save attributes", {
          proofId,
          error: dbError.message,
          stack: dbError.stack,
        });
        // Don't fail the request, just log the error
      }
    }

    logger.proofFlow("VERIFY_COMPLETE", {
      proofId,
      verified: result.data?.verified,
      success: result.success,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    logger.error("API: Error verifying proof", {
      error: error.message,
      stack: error.stack,
    });

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
