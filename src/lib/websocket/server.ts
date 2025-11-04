/**
 * WebSocket Server for Real-time Connection Updates
 *
 * This creates a WebSocket server alongside the Next.js HTTP server
 */

import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { wsManager } from './connection-manager';
import { logger } from '../api/logger';
import type { IncomingMessage } from 'http';

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(server: any): void {
  if (wss) {
    logger.warn('WebSocket server already initialized');
    return;
  }

  wss = new WebSocketServer({ noServer: true });

  logger.info('WebSocket server initialized');

  // Handle upgrade requests
  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    const { pathname } = parse(request.url || '', true);

    if (pathname === '/ws/connections') {
      wss!.handleUpgrade(request, socket, head, (ws) => {
        wss!.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const { query } = parse(request.url || '', true);
    const sessionId = query.sessionId as string;

    if (!sessionId) {
      logger.warn('WebSocket connection without sessionId');
      ws.close(1008, 'Session ID required');
      return;
    }

    logger.info('New WebSocket connection', { sessionId });

    // Register client with manager
    wsManager.registerClient(sessionId, ws);

    // Send welcome message
    ws.send(
      JSON.stringify({
        type: 'connected',
        sessionId,
        message: 'Connected to connection status updates',
        timestamp: new Date().toISOString(),
      })
    );

    // Handle incoming messages (ping/pong)
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'ping') {
          ws.send(
            JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString(),
            })
          );
        }
      } catch (error: any) {
        logger.error('Error handling WebSocket message', {
          sessionId,
          error: error.message,
        });
      }
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket error', {
        sessionId,
        error: error.message,
      });
    });

    // Handle close
    ws.on('close', (code, reason) => {
      logger.info('WebSocket connection closed', {
        sessionId,
        code,
        reason: reason.toString(),
      });
    });
  });

  // Handle server errors
  wss.on('error', (error) => {
    logger.error('WebSocket server error', {
      error: error.message,
    });
  });

  logger.info('WebSocket server ready on /ws/connections');
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}

/**
 * Broadcast status update
 */
export function broadcastStatusUpdate(
  sessionId: string,
  status: string,
  data?: Record<string, any>
): void {
  wsManager.broadcastStatusUpdate(sessionId, status as any, data);
}
