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
      surname,
      othernames,
      admissionNumber,
      matricNumber,
      Department,
      Faculty,
      programme,
      yearStart,
      yearEnd,
      classOfDegree,
      awardedDegree,
      schoolRefNumber,
      issuedDate,
      dateOfBirth,
      nationalIdNumber,
      bankVerificationNumber,
      jambNumber,
      schoolNucNumber,
      schoolName,
      gender,
    } = body;

    const fullName = `${surname} ${othernames}`;

    // Log received data for debugging
    console.log("[Statement of Results API] Received data:", {
      email,
      phoneNumber,
      fullName,
      matricNumber,
      programme,
      classOfDegree,
      awardedDegree,
      yearEnd,
    });

    // Validate required fields
    if (!email || !phoneNumber || !surname || !othernames || !classOfDegree || !awardedDegree) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Email, phone number, surname, othernames, class of degree, and awarded degree are required",
        },
        { status: 400 }
      );
    }

    // Get access token
    const token = await getAccessToken();
    const orgId = API_CONFIG.ORG_ID;

    // Get credential definition ID from environment
    // Check for Statement of Results specific cred def first, then fall back to student card cred def
    let credentialDefinitionId = process.env.STATEMENT_OF_RESULT_CRED_DEF_ID;

    // Check if it's a placeholder value
    if (!credentialDefinitionId || credentialDefinitionId.includes("PLACEHOLDER")) {
      console.warn("[Statement of Results API] STATEMENT_OF_RESULT_CRED_DEF_ID not configured, falling back to ISSUE_CRED_DEF_ID");
      credentialDefinitionId = process.env.ISSUE_CRED_DEF_ID || "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2968758:Current Student Credential";

      // If it's still a placeholder, return a helpful error
      if (credentialDefinitionId.includes("PLACEHOLDER")) {
        console.error("[Statement of Results API] Credential definition not configured properly");
        return NextResponse.json(
          {
            error: "Configuration Error",
            message: "Statement of Results credential definition is not configured. Please update STATEMENT_OF_RESULT_CRED_DEF_ID in your .env file with a valid credential definition ID. For this demo, the system will use the Student Card credential definition as a fallback.",
            fallbackUsed: true,
          },
          { status: 500 }
        );
      }
    }

    // Helper function to ensure no null/undefined values
    const ensureValue = (value: any, defaultValue: string = "N/A"): string => {
      if (value === undefined || value === null || value === "undefined" || value === "null" || value === "") {
        console.log(`[ensureValue] Using default "${defaultValue}" for value:`, value);
        return defaultValue;
      }
      return String(value);
    };

    // Generate school reference number if not provided
    const refNumber = schoolRefNumber || `SOR/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;

    // Use provided issue date or current date
    const certificateIssuedDate = issuedDate || new Date().toISOString().split("T")[0];

    // Calculate expiry date (5 years from issue date)
    const expiryDate = new Date(certificateIssuedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    const certificateExpiryDate = expiryDate.toISOString().split("T")[0];

    // Prepare the credential offer payload for Statement of Results with ONLY schema-required attributes
    const payload = {
      credentialOffer: [
        {
          emailId: email,
          attributes: [
            {
              value: ensureValue(surname),
              name: "surname",
              isRequired: true,
            },
            {
              value: ensureValue(othernames),
              name: "othernames",
              isRequired: true,
            },
            {
              value: ensureValue(Department, "Not Specified"),
              name: "Department",
              isRequired: true,
            },
            {
              value: ensureValue(Faculty, "Not Specified"),
              name: "Faculty",
              isRequired: true,
            },
            {
              value: ensureValue(matricNumber, "UNI/XXX/00/0000"),
              name: "matric_number",
              isRequired: true,
            },
            {
              value: ensureValue(admissionNumber, "ADM/0000/0000"),
              name: "admission_number",
              isRequired: true,
            },
            {
              value: ensureValue(yearEnd, new Date().getFullYear().toString()),
              name: "year_end",
              isRequired: true,
            },
            {
              value: certificateIssuedDate,
              name: "issued_date",
              isRequired: true,
            },
            {
              value: ensureValue(programme, "Not Specified"),
              name: "programme",
              isRequired: true,
            },
            {
              value: ensureValue(classOfDegree, "Not Classified"),
              name: "class_of_degree",
              isRequired: true,
            },
            {
              value: ensureValue(awardedDegree, "Bachelor's Degree"),
              name: "awarded_degree",
              isRequired: true,
            },
            {
              value: ensureValue(yearStart, new Date().getFullYear().toString()),
              name: "year_start",
              isRequired: true,
            },
            {
              value: refNumber,
              name: "school_ref_number",
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

    console.log("[Statement of Results API] Issuing credential...");
    console.log("[Statement of Results API] API URL:", apiUrl);
    console.log("[Statement of Results API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("[Statement of Results API] Success:", response.data);

    return NextResponse.json({
      success: true,
      message: "Statement of Results credential issued successfully",
      data: response.data,
    });
  } catch (error: any) {
    console.error("[Statement of Results API] Error:", error);

    // Handle axios errors specifically
    if (axios.isAxiosError(error)) {
      console.error("[Statement of Results API] Axios error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          error: "API Error",
          message: error.response?.data?.message || error.message || "Failed to issue Statement of Results",
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
