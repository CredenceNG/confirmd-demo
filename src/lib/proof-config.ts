/**
 * Unified Proof Request Configuration
 *
 * This is the SINGLE source of truth for all proof request configuration.
 * All demos use this module for consistent proof request handling.
 *
 * Supports two configuration approaches:
 * 1. Credential-based (recommended): Use "credential" field to reference a credential type
 * 2. Explicit IDs: Directly specify schemaId/credDefId per attribute
 *
 * Configuration sources (priority order):
 * 1. Config file (config/proof-attributes.json or custom file)
 * 2. Environment variables - fallback
 */

import { ProofAttributeRequest } from "./api/types";
import * as fs from "fs";
import * as path from "path";

/**
 * Credential type to Schema/CredDef ID mapping
 */
interface CredentialMapping {
  schemaId: string;
  credDefId?: string;
}

/**
 * Get credential type to schema/credDefId mappings from environment variables
 *
 * This centralizes all credential type mappings so demos can reference credentials
 * by name (e.g., "Student Card") rather than hardcoding IDs.
 */
export function getCredentialMappings(): Record<string, CredentialMapping> {
  return {
    "Student Card": {
      schemaId: process.env.STUDENT_CARD_SCHEMA_ID || process.env.PROOF_SCHEMA_ID || "",
      credDefId: process.env.STUDENT_CARD_CRED_DEF_ID || (() => { throw new Error("STUDENT_CARD_CRED_DEF_ID is not configured"); })(),
    },
    "Statement of Results": {
      schemaId: process.env.STATEMENT_OF_RESULT_SCHEMA_ID || "",
      credDefId: process.env.STATEMENT_OF_RESULT_CRED_DEF_ID,
    },
    "Medical Fitness Certificate": {
      schemaId: process.env.MEDICAL_FITNESS_SCHEMA_ID || "",
      credDefId: process.env.MEDICAL_FITNESS_CRED_DEF_ID,
    },
    "NYSC Green Card": {
      schemaId: process.env.NYSC_GREEN_CARD_SCHEMA_ID || "",
      credDefId: process.env.NYSC_GREEN_CARD_CRED_DEF_ID,
    },
    "NYSC Certificate": {
      schemaId: process.env.NYSC_CERTIFICATE_SCHEMA_ID || "",
      credDefId: process.env.NYSC_CERTIFICATE_CRED_DEF_ID,
    },
    "eKYC": {
      schemaId: process.env.EKYC_SCHEMA_ID || "",
      credDefId: process.env.EKYC_CRED_DEF_ID,
    },
    "Health Card": {
      schemaId: process.env.HEALTH_CARD_SCHEMA_ID || "",
      credDefId: process.env.HEALTH_CARD_CRED_DEF_ID,
    },
  };
}

/**
 * Get proof schema ID from environment
 */
export function getProofSchemaId(): string {
  const schemaId = process.env.PROOF_SCHEMA_ID;
  if (!schemaId) {
    throw new Error("PROOF_SCHEMA_ID is not configured in environment variables");
  }
  return schemaId;
}

/**
 * Get proof credential definition ID from environment
 */
export function getProofCredDefId(): string | undefined {
  return undefined;
}

/**
 * Attribute configuration interface
 */
interface AttributeConfig {
  name: string;
  description?: string;
  predicate?: ">" | "<" | ">=" | "<=";
  value?: number;
  comment?: string;
  credential?: string; // Optional: identifies which credential this attribute comes from (for multi-credential proofs)
  schemaId?: string;   // Optional: override schema ID for this specific attribute
  credDefId?: string;  // Optional: override credential definition ID for this specific attribute
}

/**
 * Load attributes from config file
 *
 * @param configFileName - Optional custom config file name (e.g., "nysc-proof-attributes.json")
 * @returns Array of attribute configurations or null if file doesn't exist
 */
function loadAttributesFromFile(configFileName?: string): AttributeConfig[] | null {
  try {
    const fileName = configFileName || "proof-attributes.json";
    const configPath = path.join(process.cwd(), "config", fileName);

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(configPath, "utf-8");
    const attributes = JSON.parse(fileContent);

    if (!Array.isArray(attributes)) {
      throw new Error("Config file must contain an array of attributes");
    }

    return attributes;
  } catch (error) {
    throw new Error(
      `Failed to load proof attributes from config file: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get list of proof attributes
 *
 * Priority:
 * 1. Config file (config/proof-attributes.json or custom file)
 * 2. Environment variable PROOF_ATTRIBUTES
 *
 * Environment variable supports two formats:
 * 1. Simple comma-separated list: PROOF_ATTRIBUTES=attr1,attr2,attr3
 * 2. JSON array with predicates: PROOF_ATTRIBUTES=[{"name":"age","predicate":">","value":18},{"name":"name"}]
 *
 * @param configFileName - Optional custom config file name
 * @returns Array of attribute configurations
 */
export function getProofAttributes(configFileName?: string): Array<string | AttributeConfig> {
  // Try loading from config file first
  const fileAttributes = loadAttributesFromFile(configFileName);
  if (fileAttributes) {
    return fileAttributes;
  }

  // Fallback to environment variable
  const attributes = process.env.PROOF_ATTRIBUTES;
  if (!attributes) {
    throw new Error(
      "PROOF_ATTRIBUTES is not configured. " +
      "Either create config/proof-attributes.json or set PROOF_ATTRIBUTES environment variable"
    );
  }

  // Try parsing as JSON first (for predicate support)
  if (attributes.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(attributes);
      if (!Array.isArray(parsed)) {
        throw new Error("PROOF_ATTRIBUTES JSON must be an array");
      }
      return parsed;
    } catch (error) {
      throw new Error(
        `Invalid PROOF_ATTRIBUTES JSON format: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Otherwise, parse as comma-separated list (backward compatible)
  return attributes
    .split(",")
    .map((attr) => attr.trim())
    .filter((attr) => attr.length > 0);
}

/**
 * Build proof attribute requests from environment configuration
 *
 * UNIFIED APPROACH supporting three configuration methods:
 * 1. Credential-based (RECOMMENDED): Use "credential" field to reference credential type
 *    Example: {"name": "surname", "credential": "Student Card"}
 * 2. Explicit IDs: Directly specify schemaId/credDefId per attribute
 *    Example: {"name": "surname", "schemaId": "...", "credDefId": "..."}
 * 3. Global fallback: Use environment variables PROOF_SCHEMA_ID and PROOF_CRED_DEF_ID
 *
 * The credential-based approach is recommended as it:
 * - Reduces duplication (no need to repeat IDs for each attribute)
 * - Centralizes credential configuration in environment variables
 * - Makes configs more maintainable and readable
 * - Supports multi-credential proof requests easily
 *
 * @param configFileName - Optional custom config file name (e.g., "nysc-proof-attributes.json")
 * @returns Array of proof attribute requests ready for API
 */
export function buildProofAttributeRequests(configFileName?: string): ProofAttributeRequest[] {
  // Load credential mappings (used when "credential" field is present)
  const credentialMappings = getCredentialMappings();

  // Try to get global schemaId and credDefId as fallback
  let globalSchemaId: string | undefined;
  let globalCredDefId: string | undefined;

  try {
    globalSchemaId = getProofSchemaId();
  } catch (error) {
    // SchemaId is optional - if not provided, we'll create unrestricted proof requests
    globalSchemaId = undefined;
  }

  globalCredDefId = getProofCredDefId();
  const attributes = getProofAttributes(configFileName);

  return attributes.map((attr) => {
    // Handle JSON object format with predicates
    if (typeof attr === "object" && attr !== null) {
      const request: ProofAttributeRequest = {
        attributeName: attr.name,
        ...(attr.predicate && { condition: attr.predicate }),
        ...(attr.value !== undefined && { value: Number(attr.value) }),
      };

      // Determine schemaId and credDefId using priority order:
      // 1. Credential-based mapping (if "credential" field exists)
      // 2. Explicit attribute-level IDs (if schemaId/credDefId fields exist)
      // 3. Global environment variables (fallback)

      let effectiveSchemaId: string | undefined;
      let effectiveCredDefId: string | undefined;

      if (attr.credential) {
        // RECOMMENDED: Use credential-based mapping
        const mapping = credentialMappings[attr.credential];
        if (!mapping) {
          throw new Error(
            `Unknown credential type: "${attr.credential}". ` +
            `Available types: ${Object.keys(credentialMappings).join(", ")}`
          );
        }
        effectiveSchemaId = mapping.schemaId;
        effectiveCredDefId = mapping.credDefId;
      } else {
        // Fallback to explicit IDs or global defaults
        effectiveSchemaId = attr.schemaId || globalSchemaId;
        effectiveCredDefId = attr.credDefId || globalCredDefId;
      }

      // Only add schemaId/credDefId if they exist (omit for unrestricted proofs)
      if (effectiveSchemaId) {
        request.schemaId = effectiveSchemaId;
      }
      if (effectiveCredDefId) {
        request.credDefId = effectiveCredDefId;
      }

      return request;
    }

    // Handle simple string format (use global defaults)
    const request: ProofAttributeRequest = {
      attributeName: attr,
    };

    if (globalSchemaId) {
      request.schemaId = globalSchemaId;
    }
    if (globalCredDefId) {
      request.credDefId = globalCredDefId;
    }

    return request;
  });
}

/**
 * Get proof request comment/description
 */
export function getProofRequestComment(): string {
  return process.env.PROOF_REQUEST_COMMENT || "Please share your student credentials for verification";
}

/**
 * Validate proof configuration
 *
 * @throws Error if configuration is invalid
 */
export function validateProofConfig(): void {
  try {
    getProofSchemaId();
    getProofAttributes();
  } catch (error) {
    throw new Error(
      `Invalid proof configuration: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get all proof configuration
 */
export function getProofConfig() {
  return {
    schemaId: getProofSchemaId(),
    credDefId: getProofCredDefId(),
    attributes: getProofAttributes(),
    comment: getProofRequestComment(),
  };
}
