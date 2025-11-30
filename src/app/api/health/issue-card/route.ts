/**
 * Health Sector - Issue Medical Health Card API
 *
 * Issues verifiable medical health card credentials via email (OOB)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import axios from "axios";

interface HealthCardData {
  email: string;
  surname: string;
  othernames: string;
  dateOfBirth: string;
  gender: string;
  patientId: string;
  healthInsuranceNumber: string;
  bloodType: string;
  genotype: string;
  allergies: string;
  chronicConditions: string;
  issuingHospital: string;
  issuedDate: string;
  expiryDate: string;
}

/**
 * POST /api/health/issue-card
 * Issue a medical health card credential to a patient
 */
export async function POST(request: NextRequest) {
  try {
    const body: HealthCardData = await request.json();
    const {
      email,
      surname,
      othernames,
      dateOfBirth,
      gender,
      patientId,
      healthInsuranceNumber,
      bloodType,
      genotype,
      allergies,
      chronicConditions,
      issuingHospital,
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
      !patientId ||
      !healthInsuranceNumber ||
      !bloodType ||
      !genotype ||
      !issuingHospital ||
      !issuedDate ||
      !expiryDate
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_required_fields",
          message: "All health card fields are required",
        },
        { status: 400 }
      );
    }

    const fullName = `${othernames} ${surname}`;
    logger.info("[Health Card API] Processing credential issuance for:", { fullName });

    // Get organization ID and credential definition ID
    const orgId = process.env.CONFIRMD_ORG_ID;
    const credDefId = process.env.HEALTH_CARD_CRED_DEF_ID;

    if (!orgId || !credDefId) {
      logger.error("[Health Card API] Missing configuration", {
        orgId: !!orgId,
        credDefId: !!credDefId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "configuration_error",
          message: "Organization or credential definition not configured. Please set HEALTH_CARD_CRED_DEF_ID in your .env file.",
        },
        { status: 500 }
      );
    }

    logger.info("[Health Card API] Using Organization ID:", { orgId });
    logger.info("[Health Card API] Using Credential Definition ID:", { credDefId });

    // Authenticate with ConfirmD Platform
    logger.info("[Health Card API] Authenticating with ConfirmD Platform...");
    const token = await getAccessToken();

    // Prepare credential offer payload
    const payload = {
      credentialOffer: [
        {
          emailId: email,
          attributes: [
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
              value: patientId,
              name: "patient_id",
              isRequired: true,
            },
            {
              value: healthInsuranceNumber,
              name: "health_insurance_number",
              isRequired: true,
            },
            {
              value: bloodType,
              name: "blood_type",
              isRequired: true,
            },
            {
              value: genotype,
              name: "genotype",
              isRequired: true,
            },
            {
              value: allergies,
              name: "allergies",
              isRequired: true,
            },
            {
              value: chronicConditions,
              name: "chronic_conditions",
              isRequired: true,
            },
            {
              value: issuingHospital,
              name: "issuing_hospital",
              isRequired: true,
            },
            {
              value: issuedDate,
              name: "issuing_date",
              isRequired: true,
            },
            {
              value: expiryDate,
              name: "expiry_date",
              isRequired: true,
            },
          ],
        },
      ],
      credentialDefinitionId: credDefId,
      isReuseConnection: true,
    };

    // Issue credential via ConfirmD Platform
    const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/credentials/oob/email?credentialType=indy`;

    logger.info("[Health Card API] Issuing credential to:", { email });
    logger.info("[Health Card API] API URL:", { apiUrl });
    logger.info("[Health Card API] Payload:", { payload: JSON.stringify(payload, null, 2) });

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("[Health Card API] Credential issued successfully");

    return NextResponse.json(
      {
        success: true,
        data: {
          email,
          fullName,
          patientId,
          healthInsuranceNumber,
          issuingHospital,
          message: "Medical health card issued successfully",
          response: response.data,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("[Health Card API] Error issuing credential:", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("[Health Card API] API Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: "api_error",
          message: error.response?.data?.message || "Failed to issue health card",
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: error.message || "Failed to issue health card",
      },
      { status: 500 }
    );
  }
}
