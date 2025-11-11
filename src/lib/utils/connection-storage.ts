/**
 * Unified connection storage utility
 *
 * Since all demos use the same organization (single issuer),
 * we share one connection across all demos for better UX.
 */

const CONNECTION_KEY = 'confirmd_connectionId';
const TIMESTAMP_KEY = 'confirmd_connectionId_timestamp';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface StoredConnection {
  connectionId: string;
  timestamp: number;
}

/**
 * Store a connection ID in localStorage
 */
export function storeConnection(connectionId: string): void {
  try {
    localStorage.setItem(CONNECTION_KEY, connectionId);
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    console.log('[ConnectionStorage] Stored connectionId:', connectionId);
  } catch (error) {
    console.error('[ConnectionStorage] Failed to store connection:', error);
  }
}

/**
 * Retrieve stored connection if it exists and is valid
 */
export function getStoredConnection(): StoredConnection | null {
  try {
    const connectionId = localStorage.getItem(CONNECTION_KEY);
    const timestampStr = localStorage.getItem(TIMESTAMP_KEY);

    if (!connectionId) {
      console.log('[ConnectionStorage] No stored connection found');
      return null;
    }

    const timestamp = timestampStr ? parseInt(timestampStr) : Date.now();
    const age = Date.now() - timestamp;

    if (age > MAX_AGE_MS) {
      console.warn('[ConnectionStorage] Stored connection expired (age:', age, 'ms)');
      clearConnection();
      return null;
    }

    console.log('[ConnectionStorage] Retrieved valid connection:', connectionId);
    return { connectionId, timestamp };
  } catch (error) {
    console.error('[ConnectionStorage] Failed to retrieve connection:', error);
    return null;
  }
}

/**
 * Clear stored connection
 */
export function clearConnection(): void {
  try {
    localStorage.removeItem(CONNECTION_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    console.log('[ConnectionStorage] Cleared stored connection');
  } catch (error) {
    console.error('[ConnectionStorage] Failed to clear connection:', error);
  }
}

/**
 * Check if a valid connection exists
 */
export function hasValidConnection(): boolean {
  return getStoredConnection() !== null;
}

/**
 * Get connection age in milliseconds
 */
export function getConnectionAge(): number | null {
  try {
    const timestampStr = localStorage.getItem(TIMESTAMP_KEY);
    if (!timestampStr) return null;

    const timestamp = parseInt(timestampStr);
    return Date.now() - timestamp;
  } catch (error) {
    return null;
  }
}
