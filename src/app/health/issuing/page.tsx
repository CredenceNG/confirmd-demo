"use client";

import { Suspense, useRef } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function IssuingHealthCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueStatus, setIssueStatus] = useState<"idle" | "issuing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [credentialDetails, setCredentialDetails] = useState<any>(null);
  const hasIssuedRef = useRef(false); // Prevent double issuance in React Strict Mode

  // Parse data from URL parameter
  const dataParam = searchParams.get("data");
  const formData = dataParam ? JSON.parse(decodeURIComponent(dataParam)) : {
    email: "",
    title: "",
    surname: "",
    othernames: "",
    dateOfBirth: "",
    patientId: "",
    healthInsuranceNumber: "",
    bloodType: "",
    genotype: "",
    allergies: "",
    chronicConditions: "",
    issuingHospital: "",
    issuedDate: "",
    expiryDate: "",
  };

  const fullName = `${formData.title} ${formData.othernames} ${formData.surname}`;

  useEffect(() => {
    // Auto-start issuing when page loads (only once, guard against React Strict Mode double-mount)
    if (hasIssuedRef.current) return;
    hasIssuedRef.current = true;
    issueHealthCard();
  }, []);

  const issueHealthCard = async () => {
    setIsIssuing(true);
    setIssueStatus("issuing");
    setErrorMessage("");

    try {
      console.log("[Health Sector] Issuing health card...", formData);

      const response = await fetch("/api/health/issue-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("[Health Sector] Issue response:", data);

      if (response.ok && data.success) {
        setIssueStatus("success");
        setCredentialDetails(data.data);
      } else {
        setIssueStatus("error");
        setErrorMessage(data.error || data.message || "Failed to issue health card");
      }
    } catch (error) {
      console.error("[Health Sector] Error issuing credential:", error);
      setIssueStatus("error");
      setErrorMessage("An error occurred while issuing the health card. Please try again.");
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Issuing Medical Health Card
                  </h1>
                  <p className="text-cyan-100 mt-1">
                    Processing credential for {fullName}
                  </p>
                </div>
                <Link
                  href="/health/issue-card"
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  ← Back
                </Link>
              </div>
            </div>

            <div className="p-8">
              {/* Issuing State */}
              {issueStatus === "issuing" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Processing Medical Health Card...
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Creating and sending credential to {formData.email}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              )}

              {/* Success State */}
              {issueStatus === "success" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Medical Health Card Issued Successfully!
                  </h2>
                  <p className="text-xl text-gray-700 mb-8">
                    The credential has been sent to <strong>{formData.email}</strong>
                  </p>

                  {/* Patient Details */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Credential Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Patient Name:</span>
                        <span className="font-semibold text-gray-900">{fullName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-semibold text-gray-900">{formData.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Patient ID:</span>
                        <span className="font-semibold text-gray-900">{formData.patientId}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Health Insurance Number:</span>
                        <span className="font-semibold text-teal-600">{formData.healthInsuranceNumber}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Blood Type:</span>
                        <span className="font-semibold text-red-600">{formData.bloodType}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Genotype:</span>
                        <span className="font-semibold text-gray-900">{formData.genotype}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Allergies:</span>
                        <span className="font-semibold text-orange-600">{formData.allergies || "None"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Chronic Conditions:</span>
                        <span className="font-semibold text-gray-900">{formData.chronicConditions || "None"}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Issuing Hospital:</span>
                        <span className="font-semibold text-gray-900">{formData.issuingHospital}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                        <span className="text-gray-600">Issued Date:</span>
                        <span className="font-semibold text-gray-900">{formData.issuedDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-semibold text-gray-900">{formData.expiryDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">Next Steps</h3>
                    <ol className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>The patient will receive an email with instructions to claim their health card</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>They can add it to their ConfirmD wallet app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>They can now use this credential for hospital admission and medical services</span>
                      </li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/health/issue-card"
                      className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl text-center"
                    >
                      Issue Another Health Card
                    </Link>
                    <Link
                      href="/"
                      className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-teal-600 text-center"
                    >
                      Back to Demos
                    </Link>
                  </div>
                </div>
              )}

              {/* Error State */}
              {issueStatus === "error" && (
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Failed to Issue Health Card
                  </h2>
                  <p className="text-gray-700 mb-6">
                    {errorMessage}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={issueHealthCard}
                      disabled={isIssuing}
                      className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isIssuing ? "Retrying..." : "Try Again"}
                    </button>
                    <Link
                      href="/health/issue-card"
                      className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-teal-600 text-center"
                    >
                      Go Back
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function IssuingHealthCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <IssuingHealthCardContent />
    </Suspense>
  );
}
