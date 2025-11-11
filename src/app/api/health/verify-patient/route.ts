/**
 * Health Sector - Verify Patient Credentials API
 *
 * Verifies medical health card credentials for patient visit registration
 */

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/api/confirmd-auth";
import { API_CONFIG } from "@/lib/api/constants";
import { logger } from "@/lib/api/logger";
import axios from "axios";

/**
 * POST /api/health/verify-patient
 * Request proof of medical health card or check verification status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, proofRecordId } = body;

    // Get organization ID
    const orgId = process.env.CONFIRMD_ORG_ID;
    const credDefId = process.env.ISSUE_CRED_DEF_ID;

    if (!orgId || !credDefId) {
      logger.error("[Health Verify API] Missing configuration");
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
      logger.info("[Health Verify API] Requesting proof from patient");

      // Request proof presentation
      const payload = {
        comment: "Please share your medical health card for visit registration",
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
              date_of_birth: {
                name: "date_of_birth",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              patient_id: {
                name: "patient_id",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              health_insurance_number: {
                name: "health_insurance_number",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              blood_type: {
                name: "blood_type",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              genotype: {
                name: "genotype",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              allergies: {
                name: "allergies",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              chronic_conditions: {
                name: "chronic_conditions",
                restrictions: [
                  {
                    cred_def_id: credDefId,
                  },
                ],
              },
              issuing_hospital: {
                name: "issuing_hospital",
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

      logger.info("[Health Verify API] API URL:", { apiUrl });
      logger.info("[Health Verify API] Payload:", { payload: JSON.stringify(payload, null, 2) });

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      logger.info("[Health Verify API] Proof request created successfully");

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

      logger.info("[Health Verify API] Checking proof status for:", { proofRecordId });

      // Check proof status
      const apiUrl = `${API_CONFIG.BASE_URL}/orgs/${orgId}/proofs/${proofRecordId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });

      const proofData = response.data;
      logger.info("[Health Verify API] Proof status:", proofData.state);

      // Check if proof is verified
      if (proofData.state === "done" || proofData.state === "verified") {
        // Extract revealed attributes
        const revealedAttrs = proofData.presentationMessage?.presentations_attach?.[0]?.data?.json?.requested_proof?.revealed_attrs || {};

        const patientData = {
          fullName: `${revealedAttrs.title?.raw || ""} ${revealedAttrs.othernames?.raw || ""} ${revealedAttrs.surname?.raw || ""}`,
          title: revealedAttrs.title?.raw || "",
          surname: revealedAttrs.surname?.raw || "",
          othernames: revealedAttrs.othernames?.raw || "",
          dateOfBirth: revealedAttrs.date_of_birth?.raw || "",
          patientId: revealedAttrs.patient_id?.raw || "",
          healthInsuranceNumber: revealedAttrs.health_insurance_number?.raw || "",
          bloodType: revealedAttrs.blood_type?.raw || "",
          genotype: revealedAttrs.genotype?.raw || "",
          allergies: revealedAttrs.allergies?.raw || "",
          chronicConditions: revealedAttrs.chronic_conditions?.raw || "",
          issuingHospital: revealedAttrs.issuing_hospital?.raw || "",
        };

        logger.info("[Health Verify API] Patient verified:", { fullName: patientData.fullName });

        return NextResponse.json(
          {
            success: true,
            data: {
              verified: true,
              patient: patientData,
              message: "Patient credentials verified successfully",
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
    logger.error("[Health Verify API] Error:", {
      error: error.message,
      stack: error.stack,
    });

    if (axios.isAxiosError(error)) {
      logger.error("[Health Verify API] API Response Error:", {
        status: error.response?.status,
        data: error.response?.data,
      });

      return NextResponse.json(
        {
          success: false,
          error: "api_error",
          message: error.response?.data?.message || "Failed to verify patient credentials",
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: error.message || "Failed to verify patient credentials",
      },
      { status: 500 }
    );
  }
}
