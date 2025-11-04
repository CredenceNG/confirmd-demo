/**
 * WebSocket Connection Manager
 *
 * Manages WebSocket connections for real-time connection status updates
 * Uses in-memory storage (can be replaced with Redis for production)
 */

import { WebSocket } from 'ws';
import type { ConnectionStatus } from '../api/types';
import { logger } from '../api/logger';

interface ConnectionClient {
  sessionId: string;
  ws: WebSocket;
  connectedAt: Date;
}

class WebSocketConnectionManager {
  private clients: Map<string, Set<WebSocket>> = new Map();
  private sessionMap: Map<WebSocket, string> = new Map();

  /**
   * Register a client for a specific session
   */
  registerClient(sessionId: string, ws: WebSocket): void {
    // Add to clients map
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set());
    }
    this.clients.get(sessionId)!.add(ws);

    // Add to reverse lookup
    this.sessionMap.set(ws, sessionId);

    logger.info('WebSocket client registered', {
      sessionId,
      totalClients: this.clients.get(sessionId)!.size,
    });

    // Clean up on close
    ws.on('close', () => {
      this.unregisterClient(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket error', {
        sessionId,
        error: error.message,
      });
      this.unregisterClient(ws);
    });
  }

  /**
   * Unregister a client
   */
  private unregisterClient(ws: WebSocket): void {
    const sessionId = this.sessionMap.get(ws);
    if (!sessionId) return;

    const clients = this.clients.get(sessionId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(sessionId);
      }
    }

    this.sessionMap.delete(ws);

    logger.info('WebSocket client unregistered', {
      sessionId,
      remainingClients: clients?.size || 0,
    });
  }

  /**
   * Broadcast status update to all clients watching a session
   */
  broadcastStatusUpdate(
    sessionId: string,
    status: ConnectionStatus,
    data?: Record<string, any>
  ): void {
    const clients = this.clients.get(sessionId);
    if (!clients || clients.size === 0) {
      logger.debug('No clients to broadcast to', { sessionId });
      return;
    }

    const message = JSON.stringify({
      type: 'status_update',
      sessionId,
      status,
      timestamp: new Date().toISOString(),
      ...data,
    });

    let sentCount = 0;
    let failedCount = 0;

    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
          sentCount++;
        } catch (error: any) {
          logger.error('Failed to send WebSocket message', {
            sessionId,
            error: error.message,
          });
          failedCount++;
        }
      } else {
        failedCount++;
        // Clean up dead connections
        this.unregisterClient(ws);
      }
    });

    logger.info('Status update broadcasted', {
      sessionId,
      status,
      sentCount,
      failedCount,
    });
  }

  /**
   * Send message to specific client
   */
  sendToClient(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * Get number of connected clients for a session
   */
  getClientCount(sessionId: string): number {
    return this.clients.get(sessionId)?.size || 0;
  }

  /**
   * Get total number of active connections
   */
  getTotalConnections(): number {
    return this.sessionMap.size;
  }

  /**
   * Get all active session IDs
   */
  getActiveSessions(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Close all connections for a session
   */
  closeSession(sessionId: string, reason?: string): void {
    const clients = this.clients.get(sessionId);
    if (!clients) return;

    const closeMessage = JSON.stringify({
      type: 'session_closed',
      sessionId,
      reason: reason || 'Session ended',
      timestamp: new Date().toISOString(),
    });

    clients.forEach((ws) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(closeMessage);
          ws.close(1000, reason);
        }
      } catch (error: any) {
        logger.error('Error closing WebSocket', {
          sessionId,
          error: error.message,
        });
      }
    });

    this.clients.delete(sessionId);
    logger.info('Session closed', { sessionId, clientCount: clients.size });
  }
}

// Singleton instance
export const wsManager = new WebSocketConnectionManager();
