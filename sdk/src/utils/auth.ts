/**
 * Authentication Manager for ConfirmD Platform
 *
 * Handles OAuth2 client credentials flow with automatic token refresh
 */

import axios, { AxiosInstance } from 'axios';
import { AuthenticationError } from '../types';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class AuthManager {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(
    private tokenUrl: string,
    private clientId: string,
    private clientSecret: string,
    private httpClient: AxiosInstance
  ) {}

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    // If already refreshing, wait for that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start new refresh
    this.refreshPromise = this.refreshToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Fetch a new access token from the OAuth2 server
   */
  private async refreshToken(): Promise<string> {
    try {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const response = await this.httpClient.post<TokenResponse>(
        this.tokenUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, expires_in } = response.data;

      this.accessToken = access_token;
      this.tokenExpiresAt = Date.now() + expires_in * 1000;

      return access_token;
    } catch (error: any) {
      throw new AuthenticationError(
        `Failed to obtain access token: ${error.message}`
      );
    }
  }

  /**
   * Clear cached tokens (useful for testing or logout)
   */
  clearTokens(): void {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.refreshPromise = null;
  }
}
