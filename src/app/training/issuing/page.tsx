"use client";

import { Suspense, useRef } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function IssuingCertificationContent() {
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
    surname: "",
    othernames: "",
    nationalIdNumber: "",
    certificationTitle: "",
    trainingOrganization: "",
    courseCode: "",
    completionDate: "",
    issueDate: "",
    expiryDate: "",
    grade: "",
    credentialNumber: "",
    skills: "",
  };

  const fullName = `${formData.othernames} ${formData.surname}`;

  useEffect(() => {
    // Auto-start issuing when page loads (only once, guard against React Strict Mode double-mount)
    if (hasIssuedRef.current) return;
    hasIssuedRef.current = true;
    issueCertification();
  }, []);

  const issueCertification = async () => {
    setIsIssuing(true);
    setIssueStatus("issuing");
    setErrorMessage("");

    try {
      console.log("[Training Certification] Issuing certification...", formData);

      const response = await fetch("/api/training/issue-certification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("[Training Certification] Issue response:", data);

      if (response.ok && data.success) {
        setIssueStatus("success");
        setCredentialDetails(data.data);
      } else {
        setIssueStatus("error");
        setErrorMessage(data.error || data.message || "Failed to issue certification");
      }
    } catch (error) {
      console.error("[Training Certification] Error issuing credential:", error);
      setIssueStatus("error");
      setErrorMessage("An error occurred while issuing the certification. Please try again.");
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
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Issuing Training Certification
                  </h1>
                  <p className="text-indigo-100 mt-1">
                    Processing credential for {fullName}
                  </p>
                </div>
                <Link
                  href="/training/issue-certification"
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
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Processing Training Certification...
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Creating and sending credential to {formData.email}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
                    Certification Issued Successfully!
                  </h2>
                  <p className="text-xl text-gray-700 mb-8">
                    The credential has been sent to <strong>{formData.email}</strong>
                  </p>

                  {/* Certificate Details */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Certification Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Certificate Holder:</span>
                        <span className="font-semibold text-gray-900">{fullName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Certification Title:</span>
                        <span className="font-semibold text-gray-900">{formData.certificationTitle}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Training Organization:</span>
                        <span className="font-semibold text-gray-900">{formData.trainingOrganization}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Credential Number:</span>
                        <span className="font-semibold text-purple-600">{formData.credentialNumber}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Grade:</span>
                        <span className="font-semibold text-green-600">{formData.grade}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Course Code:</span>
                        <span className="font-semibold text-gray-900">{formData.courseCode}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Skills Acquired:</span>
                        <span className="font-semibold text-gray-900">{formData.skills}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Completion Date:</span>
                        <span className="font-semibold text-gray-900">{formData.completionDate}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                        <span className="text-gray-600">Issue Date:</span>
                        <span className="font-semibold text-gray-900">{formData.issueDate}</span>
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
                        <span>The certificate holder will receive an email with instructions to claim their certification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>They can add it to their ConfirmD wallet app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>They can now use this credential to prove their training to employers and clients</span>
                      </li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/training/issue-certification"
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-center"
                    >
                      Issue Another Certification
                    </Link>
                    <Link
                      href="/"
                      className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-purple-600 text-center"
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
                    Failed to Issue Certification
                  </h2>
                  <p className="text-gray-700 mb-6">
                    {errorMessage}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={issueCertification}
                      disabled={isIssuing}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isIssuing ? "Retrying..." : "Try Again"}
                    </button>
                    <Link
                      href="/training/issue-certification"
                      className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-purple-600 text-center"
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

export default function IssuingCertificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <IssuingCertificationContent />
    </Suspense>
  );
}
