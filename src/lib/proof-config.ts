/**
 * Proof Request Configuration
 *
 * Utilities for managing proof request configuration from:
 * 1. Config file (config/proof-attributes.json) - primary source
 * 2. Environment variables - fallback
 */

import { ProofAttributeRequest } from "./api/types";
import * as fs from "fs";
import * as path from "path";

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
  return process.env.PROOF_CRED_DEF_ID;
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
}

/**
 * Load attributes from config file
 *
 * @returns Array of attribute configurations or null if file doesn't exist
 */
function loadAttributesFromFile(): AttributeConfig[] | null {
  try {
    const configPath = path.join(process.cwd(), "config", "proof-attributes.json");

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
 * 1. Config file (config/proof-attributes.json)
 * 2. Environment variable PROOF_ATTRIBUTES
 *
 * Environment variable supports two formats:
 * 1. Simple comma-separated list: PROOF_ATTRIBUTES=attr1,attr2,attr3
 * 2. JSON array with predicates: PROOF_ATTRIBUTES=[{"name":"age","predicate":">","value":18},{"name":"name"}]
 *
 * @returns Array of attribute configurations
 */
export function getProofAttributes(): Array<string | AttributeConfig> {
  // Try loading from config file first
  const fileAttributes = loadAttributesFromFile();
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
 * Supports both simple attributes and predicates
 *
 * @returns Array of proof attribute requests ready for API
 */
export function buildProofAttributeRequests(): ProofAttributeRequest[] {
  const schemaId = getProofSchemaId();
  const credDefId = getProofCredDefId();
  const attributes = getProofAttributes();

  return attributes.map((attr) => {
    // Handle JSON object format with predicates
    if (typeof attr === "object" && attr !== null) {
      return {
        attributeName: attr.name,
        schemaId,
        ...(credDefId && { credDefId }),
        ...(attr.predicate && { condition: attr.predicate }),
        ...(attr.value !== undefined && { value: Number(attr.value) }),
      };
    }

    // Handle simple string format
    return {
      attributeName: attr,
      schemaId,
      ...(credDefId && { credDefId }),
    };
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
