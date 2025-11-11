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
      admissionNumber,
      matricNumber,
      department,
      faculty,
      programme,
      yearOfGraduation,
      level,
      dateOfBirth,
      gender,
      nationalIdNumber,
      bvn,
      jambNumber,
      schoolNucNumber,
      schoolName,
    } = body;

    // Log received data for debugging
    console.log("[Student Card API] Received data:", {
      email,
      phoneNumber,
      fullName,
      nationalIdNumber,
      bvn,
      jambNumber,
      schoolNucNumber,
      schoolName,
      dateOfBirth,
      gender,
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

    // Get credential definition ID from environment (use ISSUE_CRED_DEF_ID for issuance)
    const credentialDefinitionId =
      process.env.ISSUE_CRED_DEF_ID ||
      "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2968758:Current Student Credential";

    // Split full name into surname and other names
    const nameParts = fullName.trim().split(" ");
    const surname = nameParts[0] || fullName;
    const othernames = nameParts.slice(1).join(" ") || fullName;

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
              value: ensureValue(admissionNumber, "ADM/0000/0000"),
              name: "admission_number",
              isRequired: true,
            },
            {
              value: ensureValue(programme, "Not Specified"),
              name: "programme",
              isRequired: true,
            },
            {
              value: ensureValue(yearOfGraduation, new Date().getFullYear().toString()),
              name: "graduation_year",
              isRequired: true,
            },
            {
              value: ensureValue(surname, fullName),
              name: "surname",
              isRequired: true,
            },
            {
              value: ensureValue(schoolName, "University"),
              name: "school_name",
              isRequired: true,
            },
            {
              value: ensureValue(nationalIdNumber, "00000000000"),
              name: "national_id_number",
              isRequired: true,
            },
            {
              value: ensureValue(department, "Not Specified"),
              name: "department",
              isRequired: true,
            },
            {
              value: ensureValue(othernames, fullName),
              name: "othernames",
              isRequired: true,
            },
            {
              value: ensureValue(matricNumber, "UNI/XXX/00/0000"),
              name: "matric_number",
              isRequired: true,
            },
            {
              value: new Date().toISOString().slice(0, 16),
              name: "date_issued",
              isRequired: true,
            },
            {
              value: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16),
              name: "date_expiry",
              isRequired: true,
            },
            {
              value: ensureValue(bvn, "00000000000"),
              name: "bank_verification_number",
              isRequired: true,
            },
            {
              value: ensureValue(schoolNucNumber, "NUC/000/0000"),
              name: "school_nuc_number",
              isRequired: true,
            },
            {
              value: ensureValue(jambNumber, "00000000XX"),
              name: "jamb_number",
              isRequired: true,
            },
            {
              value: ensureValue(dateOfBirth, new Date().toISOString().slice(0, 16)),
              name: "date_of_birth",
              isRequired: true,
            },
            {
              value: ensureValue(gender, "N/A"),
              name: "gender",
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

    console.log("[Student Card API] Issuing credential to:", email);
    console.log("[Student Card API] API URL:", apiUrl);
    console.log("[Student Card API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("[Student Card API] Credential issued successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Student card credential issued successfully",
        data: response.data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Student Card API] Error issuing credential:", error);

    if (axios.isAxiosError(error)) {
      console.error("[Student Card API] API Response Error:", {
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
