/**
 * Demo Session Management Utility
 *
 * Tracks demo sessions using a hybrid approach:
 * - Session Cookie: Cleared on browser close
 * - Device ID (localStorage): Persists across browser sessions
 *
 * This allows for:
 * - Active session tracking within a browser session
 * - Session recovery after browser restart (via deviceId)
 * - Clean separation between different demo sessions
 */

export interface SessionInfo {
  sessionId: string;  // From cookie - session-scoped
  deviceId: string;   // From localStorage - device-scoped
}

/**
 * Get or create session identifiers
 * Uses both session cookie and localStorage for reliable tracking
 */
export function getSessionInfo(): SessionInfo {
  // Get or create session ID (cookie - cleared on browser close)
  let sessionId = getSessionCookie('confirmd_demo_session');
  if (!sessionId) {
    sessionId = generateSecureId();
    setSessionCookie('confirmd_demo_session', sessionId);
    console.log('[DemoSession] Created new session ID:', sessionId);
  }

  // Get or create device ID (localStorage - persists across sessions)
  let deviceId: string | null = null;
  try {
    deviceId = localStorage.getItem('confirmd_device_id');
    if (!deviceId) {
      deviceId = generateSecureId();
      localStorage.setItem('confirmd_device_id', deviceId);
      console.log('[DemoSession] Created new device ID:', deviceId);
    }
  } catch (error) {
    // Fallback if localStorage is not available (e.g., incognito mode)
    console.warn('[DemoSession] localStorage not available, using session ID as device ID');
    deviceId = sessionId;
  }

  return { sessionId, deviceId };
}

/**
 * Clear all session data
 * Called when user clicks "Leave Demo"
 */
export function clearSessionInfo(): void {
  console.log('[DemoSession] Clearing session info');

  // Clear session cookie
  document.cookie = 'confirmd_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure';

  // Keep deviceId for cross-session analytics, but you can optionally clear it:
  // localStorage.removeItem('confirmd_device_id');
}

/**
 * Clear only the connection ID from localStorage
 * Called when leaving a demo to ensure fresh connection next time
 */
export function clearStoredConnection(): void {
  console.log('[DemoSession] Clearing stored connection');
  try {
    localStorage.removeItem('confirmd_connectionId');
    localStorage.removeItem('confirmd_connectionId_timestamp');
  } catch (error) {
    console.error('[DemoSession] Failed to clear stored connection:', error);
  }
}

/**
 * Generate a secure random ID
 */
function generateSecureId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get a cookie value by name
 */
function getSessionCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Set a session cookie (no max-age = cleared on browser close)
 */
function setSessionCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;

  // Session cookie (no max-age/expires = cleared on browser close)
  // Secure flag requires HTTPS in production
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? '; Secure' : '';

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict${secureFlag}`;
}

/**
 * Get session info from server-side (Next.js API routes)
 * Extracts sessionId from cookies and deviceId from headers
 */
export function getSessionInfoFromRequest(request: Request): SessionInfo {
  // Parse cookies from request
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...values] = c.split('=');
      return [key, values.join('=')];
    })
  );

  const sessionId = cookies['confirmd_demo_session'] || generateSecureId();
  const deviceId = request.headers.get('x-device-id') || sessionId;

  return { sessionId, deviceId };
}

/**
 * Check if user has an active demo session for a specific demo type
 * Call this from the frontend before starting a demo
 */
export async function checkActiveDemoSession(demoType: string): Promise<{
  hasActiveSession: boolean;
  sessionData?: any;
}> {
  try {
    const { sessionId, deviceId } = getSessionInfo();

    const response = await fetch('/api/demo/session/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
      },
      body: JSON.stringify({ demoType, sessionId }),
    });

    const data = await response.json();
    return {
      hasActiveSession: data.success && data.data?.status === 'active',
      sessionData: data.data,
    };
  } catch (error) {
    console.error('[DemoSession] Failed to check active session:', error);
    return { hasActiveSession: false };
  }
}

/**
 * End a demo session
 * Marks the session as completed in the database and clears local storage
 */
export async function endDemoSession(demoType: string): Promise<{ success: boolean }> {
  try {
    const { sessionId, deviceId } = getSessionInfo();

    const response = await fetch('/api/demo/session/end', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Id': deviceId,
      },
      body: JSON.stringify({ demoType, sessionId }),
    });

    const data = await response.json();

    if (data.success) {
      // Clear local session data
      clearSessionInfo();
      clearStoredConnection();
    }

    return { success: data.success };
  } catch (error) {
    console.error('[DemoSession] Failed to end session:', error);
    return { success: false };
  }
}
