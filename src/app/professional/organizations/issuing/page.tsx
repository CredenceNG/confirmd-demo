"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function IssuingMembershipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueStatus, setIssueStatus] = useState<"idle" | "issuing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [credentialDetails, setCredentialDetails] = useState<any>(null);

  // Parse data from URL parameter
  const dataParam = searchParams.get("data");
  const formData = dataParam ? JSON.parse(decodeURIComponent(dataParam)) : {
    email: "",
    title: "",
    surname: "",
    othernames: "",
    membershipNumber: "",
    designation: "",
    organization: "",
    memberSince: "",
    issuedDate: "",
    expiryDate: "",
    goodStanding: "",
  };

  const fullName = `${formData.title} ${formData.othernames} ${formData.surname}`;

  useEffect(() => {
    // Auto-start issuing when page loads
    issueMembershipCredential();
  }, []);

  const issueMembershipCredential = async () => {
    setIsIssuing(true);
    setIssueStatus("issuing");
    setErrorMessage("");

    try {
      console.log("[Professional Organizations] Issuing membership credential...", formData);

      const response = await fetch("/api/professional/issue-membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("[Professional Organizations] Issue response:", data);

      if (response.ok && data.success) {
        setIssueStatus("success");
        setCredentialDetails(data.data);
      } else {
        setIssueStatus("error");
        setErrorMessage(data.error || data.message || "Failed to issue membership credential");
      }
    } catch (error) {
      console.error("[Professional Organizations] Error issuing credential:", error);
      setIssueStatus("error");
      setErrorMessage("An error occurred while issuing the credential. Please try again.");
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Issuing Membership Credential
                  </h1>
                  <p className="text-indigo-100 mt-1">
                    Processing credential for {fullName}
                  </p>
                </div>
                <Link
                  href="/professional/organizations"
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
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Processing Membership Credential...
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Creating and sending credential to {formData.email}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
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
                    Membership Credential Issued Successfully!
                  </h2>
                  <p className="text-xl text-gray-700 mb-8">
                    The credential has been sent to <strong>{formData.email}</strong>
                  </p>

                  {/* Member Details */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 text-left">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Credential Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-gray-600">Member Name:</span>
                        <span className="font-semibold text-gray-900">{fullName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-gray-600">Membership Number:</span>
                        <span className="font-semibold text-gray-900">{formData.membershipNumber}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-gray-600">Designation:</span>
                        <span className="font-semibold text-indigo-600">{formData.designation}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-gray-600">Organization:</span>
                        <span className="font-semibold text-gray-900">{formData.organization}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-gray-600">Member Since:</span>
                        <span className="font-semibold text-gray-900">{formData.memberSince}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-gray-600">Issued Date:</span>
                        <span className="font-semibold text-gray-900">{formData.issuedDate}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-semibold text-gray-900">{formData.expiryDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Good Standing:</span>
                        <span className={`font-semibold ${formData.goodStanding === "Yes" ? "text-green-600" : "text-red-600"}`}>
                          {formData.goodStanding}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">Next Steps</h3>
                    <ol className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>The member will receive an email with instructions to claim their credential</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>They can add it to their ConfirmD wallet app</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>They can now use this credential for member verification (e.g., conference registration)</span>
                      </li>
                    </ol>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/professional/organizations"
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-center"
                    >
                      Issue Another Credential
                    </Link>
                    <Link
                      href="/"
                      className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-indigo-600 text-center"
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
                    Failed to Issue Credential
                  </h2>
                  <p className="text-gray-700 mb-6">
                    {errorMessage}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={issueMembershipCredential}
                      disabled={isIssuing}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isIssuing ? "Retrying..." : "Try Again"}
                    </button>
                    <Link
                      href="/professional/organizations"
                      className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-indigo-600 text-center"
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

export default function IssuingMembershipPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <IssuingMembershipContent />
    </Suspense>
  );
}
