import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { getAccessToken, invalidateToken } from "./confirmd-auth";
import { ProofRequestType } from "./types";
import type {
  ApiError,
  ConfirmdApiResponse,
  ConfirmdPlatformResponse,
  Organization,
  StudentRegistrationData,
  StudentProfile,
  WalletConnectionRequest,
  WalletDataRequest,
  WalletSignatureRequest,
  CreateProofRequestPayload,
  ProofRecord,
  VerifiedProofDetails,
} from "./types";

/**
 * Confirmd API Client
 *
 * Handles authenticated requests to the Confirmd Platform API with:
 * - Automatic OAuth token injection
 * - Token refresh on 401 errors
 * - Comprehensive error handling
 * - Type-safe request/response handling
 */
class ConfirmdClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.CONFIRMD_BASE_URL || "";

    if (!this.baseURL) {
      throw new Error(
        "CONFIRMD_BASE_URL is not configured. Please set it in your environment variables."
      );
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Request interceptor to add authentication token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await getAccessToken();
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // If 401 and we haven't retried yet, invalidate token and retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Invalidate the cached token
            invalidateToken();

            // Get a fresh token
            const token = await getAccessToken();

            // Update the authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            // Retry the original request
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors and convert to ApiError format
   */
  private handleError(error: AxiosError): ApiError {
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data as any;
      return {
        error: responseData.error || "api_error",
        error_description:
          responseData.error_description ||
          responseData.message ||
          "An error occurred while communicating with the API",
        status: error.response.status,
      };
    }

    return {
      error: "network_error",
      error_description: "Failed to connect to the API",
    };
  }

  /**
   * Make a GET request
   */
  async get<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ConfirmdApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("[ConfirmdClient] GET request failed:", {
        endpoint,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ConfirmdApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ConfirmdApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ConfirmdApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(
        endpoint,
        data,
        config
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ConfirmdApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error as ApiError,
      };
    }
  }

  /**
   * Verify wallet connection
   * @param request - Wallet connection request with sessionId and walletAddress
   */
  async verifyWalletConnection(request: WalletConnectionRequest) {
    return this.post("/wallet/verify", request);
  }

  /**
   * Request data from wallet
   * @param request - Data request with sessionId and requested fields
   */
  async requestWalletData(request: WalletDataRequest) {
    return this.post("/wallet/request-data", request);
  }

  /**
   * Verify wallet signature for authentication
   * @param request - Signature verification request
   */
  async verifyWalletSignature(request: WalletSignatureRequest) {
    return this.post("/wallet/verify-signature", request);
  }

  /**
   * Register a new student
   * @param studentData - Complete student registration data
   */
  async registerStudent(studentData: StudentRegistrationData) {
    return this.post<StudentProfile>("/students/register", studentData);
  }

  /**
   * Authenticate a student using wallet signature
   * @param walletAddress - Student's wallet address
   * @param signature - Cryptographic signature for verification
   */
  async authenticateStudent(walletAddress: string, signature: string) {
    return this.post<{ token: string; student: StudentProfile }>(
      "/students/authenticate",
      { walletAddress, signature }
    );
  }

  /**
   * Get student profile by ID
   * @param studentId - Unique student identifier
   */
  async getStudentProfile(studentId: string) {
    return this.get<StudentProfile>(`/students/${studentId}`);
  }

  /**
   * Update student profile
   * @param studentId - Unique student identifier
   * @param updates - Partial student data to update
   */
  async updateStudentProfile(
    studentId: string,
    updates: Partial<StudentRegistrationData>
  ) {
    return this.patch<StudentProfile>(`/students/${studentId}`, updates);
  }

  /**
   * Get organization details by ID
   * @param organizationId - Unique organization identifier
   */
  async getOrganizationById(organizationId: string) {
    return this.get<ConfirmdPlatformResponse<Organization>>(
      `/orgs/${organizationId}`
    );
  }

  /**
   * Get current organization from environment variable
   * Reads CONFIRMD_ORG_ID from process.env
   */
  async getCurrentOrganization() {
    const orgId = process.env.CONFIRMD_ORG_ID;
    console.log("[ConfirmdClient] getCurrentOrganization - Reading process.env.CONFIRMD_ORG_ID:", orgId);
    console.log("[ConfirmdClient] Will call endpoint:", `/orgs/${orgId}`);
    if (!orgId) {
      return {
        success: false,
        error: {
          error: "missing_organization_id",
          error_description: "CONFIRMD_ORG_ID not found in environment variables",
        },
      } as ConfirmdApiResponse<ConfirmdPlatformResponse<Organization>>;
    }
    return this.getOrganizationById(orgId);
  }

  /**
   * Create a webhook subscription
   * @param config - Webhook configuration
   */
  async createWebhook(config: {
    url: string;
    secret: string;
    topics: string[];
    enabled?: boolean;
  }) {
    return this.post("/webhooks", config);
  }

  /**
   * List all webhook subscriptions
   */
  async listWebhooks() {
    return this.get("/webhooks");
  }

  /**
   * Delete a webhook subscription
   * @param webhookId - Unique webhook identifier
   */
  async deleteWebhook(webhookId: string) {
    return this.delete(`/webhooks/${webhookId}`);
  }

  /**
   * Create a new connection invitation
   * Creates a unique, single-use invitation for establishing a connection
   * @param label - Optional label for the invitation (defaults to org name)
   * @param multiUse - Whether invitation can be used multiple times (default: false)
   * @returns Connection invitation object with invitation URL and ID
   */
  async createConnectionInvitation(
    label?: string,
    multiUse: boolean = false
  ): Promise<ConfirmdApiResponse<{
    invitationId: string;
    invitationUrl: string;
    state: string;
  }>> {
    try {
      // Get organization ID
      const orgId = process.env.CONFIRMD_ORG_ID;
      console.log("[ConfirmdClient] createConnectionInvitation - Reading process.env.CONFIRMD_ORG_ID:", orgId);
      if (!orgId) {
        return {
          success: false,
          error: {
            error: "missing_organization_id",
            error_description: "CONFIRMD_ORG_ID not found in environment variables",
          },
        };
      }

      // Get the agent ID from organization
      const orgResult = await this.getCurrentOrganization();
      if (!orgResult.success || !orgResult.data?.data) {
        return {
          success: false,
          error: orgResult.error || {
            error: "organization_not_found",
            error_description: "Could not retrieve organization details",
          },
        };
      }

      const agent = orgResult.data.data.org_agents?.[0];
      if (!agent) {
        return {
          success: false,
          error: {
            error: "no_agents_found",
            error_description: "Organization has no agents configured",
          },
        };
      }

      // Create the invitation
      const result = await this.post(`/connections/create-invitation`, {
        agentId: agent.id,
        label: label || orgResult.data.data.name,
        multiUse,
      });

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: {
          error: "invitation_creation_failed",
          error_description:
            error.message || "Failed to create connection invitation",
        },
      };
    }
  }

  /**
   * Get connection invitation URL from current organization
   * Extracts the multi-use invitation from org_agents
   * @returns Connection invitation URL or null if not found
   * @deprecated Use createConnectionInvitation() for session-specific invitations
   */
  async getConnectionInvitation(): Promise<ConfirmdApiResponse<string>> {
    try {
      // Check if there's an environment variable fallback for invitation URL
      const envInvitationUrl = process.env.CONFIRMD_INVITATION_URL;

      if (envInvitationUrl) {
        console.log("[ConfirmdClient] Using invitation URL from environment variable");
        try {
          const response = await axios.get<string>(envInvitationUrl);
          return {
            success: true,
            data: response.data,
          };
        } catch (error: any) {
          console.error("[ConfirmdClient] Failed to fetch invitation from env URL:", error.message);
          // Continue to try organization method
        }
      }

      const orgResult = await this.getCurrentOrganization();

      if (!orgResult.success || !orgResult.data?.data) {
        return {
          success: false,
          error: orgResult.error || {
            error: "organization_not_found",
            error_description: "Could not retrieve organization details",
          },
        };
      }

      const org = orgResult.data.data;

      // Extract invitation from first agent
      const agent = org.org_agents?.[0];
      if (!agent) {
        return {
          success: false,
          error: {
            error: "no_agents_found",
            error_description: "Organization has no agents configured",
          },
        };
      }

      const invitation = agent.agent_invitations?.[0];
      if (!invitation) {
        return {
          success: false,
          error: {
            error: "no_invitation_found",
            error_description: "Agent has no connection invitations",
          },
        };
      }

      // Fetch the actual invitation URL from the storage
      const invitationUrl = invitation.connectionInvitation;
      const response = await axios.get<string>(invitationUrl);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          error: "invitation_fetch_failed",
          error_description:
            error.message || "Failed to fetch connection invitation",
        },
      };
    }
  }

  // ============================================================
  // Proof Request Operations
  // ============================================================

  /**
   * Create a proof request and send it to an existing connection
   *
   * @param payload - Proof request payload
   * @param requestType - Type of proof request (INDY or AnonCreds)
   * @returns Proof record
   */
  async createProofRequest(
    payload: CreateProofRequestPayload,
    requestType: ProofRequestType = ProofRequestType.INDY
  ): Promise<ConfirmdApiResponse<ProofRecord>> {
    try {
      const url = `/orgs/${payload.orgId}/proofs?requestType=${requestType}`;
      console.log('[ConfirmdClient] Sending proof request to:', `${this.baseURL}${url}`);
      console.log('[ConfirmdClient] Payload:', JSON.stringify(payload, null, 2));

      const response = await this.axiosInstance.post<ConfirmdPlatformResponse<ProofRecord>>(
        url,
        payload
      );

      console.log('[ConfirmdClient] Proof request successful:', response.data);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('[ConfirmdClient] Proof request failed - RAW ERROR:', error.response?.data || error);
      console.error('[ConfirmdClient] Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get proof details including presentation attributes
   *
   * @param orgId - Organization ID
   * @param proofId - Proof ID
   * @returns Verified proof details
   */
  async getProofDetails(
    orgId: string,
    proofId: string
  ): Promise<ConfirmdApiResponse<VerifiedProofDetails[]>> {
    try {
      const response = await this.axiosInstance.get<ConfirmdPlatformResponse<VerifiedProofDetails[]>>(
        `/orgs/${orgId}/verified-proofs/${proofId}`
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Verify the cryptographic validity of a received presentation
   *
   * @param orgId - Organization ID
   * @param proofId - Proof ID
   * @returns Verification result
   */
  async verifyProof(
    orgId: string,
    proofId: string
  ): Promise<ConfirmdApiResponse<{ verified: boolean; proofId: string }>> {
    try {
      const response = await this.axiosInstance.post<ConfirmdPlatformResponse<{ verified: boolean; proofId: string }>>(
        `/orgs/${orgId}/proofs/${proofId}/verify`
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get proof record by ID
   *
   * @param orgId - Organization ID
   * @param proofId - Proof ID
   * @returns Proof record
   */
  async getProofRecord(
    orgId: string,
    proofId: string
  ): Promise<ConfirmdApiResponse<ProofRecord>> {
    try {
      const response = await this.axiosInstance.get<ConfirmdPlatformResponse<ProofRecord>>(
        `/orgs/${orgId}/proofs/${proofId}`
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }
}

// Export singleton instance
export const confirmdClient = new ConfirmdClient();

// Export class for custom instances
export default ConfirmdClient;
