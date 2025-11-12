import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      phoneNumber,
      fullName,
      dateOfBirth,
      nin,
      bvn,
      gender,
      address,
      stateOfOrigin,
      lga,
      nationality,
    } = body;

    // Log received data for debugging
    console.log("[eKYC API] Received data:", {
      email,
      phoneNumber,
      fullName,
      nin,
      bvn,
      dateOfBirth,
      gender,
      stateOfOrigin,
      lga,
    });

    // Validate required fields
    if (!email || !phoneNumber || !fullName) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Email, phone number, and full name are required",
        },
        { status: 400 }
      );
    }

    // Get access token
    const token = await getAccessToken();
    const orgId = API_CONFIG.ORG_ID;

    // Get credential definition ID from environment
    const credentialDefinitionId =
      process.env.EKYC_CRED_DEF_ID ||
      "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2981071:E-KYC Credential";

    // Helper function to ensure no null/undefined values
    const ensureValue = (value: any, defaultValue: string = "N/A"): string => {
      if (value === undefined || value === null || value === "undefined" || value === "null" || value === "") {
        console.log(`[ensureValue] Using default "${defaultValue}" for value:`, value);
        return defaultValue;
      }
      return String(value);
    };

    // Prepare the credential offer payload
    // IMPORTANT: Attributes must be in the exact order specified in the schema
    const payload = {
      credentialOffer: [
        {
          emailId: email,
          attributes: [
            {
              value: ensureValue(fullName),
              name: "full_name",
              isRequired: true,
            },
            {
              value: ensureValue(dateOfBirth, new Date().toISOString().slice(0, 16)),
              name: "date_of_birth",
              isRequired: true,
            },
            {
              value: ensureValue(nin, "00000000000"),
              name: "national_id_number",
              isRequired: true,
            },
            {
              value: ensureValue(bvn, "00000000000"),
              name: "bank_verification_number",
              isRequired: true,
            },
            {
              value: ensureValue(gender, "N/A"),
              name: "gender",
              isRequired: true,
            },
            {
              value: ensureValue(phoneNumber),
              name: "phone_number",
              isRequired: true,
            },
            {
              value: ensureValue(address, "N/A"),
              name: "residential_address",
              isRequired: true,
            },
            {
              value: ensureValue(stateOfOrigin, "N/A"),
              name: "state_of_origin",
              isRequired: true,
            },
            {
              value: ensureValue(lga, "N/A"),
              name: "lga",
              isRequired: true,
            },
            {
              value: ensureValue(nationality, "Nigerian"),
              name: "nationality",
              isRequired: true,
            },
            {
              value: new Date().toISOString().slice(0, 16),
              name: "kyc_verification_date",
              isRequired: true,
            },
            {
              value: "VERIFIED",
              name: "kyc_status",
              isRequired: true,
            },
          ],
        },
      ],
      credentialDefinitionId,
      isReuseConnection: true,
    };

    // Make API call to issue credential
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;

    console.log("[eKYC API] Issuing credential to:", email);
    console.log("[eKYC API] API URL:", apiUrl);
    console.log("[eKYC API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("[eKYC API] Credential issued successfully");

    return NextResponse.json(
      {
        success: true,
        message: "eKYC credential issued successfully",
        data: response.data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[eKYC API] Error issuing credential:", error);

    if (axios.isAxiosError(error)) {
      console.error("[eKYC API] API Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.response?.data?.message,
      });

      return NextResponse.json(
        {
          error: "API Error",
          message:
            error.response?.data?.message || "Failed to issue credential",
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while issuing the credential",
      },
      { status: 500 }
    );
  }
}
