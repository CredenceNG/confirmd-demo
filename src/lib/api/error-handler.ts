import type { ApiError } from "./types";

/**
 * Format API error for user display
 */
export function formatApiError(error: ApiError): string {
  const errorMessages: Record<string, string> = {
    network_error: "Unable to connect to the server. Please check your internet connection.",
    authentication_failed: "Authentication failed. Please check your credentials.",
    invalid_token: "Your session has expired. Please sign in again.",
    token_expired: "Your session has expired. Please sign in again.",
    unauthorized: "You are not authorized to perform this action.",
    forbidden: "Access to this resource is forbidden.",
    not_found: "The requested resource was not found.",
    validation_error: "Please check your input and try again.",
    server_error: "An internal server error occurred. Please try again later.",
    rate_limit_exceeded: "Too many requests. Please slow down and try again.",
    invalid_request: "Invalid request. Please check your input.",
  };

  return (
    errorMessages[error.error] ||
    error.error_description ||
    "An unexpected error occurred. Please try again."
  );
}

/**
 * Log API error for debugging
 */
export function logApiError(error: ApiError, context?: string): void {
  const logPrefix = context ? `[${context}]` : "[API Error]";

  console.error(`${logPrefix} Error:`, {
    error: error.error,
    description: error.error_description,
    status: error.status,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  const retryableErrors = [
    "network_error",
    "server_error",
    "rate_limit_exceeded",
  ];

  const retryableStatuses = [408, 429, 500, 502, 503, 504];

  return (
    retryableErrors.includes(error.error) ||
    (error.status !== undefined && retryableStatuses.includes(error.status))
  );
}

/**
 * Get retry delay based on error type
 */
export function getRetryDelay(error: ApiError, attemptNumber: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  const baseDelay = 1000;
  const maxDelay = 30000; // 30 seconds max

  if (error.error === "rate_limit_exceeded") {
    // For rate limiting, use a longer delay
    return Math.min(5000 * attemptNumber, maxDelay);
  }

  return Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  onError?: (error: ApiError, attempt: number) => void
): Promise<T> {
  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as ApiError;

      if (onError) {
        onError(lastError, attempt);
      }

      // If error is not retryable or we've exhausted retries, throw immediately
      if (!isRetryableError(lastError) || attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      const delay = getRetryDelay(lastError, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Handle API response and extract data or error
 */
export function handleApiResponse<T>(
  response: { success: boolean; data?: T; error?: ApiError },
  context?: string
): T {
  if (!response.success || !response.data) {
    const error = response.error || {
      error: "unknown_error",
      error_description: "An unknown error occurred",
    };

    if (context) {
      logApiError(error, context);
    }

    throw error;
  }

  return response.data;
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    (field) => !data[field] || (typeof data[field] === "string" && data[field].trim() === "")
  );

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Create a standardized API error
 */
export function createApiError(
  error: string,
  description: string,
  status?: number
): ApiError {
  return {
    error,
    error_description: description,
    status,
  };
}

/**
 * Check if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string"
  );
}
