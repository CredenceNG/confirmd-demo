/**
 * Connection Session Management Service
 *
 * Handles tracking of DIDComm connection sessions for wallet integration
 */

import { prisma } from "../prisma";
import type {
  ConnectionSession,
  ConnectionStatus,
  ConfirmdWebhookPayload,
} from "./types";
import { logger } from "./logger";

/**
 * Create a new connection session
 */
export async function createConnectionSession(params: {
  invitationId: string;
  invitationUrl: string;
  requestType?: "registration" | "authentication";
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}): Promise<ConnectionSession> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  logger.info("Creating connection session", {
    sessionId,
    invitationId: params.invitationId,
    requestType: params.requestType,
  });

  const session = await prisma.connectionSession.create({
    data: {
      sessionId,
      invitationId: params.invitationId,
      invitationUrl: params.invitationUrl,
      status: "invitation",
      requestType: params.requestType || null,
      userAgent: params.userAgent || null,
      ipAddress: params.ipAddress || null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      expiresAt,
    },
  });

  return mapToConnectionSession(session);
}

/**
 * Get connection session by session ID
 */
export async function getConnectionSession(
  sessionId: string
): Promise<ConnectionSession | null> {
  const session = await prisma.connectionSession.findUnique({
    where: { sessionId },
  });

  if (!session) {
    return null;
  }

  return mapToConnectionSession(session);
}

/**
 * Get connection session by connection ID
 */
export async function getConnectionSessionByConnectionId(
  connectionId: string
): Promise<ConnectionSession | null> {
  const session = await prisma.connectionSession.findFirst({
    where: { connectionId },
  });

  if (!session) {
    return null;
  }

  return mapToConnectionSession(session);
}

/**
 * Update connection session status
 */
export async function updateConnectionSession(
  sessionId: string,
  updates: {
    status?: ConnectionStatus;
    connectionId?: string;
    theirDid?: string;
    theirLabel?: string;
  }
): Promise<ConnectionSession | null> {
  logger.info("Updating connection session", {
    sessionId,
    updates,
  });

  const session = await prisma.connectionSession.update({
    where: { sessionId },
    data: {
      status: updates.status,
      connectionId: updates.connectionId,
      theirDid: updates.theirDid,
      theirLabel: updates.theirLabel,
      updatedAt: new Date(),
    },
  });

  return mapToConnectionSession(session);
}

/**
 * Process webhook event and update connection session
 */
export async function processWebhookEvent(
  payload: ConfirmdWebhookPayload
): Promise<void> {
  logger.info("Processing webhook event", {
    type: payload.type,
    connectionId: payload.connectionId,
    state: payload.state,
    theirLabel: payload.theirLabel,
  });

  // Use orgId from payload or fallback to environment variable
  const orgId = payload.orgId || process.env.CONFIRMD_ORG_ID || "unknown";

  // Store webhook event (upsert to handle duplicates)
  await prisma.webhookEvent.upsert({
    where: { webhookId: payload.id },
    create: {
      webhookId: payload.id,
      topic: `connections.${payload.state}`,
      organizationId: orgId,
      agentId: orgId, // Using orgId as agentId since not separate in payload
      connectionId: payload.connectionId || null,
      payload: JSON.stringify(payload),
      processed: false,
    },
    update: {
      topic: `connections.${payload.state}`,
      connectionId: payload.connectionId || null,
      payload: JSON.stringify(payload),
      processed: false,
    },
  });

  // If this is a connection event, update the session
  if (payload.type === "Connection" && payload.connectionId) {
    // Strategy 1: Try to find session by connectionId (if already linked)
    let session = await prisma.connectionSession.findFirst({
      where: { connectionId: payload.connectionId },
    });

    // Strategy 2: If not found, find most recent session in "invitation" state
    // This works because we're using multi-use invitation - the newest session
    // without a connectionId is likely the one being connected
    if (!session) {
      session = await prisma.connectionSession.findFirst({
        where: {
          connectionId: null,
          status: "invitation",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (session) {
        logger.info("Matched webhook to most recent invitation session", {
          sessionId: session.sessionId,
          connectionId: payload.connectionId,
        });
      }
    }

    if (session) {
      // Map Confirmd states to our ConnectionStatus
      const statusMap: Record<string, ConnectionStatus> = {
        "response-sent": "response",
        "completed": "active",
        "active": "active",
        "request-sent": "request",
        "invitation": "invitation",
      };

      const mappedStatus = statusMap[payload.state] || payload.state as ConnectionStatus;

      const updatedSession = await prisma.connectionSession.update({
        where: { id: session.id },
        data: {
          status: mappedStatus,
          connectionId: payload.connectionId,
          theirLabel: payload.theirLabel || session.theirLabel,
          theirDid: payload.theirDid || session.theirDid,
          updatedAt: new Date(),
        },
      });

      logger.info("Updated session from webhook", {
        sessionId: session.sessionId,
        status: mappedStatus,
        connectionId: payload.connectionId,
        theirLabel: payload.theirLabel,
      });

      // Broadcast status update via WebSocket
      try {
        // Access the global wsManager set by the custom server
        const wsManager = (global as any).wsManager;
        if (wsManager) {
          // Link the connectionId to the sessionId in WebSocket manager
          if (typeof wsManager.linkConnectionToSession === 'function') {
            wsManager.linkConnectionToSession(session.sessionId, payload.connectionId);
          }

          // Broadcast using connectionId (preferred) or sessionId (fallback)
          if (typeof wsManager.broadcastStatusUpdate === 'function') {
            wsManager.broadcastStatusUpdate(
              payload.connectionId,
              mappedStatus,
              {
                sessionId: session.sessionId,
                connectionId: payload.connectionId,
                theirLabel: payload.theirLabel,
              }
            );
          }
        } else {
          logger.warn("WebSocket manager not available (running without custom server)", {
            sessionId: session.sessionId,
          });
        }
      } catch (error: any) {
        logger.error("Failed to broadcast WebSocket update", {
          sessionId: session.sessionId,
          error: error.message,
        });
      }
    } else {
      logger.warn("No session found for webhook event", {
        connectionId: payload.connectionId,
        outOfBandId: payload.outOfBandId,
      });
    }
  }

  // Mark webhook as processed
  await prisma.webhookEvent.updateMany({
    where: { webhookId: payload.id },
    data: {
      processed: true,
      processedAt: new Date(),
    },
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.connectionSession.updateMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
      status: {
        in: ["invitation", "request"],
      },
    },
    data: {
      status: "abandoned",
      updatedAt: new Date(),
    },
  });

  if (result.count > 0) {
    logger.info("Cleaned up expired sessions", {
      count: result.count,
    });
  }

  return result.count;
}

/**
 * Map Prisma model to ConnectionSession type
 */
function mapToConnectionSession(session: any): ConnectionSession {
  return {
    id: session.id,
    sessionId: session.sessionId,
    invitationId: session.invitationId,
    invitationUrl: session.invitationUrl,
    status: session.status as ConnectionStatus,
    connectionId: session.connectionId || undefined,
    theirDid: session.theirDid || undefined,
    theirLabel: session.theirLabel || undefined,
    metadata: session.metadata ? JSON.parse(session.metadata) : undefined,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
  };
}

/**
 * Get connection statistics
 */
export async function getConnectionStats(since?: Date) {
  const whereClause = since
    ? {
        createdAt: {
          gte: since,
        },
      }
    : {};

  const [total, active, completed, abandoned] = await Promise.all([
    prisma.connectionSession.count({ where: whereClause }),
    prisma.connectionSession.count({
      where: { ...whereClause, status: "active" },
    }),
    prisma.connectionSession.count({
      where: { ...whereClause, status: "completed" },
    }),
    prisma.connectionSession.count({
      where: { ...whereClause, status: "abandoned" },
    }),
  ]);

  return {
    total,
    active,
    completed,
    abandoned,
    successRate: total > 0 ? ((completed / total) * 100).toFixed(2) : "0.00",
  };
}
