import { useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: 'connected' | 'status_update' | 'error';
  sessionId?: string;
  status?: string;
  connectionId?: string;
  theirLabel?: string;
  message?: string;
  timestamp: string;
  // Proof-specific fields
  proofId?: string;
  verified?: boolean;
  [key: string]: any; // Allow additional fields
}

export function useConnectionWebSocket(sessionId: string | null) {
  const [status, setStatus] = useState<string>('invitation');
  const [connectionData, setConnectionData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const connectWebSocket = () => {
      // Use ws:// for localhost, wss:// for production
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/connections?sessionId=${sessionId}`;

      console.log('[WebSocket] Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message);

          if (message.type === 'connected') {
            console.log('[WebSocket] Connection established:', message.message);
          } else if (message.type === 'status_update') {
            console.log('[WebSocket] Status update:', message.status);
            if (message.status) {
              setStatus(message.status);
              // Store all message data, not just connectionId and theirLabel
              setConnectionData(message);
            }
          } else if (message.type === 'error') {
            console.error('[WebSocket] Error:', message.message);
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (event) => {
        console.error('[WebSocket] Connection error occurred');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [sessionId]);

  return {
    status,
    connectionData,
    isConnected,
  };
}
