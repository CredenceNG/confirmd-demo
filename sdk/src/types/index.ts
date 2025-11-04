/**
 * ConfirmD Verifier SDK Type Definitions
 *
 * Type definitions for building verifier applications with ConfirmD Platform
 */

// ============================================
// Configuration Types
// ============================================

export interface ConfirmDConfig {
  /** ConfirmD Platform API base URL */
  baseUrl?: string;
  /** Organization ID from ConfirmD Platform */
  organizationId: string;
  /** OAuth2 client credentials */
  auth: {
    tokenUrl: string;
    clientId: string;
    clientSecret: string;
  };
  /** Optional timeout for API requests in milliseconds */
  timeout?: number;
}

// ============================================
// Connection Types
// ============================================

export interface ConnectionInvitation {
  /** Unique invitation ID */
  invitationId: string;
  /** Out-of-band invitation URL for QR code or deep link */
  invitationUrl: string;
  /** Expiration timestamp */
  expiresAt: Date;
}

export interface Connection {
  /** Unique connection ID */
  connectionId: string;
  /** Connection state */
  state: ConnectionState;
  /** Label from the holder's wallet */
  theirLabel?: string;
  /** DID of the connected holder */
  theirDid?: string;
  /** When the connection was created */
  createdAt: Date;
  /** When the connection was last updated */
  updatedAt: Date;
}

export type ConnectionState =
  | 'invitation'
  | 'request'
  | 'response'
  | 'active'
  | 'completed'
  | 'error'
  | 'abandoned';

// ============================================
// Proof Request Types
// ============================================

export interface ProofRequestOptions {
  /** The active connection ID to send the proof request to */
  connectionId: string;
  /** Optional comment/instructions for the holder */
  comment?: string;
  /** Requested attributes with credential restrictions */
  attributes: AttributeRequest[];
}

export interface AttributeRequest {
  /** Name of the attribute to request */
  attributeName: string;
  /** Schema ID that issued the credential */
  schemaId: string;
  /** Credential definition ID */
  credDefId: string;
  /** Optional restrictions (predicates, etc.) */
  restrictions?: Record<string, any>;
}

export interface ProofRequest {
  /** Unique proof request ID */
  proofId: string;
  /** Connection this proof request was sent to */
  connectionId: string;
  /** Current state of the proof exchange */
  state: ProofState;
  /** When the proof request was created */
  createdAt: Date;
  /** When the proof was last updated */
  updatedAt: Date;
  /** Thread ID for message correlation */
  threadId: string;
}

export type ProofState =
  | 'request-sent'
  | 'presentation-received'
  | 'done'
  | 'abandoned'
  | 'declined';

// ============================================
// Proof Verification Types
// ============================================

export interface VerifiedProof {
  /** Proof ID */
  proofId: string;
  /** Whether the proof is cryptographically valid */
  verified: boolean;
  /** Final state of the proof */
  state: ProofState;
  /** Presented attributes (key-value pairs) */
  attributes: Record<string, string>;
  /** When the proof was verified */
  verifiedAt: Date;
  /** Schema and credential definition metadata */
  metadata: ProofMetadata[];
}

export interface ProofMetadata {
  /** Schema ID */
  schemaId: string;
  /** Credential definition ID */
  credDefId: string;
  /** Issuer DID */
  issuerDid?: string;
}

// ============================================
// Webhook Types
// ============================================

export interface WebhookPayload {
  /** Type of webhook event */
  type: 'Connection' | 'Proof' | 'Credential';
  /** Organization ID */
  orgId: string;
  /** Agent ID */
  agentId: string;
  /** Timestamp of the event */
  timestamp: string;
  /** Connection ID (if applicable) */
  connectionId?: string;
  /** Proof ID (if applicable) */
  proofId?: string;
  /** State of the resource */
  state?: string;
  /** Label from holder (for connections) */
  theirLabel?: string;
}

// ============================================
// Error Types
// ============================================

export class ConfirmDError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ConfirmDError';
  }
}

export class AuthenticationError extends ConfirmDError {
  constructor(message: string) {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ConfirmDError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ConfirmDError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// ============================================
// Event Emitter Types
// ============================================

export interface EventMap {
  'connection:state-changed': (connection: Connection) => void;
  'proof:state-changed': (proof: ProofRequest) => void;
  'proof:verified': (verifiedProof: VerifiedProof) => void;
  'error': (error: ConfirmDError) => void;
}

export type EventName = keyof EventMap;
export type EventHandler<T extends EventName> = EventMap[T];
