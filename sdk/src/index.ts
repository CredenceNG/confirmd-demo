/**
 * ConfirmD Verifier SDK
 *
 * Official SDK for building verifier applications with ConfirmD Platform
 *
 * @example
 * ```typescript
 * import { ConfirmDClient } from '@confirmd/verifier-sdk';
 *
 * const client = new ConfirmDClient({
 *   organizationId: 'your-org-id',
 *   auth: {
 *     tokenUrl: 'https://manager.credence.ng/realms/confirmd-bench/protocol/openid-connect/token',
 *     clientId: 'your-client-id',
 *     clientSecret: 'your-client-secret',
 *   },
 * });
 *
 * // Create connection invitation
 * const invitation = await client.connections.createInvitation();
 * console.log('Scan this QR code:', invitation.invitationUrl);
 *
 * // Request proof
 * const proof = await client.proofs.requestProof({
 *   connectionId: 'connection-id',
 *   attributes: [
 *     {
 *       attributeName: 'name',
 *       schemaId: 'schema-id',
 *       credDefId: 'cred-def-id',
 *     },
 *   ],
 * });
 *
 * // Verify proof
 * const verified = await client.proofs.verifyProof(proof.proofId);
 * console.log('Verified attributes:', verified.attributes);
 * ```
 */

// Core client
export { ConfirmDClient } from './core/client';
export { ConnectionManager } from './core/connections';
export { ProofManager } from './core/proofs';

// Types
export * from './types';

// Default export
export { ConfirmDClient as default } from './core/client';
