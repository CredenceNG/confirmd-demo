/**
 * API Constants and Configuration
 *
 * Centralized configuration for the Confirmd Platform API integration.
 * All values are sourced from environment variables with no hardcoded defaults.
 */

/**
 * Validates that required environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateEnvironmentVariables(): void {
  const required = [
    "CONFIRMD_ORG_ID",
    "CONFIRMD_CLIENT_ID",
    "CONFIRMD_CLIENT_SECRET",
    "CONFIRMD_AUTH_URL",
    "CONFIRMD_BASE_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Please check your .env file.`
    );
  }
}

/**
 * API Configuration sourced from environment variables
 */
export const API_CONFIG = {
  /**
   * OAuth 2.0 token endpoint URL
   */
  get AUTH_URL(): string {
    const url = process.env.CONFIRMD_AUTH_URL;
    if (!url) {
      throw new Error("CONFIRMD_AUTH_URL is not set in environment variables");
    }
    return url;
  },

  /**
   * Confirmd Platform API base URL
   */
  get BASE_URL(): string {
    const url = process.env.CONFIRMD_BASE_URL;
    if (!url) {
      throw new Error("CONFIRMD_BASE_URL is not set in environment variables");
    }
    return url;
  },

  /**
   * OAuth Client ID
   */
  get CLIENT_ID(): string {
    const id = process.env.CONFIRMD_CLIENT_ID;
    if (!id) {
      throw new Error("CONFIRMD_CLIENT_ID is not set in environment variables");
    }
    return id;
  },

  /**
   * OAuth Client Secret
   */
  get CLIENT_SECRET(): string {
    const secret = process.env.CONFIRMD_CLIENT_SECRET;
    if (!secret) {
      throw new Error("CONFIRMD_CLIENT_SECRET is not set in environment variables");
    }
    return secret;
  },

  /**
   * Organization ID
   */
  get ORG_ID(): string {
    const id = process.env.CONFIRMD_ORG_ID;
    if (!id) {
      throw new Error("CONFIRMD_ORG_ID is not set in environment variables");
    }
    return id;
  },
} as const;

/**
 * API Request Timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  AUTHENTICATION: 15000, // 15 seconds
  LONG_RUNNING: 60000, // 60 seconds
} as const;

/**
 * Token Configuration
 */
export const TOKEN_CONFIG = {
  /**
   * Buffer time before token expiration to trigger refresh (in milliseconds)
   */
  EXPIRY_BUFFER: 60000, // 60 seconds

  /**
   * Default token lifetime if not specified (in milliseconds)
   */
  DEFAULT_LIFETIME: 900000, // 15 minutes
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  // Authentication
  TOKEN: "/token",

  // Organizations
  ORGANIZATIONS: "/orgs",
  ORGANIZATION_BY_ID: (id: string) => `/orgs/${id}`,

  // Students
  STUDENTS: "/students",
  STUDENT_BY_ID: (id: string) => `/students/${id}`,
  STUDENT_REGISTER: "/students/register",
  STUDENT_AUTHENTICATE: "/students/authenticate",

  // Wallet
  WALLET_VERIFY: "/wallet/verify",
  WALLET_REQUEST_DATA: "/wallet/request-data",
  WALLET_VERIFY_SIGNATURE: "/wallet/verify-signature",
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  NETWORK_ERROR: "network_error",
  AUTHENTICATION_FAILED: "authentication_failed",
  INVALID_TOKEN: "invalid_token",
  TOKEN_EXPIRED: "token_expired",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  VALIDATION_ERROR: "validation_error",
  SERVER_ERROR: "server_error",
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
  INVALID_REQUEST: "invalid_request",
  MISSING_ORGANIZATION_ID: "missing_organization_id",
} as const;
