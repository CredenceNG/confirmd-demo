/**
 * Confirmd Platform Webhook Endpoint
 *
 * Receives webhook notifications from the Confirmd Platform about:
 * - Connection status changes
 * - Credential offers and issuances
 * - Presentation requests and verifications
 */

import { NextRequest, NextResponse } from "next/server";
import { processWebhookEvent } from "@/lib/api/connection-service";
import { processProofWebhookEvent } from "@/lib/api/proof-service";
import { logger } from "@/lib/api/logger";
import type { ConfirmdWebhookPayload } from "@/lib/api/types";

/**
 * POST handler for Confirmd Platform webhooks
 */
export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  let rawPayload: any = null;

  try {
    // Log all incoming headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = key.toLowerCase() === 'x-api-key' ? `${value.substring(0, 8)}...` : value;
    });

    logger.info("=== WEBHOOK REQUEST START ===", {
      method: request.method,
      url: request.url,
      headers,
    });

    // Verify webhook authentication using X-API-Key header
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.WEBHOOK_SECRET;

    if (!expectedKey) {
      logger.error("Webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook configuration error" },
        { status: 500 }
      );
    }

    if (apiKey !== expectedKey) {
      logger.warn("Invalid webhook API key", {
        providedKey: apiKey ? `${apiKey.substring(0, 8)}...` : "none",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse webhook payload
    rawPayload = await request.json();

    // Log the raw payload for debugging
    logger.info("RAW WEBHOOK PAYLOAD", {
      rawPayload: JSON.stringify(rawPayload, null, 2),
      payloadKeys: Object.keys(rawPayload),
      hasData: !!rawPayload.data,
      dataKeys: rawPayload.data ? Object.keys(rawPayload.data) : null,
    });

    // Transform payload structure from Platform format to flat format
    // The Platform sends webhooks with important fields nested inside a 'data' object:
    // {
    //   "type": "Connection",
    //   "timestamp": "...",
    //   "orgId": "...",
    //   "tenantId": "...",
    //   "data": {
    //     "id": "...",
    //     "state": "...",
    //     "connectionId": "...",
    //     ...other fields
    //   }
    // }
    // We flatten this by merging the data object into the top level for easier access
    const payload: ConfirmdWebhookPayload = {
      ...rawPayload,
      ...(rawPayload.data || {}),
      // Preserve top-level fields (don't let data override these)
      timestamp: rawPayload.timestamp,
      type: rawPayload.type,
      orgId: rawPayload.orgId,
      tenantId: rawPayload.tenantId,
    };

    // Log the transformed payload
    logger.info("TRANSFORMED WEBHOOK PAYLOAD", {
      type: payload.type,
      state: payload.state,
      connectionId: payload.connectionId || payload.id,
      proofId: payload.proofId || payload.id,
      theirLabel: payload.theirLabel,
      orgId: payload.orgId,
      timestamp: payload.timestamp,
      allKeys: Object.keys(payload),
    });

    // Process the webhook event based on type and state
    // Proof-related states should be routed to proof service
    const proofStates = ["request-sent", "presentation-received", "done", "abandoned"];
    const isProofEvent =
      payload.type === "Proof" ||
      payload.type === "ProofRequest" ||
      (payload.type === "Connection" && payload.state && proofStates.includes(payload.state));

    logger.info("WEBHOOK ROUTING DECISION", {
      type: payload.type,
      state: payload.state,
      isProofEvent,
      willRouteToProofService: isProofEvent,
      willRouteToConnectionService: !isProofEvent && payload.type === "Connection",
    });

    if (isProofEvent) {
      logger.info("ROUTING TO PROOF SERVICE", {
        type: payload.type,
        state: payload.state,
        proofId: payload.proofId || payload.id,
      });

      try {
        await processProofWebhookEvent(payload);
        logger.info("PROOF SERVICE PROCESSING COMPLETE", {
          type: payload.type,
          state: payload.state,
          proofId: payload.proofId || payload.id,
        });
      } catch (proofError: any) {
        logger.error("PROOF SERVICE PROCESSING FAILED", {
          type: payload.type,
          state: payload.state,
          proofId: payload.proofId || payload.id,
          error: proofError.message,
          stack: proofError.stack,
        });
        throw proofError;
      }
    } else if (payload.type === "Connection") {
      logger.info("ROUTING TO CONNECTION SERVICE", {
        type: payload.type,
        state: payload.state,
        connectionId: payload.connectionId || payload.id,
      });

      // Ensure connectionId is set (use id as fallback)
      payload.connectionId = payload.connectionId || payload.id;

      try {
        await processWebhookEvent(payload);
        logger.info("CONNECTION SERVICE PROCESSING COMPLETE", {
          type: payload.type,
          state: payload.state,
          connectionId: payload.connectionId,
        });
      } catch (connError: any) {
        logger.error("CONNECTION SERVICE PROCESSING FAILED", {
          type: payload.type,
          state: payload.state,
          connectionId: payload.connectionId,
          error: connError.message,
          stack: connError.stack,
        });
        throw connError;
      }
    } else if (payload.type === "Credential") {
      logger.info("ROUTING TO CONNECTION SERVICE (CREDENTIAL EVENT)", {
        type: payload.type,
        state: payload.state,
        connectionId: payload.connectionId || payload.id,
      });

      // Credential events should be broadcast via WebSocket
      // Use connection service to broadcast to the appropriate session
      payload.connectionId = payload.connectionId || payload.id;

      try {
        await processWebhookEvent(payload);
        logger.info("CREDENTIAL EVENT PROCESSING COMPLETE", {
          type: payload.type,
          state: payload.state,
          connectionId: payload.connectionId,
        });
      } catch (credError: any) {
        logger.error("CREDENTIAL EVENT PROCESSING FAILED", {
          type: payload.type,
          state: payload.state,
          connectionId: payload.connectionId,
          error: credError.message,
          stack: credError.stack,
        });
        throw credError;
      }
    } else {
      logger.warn("Unknown webhook type", {
        type: payload.type,
        state: payload.state,
        rawPayload: JSON.stringify(rawPayload),
      });
    }

    const processingTime = Date.now() - requestStartTime;
    const response = {
      received: true,
      type: payload.type,
      connectionId: payload.connectionId,
      state: payload.state,
      timestamp: new Date().toISOString(),
    };

    logger.info("=== WEBHOOK RESPONSE SUCCESS ===", {
      processingTimeMs: processingTime,
      response,
    });

    // Return 200 immediately to acknowledge receipt
    return NextResponse.json(response);
  } catch (error: any) {
    const processingTime = Date.now() - requestStartTime;

    logger.error("=== WEBHOOK PROCESSING ERROR ===", {
      processingTimeMs: processingTime,
      error: error.message,
      stack: error.stack,
      rawPayload: rawPayload ? JSON.stringify(rawPayload, null, 2) : "null",
      errorName: error.name,
      errorCode: error.code,
    });

    // Still return 200 to prevent retries for malformed payloads
    return NextResponse.json(
      {
        received: false,
        error: "Internal processing error",
      },
      { status: 200 }
    );
  }
}

/**
 * GET handler for webhook health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Confirmd webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
