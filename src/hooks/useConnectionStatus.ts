/**
 * useConnectionStatus Hook
 *
 * Connects to WebSocket for real-time connection status updates
 * Falls back to polling if WebSocket connection fails
 */

import { useEffect, useRef, useState } from 'react';

interface ConnectionStatusData {
  status: string;
  connectionId?: string;
  theirLabel?: string;
  timestamp?: string;
}

interface UseConnectionStatusOptions {
  sessionId: string;
  onStatusChange?: (data: ConnectionStatusData) => void;
  enablePolling?: boolean; // Enable polling fallback
  pollingInterval?: number; // Polling interval in ms (default: 3000)
}

export function useConnectionStatus({
  sessionId,
  onStatusChange,
  enablePolling = true,
  pollingInterval = 3000,
}: UseConnectionStatusOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'websocket' | 'polling'>('websocket');
  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/connections?sessionId=${sessionId}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionMethod('websocket');
        reconnectAttempts.current = 0;

        // Stop polling if it was running
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'status_update') {
            setLastUpdate(new Date(data.timestamp));

            if (onStatusChange) {
              onStatusChange({
                status: data.status,
                connectionId: data.connectionId,
                theirLabel: data.theirLabel,
                timestamp: data.timestamp,
              });
            }
          } else if (data.type === 'connected') {
            console.log('WebSocket connection acknowledged:', data.message);
          } else if (data.type === 'session_closed') {
            console.log('Session closed:', data.reason);
            ws.close();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect or fall back to polling
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Reconnecting WebSocket in ${delay}ms...`);
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else if (enablePolling) {
          console.log('Max WebSocket reconnect attempts reached, falling back to polling');
          startPolling();
        }
      };

      // Keep connection alive with ping/pong
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Ping every 30 seconds

      ws.addEventListener('close', () => {
        clearInterval(pingInterval);
      });

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);

      if (enablePolling) {
        startPolling();
      }
    }
  };

  // Fallback polling
  const startPolling = () => {
    if (pollingIntervalRef.current) {
      return; // Already polling
    }

    console.log('Starting polling fallback');
    setConnectionMethod('polling');

    const poll = async () => {
      try {
        const response = await fetch(`/api/connections/session?sessionId=${sessionId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setLastUpdate(new Date());

          if (onStatusChange) {
            onStatusChange({
              status: data.data.status,
              connectionId: data.data.connectionId,
              theirLabel: data.data.theirLabel,
              timestamp: data.data.updatedAt,
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    pollingIntervalRef.current = setInterval(poll, pollingInterval);
  };

  // Initialize connection
  useEffect(() => {
    connectWebSocket();

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [sessionId]);

  return {
    isConnected,
    lastUpdate,
    connectionMethod,
  };
}
