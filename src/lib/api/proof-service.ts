/**
 * Proof Request Service
 *
 * Handles proof request operations including:
 * - Creating and sending proof requests
 * - Tracking proof request state
 * - Processing proof responses
 * - Verifying presentations
 */

import { prisma } from "../prisma";
import { confirmdClient } from "./confirmd-client";
import { logger } from "./logger";
import {
  ProofRequestType,
  ProofAttributeRequest,
  StudentCredentialAttributes,
  ConfirmdWebhookPayload,
} from "./types";
import { buildProofAttributeRequests, getProofRequestComment, getProofAttributes } from "../proof-config";

/**
 * Create and send a proof request to an existing connection
 *
 * @param sessionId - Session ID from connection
 * @param connectionId - Connection ID from ConfirmD
 * @param orgId - Organization ID
 * @param customAttributes - Optional custom proof attributes (for multi-credential proof requests like NYSC)
 * @param customComment - Optional custom comment/description
 * @returns Proof request record
 */
export async function createProofRequest(
  sessionId: string,
  connectionId: string,
  orgId: string,
  customAttributes?: ProofAttributeRequest[],
  customComment?: string
) {
  try {
    logger.info("Creating proof request", {
      sessionId,
      connectionId,
      orgId,
      hasCustomAttributes: !!customAttributes,
    });

    // Build proof attributes from environment config or use custom attributes
    const attributes = customAttributes || buildProofAttributeRequests();
    const comment = customComment || getProofRequestComment();

    logger.info("Built proof attributes", {
      attributeCount: attributes.length,
      sampleAttribute: attributes[0],
      hasCustomAttributes: !!customAttributes,
      allAttributes: JSON.stringify(attributes).substring(0, 500),
    });

    const payload = {
      connectionId,
      comment,
      orgId,
      proofFormats: {
        indy: {
          attributes,
        },
      },
    };

    logger.info("Sending proof request to ConfirmD Platform", {
      payload: JSON.stringify(payload).substring(0, 1000),
      requestType: ProofRequestType.INDY,
    });

    // Send proof request to ConfirmD Platform
    const response = await confirmdClient.createProofRequest(
      payload,
      ProofRequestType.INDY
    );

    if (!response.success || !response.data) {
      logger.error("Failed to create proof request", {
        error: response.error,
        fullResponse: response,
      });
      throw new Error(
        response.error?.error_description || "Failed to create proof request"
      );
    }

    const proofRecord = response.data;

    // Store proof request in database
    const dbProof = await prisma.proofRequest.create({
      data: {
        sessionId,
        proofId: proofRecord.proofId,
        connectionId,
        status: "request-sent",
        comment,
        requestedAttributes: JSON.stringify(attributes),
      },
    });

    logger.info("Proof request created successfully", {
      sessionId,
      proofId: proofRecord.proofId,
      connectionId,
    });

    return {
      success: true,
      data: {
        proofId: proofRecord.proofId,
        sessionId,
        status: "request-sent",
      },
    };
  } catch (error: any) {
    logger.error("Error creating proof request", {
      sessionId,
      connectionId,
      error: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: {
        error: "proof_request_failed",
        error_description: error.message || "Failed to create proof request",
      },
    };
  }
}

/**
 * Get proof request by session ID
 *
 * @param sessionId - Session ID
 * @returns Proof request record
 */
export async function getProofBySessionId(sessionId: string) {
  try {
    const proof = await prisma.proofRequest.findUnique({
      where: { sessionId },
    });

    if (!proof) {
      return {
        success: false,
        error: {
          error: "proof_not_found",
          error_description: "Proof request not found",
        },
      };
    }

    return {
      success: true,
      data: {
        ...proof,
        requestedAttributes: JSON.parse(proof.requestedAttributes),
        presentedAttributes: proof.presentedAttributes
          ? JSON.parse(proof.presentedAttributes)
          : null,
      },
    };
  } catch (error: any) {
    logger.error("Error getting proof request", {
      sessionId,
      error: error.message,
    });

    return {
      success: false,
      error: {
        error: "database_error",
        error_description: error.message,
      },
    };
  }
}

/**
 * Process proof webhook event
 *
 * @param payload - Webhook payload from ConfirmD Platform
 */
export async function processProofWebhookEvent(
  payload: ConfirmdWebhookPayload
): Promise<void> {
  logger.info("=== PROOF SERVICE: Processing webhook event ===", {
    type: payload.type,
    proofId: payload.id,
    state: payload.state,
    connectionId: payload.connectionId,
    orgId: payload.orgId,
    allPayloadKeys: Object.keys(payload),
  });

  try {
    // Store webhook event
    logger.info("PROOF SERVICE: Storing webhook event in database", {
      webhookId: payload.id,
      topic: `proofs.${payload.state}`,
      organizationId: payload.orgId,
      proofId: payload.id,
      connectionId: payload.connectionId,
    });

    await prisma.webhookEvent.upsert({
      where: { webhookId: payload.id },
      create: {
        webhookId: payload.id,
        topic: `proofs.${payload.state}`,
        organizationId: payload.orgId,
        agentId: payload.orgId,
        connectionId: payload.connectionId || null,
        proofId: payload.id,
        payload: JSON.stringify(payload),
        processed: false,
      },
      update: {
        topic: `proofs.${payload.state}`,
        payload: JSON.stringify(payload),
        processed: false,
      },
    });

    logger.info("PROOF SERVICE: Webhook event stored successfully", {
      webhookId: payload.id,
    });
  } catch (dbError: any) {
    logger.error("PROOF SERVICE: Failed to store webhook event", {
      webhookId: payload.id,
      error: dbError.message,
      stack: dbError.stack,
    });
    throw dbError;
  }

  logger.info("PROOF SERVICE: Checking payload type", {
    type: payload.type,
    state: payload.state,
    isProofType: payload.type === "Proof",
    isProofRequestType: payload.type === "ProofRequest",
    isConnectionWithProofState: payload.type === "Connection" && payload.state && ["request-sent", "presentation-received", "done", "abandoned"].includes(payload.state),
  });

  // Accept Proof, ProofRequest, or Connection types with proof-related states
  const isProofEvent =
    payload.type === "Proof" ||
    payload.type === "ProofRequest" ||
    (payload.type === "Connection" && payload.state && ["request-sent", "presentation-received", "done", "abandoned"].includes(payload.state));

  if (isProofEvent) {
    logger.info("PROOF SERVICE: Looking up proof request by proofId", {
      proofId: payload.id,
    });

    // Find proof request by proofId
    let proofRequest = await prisma.proofRequest.findFirst({
      where: { proofId: payload.id },
    });

    logger.info("PROOF SERVICE: Proof request lookup by proofId result", {
      proofId: payload.id,
      found: !!proofRequest,
      sessionId: proofRequest?.sessionId,
    });

    // If not found, try by connectionId (for first proof webhook)
    if (!proofRequest && payload.connectionId) {
      logger.info("PROOF SERVICE: Trying to find proof request by connectionId", {
        connectionId: payload.connectionId,
      });

      proofRequest = await prisma.proofRequest.findFirst({
        where: {
          connectionId: payload.connectionId,
          status: "request-sent",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (proofRequest) {
        logger.info("PROOF SERVICE: Matched proof webhook to request by connectionId", {
          proofId: payload.id,
          sessionId: proofRequest.sessionId,
          connectionId: payload.connectionId,
        });
      } else {
        logger.warn("PROOF SERVICE: No proof request found by connectionId", {
          connectionId: payload.connectionId,
        });
      }
    }

    if (proofRequest) {
      logger.info("PROOF SERVICE: Found proof request, will process", {
        proofRequestId: proofRequest.id,
        sessionId: proofRequest.sessionId,
        currentStatus: proofRequest.status,
        incomingState: payload.state,
      });
      // Map ConfirmD states to our proof states
      const statusMap: Record<string, string> = {
        "request-sent": "request-sent",
        "presentation-received": "presentation-received",
        done: "done",
        abandoned: "abandoned",
      };

      const mappedStatus = statusMap[payload.state] || payload.state;

      // If presentation received, fetch and store the attributes
      if (mappedStatus === "presentation-received" || mappedStatus === "done") {
        logger.info("PROOF SERVICE: Fetching proof details", {
          mappedStatus,
          proofId: payload.id,
          sessionId: proofRequest.sessionId,
        });

        try {
          const orgId = process.env.CONFIRMD_ORG_ID!;

          logger.info("PROOF SERVICE: Calling getProofDetails API", {
            orgId,
            proofId: payload.id,
          });

          const proofDetails = await confirmdClient.getProofDetails(orgId, payload.id);

          logger.info("PROOF SERVICE: getProofDetails API response", {
            proofId: payload.id,
            success: proofDetails.success,
            hasData: !!proofDetails.data,
            dataType: typeof proofDetails.data,
            isArray: Array.isArray(proofDetails.data),
            dataLength: Array.isArray(proofDetails.data) ? proofDetails.data.length : 0,
            rawData: JSON.stringify(proofDetails.data),
            error: proofDetails.error,
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
            } else {
              // Fallback for old structure
              attributes = (proofDetails.data as any).attributes || {};
            }

            logger.info("Proof attributes structure", {
              sessionId: proofRequest.sessionId,
              proofId: payload.id,
              attributesType: typeof attributes,
              attributesKeys: attributes ? Object.keys(attributes) : null,
              attributeCount: attributes ? Object.keys(attributes).length : 0,
              sampleAttribute: attributes ? Object.entries(attributes)[0] : null,
            });

            // Update proof request with presentation details
            await prisma.proofRequest.update({
              where: { id: proofRequest.id },
              data: {
                status: mappedStatus,
                proofId: payload.id,
                presentedAttributes: JSON.stringify(attributes),
                verified: proofDetails.success && mappedStatus === "done",
                ...(mappedStatus === "done" && { verifiedAt: new Date() }),
                updatedAt: new Date(),
              },
            });

            logger.info("Updated proof request with presentation", {
              sessionId: proofRequest.sessionId,
              proofId: payload.id,
              status: mappedStatus,
              verified: proofDetails.success && mappedStatus === "done",
            });

            // Broadcast via WebSocket
            const wsManager = (global as any).wsManager;
            if (wsManager && typeof wsManager.broadcastStatusUpdate === "function") {
              wsManager.broadcastStatusUpdate(
                proofRequest.sessionId,
                mappedStatus,
                {
                  proofId: payload.id,
                  verified: proofDetails.success && mappedStatus === "done",
                  status: mappedStatus,
                  eventType: "proof",  // Changed from 'type' to 'eventType' to avoid collision
                }
              );
            }
          }
        } catch (error: any) {
          logger.error("Failed to fetch proof details", {
            proofId: payload.id,
            error: error.message,
          });
        }
      } else {
        // Just update status
        await prisma.proofRequest.update({
          where: { id: proofRequest.id },
          data: {
            status: mappedStatus,
            proofId: payload.id,
            updatedAt: new Date(),
          },
        });

        logger.info("Updated proof request status", {
          sessionId: proofRequest.sessionId,
          proofId: payload.id,
          status: mappedStatus,
        });

        // Broadcast via WebSocket
        const wsManager = (global as any).wsManager;
        if (wsManager && typeof wsManager.broadcastStatusUpdate === "function") {
          wsManager.broadcastStatusUpdate(
            proofRequest.sessionId,
            mappedStatus,
            {
              proofId: payload.id,
              status: mappedStatus,
              eventType: "proof",  // Changed from 'type' to 'eventType' to avoid collision
            }
          );
        }
      }
    } else {
      logger.warn("No proof request found for webhook event", {
        proofId: payload.id,
        connectionId: payload.connectionId,
      });
    }
  }

  // Mark webhook as processed
  await prisma.webhookEvent.updateMany({
    where: { webhookId: payload.id },
    data: { processed: true, processedAt: new Date() },
  });
}

/**
 * Extract student credential attributes from proof presentation
 *
 * @param presentedAttributes - Raw attributes from proof
 * @returns Structured student credential attributes
 */
export function extractStudentAttributes(
  presentedAttributes: Record<string, { raw: string; encoded: string }>
): StudentCredentialAttributes {
  const attributes: StudentCredentialAttributes = {};

  for (const [key, value] of Object.entries(presentedAttributes)) {
    const attrName = key as keyof StudentCredentialAttributes;
    attributes[attrName] = value.raw;
  }

  return attributes;
}

/**
 * Verify a proof presentation
 *
 * @param proofId - Proof ID
 * @param orgId - Organization ID
 * @returns Verification result
 */
export async function verifyProofPresentation(proofId: string, orgId: string) {
  try {
    logger.info("Verifying proof presentation", { proofId, orgId });

    const response = await confirmdClient.verifyProof(orgId, proofId);

    if (!response.success || !response.data) {
      logger.error("Failed to verify proof", {
        proofId,
        error: response.error,
      });
      return {
        success: false,
        error: response.error,
      };
    }

    // Update database
    await prisma.proofRequest.updateMany({
      where: { proofId },
      data: {
        verified: response.data.verified,
        verifiedAt: new Date(),
      },
    });

    logger.info("Proof verification completed", {
      proofId,
      verified: response.data.verified,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    logger.error("Error verifying proof", {
      proofId,
      error: error.message,
    });

    return {
      success: false,
      error: {
        error: "verification_failed",
        error_description: error.message,
      },
    };
  }
}
