/**
 * NYSC Proof Request Configuration
 *
 * This module handles NYSC-specific proof request configuration,
 * which requires attributes from 4 different credentials:
 * - NYSC Green Card
 * - Student Card
 * - Statement of Results
 * - Medical Fitness Certificate
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
 * Get credential mappings from environment variables
 *
 * Each credential type has its own schema ID and credential definition ID
 */
function getCredentialMappings(): Record<string, CredentialMapping> {
  return {
    "NYSC Green Card": {
      schemaId: process.env.NYSC_GREEN_CARD_SCHEMA_ID || "",
      credDefId: process.env.NYSC_GREEN_CARD_CRED_DEF_ID,
    },
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
  };
}

/**
 * Load NYSC proof attributes from config file
 */
function loadNyscProofAttributes(): any[] {
  try {
    const configPath = path.join(process.cwd(), "config", "nysc-proof-attributes.json");

    if (!fs.existsSync(configPath)) {
      throw new Error("NYSC proof attributes config file not found");
    }

    const fileContent = fs.readFileSync(configPath, "utf-8");
    const attributes = JSON.parse(fileContent);

    if (!Array.isArray(attributes)) {
      throw new Error("NYSC proof attributes config must be an array");
    }

    return attributes;
  } catch (error) {
    throw new Error(
      `Failed to load NYSC proof attributes: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Build NYSC proof attribute requests
 *
 * This function maps attributes to their respective credential types
 * and constructs the proper proof request structure.
 *
 * @returns Array of proof attribute requests for NYSC registration
 */
export function buildNyscProofAttributeRequests(): ProofAttributeRequest[] {
  const attributes = loadNyscProofAttributes();
  const credentialMappings = getCredentialMappings();

  return attributes.map((attr) => {
    const credentialType = attr.credential || "Student Card";
    const mapping = credentialMappings[credentialType];

    if (!mapping) {
      throw new Error(`Unknown credential type: ${credentialType}`);
    }

    return {
      attributeName: attr.name,
      schemaId: mapping.schemaId,
      ...(mapping.credDefId && { credDefId: mapping.credDefId }),
      ...(attr.predicate && { condition: attr.predicate }),
      ...(attr.value !== undefined && { value: Number(attr.value) }),
    };
  });
}

/**
 * Load comprehensive onboarding proof attributes (includes Green Card)
 */
function loadComprehensiveOnboardingAttributes(): any[] {
  try {
    const configPath = path.join(process.cwd(), "config", "comprehensive-onboarding-proof-attributes.json");

    if (!fs.existsSync(configPath)) {
      throw new Error("Comprehensive onboarding proof attributes config file not found");
    }

    const fileContent = fs.readFileSync(configPath, "utf-8");
    const attributes = JSON.parse(fileContent);

    if (!Array.isArray(attributes)) {
      throw new Error("Comprehensive onboarding proof attributes config must be an array");
    }

    return attributes;
  } catch (error) {
    throw new Error(
      `Failed to load comprehensive onboarding proof attributes: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Build comprehensive onboarding proof attribute requests
 *
 * This includes all 4 credentials: Green Card, Student Card, Statement of Results, Medical Fitness
 *
 * @returns Array of proof attribute requests for comprehensive onboarding
 */
export function buildComprehensiveOnboardingProofRequests(): ProofAttributeRequest[] {
  const attributes = loadComprehensiveOnboardingAttributes();
  const credentialMappings = getCredentialMappings();

  return attributes.map((attr) => {
    const credentialType = attr.credential || "Student Card";
    const mapping = credentialMappings[credentialType];

    if (!mapping) {
      throw new Error(`Unknown credential type: ${credentialType}`);
    }

    return {
      attributeName: attr.name,
      schemaId: mapping.schemaId,
      ...(mapping.credDefId && { credDefId: mapping.credDefId }),
      ...(attr.predicate && { condition: attr.predicate }),
      ...(attr.value !== undefined && { value: Number(attr.value) }),
    };
  });
}

/**
 * Get NYSC proof request comment
 */
export function getNyscProofRequestComment(): string {
  return (
    process.env.NYSC_PROOF_REQUEST_COMMENT ||
    "Please share your Student Card, Statement of Results, and Medical Fitness Certificate for NYSC registration"
  );
}

/**
 * Get comprehensive onboarding proof request comment
 */
export function getComprehensiveOnboardingComment(): string {
  return (
    process.env.COMPREHENSIVE_ONBOARDING_COMMENT ||
    "NYSC Camp Onboarding Verification\n\nPlease share all 4 credentials:\n• NYSC Green Card\n• Student Card\n• Statement of Results\n• Medical Fitness Certificate"
  );
}

/**
 * Get all NYSC proof configuration
 */
export function getNyscProofConfig() {
  return {
    attributes: buildNyscProofAttributeRequests(),
    comment: getNyscProofRequestComment(),
  };
}

/**
 * Get comprehensive onboarding proof configuration
 */
export function getComprehensiveOnboardingConfig() {
  return {
    attributes: buildComprehensiveOnboardingProofRequests(),
    comment: getComprehensiveOnboardingComment(),
  };
}
