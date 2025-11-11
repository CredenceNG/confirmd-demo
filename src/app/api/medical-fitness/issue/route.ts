import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import axios from "axios";

/**
 * API Route: Issue Medical Fitness Certificate
 *
 * This endpoint issues a verifiable Medical Fitness Certificate credential to a student
 * through the ConfirmD Platform. The certificate includes medical examination details,
 * health status, and medical center information.
 *
 * Required for NYSC Phase 1 registration along with Student Card and Statement of Results.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract all required fields matching Medical Fitness Certificate schema
    const {
      email,
      phoneNumber,
      surname,
      othernames,
      nationalIdNumber,
      dateOfBirth,
      gender,
      // Medical examination details
      examinationDate,
      bloodPressure,
      bloodGroup,
      genotype,
      fitnessDeclaration,
      otherFitnessInfo,
      // Certificate details
      issuerReferenceNumber,
      issuedDate,
      expiryDate,
    } = body;

    // Validate required fields
    if (
      !email ||
      !surname ||
      !othernames ||
      !dateOfBirth ||
      !gender ||
      !examinationDate ||
      !bloodPressure ||
      !bloodGroup ||
      !genotype ||
      !fitnessDeclaration
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message:
            "Please provide all required medical examination details",
        },
        { status: 400 }
      );
    }

    const fullName = `${surname} ${othernames}`;
    console.log("[Medical Fitness API] Processing certificate issuance for:", fullName);

    // Get credential definition ID with fallback
    let credentialDefinitionId = process.env.MEDICAL_FITNESS_CRED_DEF_ID;

    if (
      !credentialDefinitionId ||
      credentialDefinitionId.includes("PLACEHOLDER")
    ) {
      console.warn(
        "[Medical Fitness API] MEDICAL_FITNESS_CRED_DEF_ID not configured, falling back to Student Card credential definition"
      );
      credentialDefinitionId =
        process.env.ISSUE_CRED_DEF_ID ||
        "NxbvVcdwR5a2oyiYa6UbPP:3:CL:2968758:Current Student Credential";

      // If still a placeholder, return error with configuration instructions
      if (credentialDefinitionId.includes("PLACEHOLDER")) {
        return NextResponse.json(
          {
            error: "Configuration Error",
            message:
              "Medical Fitness Certificate credential definition is not configured. Please update MEDICAL_FITNESS_CRED_DEF_ID in your .env file with a valid credential definition ID from your ConfirmD Platform organization.",
            fallbackUsed: true,
          },
          { status: 500 }
        );
      }
    }

    console.log(
      "[Medical Fitness API] Using Credential Definition ID:",
      credentialDefinitionId
    );

    // Step 1: Authenticate with ConfirmD Platform using JWT
    console.log("[Medical Fitness API] Authenticating with ConfirmD Platform...");

    let token;
    try {
      token = await getAccessToken();
      console.log("[Medical Fitness API] Authentication successful");
    } catch (authError: any) {
      console.error("[Medical Fitness API] Authentication failed:", authError);

      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Unable to authenticate with ConfirmD Platform. Please check your credentials in .env file.",
          details: authError.error_description || authError.message,
        },
        { status: 401 }
      );
    }

    const orgId = API_CONFIG.ORG_ID;

    // Step 2: Prepare credential payload with actual Medical Fitness Certificate schema attributes
    // Generate certificate reference number if not provided
    const certificateRefNumber = issuerReferenceNumber || `MFC-${Date.now()}`;

    // Use provided dates or generate defaults
    const certificateIssuedDate = issuedDate || new Date().toISOString().split("T")[0];
    const certificateExpiryDate = expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const payload = {
      credentialOffer: [
        {
          emailId: email,
          attributes: [
            // Personal information
            {
              value: surname,
              name: "surname",
              isRequired: true,
            },
            {
              value: othernames,
              name: "othernames",
              isRequired: true,
            },
            {
              value: dateOfBirth,
              name: "date_of_birth",
              isRequired: true,
            },
            {
              value: gender,
              name: "gender",
              isRequired: true,
            },
            {
              value: nationalIdNumber || "N/A",
              name: "national_id_number",
              isRequired: true,
            },
            // Medical examination details
            {
              value: examinationDate,
              name: "examination_date",
              isRequired: true,
            },
            {
              value: bloodPressure,
              name: "blood_pressure",
              isRequired: true,
            },
            {
              value: bloodGroup,
              name: "blood_group",
              isRequired: true,
            },
            {
              value: genotype,
              name: "genotype",
              isRequired: true,
            },
            {
              value: fitnessDeclaration,
              name: "fitness_declaration",
              isRequired: true,
            },
            {
              value: otherFitnessInfo || "None",
              name: "other_fitness_info",
              isRequired: true,
            },
            // Certificate details
            {
              value: certificateRefNumber,
              name: "issuer_reference_number",
              isRequired: true,
            },
            {
              value: certificateIssuedDate,
              name: "issued_date",
              isRequired: true,
            },
            {
              value: certificateExpiryDate,
              name: "expiry_date",
              isRequired: true,
            },
          ],
        },
      ],
      credentialDefinitionId,
      isReuseConnection: true,
    };

    console.log(
      "[Medical Fitness API] Prepared payload with",
      payload.credentialOffer[0].attributes.length,
      "attributes"
    );

    // Step 3: Issue credential via ConfirmD Platform
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;

    console.log("[Medical Fitness API] Issuing credential to:", email);
    console.log("[Medical Fitness API] API URL:", apiUrl);

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[Medical Fitness API] Credential issued successfully");
    console.log(
      "[Medical Fitness API] Response:",
      JSON.stringify(response.data, null, 2)
    );

    return NextResponse.json({
      success: true,
      message: "Medical Fitness Certificate issued successfully",
      data: response.data,
      certificateNumber: certificateRefNumber,
      studentName: fullName,
      email,
      phoneNumber,
    });
  } catch (error: any) {
    console.error("[Medical Fitness API] Error issuing certificate:", error);

    // Enhanced error logging
    if (error.response) {
      console.error("[Medical Fitness API] Response status:", error.response.status);
      console.error("[Medical Fitness API] Response data:", error.response.data);
      console.error("[Medical Fitness API] Response headers:", error.response.headers);
    }

    // Determine error type and provide helpful message
    let errorMessage = "Failed to issue Medical Fitness Certificate";
    let errorDetails = error.message;

    if (error.response?.status === 401) {
      errorMessage = "Authentication failed";
      errorDetails =
        "Unable to authenticate with ConfirmD Platform. Please check your credentials.";
    } else if (error.response?.status === 404) {
      errorMessage = "Credential definition not found";
      errorDetails = `The credential definition ID might be invalid. Please check your configuration.`;
    } else if (error.response?.status === 400) {
      errorMessage = "Invalid request";
      errorDetails =
        error.response.data?.message ||
        "The credential payload might be invalid. Please check all required fields.";
    } else if (error.code === "ECONNREFUSED") {
      errorMessage = "Connection failed";
      errorDetails = "Unable to connect to ConfirmD Platform. Please check your network.";
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: errorDetails,
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
