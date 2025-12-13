/**
 * Custom Next.js Server with WebSocket Support
 *
 * This custom server enables WebSocket connections alongside Next.js HTTP server
 */

// Load environment variables from .env file (override any existing env vars)
require('dotenv').config({ override: true });

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3300', 10);

// In production with standalone build, Next.js handles routing differently
const app = next({
  dev,
  hostname: dev ? hostname : '0.0.0.0',
  port
});
const handle = app.getRequestHandler();

// WebSocket connection manager (in-memory)
// Dual-key tracking: by sessionId (initial) and connectionId (after webhook)
const clients = new Map(); // sessionId or connectionId -> Set<WebSocket>
const sessionMap = new WeakMap(); // WebSocket -> { sessionId, connectionId? }

function registerClient(sessionId, ws) {
  if (!clients.has(sessionId)) {
    clients.set(sessionId, new Set());
  }
  clients.get(sessionId).add(ws);
  sessionMap.set(ws, { sessionId });

  ws.on('close', () => unregisterClient(ws));
  ws.on('error', (error) => {
    console.error('WebSocket error', { sessionId, error: error.message });
    unregisterClient(ws);
  });
}

function unregisterClient(ws) {
  const metadata = sessionMap.get(ws);
  if (metadata) {
    const { sessionId, connectionId } = metadata;

    // Remove from sessionId map
    if (sessionId) {
      const sessionClients = clients.get(sessionId);
      if (sessionClients) {
        sessionClients.delete(ws);
        if (sessionClients.size === 0) {
          clients.delete(sessionId);
        }
      }
    }

    // Remove from connectionId map if exists
    if (connectionId) {
      const connectionClients = clients.get(connectionId);
      if (connectionClients) {
        connectionClients.delete(ws);
        if (connectionClients.size === 0) {
          clients.delete(connectionId);
        }
      }
    }
  }
}

function linkConnectionToSession(sessionId, connectionId) {
  // Get all WebSockets for this session
  const sessionClients = clients.get(sessionId);
  if (!sessionClients || sessionClients.size === 0) {
    console.log('No WebSocket clients found for session', { sessionId });
    return;
  }

  // Create connectionId entry in map
  if (!clients.has(connectionId)) {
    clients.set(connectionId, new Set());
  }

  // Add all session WebSockets to connectionId map
  sessionClients.forEach((ws) => {
    clients.get(connectionId).add(ws);

    // Update metadata to include connectionId
    const metadata = sessionMap.get(ws);
    if (metadata) {
      metadata.connectionId = connectionId;
    }
  });

  console.log('Linked connectionId to session', {
    sessionId,
    connectionId,
    clientCount: sessionClients.size
  });
}

function broadcastStatusUpdate(sessionIdOrConnectionId, status, data = {}) {
  // Try to find clients by sessionId OR connectionId
  const clients_set = clients.get(sessionIdOrConnectionId);

  if (!clients_set || clients_set.size === 0) {
    console.log('No clients found for broadcast', {
      key: sessionIdOrConnectionId,
      status
    });
    return;
  }

  const message = JSON.stringify({
    type: 'status_update',
    sessionId: data.sessionId || sessionIdOrConnectionId,
    status,
    timestamp: new Date().toISOString(),
    ...data,
  });

  let sent = 0;
  clients_set.forEach((ws) => {
    if (ws.readyState === 1) { // OPEN
      ws.send(message);
      sent++;
    }
  });

  console.log('Broadcast sent', {
    key: sessionIdOrConnectionId,
    status,
    clientCount: clients_set.size,
    sentCount: sent
  });
}

// Export for use by webhook handler
global.wsManager = {
  broadcastStatusUpdate,
  linkConnectionToSession
};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  // Store original upgrade listeners from Next.js
  const originalUpgradeListeners = server.listeners('upgrade').slice();

  // Remove existing upgrade listeners to prevent conflicts
  server.removeAllListeners('upgrade');

  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url || '', true);

    // Handle our custom WebSocket connections
    if (pathname === '/ws/connections') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    // Forward HMR and other Next.js WebSocket requests to Next.js
    else {
      // Let Next.js handle its own WebSocket connections (HMR, etc.)
      let handled = false;
      for (const listener of originalUpgradeListeners) {
        listener(request, socket, head);
        handled = true;
        break; // Only call first listener
      }

      // If no Next.js listeners, destroy unknown connections
      if (!handled && !pathname.startsWith('/_next/')) {
        socket.destroy();
      }
    }
  });

  // Handle WebSocket connections
  wss.on('connection', (ws, request) => {
    const { query } = parse(request.url || '', true);
    const sessionId = query.sessionId;

    if (!sessionId) {
      ws.close(1008, 'Session ID required');
      return;
    }

    // Register client with manager
    registerClient(sessionId, ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      message: 'Connected to connection status updates',
      timestamp: new Date().toISOString(),
    }));

    console.log('WebSocket client connected', { sessionId });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Ready on http://${hostname}:${port} with WebSocket support`
      );
      console.log('✓ WebSocket server initialized');
    });
});
