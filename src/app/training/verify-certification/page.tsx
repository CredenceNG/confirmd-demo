"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type VerificationStatus =
  | "idle"
  | "generating-qr"
  | "waiting-scan"
  | "verifying"
  | "verified"
  | "error";

interface VerifiedCertificationData {
  fullName: string;
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

export default function VerifyTrainingCertificationPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [proofRecordId, setProofRecordId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [certificationData, setCertificationData] = useState<VerifiedCertificationData | null>(null);
  const [pollIntervalId, setPollIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, [pollIntervalId]);

  // Request proof from candidate
  const requestProof = async () => {
    setVerificationStatus("generating-qr");
    setErrorMessage("");

    try {
      console.log("[Training Verify] Requesting proof from API...");
      const response = await fetch("/api/training/verify-certification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "request_proof",
        }),
      });

      const data = await response.json();
      console.log("[Training Verify] Proof request response:", data);

      if (!response.ok || !data.success) {
        // Handle various error formats - error could be string, object, or undefined
        let errorDescription = "Failed to create proof request";
        if (data.message) {
          errorDescription = data.message;
        } else if (data.error && typeof data.error === "string") {
          errorDescription = data.error;
        } else if (data.error?.message) {
          errorDescription = data.error.message;
        } else if (data.details) {
          errorDescription = typeof data.details === "string" ? data.details : JSON.stringify(data.details);
        }
        console.error("[Training Verify] Failed to request proof:", data);
        setErrorMessage(errorDescription);
        setVerificationStatus("error");
        return;
      }

      const qrCode = data.data?.qrCode || "";
      const recordId = data.data?.proofRecordId || "";

      if (!qrCode) {
        setErrorMessage("No QR code received from the server. Please try again.");
        setVerificationStatus("error");
        return;
      }

      setQrCodeUrl(qrCode);
      setProofRecordId(recordId);
      setVerificationStatus("waiting-scan");

      console.log("[Training Verify] QR code generated, starting polling...", { recordId });

      // Start polling for proof status
      const intervalId = setInterval(() => {
        checkProofStatus(recordId);
      }, 3000);
      setPollIntervalId(intervalId);

    } catch (error: any) {
      console.error("[Training Verify] Network error:", error);
      setErrorMessage(`Network error: ${error.message || "Unable to connect to the server"}`);
      setVerificationStatus("error");
    }
  };

  // Check proof verification status
  const checkProofStatus = async (recordId: string) => {
    try {
      console.log("[Training Verify] Checking proof status...", { recordId });
      const response = await fetch("/api/training/verify-certification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "check_status",
          proofRecordId: recordId,
        }),
      });

      const data = await response.json();
      console.log("[Training Verify] Status response:", data);

      if (response.ok && data.success && data.data?.verified) {
        // Stop polling
        if (pollIntervalId) {
          clearInterval(pollIntervalId);
          setPollIntervalId(null);
        }

        // Extract certification data
        const cert = data.data.certification;
        setCertificationData({
          fullName: cert.fullName || `${cert.othernames || ""} ${cert.surname || ""}`.trim(),
          surname: cert.surname || "",
          othernames: cert.othernames || "",
          nationalIdNumber: cert.nationalIdNumber || "",
          certificationTitle: cert.certificationTitle || "",
          trainingOrganization: cert.trainingOrganization || "",
          courseCode: cert.courseCode || "",
          completionDate: cert.completionDate || "",
          issueDate: cert.issueDate || "",
          expiryDate: cert.expiryDate || "",
          grade: cert.grade || "",
          credentialNumber: cert.credentialNumber || "",
          skills: cert.skills || "",
        });

        setVerificationStatus("verified");
        console.log("[Training Verify] Proof verified successfully!");
      }
    } catch (error) {
      console.error("[Training Verify] Error checking status:", error);
    }
  };

  // Reset to initial state
  const resetVerification = () => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      setPollIntervalId(null);
    }
    setVerificationStatus("idle");
    setQrCodeUrl("");
    setProofRecordId("");
    setErrorMessage("");
    setCertificationData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Demos
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Employer Portal
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Training Certification
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Instantly verify candidate training certifications for employment decisions.
            Request proof of professional training credentials from job applicants.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Idle State - Start Verification */}
          {verificationStatus === "idle" && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Request Training Credential Verification
                </h2>
                <p className="text-gray-600">
                  Generate a QR code for the candidate to scan with their digital wallet
                </p>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How Verification Works
                </h3>
                <ol className="space-y-3 text-sm text-purple-800">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <span>Click "Start Verification" to generate a proof request QR code</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <span>Candidate scans the QR code with their ConfirmD wallet app</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    <span>Candidate approves sharing their training certification credential</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                    <span>Credential is cryptographically verified and displayed to you</span>
                  </li>
                </ol>
              </div>

              {/* Prerequisite Notice */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Candidate Prerequisites</h4>
                    <p className="text-sm text-amber-800">
                      The candidate must have a Training Certification credential in their ConfirmD wallet.
                      If they don't have one, they can obtain it from the{" "}
                      <Link href="/training/issue-certification" className="text-purple-600 underline font-medium hover:text-purple-800">
                        Training Organization Demo
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={requestProof}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Start Verification
                </div>
              </button>
            </div>
          )}

          {/* Generating QR State */}
          {verificationStatus === "generating-qr" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating QR Code...</h2>
              <p className="text-gray-600">Creating a secure proof request</p>
            </div>
          )}

          {/* Waiting for Scan State */}
          {verificationStatus === "waiting-scan" && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Scan QR Code with Wallet
                </h2>
                <p className="text-gray-600">
                  Ask the candidate to scan this QR code with their ConfirmD wallet
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 mb-6 border-2 border-purple-200">
                <div className="bg-white p-6 rounded-xl shadow-lg mx-auto w-fit">
                  <QRCodeSVG value={qrCodeUrl} size={280} level="H" />
                </div>
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    Waiting for credential presentation...
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instructions for Candidate
                </h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Open the ConfirmD wallet app on your phone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Tap the scan button to scan this QR code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Review the credential request and approve sharing</span>
                  </li>
                </ol>
              </div>

              <button
                onClick={resetVerification}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Verification
              </button>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === "error" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={resetVerification}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Verified State */}
          {verificationStatus === "verified" && certificationData && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Certification Verified!
                </h2>
                <p className="text-gray-600">
                  The candidate's training certification has been cryptographically verified
                </p>
              </div>

              {/* Verified Certification Details */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified Credential Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-bold text-gray-900">{certificationData.fullName}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">National ID Number</p>
                    <p className="font-bold text-gray-900">{certificationData.nationalIdNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Certification Title</p>
                    <p className="font-bold text-gray-900 text-lg">{certificationData.certificationTitle}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Training Organization</p>
                    <p className="font-bold text-gray-900">{certificationData.trainingOrganization}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Credential Number</p>
                    <p className="font-bold text-purple-600">{certificationData.credentialNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Course Code</p>
                    <p className="font-bold text-gray-900">{certificationData.courseCode}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Grade</p>
                    <p className="font-bold text-green-600 text-lg">{certificationData.grade}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Completion Date</p>
                    <p className="font-bold text-gray-900">{certificationData.completionDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                    <p className="font-bold text-gray-900">{certificationData.issueDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                    <p className="font-bold text-gray-900">{certificationData.expiryDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Skills / Competencies</p>
                    <p className="font-bold text-gray-900">{certificationData.skills}</p>
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Cryptographically Verified</h4>
                    <p className="text-sm text-blue-800">
                      This credential has been cryptographically verified against the issuing organization's
                      digital signature. The information shown is authentic and has not been tampered with.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={resetVerification}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  Verify Another Candidate
                </button>
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Back to Demos
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This demo showcases employer-side verification of training certifications using verifiable credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
