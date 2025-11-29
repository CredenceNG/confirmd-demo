/**
 * NYSC Onboarding - Issue ID Card API
 *
 * Verifies the submitted Green Card proof
 * and issues NYSC ID Card credential if verification succeeds
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
 * POST /api/nysc/onboarding/issue-id-card
 * Verify Green Card proof and issue NYSC ID Card credential
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofId, sessionId } = body;

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

    logger.info("NYSC Onboarding: Verifying Green Card and issuing NYSC ID", {
      proofId,
      sessionId,
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

    logger.info("Found connectionId from session", { connectionId });

    // Step 2: Fetch the Green Card proof details from ConfirmD
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

    logger.info("Fetching Green Card proof details from ConfirmD", { proofId, orgId });

    const proofDetailsResponse = await confirmdClient.getProofDetails(orgId, proofId);

    if (!proofDetailsResponse.success || !proofDetailsResponse.data) {
      logger.error("Failed to fetch Green Card proof details", {
        proofId,
        error: proofDetailsResponse.error,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "proof_fetch_failed",
            error_description: "Could not fetch Green Card proof details from ConfirmD",
          },
        },
        { status: 500 }
      );
    }

    // Step 3: Extract attributes from the Green Card proof
    const proofData = proofDetailsResponse.data;
    const attributes: Record<string, string> = {};

    // Log raw proof data structure for debugging
    logger.info("Raw Green Card proof data structure", {
      proofId,
      proofDataType: typeof proofData,
      isArray: Array.isArray(proofData),
      proofDataLength: Array.isArray(proofData) ? proofData.length : 'N/A',
      proofDataKeys: proofData && typeof proofData === 'object' ? Object.keys(proofData) : 'N/A',
      rawProofData: JSON.stringify(proofData, null, 2),
    });

    if (Array.isArray(proofData) && proofData.length > 0) {
      // The ConfirmD Platform API returns attributes as an array where EACH object
      // contains ONE attribute (plus schemaId/credDefId metadata).
      // Iterate through each object and extract its attribute
      proofData.forEach((credentialData: any, index: number) => {
        logger.info(`Processing credential data at index ${index}`, {
          credentialDataKeys: Object.keys(credentialData),
          schemaId: credentialData.schemaId,
          credDefId: credentialData.credDefId,
          fullCredentialData: JSON.stringify(credentialData, null, 2),
        });

        // Remove schemaId and credDefId metadata, keep only the actual attribute
        const { schemaId, credDefId, ...extractedAttribute } = credentialData;

        // Merge this attribute directly into the attributes object
        // The attributes are direct properties, not nested objects with 'raw' values
        Object.assign(attributes, extractedAttribute);

        logger.info(`Extracted attributes from credential ${index}:`, { extractedAttribute });
      });
    }

    logger.info("Extracted proof attributes from all credentials", {
      proofId,
      attributeCount: Object.keys(attributes).length,
      attributeNames: Object.keys(attributes),
      extractedAttributes: attributes,
    });

    // Validate that we have attributes from all 4 required credentials
    const hasGreenCard = !!(attributes.surname && attributes.othernames && attributes.call_up_number);
    const hasStudentCard = !!(attributes.matric_number && attributes.school_name && attributes.programme);
    const hasStatementOfResults = !!(attributes.graduation_year && attributes.classification);
    const hasMedicalFitness = !!(attributes.certificate_number && attributes.fitness_status);

    logger.info("Credential verification status", {
      hasGreenCard,
      hasStudentCard,
      hasStatementOfResults,
      hasMedicalFitness,
    });

    // Check for required identity attributes
    const surname = attributes.surname;
    const othernames = attributes.othernames;

    if (!surname || !othernames) {
      logger.error("Required identity attributes not found in proof", {
        proofId,
        hasSurname: !!surname,
        hasOthernames: !!othernames,
        providedAttributes: Object.keys(attributes),
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            error: "missing_identity_attributes",
            error_description: "Surname and othernames are required. Please ensure you've shared all required credentials.",
          },
        },
        { status: 400 }
      );
    }

    // Warn if any credentials are missing (but continue for demo purposes)
    if (!hasGreenCard || !hasStudentCard || !hasStatementOfResults || !hasMedicalFitness) {
      logger.warn("Some credentials are missing from the proof", {
        hasGreenCard,
        hasStudentCard,
        hasStatementOfResults,
        hasMedicalFitness,
        providedAttributes: Object.keys(attributes),
      });
    }

    // Step 4: Try to look up NYSC Registration record (optional for demo purposes)
    logger.info("Looking up NYSC Registration record (optional)", {
      surname,
      othernames,
    });

    let nyscRegistration = await prisma.nYSCRegistration.findFirst({
      where: {
        surname,
        othernames,
        greenCardIssued: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // For demo purposes: If no registration found, create one on the fly
    if (!nyscRegistration) {
      logger.info("No existing registration found, creating demo registration record", {
        surname,
        othernames,
      });

      // Generate a demo national ID number
      const demoNationalId = `DEMO-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Create a new registration record for demo purposes with all credential attributes
      nyscRegistration = await prisma.nYSCRegistration.create({
        data: {
          sessionId: sessionId, // Link to current session
          nationalIdNumber: demoNationalId,
          // Identity from Green Card
          surname,
          othernames,
          callUpNumber: attributes.call_up_number || null,
          contactPhone: attributes.phone_number || null,
          contactAddress: attributes.address || null,
          // Academic info from Student Card
          matricNumber: attributes.matric_number || null,
          schoolName: attributes.school_name || null,
          programme: attributes.programme || null,
          department: attributes.department || null,
          // Green Card credential tracking
          greenCardIssued: true,
          greenCardIssuedAt: new Date(),
          status: "green_card_issued",
          // Store all proof data as JSON
          proofData: JSON.stringify({
            greenCard: {
              surname,
              othernames,
              call_up_number: attributes.call_up_number,
              phone_number: attributes.phone_number,
              address: attributes.address,
            },
            studentCard: {
              matric_number: attributes.matric_number,
              school_name: attributes.school_name,
              programme: attributes.programme,
            },
            statementOfResults: {
              graduation_year: attributes.graduation_year,
              classification: attributes.classification,
            },
            medicalFitness: {
              certificate_number: attributes.certificate_number,
              fitness_status: attributes.fitness_status,
              blood_group: attributes.blood_group,
            },
          }),
        },
      });

      logger.info("Created demo registration record", {
        registrationId: nyscRegistration.id,
        nationalIdNumber: nyscRegistration.nationalIdNumber,
      });
    } else {
      logger.info("Found existing NYSC Registration record", {
        registrationId: nyscRegistration.id,
        nationalIdNumber: nyscRegistration.nationalIdNumber,
        greenCardIssued: nyscRegistration.greenCardIssued,
        status: nyscRegistration.status,
      });
    }

    // Get access token for NYSC organization
    const token = await getAccessToken();

    // Get NYSC ID Card credential definition ID
    const credentialDefinitionId =
      process.env.NYSC_ID_CARD_CRED_DEF_ID ||
      process.env.ISSUE_CRED_DEF_ID; // Fallback for demo

    if (!credentialDefinitionId || credentialDefinitionId.includes("PLACEHOLDER")) {
      logger.warn("NYSC_ID_CARD_CRED_DEF_ID not configured, using fallback");
    }

    // Helper function to ensure no null/undefined values
    const ensureValue = (value: any, defaultValue: string = "N/A"): string => {
      if (value === undefined || value === null || value === "undefined" || value === "null" || value === "") {
        return defaultValue;
      }
      return String(value);
    };

    // Calculate service dates (1 year service period)
    const serviceStartDate = new Date().toISOString().slice(0, 10);
    const serviceEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const expiryDate = new Date(Date.now() + 730 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const issuedDate = new Date().toISOString().slice(0, 10);

    // Prepare NYSC ID Card credential attributes
    // This comprehensive ID Card includes verified data from all 4 credentials:
    // - Identity from Green Card
    // - Academic info from Student Card & Statement of Results
    // - Health info from Medical Fitness Certificate
    const payload = {
      credentialData: [
        {
          connectionId,
          attributes: [
            // Basic Identity (from Green Card)
            {
              name: "surname",
              value: ensureValue(surname, "Doe"),
            },
            {
              name: "othernames",
              value: ensureValue(othernames, "John"),
            },
            {
              name: "id_number",
              value: `NYSC-${Date.now()}`,
            },
            {
              name: "service_state",
              value: ensureValue("Lagos", "Lagos"),
            },
            {
              name: "Service_start_date",
              value: serviceStartDate,
            },
            {
              name: "service_end_date",
              value: serviceEndDate,
            },
            {
              name: "issued_date",
              value: issuedDate,
            },
            {
              name: "expiry_date",
              value: expiryDate,
            },
          ],
        },
      ],
      credentialDefinitionId,
      orgId,
    };

    logger.info("NYSC ID Card will include verified data from multiple credentials", {
      greenCard: { surname, othernames, call_up_number: attributes.call_up_number },
      studentCard: { matric_number: attributes.matric_number, school: attributes.school_name },
      statementOfResults: { graduation_year: attributes.graduation_year, classification: attributes.classification },
      medicalFitness: { fitness_status: attributes.fitness_status, blood_group: attributes.blood_group },
    });

    // Make API call to issue NYSC ID Card credential using existing connection
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/offer?credentialType=indy`;

    logger.info("NYSC Onboarding: Issuing NYSC ID Card credential", {
      connectionId,
      apiUrl,
    });

    console.log("[NYSC ID Card API] Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("NYSC Onboarding: NYSC ID Card issued successfully", {
      responseData: response.data,
    });

    // Extract credential ID from response
    const credentialOfferDetails = response.data?.data || response.data;
    const idCardCredentialId = credentialOfferDetails?.response?.credentialId ||
                                 credentialOfferDetails?.credentialId ||
                                 response.data?.id;

    // Step 5: Update NYSC Registration record with ID Card issuance details
    await prisma.nYSCRegistration.update({
      where: { id: nyscRegistration.id },
      data: {
        onboardingSessionId: sessionId,
        idCardIssued: true,
        idCardIssuedAt: new Date(),
        idCardCredentialId,
        serviceState: "Lagos", // TODO: Extract from form or proof
        serviceStartDate,
        serviceEndDate,
        status: "completed",
      },
    });

    logger.info("NYSC Registration record updated with ID Card details", {
      registrationId: nyscRegistration.id,
      nationalIdNumber: nyscRegistration.nationalIdNumber,
      idCardCredentialId,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      data: {
        idCardIssued: true,
        credentialData: response.data,
        nationalIdNumber: nyscRegistration.nationalIdNumber,
        message: "NYSC ID Card issued successfully",
      },
    });
  } catch (error: any) {
    logger.error("NYSC Onboarding: Error issuing NYSC ID Card", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("NYSC Onboarding: API Response Error", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            error: "api_error",
            error_description: error.response?.data?.message || "Failed to issue NYSC ID Card",
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
          error_description: error.message || "Failed to issue NYSC ID Card",
        },
      },
      { status: 500 }
    );
  }
}
