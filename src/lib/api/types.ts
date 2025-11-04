/**
 * Confirmd Platform API Types
 *
 * This file contains TypeScript interfaces for the Confirmd Platform API
 * including authentication, organization, and wallet-related types.
 */

// ============================================================
// Authentication Types
// ============================================================

/**
 * OAuth 2.0 Token Response from Confirmd Platform
 */
export interface ConfirmdTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  "not-before-policy": number;
  scope: string;
}

/**
 * OAuth 2.0 Client Credentials Configuration
 */
export interface ConfirmdAuthConfig {
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
}

/**
 * Cached token entry with expiration timestamp
 */
export interface TokenCacheEntry {
  access_token: string;
  expires_at: number; // Unix timestamp in milliseconds
  token_type: string;
}

// ============================================================
// API Response Types
// ============================================================

/**
 * Standard API Error Response
 */
export interface ApiError {
  error: string;
  error_description?: string;
  status?: number;
}

/**
 * Generic API Response Wrapper
 */
export interface ConfirmdApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Confirmd Platform Standard Response Format
 */
export interface ConfirmdPlatformResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

// ============================================================
// Organization Types
// ============================================================

/**
 * Organization Agent Type
 */
export interface OrgAgentType {
  id: string;
  createDateTime: string;
  lastChangedDateTime: string;
  agent: "SHARED" | "DEDICATED";
}

/**
 * Ledger Information
 */
export interface Ledger {
  id: string;
  name: string;
  networkType: "mainnet" | "testnet" | "devnet";
}

/**
 * DID Document following W3C DID specification
 */
export interface DidDocument {
  id: string;
  "@context": string[];
  authentication: string[];
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyBase58: string;
  }>;
}

/**
 * Agent Invitation
 */
export interface AgentInvitation {
  id: string;
  connectionInvitation: string;
  multiUse: boolean;
}

/**
 * Organization Agent
 */
export interface OrgAgent {
  id: string;
  orgDid: string;
  didDocument: DidDocument;
  walletName: string;
  agentEndPoint: string;
  agentSpinUpStatus: number;
  agentsTypeId: string;
  orgAgentTypeId: string;
  createDateTime: string;
  tenantId: string;
  agent_invitations: AgentInvitation[];
  org_agent_type: OrgAgentType;
  ledgers: Ledger;
}

/**
 * Organization Schema
 */
export interface OrganizationSchema {
  id: string;
  name: string;
  version: string;
  attributes: string[];
  createdAt: string;
}

/**
 * Complete Organization Details
 */
export interface Organization {
  id: string;
  name: string;
  description: string;
  orgSlug: string;
  logoUrl: string | null;
  website: string;
  publicProfile: boolean;
  cityCode: string | null;
  countryCode: string | null;
  stateCode: string | null;
  schema: OrganizationSchema[];
  org_agents: OrgAgent[];
}

// ============================================================
// Student/User Types
// ============================================================

/**
 * Student Registration Data
 */
export interface StudentRegistrationData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  nin: string;
  bvn: string;
  gender: "male" | "female" | "other";
  stateOfOrigin: string;
  lga: string;
  address: string;
  walletAddress?: string;
}

/**
 * Student Profile
 */
export interface StudentProfile extends StudentRegistrationData {
  id: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Wallet Types
// ============================================================

/**
 * Wallet Connection Request
 */
export interface WalletConnectionRequest {
  sessionId: string;
  walletAddress: string;
}

/**
 * Wallet Data Request
 */
export interface WalletDataRequest {
  sessionId: string;
  dataFields: string[];
}

/**
 * Wallet Signature Verification Request
 */
export interface WalletSignatureRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

/**
 * Wallet Connection Status
 */
export type WalletConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "requesting"
  | "authenticating";

// ============================================================
// Validation Types
// ============================================================

/**
 * Field Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  missingFields?: string[];
  invalidFields?: Record<string, string>;
}

// ============================================================
// Connection and Webhook Types
// ============================================================

/**
 * Connection status for DIDComm connections
 */
export type ConnectionStatus =
  | "invitation"    // Invitation created
  | "request"       // Connection request received
  | "response"      // Connection response sent
  | "active"        // Connection established
  | "completed"     // Connection fully established
  | "error"         // Connection failed
  | "abandoned";    // Connection abandoned/expired

/**
 * DIDComm connection record from Confirmd Platform
 */
export interface Connection {
  connectionId: string;
  state: ConnectionStatus;
  invitationId?: string;
  theirDid?: string;
  theirLabel?: string;
  myDid?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Webhook event types from Confirmd Platform
 */
export type WebhookEventType =
  | "connections"
  | "credentials"
  | "presentations"
  | "basic-messages"
  | "proofs";

/**
 * Webhook topic for specific events
 */
export type WebhookTopic =
  | "connections.invitation"
  | "connections.request"
  | "connections.response"
  | "connections.active"
  | "connections.completed"
  | "credentials.offer"
  | "credentials.request"
  | "credentials.issued"
  | "proofs.request"
  | "proofs.presentation"
  | "proofs.verified";

/**
 * Webhook payload from Confirmd Platform
 */
/**
 * Actual webhook payload structure from Confirmd Platform
 * Fields are flat at the top level, not nested in a `data` object
 */
export interface ConfirmdWebhookPayload {
  type: string;
  createDateTime: string;
  lastChangedDateTime: string;
  id: string;
  connectionId: string;
  state: string;
  imageUrl?: string;
  orgDid: string;
  theirLabel?: string;
  theirDid?: string;
  autoAcceptConnection?: boolean;
  outOfBandId: string;
  orgId: string;
  contextCorrelationId?: string;
  createdBy?: string;
  lastChangedBy?: string;
  timestamp: string;
  clientContext?: Record<string, any>;
  [key: string]: any;
}

/**
 * @deprecated Use ConfirmdWebhookPayload instead
 * Legacy webhook payload structure (kept for backwards compatibility)
 */
export interface WebhookPayload {
  webhookId: string;
  topic: WebhookTopic;
  timestamp: string;
  organizationId: string;
  agentId: string;
  data: {
    connectionId?: string;
    state?: ConnectionStatus;
    invitationId?: string;
    credentialExchangeId?: string;
    presentationExchangeId?: string;
    [key: string]: any;
  };
}

/**
 * Connection session for tracking user connections
 */
export interface ConnectionSession {
  id: string;
  sessionId: string;
  invitationId: string;
  invitationUrl: string;
  status: ConnectionStatus;
  connectionId?: string;
  theirDid?: string;
  theirLabel?: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    requestType?: "registration" | "authentication";
    userId?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * Credential exchange state
 */
export type CredentialExchangeState =
  | "offer-sent"
  | "offer-received"
  | "request-sent"
  | "request-received"
  | "credential-issued"
  | "credential-received"
  | "done"
  | "abandoned";

/**
 * Credential exchange record
 */
export interface CredentialExchange {
  credentialExchangeId: string;
  connectionId: string;
  state: CredentialExchangeState;
  credentialDefinitionId?: string;
  schemaId?: string;
  attributes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Presentation exchange state (Proof states from ConfirmD)
 */
export type PresentationExchangeState =
  | "request-sent"        // Proof request sent to holder
  | "presentation-received" // Holder submitted presentation
  | "done"                // Verified successfully
  | "abandoned";          // Request expired/rejected

/**
 * Proof request type
 */
export enum ProofRequestType {
  INDY = "indy",
  AnonCreds = "anoncreds"
}

/**
 * Proof attribute request
 */
export interface ProofAttributeRequest {
  attributeName: string;
  schemaId: string;
  credDefId?: string;
  condition?: ">" | "<" | ">=" | "<="; // For predicates
  value?: number;                       // For predicates
}

/**
 * Proof request payload for ConfirmD Platform
 */
export interface CreateProofRequestPayload {
  connectionId: string;
  comment: string;
  orgId: string;
  proofFormats: {
    indy: {
      attributes: ProofAttributeRequest[];
    };
  };
}

/**
 * Proof record from ConfirmD Platform
 */
export interface ProofRecord {
  id: string;
  proofId: string;
  connectionId: string;
  state: PresentationExchangeState;
  comment?: string;
  requestedAttributes?: ProofAttributeRequest[];
  presentedAttributes?: Record<string, any>;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Verified proof details from ConfirmD Platform
 */
export interface VerifiedProofDetails {
  schemaId: string;
  credDefId?: string;
  [key: string]: any; // Dynamic attributes from the credential
}

/**
 * Proof verification request
 */
export interface VerifyProofRequest {
  orgId: string;
  proofId: string;
}

/**
 * @deprecated Use ProofRecord instead
 * Presentation exchange record
 */
export interface PresentationExchange {
  presentationExchangeId: string;
  connectionId: string;
  state: PresentationExchangeState;
  requestedAttributes?: string[];
  requestedPredicates?: any[];
  presentedAttributes?: Record<string, string>;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Student Credential Attributes
// ============================================================

/**
 * Student credential attributes from proof presentation
 */
export interface StudentCredentialAttributes {
  admission_number?: string;
  programme?: string;
  graduation_year?: string;
  surname?: string;
  school_name?: string;
  national_id_number?: string;
  department?: string;
  othernames?: string;
  matric_number?: string;
  date_issued?: string;
  date_expiry?: string;
  bank_verification_number?: string;
  school_nuc_number?: string;
  jamb_number?: string;
  date_of_birth?: string;
}
