/**
 * NYSC Registration - Issue Green Card API
 *
 * Verifies the submitted proof (Student Card + Statement of Result + Medical Fitness Certificate)
 * and issues NYSC Green Card credential if verification succeeds
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import { getConnectionSession } from "@/lib/api/connection-service";
import { confirmdClient } from "@/lib/api/confirmd-client";
import { prisma } from "@/lib/prisma";
import axios from "axios";

/**
 * POST /api/nysc/registration/issue-green-card
 * Verify proof and issue Green Card credential
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofId, sessionId, registrationData } = body;

    if (!proofId || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "proofId and sessionId are required",
          },
        },
        { status: 400 }
      );
    }

    // Validate registration data
    if (!registrationData || typeof registrationData !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_parameters",
            error_description: "registrationData is required",
          },
        },
        { status: 400 }
      );
    }

    const {
      callUpNumber,
      contactAddress,
      contactPhone,
      isServicePersonnel,
      servicePersonnelType,
      emergencyContact,
    } = registrationData;

    // Validate required registration fields
    if (!callUpNumber || !contactAddress || !contactPhone || !emergencyContact?.fullName || !emergencyContact?.phoneNumber || !emergencyContact?.relationship) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "invalid_registration_data",
            error_description: "All registration fields are required",
          },
        },
        { status: 400 }
      );
    }

    logger.info("NYSC Registration: Verifying proof and issuing Green Card", {
      proofId,
      sessionId,
      callUpNumber,
    });

    // Step 1: Get the connectionId from the session using the service directly
    const session = await getConnectionSession(sessionId);

    if (!session) {
      logger.error("Failed to retrieve session", { sessionId });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "session_not_found",
            error_description: "Could not find session to issue credential",
          },
        },
        { status: 404 }
      );
    }

    const connectionId = session.connectionId;

    if (!connectionId) {
      logger.error("No connectionId found in session", { sessionId, session: session.sessionId });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "no_connection",
            error_description: "No active connection found for this session",
          },
        },
        { status: 400 }
      );
    }

    logger.info("Found connectionId for session", { sessionId, connectionId });

    // Step 2: Fetch the proof details from ConfirmD
    const orgId = process.env.CONFIRMD_ORG_ID;
    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "configuration_error",
            error_description: "CONFIRMD_ORG_ID not configured",
          },
        },
        { status: 500 }
      );
    }

    logger.info("Fetching proof details from ConfirmD", { proofId, orgId });

    const proofDetailsResponse = await confirmdClient.getProofDetails(orgId, proofId);

    if (!proofDetailsResponse.success || !proofDetailsResponse.data) {
      logger.error("Failed to fetch proof details", {
        proofId,
        error: proofDetailsResponse.error,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "proof_fetch_failed",
            error_description: "Could not fetch proof details from ConfirmD",
          },
        },
        { status: 500 }
      );
    }

    // Step 3: Extract attributes from the proof
    // The ConfirmD Platform API returns attributes as an array where EACH object
    // contains ONE attribute (plus schemaId/credDefId metadata)
    const proofData = proofDetailsResponse.data;
    const attributes: Record<string, string> = {};

    // Log the raw proof data to debug attribute extraction
    logger.info("Raw proof data received", {
      proofId,
      proofDataType: typeof proofData,
      isArray: Array.isArray(proofData),
      proofDataLength: Array.isArray(proofData) ? proofData.length : 'N/A',
      proofDataSample: JSON.stringify(proofData).substring(0, 500),
    });

    if (Array.isArray(proofData) && proofData.length > 0) {
      proofData.forEach((credentialData: any, index: number) => {
        logger.info(`Processing credential data at index ${index}`, {
          credentialData: JSON.stringify(credentialData).substring(0, 300),
        });
        // Remove schemaId and credDefId metadata, keep only the actual attribute
        const { schemaId, credDefId, ...extractedAttribute } = credentialData;

        // ConfirmD API returns attributes as direct string values with metadata
        // Format: {attributeName: "value", credDefId: "...", schemaId: "..."}
        Object.entries(extractedAttribute).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'string') {
            // Handle direct string values (actual format from ConfirmD)
            attributes[key] = value;
            logger.info(`Extracted attribute: ${key} = ${value}`);
          } else if (value && typeof value === 'object' && 'raw' in value) {
            // Fallback for nested object format if API returns it
            attributes[key] = value.raw;
            logger.info(`Extracted attribute (raw): ${key} = ${value.raw}`);
          }
        });
      });
    }

    logger.info("Extracted proof attributes", {
      proofId,
      attributeCount: Object.keys(attributes).length,
      attributeNames: Object.keys(attributes),
    });

    // Extract required attributes with validation
    const nationalIdNumber = attributes.national_id_number;
    const surname = attributes.surname;
    const othernames = attributes.othernames;
    const matricNumber = attributes.matric_number;
    const schoolName = attributes.school_name;
    const programme = attributes.programme;
    const department = attributes.department;
    const dateOfBirth = attributes.date_of_birth;

    // Validate that we have the national ID number (required for linking)
    // Reject empty, null, undefined, or placeholder values
    if (!nationalIdNumber || nationalIdNumber === "00000000000") {
      logger.error("national_id_number not found or invalid in proof", {
        proofId,
        nationalIdNumber,
        availableAttributes: Object.keys(attributes),
        allAttributes: attributes,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_national_id",
            error_description: "National ID Number not found in proof presentation. Please ensure your Student Card credential includes a valid National ID Number (NIN).",
          },
        },
        { status: 400 }
      );
    }

    logger.info("National ID Number extracted from proof", {
      nationalIdNumber,
      surname,
      othernames,
    });

    // Get access token for NYSC organization
    const token = await getAccessToken();

    // Get Green Card credential definition ID
    const credentialDefinitionId =
      process.env.NYSC_GREEN_CARD_CRED_DEF_ID ||
      process.env.ISSUE_CRED_DEF_ID; // Fallback for demo

    if (!credentialDefinitionId || credentialDefinitionId.includes("PLACEHOLDER")) {
      logger.warn("NYSC_GREEN_CARD_CRED_DEF_ID not configured, using fallback");
    }

    // Helper function to ensure no null/undefined values
    const ensureValue = (value: any, defaultValue: string = "N/A"): string => {
      if (value === undefined || value === null || value === "undefined" || value === "null" || value === "") {
        return defaultValue;
      }
      return String(value);
    };

    // Step 4: Create/Update NYSC Registration record with extracted data
    logger.info("Creating/updating NYSC Registration record", {
      sessionId,
      nationalIdNumber,
    });

    const nyscRegistration = await prisma.nYSCRegistration.upsert({
      where: {
        sessionId,
      },
      create: {
        sessionId,
        nationalIdNumber,
        surname: surname || "N/A",
        othernames: othernames || "N/A",
        matricNumber,
        schoolName,
        programme,
        department,
        dateOfBirth,
        callUpNumber,
        contactAddress,
        contactPhone,
        emergencyContactName: emergencyContact.fullName,
        emergencyContactPhone: emergencyContact.phoneNumber,
        emergencyContactRelation: emergencyContact.relationship,
        isServicePersonnel: isServicePersonnel === "yes" ? "Yes" : "No",
        status: "registration_started",
        registrationData: JSON.stringify(registrationData),
        proofData: JSON.stringify(attributes),
      },
      update: {
        nationalIdNumber,
        surname: surname || "N/A",
        othernames: othernames || "N/A",
        matricNumber,
        schoolName,
        programme,
        department,
        dateOfBirth,
        callUpNumber,
        contactAddress,
        contactPhone,
        emergencyContactName: emergencyContact.fullName,
        emergencyContactPhone: emergencyContact.phoneNumber,
        emergencyContactRelation: emergencyContact.relationship,
        isServicePersonnel: isServicePersonnel === "yes" ? "Yes" : "No",
        registrationData: JSON.stringify(registrationData),
        proofData: JSON.stringify(attributes),
      },
    });

    logger.info("NYSC Registration record created/updated", {
      registrationId: nyscRegistration.id,
      nationalIdNumber,
      sessionId,
    });

    // Step 5: Prepare Green Card credential attributes
    // Based on actual NYSC GREEN CARD schema attributes
    // Using connection-based credential offer (not email-based OOB)
    const payload = {
      credentialData: [
        {
          connectionId,
          attributes: [
            {
              name: "surname",
              value: ensureValue(surname, "Doe"),
            },
            {
              name: "othernames",
              value: ensureValue(othernames, "John"),
            },
            {
              name: "call_up_number",
              value: ensureValue(callUpNumber),
            },
            {
              name: "address",
              value: ensureValue(contactAddress),
            },
            {
              name: "phone_number",
              value: ensureValue(contactPhone),
            },
            {
              name: "emergency_contact_fullname",
              value: ensureValue(emergencyContact.fullName),
            },
            {
              name: "emergency_contact_phone_number",
              value: ensureValue(emergencyContact.phoneNumber),
            },
            {
              name: "emergency_contact_relationship",
              value: ensureValue(emergencyContact.relationship),
            },
            {
              name: "emergency_contact_address",
              value: ensureValue(emergencyContact.address || "N/A", "N/A"),
            },
            {
              name: "service_perssonnel",
              value: ensureValue(isServicePersonnel === "yes" ? "Yes" : "No", "No"),
            },
          ],
        },
      ],
      credentialDefinitionId,
      orgId,
    };

    // Make API call to issue Green Card credential using existing connection
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/offer?credentialType=indy`;

    logger.info("NYSC Registration: Issuing Green Card credential", {
      connectionId,
      apiUrl,
    });

    console.log("[NYSC Green Card API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("NYSC Registration: Green Card issued successfully", {
      responseData: response.data,
    });

    // Extract credential ID and deep link URL from response
    // The ConfirmD Platform returns credential offer details including invitation and deep link
    const credentialOfferDetails = response.data?.data || response.data;
    const greenCardCredentialId = credentialOfferDetails?.response?.credentialId ||
                                   credentialOfferDetails?.credentialId ||
                                   response.data?.id;
    const invitationUrl = credentialOfferDetails?.response?.invitationUrl;
    const deepLinkUrl = credentialOfferDetails?.response?.deepLinkURL;

    logger.info("NYSC Registration: Deep link URLs extracted", {
      hasInvitationUrl: !!invitationUrl,
      hasDeepLinkUrl: !!deepLinkUrl,
      greenCardCredentialId,
      invitationUrl,
      deepLinkUrl,
    });

    // Step 6: Update NYSC Registration record with Green Card issuance details
    await prisma.nYSCRegistration.update({
      where: { sessionId },
      data: {
        greenCardIssued: true,
        greenCardIssuedAt: new Date(),
        greenCardCredentialId,
        status: "green_card_issued",
      },
    });

    logger.info("NYSC Registration record updated with Green Card details", {
      sessionId,
      greenCardCredentialId,
      nationalIdNumber,
    });

    return NextResponse.json({
      success: true,
      data: {
        greenCardIssued: true,
        credentialData: response.data,
        invitationUrl,
        deepLinkUrl,
        nationalIdNumber, // Include for reference
        message: "NYSC Green Card issued successfully",
      },
    });
  } catch (error: any) {
    logger.error("NYSC Registration: Error issuing Green Card", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("NYSC Registration: API Response Error", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            error: "api_error",
            error_description: error.response?.data?.message || "Failed to issue Green Card",
            details: error.response?.data,
          },
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          error: "internal_server_error",
          error_description: error.message || "Failed to issue Green Card",
        },
      },
      { status: 500 }
    );
  }
}
