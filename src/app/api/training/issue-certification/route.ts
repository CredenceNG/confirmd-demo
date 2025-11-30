/**
 * Training Certifications - Issue Certification API
 *
 * Issues verifiable training certification credentials via email (OOB)
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import axios from "axios";

interface CertificationData {
  email: string;
  surname: string;
  othernames: string;
  nationalIdNumber: string;
  certificationTitle: string;
  trainingOrganization: string;
  courseCode: string;
  completionDate: string;
  issueDate: string;
  expiryDate: string;
  grade: string;
  credentialNumber: string;
  skills: string;
}

/**
 * POST /api/training/issue-certification
 * Issue a training certification credential to a graduate
 */
export async function POST(request: NextRequest) {
  try {
    const body: CertificationData = await request.json();
    const {
      email,
      surname,
      othernames,
      nationalIdNumber,
      certificationTitle,
      trainingOrganization,
      courseCode,
      completionDate,
      issueDate,
      expiryDate,
      grade,
      credentialNumber,
      skills,
    } = body;

    // Validate required fields
    if (
      !email ||
      !surname ||
      !othernames ||
      !nationalIdNumber ||
      !certificationTitle ||
      !trainingOrganization ||
      !courseCode ||
      !completionDate ||
      !issueDate ||
      !expiryDate ||
      !grade ||
      !credentialNumber ||
      !skills
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_required_fields",
          message: "All certification fields are required",
        },
        { status: 400 }
      );
    }

    const fullName = `${othernames} ${surname}`;
    logger.info("[Training Certification API] Processing credential issuance for:", { fullName });

    // Debug: Log all received values
    logger.info("[Training Certification API] Received values:", {
      email,
      surname,
      othernames,
      nationalIdNumber,
      certificationTitle,
      trainingOrganization,
      courseCode,
      completionDate,
      issueDate,
      expiryDate,
      grade,
      credentialNumber,
      skills,
    });

    // Get organization ID and credential definition ID
    const orgId = process.env.CONFIRMD_ORG_ID;
    const credDefId = process.env.TRAINING_CERTIFICATION_CRED_DEF_ID;

    if (!orgId) {
      logger.error("[Training Certification API] Missing CONFIRMD_ORG_ID");
      return NextResponse.json(
        {
          success: false,
          error: "configuration_error",
          message: "Organization ID not configured",
        },
        { status: 500 }
      );
    }

    if (!credDefId) {
      logger.error("[Training Certification API] Missing TRAINING_CERTIFICATION_CRED_DEF_ID");
      return NextResponse.json(
        {
          success: false,
          error: "configuration_error",
          message: "Training Certification credential definition not configured. Please set TRAINING_CERTIFICATION_CRED_DEF_ID in your .env file.",
        },
        { status: 500 }
      );
    }

    logger.info("[Training Certification API] Using Organization ID:", { orgId });
    logger.info("[Training Certification API] Using Credential Definition ID:", { credDefId });

    // Authenticate with ConfirmD Platform
    logger.info("[Training Certification API] Authenticating with ConfirmD Platform...");
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
              value: nationalIdNumber,
              name: "national_id_number",
              isRequired: true,
            },
            {
              value: certificationTitle,
              name: "certification_title",
              isRequired: true,
            },
            {
              value: trainingOrganization,
              name: "training_organization",
              isRequired: true,
            },
            {
              value: courseCode,
              name: "course_code",
              isRequired: true,
            },
            {
              value: completionDate,
              name: "completion_date",
              isRequired: true,
            },
            {
              value: issueDate,
              name: "issue_date",
              isRequired: true,
            },
            {
              value: expiryDate,
              name: "expiry_date",
              isRequired: true,
            },
            {
              value: grade,
              name: "grade",
              isRequired: true,
            },
            {
              value: credentialNumber,
              name: "credential_number",
              isRequired: true,
            },
            {
              value: skills,
              name: "skills",
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

    logger.info("[Training Certification API] Issuing credential to:", { email });
    logger.info("[Training Certification API] API URL:", { apiUrl });
    logger.info("[Training Certification API] Payload:", { payload: JSON.stringify(payload, null, 2) });

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    logger.info("[Training Certification API] Credential issued successfully");

    return NextResponse.json(
      {
        success: true,
        data: {
          email,
          fullName,
          certificationTitle,
          credentialNumber,
          trainingOrganization,
          message: "Training certification issued successfully",
          response: response.data,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("[Training Certification API] Error issuing credential:", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("[Training Certification API] API Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: "api_error",
          message: error.response?.data?.message || "Failed to issue certification",
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: error.message || "Failed to issue certification",
      },
      { status: 500 }
    );
  }
}
