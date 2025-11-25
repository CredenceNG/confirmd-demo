/**
 * OneVERIFY API Types
 *
 * Type definitions for the OneVERIFY identity verification API
 * Based on the Postman collection at:
 * https://documenter.getpostman.com/view/43842592/2sB2cVfhHc
 */

// ============================================================
// Request Types
// ============================================================

/**
 * NIN Auth verification request
 */
export interface NINAuthRequest {
  nin: string;
  requestReason: string;
}

/**
 * BVN verification request
 */
export interface BVNVerificationRequest {
  bvn: string;
  requestReason?: string;
}

/**
 * Face match verification request
 */
export interface FaceMatchRequest {
  image: string; // Base64 encoded image
  nin?: string;
  bvn?: string;
  requestReason?: string;
}

/**
 * Phone number verification request
 */
export interface PhoneVerificationRequest {
  phoneNumber: string;
  nin?: string;
  bvn?: string;
}

// ============================================================
// Response Types
// ============================================================

/**
 * Standard OneVERIFY API response wrapper
 */
export interface OneVerifyResponse<T = unknown> {
  status: number;
  message: string;
  data: T | null;
}

/**
 * NIN details from NIMC database
 */
export interface NINDetails {
  batchid: string | null;
  birthcountry: string;
  birthdate: string;
  birthlga: string;
  birthstate: string;
  cardstatus: string | null;
  centralid: string | null;
  educationallevel: string;
  email: string;
  emplymentstatus: string;
  firstname: string;
  gender: "m" | "f";
  heigth: number;
  maritalstatus: string;
  middlename: string;
  nin: string;
  nok_address1: string;
  nok_address2: string | null;
  nok_firstname: string;
  nok_lga: string;
  nok_middlename: string;
  nok_state: string;
  nok_surname: string;
  nok_town: string;
  nspokenlang: string;
  ospokenlang: string | null;
  pfirstname: string | null;
  pmiddlename: string | null;
  profession: string;
  psurname: string | null;
  religion: string;
  residence_adressline1: string;
  residence_town: string;
  residence_lga: string;
  residence_state: string;
  residencestatus: string;
  surname: string;
  telephoneno: string;
  title: string;
  trackingid: string | null;
  photo: string;      // Base64 encoded JPEG
  signature: string;  // Base64 encoded JPEG
}

/**
 * BVN details from NIBSS database
 */
export interface BVNDetails {
  bvn: string;
  firstname: string;
  middlename: string;
  surname: string;
  dateofbirth: string;
  gender: "Male" | "Female";
  phonenumber: string;
  phonenumber2: string | null;
  email: string | null;
  enrollmentbank: string;
  enrollmentbranch: string;
  levelofaccount: string;
  lga: string;
  stateoforigin: string;
  stateofresidence: string;
  maritalstatus: string;
  nin: string | null;
  registrationdate: string;
  watchlisted: boolean;
  photo: string;  // Base64 encoded JPEG
}

/**
 * Face match result
 */
export interface FaceMatchResult {
  matchScore: number;        // 0-100 confidence score
  isMatch: boolean;          // Whether face matches (typically > 70%)
  liveness: boolean;         // Whether image passes liveness check
  photoQuality: "high" | "medium" | "low";
  matchedRecord: {
    source: "NIN" | "BVN";
    id: string;
    name: string;
  } | null;
}

/**
 * Phone verification result
 */
export interface PhoneVerificationResult {
  phoneNumber: string;
  isValid: boolean;
  carrier: string | null;
  lineType: "mobile" | "landline" | "voip" | "unknown";
  countryCode: string;
  nationalFormat: string;
  linkedNIN: string | null;
  linkedBVN: string | null;
}

// ============================================================
// Error Types
// ============================================================

/**
 * OneVERIFY API error response
 */
export interface OneVerifyError {
  status: number;
  message: string;
  errorCode: string;
  data: null;
}

/**
 * Error codes used by OneVERIFY
 */
export type OneVerifyErrorCode =
  | "INVALID_API_KEY"
  | "INVALID_USER_ID"
  | "INVALID_NIN"
  | "INVALID_BVN"
  | "NIN_NOT_FOUND"
  | "BVN_NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "INSUFFICIENT_BALANCE"
  | "INVALID_REQUEST"
  | "SERVICE_UNAVAILABLE"
  | "FACE_MATCH_FAILED"
  | "LOW_IMAGE_QUALITY";

// ============================================================
// Request Reason Types
// ============================================================

/**
 * Valid request reasons for verification
 */
export type RequestReason =
  | "nyscCheck"
  | "kycVerification"
  | "accountOpening"
  | "loanApplication"
  | "employmentVerification"
  | "backgroundCheck"
  | "other";

// ============================================================
// API Configuration
// ============================================================

/**
 * OneVERIFY API configuration
 */
export interface OneVerifyConfig {
  baseUrl: string;
  apiKey: string;
  userId: string;
}

/**
 * Required headers for OneVERIFY API requests
 */
export interface OneVerifyHeaders {
  "X-API-KEY": string;
  "X-USER-ID": string;
  Accept: "application/json";
  "Content-Type"?: "application/json";
}
