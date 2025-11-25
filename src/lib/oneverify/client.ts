/**
 * OneVERIFY Mock Client
 *
 * A mock implementation of the OneVERIFY API client
 * Simulates API responses for development and testing
 */

import type {
  OneVerifyResponse,
  OneVerifyConfig,
  NINDetails,
  BVNDetails,
  FaceMatchResult,
  PhoneVerificationResult,
  RequestReason,
} from "./types";
import {
  getNINDetails,
  getBVNDetails,
  getPhoneDetails,
  findNINByBVN,
  ninDatabase,
} from "./mock-data";

// Default configuration (uses environment variables)
const defaultConfig: OneVerifyConfig = {
  baseUrl: process.env.ONEVERIFY_BASE_URL || "https://api.oneverify.ng",
  apiKey: process.env.ONEVERIFY_API_KEY || "",
  userId: process.env.ONEVERIFY_USER_ID || "",
};

// Simulated API delay (ms)
const API_DELAY = 800;

/**
 * Simulate API latency
 */
async function simulateDelay(ms: number = API_DELAY): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate API credentials
 */
function validateCredentials(
  apiKey: string,
  userId: string
): { valid: boolean; error?: string } {
  if (!apiKey || apiKey === "") {
    return { valid: false, error: "INVALID_API_KEY" };
  }
  if (!userId || userId === "") {
    return { valid: false, error: "INVALID_USER_ID" };
  }
  return { valid: true };
}

/**
 * Validate NIN format (11 digits)
 */
function validateNIN(nin: string): boolean {
  return /^\d{11}$/.test(nin);
}

/**
 * Validate BVN format (11 digits)
 */
function validateBVN(bvn: string): boolean {
  return /^\d{11}$/.test(bvn);
}

/**
 * Normalize phone number to Nigerian format
 */
function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\s/g, "").replace(/[^0-9+]/g, "");
  if (normalized.startsWith("+234")) {
    normalized = "0" + normalized.slice(4);
  } else if (normalized.startsWith("234")) {
    normalized = "0" + normalized.slice(3);
  }
  return normalized;
}

/**
 * OneVERIFY Mock Client Class
 */
export class OneVerifyClient {
  private config: OneVerifyConfig;

  constructor(config?: Partial<OneVerifyConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Get NIN details by NIN number
   * Endpoint: POST /ninAuth/getNINDetails
   */
  async getNINDetailsByNIN(
    nin: string,
    requestReason: RequestReason = "kycVerification"
  ): Promise<OneVerifyResponse<NINDetails>> {
    await simulateDelay();

    console.log("[OneVERIFY Mock] getNINDetails called:", { nin, requestReason });

    // Validate NIN format
    if (!validateNIN(nin)) {
      return {
        status: 400,
        message: "Invalid NIN format. NIN must be 11 digits.",
        data: null,
      };
    }

    // Look up NIN
    const ninDetails = getNINDetails(nin);

    if (!ninDetails) {
      return {
        status: 404,
        message: "NIN not found in NIMC database",
        data: null,
      };
    }

    return {
      status: 200,
      message: "NIN Auth verification successful",
      data: ninDetails,
    };
  }

  /**
   * Get NIN details by phone number
   * Endpoint: POST /ninAuth/getNINDetailsWithPhone
   */
  async getNINDetailsByPhone(
    phone: string,
    requestReason: RequestReason = "kycVerification"
  ): Promise<OneVerifyResponse<NINDetails>> {
    await simulateDelay();

    console.log("[OneVERIFY Mock] getNINDetailsWithPhone called:", {
      phone,
      requestReason,
    });

    const normalized = normalizePhoneNumber(phone);
    const phoneRecord = getPhoneDetails(normalized);

    if (!phoneRecord || !phoneRecord.nin) {
      return {
        status: 404,
        message: "No NIN linked to this phone number",
        data: null,
      };
    }

    const ninDetails = getNINDetails(phoneRecord.nin);

    if (!ninDetails) {
      return {
        status: 404,
        message: "NIN record not found",
        data: null,
      };
    }

    return {
      status: 200,
      message: "NIN Auth verification successful",
      data: ninDetails,
    };
  }

  /**
   * Get BVN details by BVN number
   * Endpoint: POST /bvn/getBVNDetails
   */
  async getBVNDetails(
    bvn: string,
    requestReason: RequestReason = "kycVerification"
  ): Promise<OneVerifyResponse<BVNDetails>> {
    await simulateDelay();

    console.log("[OneVERIFY Mock] getBVNDetails called:", { bvn, requestReason });

    // Validate BVN format
    if (!validateBVN(bvn)) {
      return {
        status: 400,
        message: "Invalid BVN format. BVN must be 11 digits.",
        data: null,
      };
    }

    // Look up BVN
    const bvnDetails = getBVNDetails(bvn);

    if (!bvnDetails) {
      return {
        status: 404,
        message: "BVN not found in NIBSS database",
        data: null,
      };
    }

    return {
      status: 200,
      message: "BVN verification successful",
      data: bvnDetails,
    };
  }

  /**
   * Verify phone number and get linked NIN/BVN
   * Endpoint: POST /phone/verify
   */
  async verifyPhoneNumber(
    phoneNumber: string
  ): Promise<OneVerifyResponse<PhoneVerificationResult>> {
    await simulateDelay();

    console.log("[OneVERIFY Mock] verifyPhoneNumber called:", { phoneNumber });

    const normalized = normalizePhoneNumber(phoneNumber);
    const phoneRecord = getPhoneDetails(normalized);

    if (!phoneRecord) {
      // Return unlinked phone info
      return {
        status: 200,
        message: "Phone number verified",
        data: {
          phoneNumber: normalized,
          isValid: true,
          carrier: "Unknown",
          lineType: "mobile",
          countryCode: "NG",
          nationalFormat: normalized,
          linkedNIN: null,
          linkedBVN: null,
        },
      };
    }

    return {
      status: 200,
      message: "Phone number verified with linked identities",
      data: {
        phoneNumber: normalized,
        isValid: true,
        carrier: phoneRecord.carrier,
        lineType: "mobile",
        countryCode: "NG",
        nationalFormat: normalized,
        linkedNIN: phoneRecord.nin,
        linkedBVN: phoneRecord.bvn,
      },
    };
  }

  /**
   * Perform face match verification
   * Endpoint: POST /biometric/faceMatch
   */
  async performFaceMatch(
    image: string,
    nin?: string,
    bvn?: string
  ): Promise<OneVerifyResponse<FaceMatchResult>> {
    await simulateDelay(1500); // Face matching takes longer

    console.log("[OneVERIFY Mock] performFaceMatch called:", {
      hasImage: !!image,
      nin,
      bvn,
    });

    // Validate that we have something to match against
    if (!nin && !bvn) {
      return {
        status: 400,
        message: "Either NIN or BVN is required for face matching",
        data: null,
      };
    }

    // Validate image
    if (!image || !image.startsWith("data:image")) {
      return {
        status: 400,
        message: "Invalid image format. Must be base64 encoded image.",
        data: null,
      };
    }

    // Look up the reference record
    let referenceNIN: string | null = nin || null;
    if (!referenceNIN && bvn) {
      referenceNIN = findNINByBVN(bvn);
    }

    if (!referenceNIN) {
      return {
        status: 404,
        message: "Reference identity not found",
        data: null,
      };
    }

    const ninDetails = getNINDetails(referenceNIN);
    if (!ninDetails) {
      return {
        status: 404,
        message: "Reference identity record not found",
        data: null,
      };
    }

    // Simulate face match (always returns successful match in mock)
    // In real implementation, this would use ML/AI face comparison
    const matchScore = Math.floor(Math.random() * 15) + 85; // 85-99%

    return {
      status: 200,
      message: "Face match verification completed",
      data: {
        matchScore,
        isMatch: matchScore >= 70,
        liveness: true,
        photoQuality: matchScore >= 90 ? "high" : matchScore >= 80 ? "medium" : "low",
        matchedRecord: {
          source: nin ? "NIN" : "BVN",
          id: referenceNIN,
          name: `${ninDetails.firstname} ${ninDetails.middlename} ${ninDetails.surname}`.trim(),
        },
      },
    };
  }

  /**
   * Cross-verify NIN and BVN belong to same person
   * Endpoint: POST /verify/ninBvnMatch
   */
  async verifyNINBVNMatch(
    nin: string,
    bvn: string
  ): Promise<
    OneVerifyResponse<{
      isMatch: boolean;
      ninDetails: NINDetails | null;
      bvnDetails: BVNDetails | null;
      matchedFields: string[];
      mismatchedFields: string[];
    }>
  > {
    await simulateDelay();

    console.log("[OneVERIFY Mock] verifyNINBVNMatch called:", { nin, bvn });

    const ninDetails = getNINDetails(nin);
    const bvnDetails = getBVNDetails(bvn);

    if (!ninDetails) {
      return {
        status: 404,
        message: "NIN not found",
        data: null,
      };
    }

    if (!bvnDetails) {
      return {
        status: 404,
        message: "BVN not found",
        data: null,
      };
    }

    // Check if BVN links to this NIN
    const matchedFields: string[] = [];
    const mismatchedFields: string[] = [];

    // Compare key fields
    if (
      ninDetails.firstname.toUpperCase() === bvnDetails.firstname.toUpperCase()
    ) {
      matchedFields.push("firstname");
    } else {
      mismatchedFields.push("firstname");
    }

    if (
      ninDetails.surname.toUpperCase() === bvnDetails.surname.toUpperCase()
    ) {
      matchedFields.push("surname");
    } else {
      mismatchedFields.push("surname");
    }

    if (bvnDetails.nin === nin) {
      matchedFields.push("nin_link");
    } else {
      mismatchedFields.push("nin_link");
    }

    // Consider it a match if names match and NIN links
    const isMatch =
      matchedFields.includes("firstname") &&
      matchedFields.includes("surname") &&
      matchedFields.includes("nin_link");

    return {
      status: 200,
      message: isMatch
        ? "NIN and BVN verified - same individual"
        : "NIN and BVN verification completed - mismatch detected",
      data: {
        isMatch,
        ninDetails,
        bvnDetails,
        matchedFields,
        mismatchedFields,
      },
    };
  }
}

// Default client instance
export const oneVerifyClient = new OneVerifyClient();

// Export helper functions for direct use
export async function verifyNIN(
  nin: string,
  requestReason: RequestReason = "kycVerification"
): Promise<OneVerifyResponse<NINDetails>> {
  return oneVerifyClient.getNINDetailsByNIN(nin, requestReason);
}

export async function verifyNINByPhone(
  phone: string,
  requestReason: RequestReason = "kycVerification"
): Promise<OneVerifyResponse<NINDetails>> {
  return oneVerifyClient.getNINDetailsByPhone(phone, requestReason);
}

export async function verifyBVN(
  bvn: string,
  requestReason: RequestReason = "kycVerification"
): Promise<OneVerifyResponse<BVNDetails>> {
  return oneVerifyClient.getBVNDetails(bvn, requestReason);
}
