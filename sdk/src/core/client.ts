/**
 * ConfirmD Verifier SDK Client
 *
 * Main entry point for the SDK
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthManager } from '../utils/auth';
import { ConnectionManager } from './connections';
import { ProofManager } from './proofs';
import {
  ConfirmDConfig,
  ConfirmDError,
  AuthenticationError,
  EventMap,
  EventName,
  EventHandler,
} from '../types';

export class ConfirmDClient {
  private httpClient: AxiosInstance;
  private authManager: AuthManager;
  private eventHandlers: Map<EventName, Set<Function>> = new Map();

  /** Connection management */
  public readonly connections: ConnectionManager;

  /** Proof request and verification */
  public readonly proofs: ProofManager;

  constructor(config: ConfirmDConfig) {
    const baseUrl = config.baseUrl || 'https://platform.confirmd.com';

    // Create HTTP client
    this.httpClient = axios.create({
      baseURL: baseUrl,
      timeout: config.timeout || 30000,
    });

    // Initialize auth manager
    this.authManager = new AuthManager(
      config.auth.tokenUrl,
      config.auth.clientId,
      config.auth.clientSecret,
      this.httpClient
    );

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use(async (requestConfig) => {
      const token = await this.authManager.getAccessToken();
      requestConfig.headers.Authorization = `Bearer ${token}`;
      return requestConfig;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const confirmDError = this.handleError(error);
        this.emit('error', confirmDError);
        throw confirmDError;
      }
    );

    // Initialize managers
    this.connections = new ConnectionManager(
      this.httpClient,
      config.organizationId
    );
    this.proofs = new ProofManager(this.httpClient, config.organizationId);
  }

  /**
   * Register an event handler
   *
   * @param event - Event name
   * @param handler - Event handler function
   */
  on<T extends EventName>(event: T, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as Function);
  }

  /**
   * Unregister an event handler
   *
   * @param event - Event name
   * @param handler - Event handler function
   */
  off<T extends EventName>(event: T, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as Function);
    }
  }

  /**
   * Emit an event to all registered handlers
   *
   * @param event - Event name
   * @param data - Event data
   */
  private emit<T extends EventName>(
    event: T,
    ...args: Parameters<EventHandler<T>>
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Convert Axios errors to ConfirmD errors
   */
  private handleError(error: AxiosError): ConfirmDError {
    if (error.response) {
      const { status, data } = error.response;
      const message =
        (data as any)?.message ||
        (data as any)?.error ||
        error.message ||
        'Unknown error';

      if (status === 401 || status === 403) {
        return new AuthenticationError(message);
      }

      return new ConfirmDError(message, status);
    }

    if (error.request) {
      return new ConfirmDError(
        'Network error: Unable to reach ConfirmD Platform',
        0
      );
    }

    return new ConfirmDError(error.message || 'Unknown error');
  }

  /**
   * Clear authentication tokens (useful for testing)
   */
  clearAuth(): void {
    this.authManager.clearTokens();
  }
}
