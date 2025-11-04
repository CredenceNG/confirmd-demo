/**
 * Connection Manager
 *
 * Manages DIDComm connections between verifier and holders
 */

import { AxiosInstance } from 'axios';
import {
  Connection,
  ConnectionInvitation,
  ConnectionState,
  NotFoundError,
} from '../types';

interface CreateInvitationResponse {
  statusCode: number;
  message: string;
  data: {
    invitationId: string;
    invitationUrl: string;
    expiresAt: string;
  };
}

interface GetConnectionResponse {
  statusCode: number;
  data: {
    id: string;
    state: string;
    theirLabel?: string;
    theirDid?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export class ConnectionManager {
  constructor(
    private httpClient: AxiosInstance,
    private organizationId: string
  ) {}

  /**
   * Create a new connection invitation
   *
   * @returns Connection invitation with QR code URL
   */
  async createInvitation(): Promise<ConnectionInvitation> {
    const response = await this.httpClient.post<CreateInvitationResponse>(
      `/orgs/${this.organizationId}/oob-invitations`
    );

    const { data } = response.data;

    return {
      invitationId: data.invitationId,
      invitationUrl: data.invitationUrl,
      expiresAt: new Date(data.expiresAt),
    };
  }

  /**
   * Get connection details by ID
   *
   * @param connectionId - The connection ID to retrieve
   * @returns Connection details
   */
  async getConnection(connectionId: string): Promise<Connection> {
    try {
      const response = await this.httpClient.get<GetConnectionResponse>(
        `/orgs/${this.organizationId}/connections/${connectionId}`
      );

      const { data } = response.data;

      return {
        connectionId: data.id,
        state: this.normalizeConnectionState(data.state),
        theirLabel: data.theirLabel,
        theirDid: data.theirDid,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError('Connection');
      }
      throw error;
    }
  }

  /**
   * List all connections for the organization
   *
   * @param state - Optional filter by connection state
   * @returns Array of connections
   */
  async listConnections(state?: ConnectionState): Promise<Connection[]> {
    const params = state ? { state } : {};
    const response = await this.httpClient.get<{ data: any[] }>(
      `/orgs/${this.organizationId}/connections`,
      { params }
    );

    return response.data.data.map((conn) => ({
      connectionId: conn.id,
      state: this.normalizeConnectionState(conn.state),
      theirLabel: conn.theirLabel,
      theirDid: conn.theirDid,
      createdAt: new Date(conn.createdAt),
      updatedAt: new Date(conn.updatedAt),
    }));
  }

  /**
   * Delete a connection
   *
   * @param connectionId - The connection ID to delete
   */
  async deleteConnection(connectionId: string): Promise<void> {
    await this.httpClient.delete(
      `/orgs/${this.organizationId}/connections/${connectionId}`
    );
  }

  /**
   * Normalize connection state from various formats
   */
  private normalizeConnectionState(state: string): ConnectionState {
    const normalized = state.toLowerCase().replace(/-/g, '');

    const stateMap: Record<string, ConnectionState> = {
      invitation: 'invitation',
      request: 'request',
      responsesent: 'response',
      response: 'response',
      active: 'active',
      completed: 'completed',
      error: 'error',
      abandoned: 'abandoned',
    };

    return stateMap[normalized] || 'error';
  }
}
