/**
 * API Logger Utility
 *
 * Provides structured logging for API operations with different log levels.
 * Supports both console and file logging.
 */

import * as fs from "fs";
import * as path from "path";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: any;
}

/**
 * Logger configuration
 */
const config = {
  /**
   * Current log level from environment or default to 'info'
   */
  get level(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    const validLevels: LogLevel[] = ["debug", "info", "warn", "error"];
    return validLevels.includes(envLevel as LogLevel)
      ? (envLevel as LogLevel)
      : "info";
  },

  /**
   * Whether to enable logging (disable in test environment)
   */
  get enabled(): boolean {
    return process.env.NODE_ENV !== "test";
  },

  /**
   * Whether to format logs as JSON
   */
  get json(): boolean {
    return process.env.LOG_FORMAT === "json";
  },

  /**
   * Whether to log to file
   */
  get logToFile(): boolean {
    return process.env.LOG_TO_FILE === "true";
  },

  /**
   * Log directory path
   */
  get logDir(): string {
    return process.env.LOG_DIR || path.join(process.cwd(), "logs");
  },

  /**
   * Log file name
   */
  get logFile(): string {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return path.join(this.logDir, `app-${date}.log`);
  },
};

/**
 * Ensure log directory exists
 */
function ensureLogDir(): void {
  if (config.logToFile && typeof window === "undefined") {
    // Only create log dir on server side
    try {
      if (!fs.existsSync(config.logDir)) {
        fs.mkdirSync(config.logDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to create log directory:", error);
    }
  }
}

/**
 * Log level priorities
 */
const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Check if a log level should be logged based on current config
 */
function shouldLog(level: LogLevel): boolean {
  return config.enabled && levels[level] >= levels[config.level];
}

/**
 * Format log message
 */
function formatMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();

  if (config.json) {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...context,
    });
  }

  const contextStr = context
    ? `\n${JSON.stringify(context, null, 2)}`
    : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Write log to file
 */
function writeToFile(formattedMessage: string): void {
  if (!config.logToFile || typeof window !== "undefined") {
    return; // Only log to file on server side
  }

  try {
    ensureLogDir();
    fs.appendFileSync(config.logFile, formattedMessage + "\n", "utf8");
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
}

/**
 * Log a message with the specified level
 */
function log(
  level: LogLevel,
  consoleMethod: (...args: any[]) => void,
  message: string,
  context?: LogContext
): void {
  if (!shouldLog(level)) {
    return;
  }

  const formattedMessage = formatMessage(level, message, context);

  // Always write to console
  consoleMethod(formattedMessage);

  // Write to file if enabled
  writeToFile(formattedMessage);
}

/**
 * API Logger
 */
export const logger = {
  /**
   * Log debug information (lowest priority)
   */
  debug(message: string, context?: LogContext): void {
    log("debug", console.debug, message, context);
  },

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    log("info", console.info, message, context);
  },

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    log("warn", console.warn, message, context);
  },

  /**
   * Log errors (highest priority)
   */
  error(message: string, context?: LogContext): void {
    log("error", console.error, message, context);
  },

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API Request: ${method} ${url}`, context);
  },

  /**
   * Log API response
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    context?: LogContext
  ): void {
    const level = status >= 400 ? "error" : "debug";
    this[level](`API Response: ${method} ${url} - ${status}`, context);
  },

  /**
   * Log token operations
   */
  token(action: string, context?: LogContext): void {
    this.debug(`Token ${action}`, context);
  },

  /**
   * Log authentication events
   */
  auth(event: string, context?: LogContext): void {
    this.info(`Auth: ${event}`, context);
  },

  /**
   * Log proof verification operations
   */
  proofVerification(action: string, context?: LogContext): void {
    this.info(`Proof Verification: ${action}`, {
      ...context,
      operation: "proof_verification",
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log webhook processing
   */
  webhook(event: string, context?: LogContext): void {
    this.info(`Webhook: ${event}`, {
      ...context,
      operation: "webhook",
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log attribute extraction
   */
  attributes(action: string, context?: LogContext): void {
    this.info(`Attributes: ${action}`, {
      ...context,
      operation: "attribute_extraction",
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log proof request flow
   */
  proofFlow(stage: string, context?: LogContext): void {
    this.info(`Proof Flow [${stage}]`, {
      ...context,
      operation: "proof_flow",
      stage,
      timestamp: new Date().toISOString(),
    });
  },
};

export default logger;
