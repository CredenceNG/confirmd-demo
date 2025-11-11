/**
 * Training Certifications - Verify Certification API
 *
 * Verifies training certification credentials for employment verification
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import axios from "axios";

/**
 * POST /api/training/verify-certification
 * Request proof of training certification or check verification status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, proofRecordId } = body;

    // Get organization ID
    const orgId = process.env.CONFIRMD_ORG_ID;
    const credDefId = process.env.ISSUE_CRED_DEF_ID;

    if (!orgId || !credDefId) {
      logger.error("[Training Verify API] Missing configuration");
      return NextResponse.json(
        {
          success: false,
          error: "configuration_error",
          message: "Organization or credential definition not configured",
        },
        { status: 500 }
      );
    }

    // Authenticate with ConfirmD Platform
    const token = await getAccessToken();

    if (action === "request_proof") {
      logger.info("[Training Verify API] Requesting proof from candidate");

      // Request proof presentation
      const payload = {
        comment: "Please share your training certification for employment verification",
        proofFormats: {
          indy: {
            requested_attributes: {
              title: {
                name: "title",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              surname: {
                name: "surname",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              othernames: {
                name: "othernames",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              certification_title: {
                name: "certification_title",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              training_organization: {
                name: "training_organization",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              course_code: {
                name: "course_code",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              completion_date: {
                name: "completion_date",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              issue_date: {
                name: "issue_date",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              expiry_date: {
                name: "expiry_date",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              grade: {
                name: "grade",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              credential_number: {
                name: "credential_number",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              skills: {
                name: "skills",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
            },
            requested_predicates: {},
          },
        },
        autoAcceptProof: "always",
      };

      const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/proofs/request-outofband`;

      logger.info("[Training Verify API] API URL:", { apiUrl });
      logger.info("[Training Verify API] Payload:", { payload: JSON.stringify(payload, null, 2) });

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      logger.info("[Training Verify API] Proof request created successfully");

      return NextResponse.json(
        {
          success: true,
          data: {
            qrCode: response.data.invitationUrl || "",
            proofRecordId: response.data.proofRecord?.proofId || response.data.proofId || "",
            message: "Proof request created successfully",
          },
        },
        { status: 200 }
      );
    } else if (action === "check_status") {
      if (!proofRecordId) {
        return NextResponse.json(
          {
            success: false,
            error: "missing_proof_record_id",
            message: "Proof record ID is required",
          },
          { status: 400 }
        );
      }

      logger.info("[Training Verify API] Checking proof status for:", { proofRecordId });

      // Check proof status
      const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/proofs/${proofRecordId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });

      const proofData = response.data;
      logger.info("[Training Verify API] Proof status:", proofData.state);

      // Check if proof is verified
      if (proofData.state === "done" || proofData.state === "verified") {
        // Extract revealed attributes
        const revealedAttrs = proofData.presentationMessage?.presentations_attach?.[0]?.data?.json?.requested_proof?.revealed_attrs || {};

        const certificationData = {
          fullName: `${revealedAttrs.title?.raw || ""} ${revealedAttrs.othernames?.raw || ""} ${revealedAttrs.surname?.raw || ""}`,
          title: revealedAttrs.title?.raw || "",
          surname: revealedAttrs.surname?.raw || "",
          othernames: revealedAttrs.othernames?.raw || "",
          certificationTitle: revealedAttrs.certification_title?.raw || "",
          trainingOrganization: revealedAttrs.training_organization?.raw || "",
          courseCode: revealedAttrs.course_code?.raw || "",
          completionDate: revealedAttrs.completion_date?.raw || "",
          issueDate: revealedAttrs.issue_date?.raw || "",
          expiryDate: revealedAttrs.expiry_date?.raw || "",
          grade: revealedAttrs.grade?.raw || "",
          credentialNumber: revealedAttrs.credential_number?.raw || "",
          skills: revealedAttrs.skills?.raw || "",
        };

        logger.info("[Training Verify API] Certification verified:", { fullName: certificationData.fullName });

        return NextResponse.json(
          {
            success: true,
            data: {
              verified: true,
              certification: certificationData,
              message: "Certification verified successfully",
            },
          },
          { status: 200 }
        );
      }

      // Not yet verified
      return NextResponse.json(
        {
          success: true,
          data: {
            verified: false,
            state: proofData.state,
            message: "Proof verification pending",
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_action",
          message: "Invalid action specified",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    logger.error("[Training Verify API] Error:", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("[Training Verify API] API Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: "api_error",
          message: error.response?.data?.message || "Failed to verify certification",
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: error.message || "Failed to verify certification",
      },
      { status: 500 }
    );
  }
}
