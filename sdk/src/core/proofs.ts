/**
 * Proof Manager
 *
 * Handles proof request creation, verification, and attribute extraction
 */

import { AxiosInstance } from 'axios';
import {
  ProofRequest,
  ProofRequestOptions,
  ProofState,
  VerifiedProof,
  NotFoundError,
  ValidationError,
  ProofMetadata,
} from '../types';

interface CreateProofResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    connectionId: string;
    state: string;
    threadId: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface VerifyProofResponse {
  statusCode: number;
  data: {
    id: string;
    state: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface ProofDetailsResponse {
  statusCode: number;
  data: Array<{
    schemaId: string;
    credDefId: string;
    [key: string]: string; // Dynamic attributes
  }>;
}

export class ProofManager {
  constructor(
    private httpClient: AxiosInstance,
    private organizationId: string
  ) {}

  /**
   * Send a proof request to a connected holder
   *
   * @param options - Proof request configuration
   * @returns Proof request details
   */
  async requestProof(options: ProofRequestOptions): Promise<ProofRequest> {
    const { connectionId, comment, attributes } = options;

    // Validate attributes
    if (!attributes || attributes.length === 0) {
      throw new ValidationError('At least one attribute must be requested');
    }

    // Build proof request payload
    const payload = {
      connectionId,
      comment: comment || 'Please share your credentials',
      orgId: this.organizationId,
      proofFormats: {
        indy: {
          attributes: attributes.map((attr) => ({
            attributeName: attr.attributeName,
            schemaId: attr.schemaId,
            credDefId: attr.credDefId,
            ...attr.restrictions,
          })),
        },
      },
    };

    const response = await this.httpClient.post<CreateProofResponse>(
      `/orgs/${this.organizationId}/proofs?requestType=indy`,
      payload
    );

    const { data } = response.data;

    return {
      proofId: data.id,
      connectionId: data.connectionId,
      state: this.normalizeProofState(data.state),
      threadId: data.threadId,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  /**
   * Verify a received proof presentation
   *
   * @param proofId - The proof ID to verify
   * @returns Verification result with extracted attributes
   */
  async verifyProof(proofId: string): Promise<VerifiedProof> {
    try {
      // Step 1: Verify the proof cryptographically
      const verifyResponse = await this.httpClient.put<VerifyProofResponse>(
        `/orgs/${this.organizationId}/proofs/${proofId}`,
        {
          action: 'verify-presentation',
          orgId: this.organizationId,
        }
      );

      const { data: verifyData } = verifyResponse.data;

      if (!verifyData.verified) {
        throw new ValidationError('Proof verification failed');
      }

      // Step 2: Fetch verified proof details
      const detailsResponse = await this.httpClient.get<ProofDetailsResponse>(
        `/orgs/${this.organizationId}/verified-proofs/${proofId}`
      );

      // Step 3: Extract attributes from the response
      const attributes = this.extractAttributes(detailsResponse.data.data);
      const metadata = this.extractMetadata(detailsResponse.data.data);

      return {
        proofId,
        verified: verifyData.verified,
        state: this.normalizeProofState(verifyData.state),
        attributes,
        metadata,
        verifiedAt: new Date(verifyData.updatedAt),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError('Proof');
      }
      throw error;
    }
  }

  /**
   * Get proof request details
   *
   * @param proofId - The proof ID to retrieve
   * @returns Proof request details
   */
  async getProof(proofId: string): Promise<ProofRequest> {
    try {
      const response = await this.httpClient.get<{ data: any }>(
        `/orgs/${this.organizationId}/proofs/${proofId}`
      );

      const { data } = response.data;

      return {
        proofId: data.id,
        connectionId: data.connectionId,
        state: this.normalizeProofState(data.state),
        threadId: data.threadId,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError('Proof');
      }
      throw error;
    }
  }

  /**
   * Extract attributes from proof details response
   *
   * CRITICAL: The ConfirmD Platform returns attributes as an array where each
   * item contains ONE attribute. We must iterate through ALL items and merge them.
   */
  private extractAttributes(
    proofData: Array<Record<string, string>>
  ): Record<string, string> {
    const attributes: Record<string, string> = {};

    // Iterate through each credential/attribute in the array
    proofData.forEach((credentialData) => {
      // Extract attribute (excluding schemaId and credDefId)
      const { schemaId, credDefId, ...extractedAttribute } = credentialData;

      // Merge this attribute into the attributes object
      Object.assign(attributes, extractedAttribute);
    });

    return attributes;
  }

  /**
   * Extract metadata (schema and credential definition info) from proof
   */
  private extractMetadata(
    proofData: Array<Record<string, string>>
  ): ProofMetadata[] {
    const metadataMap = new Map<string, ProofMetadata>();

    proofData.forEach((credentialData) => {
      const key = `${credentialData.schemaId}:${credentialData.credDefId}`;
      if (!metadataMap.has(key)) {
        metadataMap.set(key, {
          schemaId: credentialData.schemaId,
          credDefId: credentialData.credDefId,
        });
      }
    });

    return Array.from(metadataMap.values());
  }

  /**
   * Normalize proof state from various formats
   */
  private normalizeProofState(state: string): ProofState {
    const normalized = state.toLowerCase().replace(/-/g, '');

    const stateMap: Record<string, ProofState> = {
      requestsent: 'request-sent',
      presentationreceived: 'presentation-received',
      done: 'done',
      abandoned: 'abandoned',
      declined: 'declined',
    };

    return stateMap[normalized] || 'abandoned';
  }
}
