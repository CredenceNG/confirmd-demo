import axios from "axios";
import type {
  ConfirmdTokenResponse,
  ConfirmdAuthConfig,
  TokenCacheEntry,
  ApiError,
} from "./types";
import { API_CONFIG, TOKEN_CONFIG, TIMEOUTS, ERROR_CODES } from "./constants";
import { logger } from "./logger";

/**
 * In-memory token cache
 * NOTE: In production, consider using Redis or similar for distributed caching
 */
let tokenCache: TokenCacheEntry | null = null;

/**
 * Get Confirmd OAuth configuration from environment variables
 * @returns OAuth client credentials configuration
 */
export function getConfirmdConfig(): ConfirmdAuthConfig {
  try {
    return {
      grant_type: "client_credentials",
      client_id: API_CONFIG.CLIENT_ID,
      client_secret: API_CONFIG.CLIENT_SECRET,
    };
  } catch (error: any) {
    logger.error("Failed to get Confirmd configuration", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get the Platform OAuth token URL from environment
 * @returns OAuth token endpoint URL
 */
export function getPlatformUrl(): string {
  return API_CONFIG.AUTH_URL;
}

/**
 * Check if the cached token is still valid
 * @param cache - Cached token entry to validate
 * @returns true if token is valid and not near expiration
 */
function isTokenValid(cache: TokenCacheEntry | null): boolean {
  if (!cache) {
    logger.debug("No cached token found");
    return false;
  }

  const now = Date.now();
  const expiresIn = cache.expires_at - now;
  const isValid = expiresIn > TOKEN_CONFIG.EXPIRY_BUFFER;

  logger.debug("Token validity check", {
    isValid,
    expiresIn: `${Math.round(expiresIn / 1000)}s`,
  });

  return isValid;
}

/**
 * Fetch a new access token from Confirmd Platform
 * @returns OAuth token response with access token and metadata
 * @throws ApiError if authentication fails
 */
export async function fetchAccessToken(): Promise<ConfirmdTokenResponse> {
  const platformUrl = getPlatformUrl();

  logger.auth("Fetching new access token", { url: platformUrl });

  try {
    const config = getConfirmdConfig();

    const response = await axios.post<ConfirmdTokenResponse>(
      platformUrl,
      new URLSearchParams(config as any),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: TIMEOUTS.AUTHENTICATION,
      }
    );

    logger.auth("Access token fetched successfully", {
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
    });

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError: ApiError = {
        error: error.response.data.error || ERROR_CODES.AUTHENTICATION_FAILED,
        error_description:
          error.response.data.error_description ||
          "Failed to fetch access token from Confirmd Platform",
        status: error.response.status,
      };

      logger.error("Authentication failed", {
        error: apiError.error,
        status: apiError.status,
      });

      throw apiError;
    }

    const networkError: ApiError = {
      error: ERROR_CODES.NETWORK_ERROR,
      error_description: "Failed to connect to Confirmd Platform",
    };

    logger.error("Network error during authentication", {
      message: error.message,
    });

    throw networkError;
  }
}

/**
 * Get a valid access token (from cache or fetch new one)
 * @returns Valid OAuth access token
 * @throws ApiError if token fetch fails
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (isTokenValid(tokenCache)) {
    logger.token("Using cached token");
    return tokenCache!.access_token;
  }

  // Fetch new token
  logger.token("Cache miss, fetching new token");
  const tokenResponse = await fetchAccessToken();

  // Cache the token with expiration time
  tokenCache = {
    access_token: tokenResponse.access_token,
    expires_at: Date.now() + tokenResponse.expires_in * 1000,
    token_type: tokenResponse.token_type,
  };

  logger.token("Token cached", {
    expiresAt: new Date(tokenCache.expires_at).toISOString(),
  });

  return tokenCache.access_token;
}

/**
 * Invalidate the cached token
 * Useful for testing, error recovery, or forced refresh
 */
export function invalidateToken(): void {
  logger.token("Invalidating cached token");
  tokenCache = null;
}

/**
 * Get cached token info without fetching
 * @returns Token cache entry if valid, null otherwise
 */
export function getTokenInfo(): TokenCacheEntry | null {
  if (!isTokenValid(tokenCache)) {
    return null;
  }
  return tokenCache;
}
