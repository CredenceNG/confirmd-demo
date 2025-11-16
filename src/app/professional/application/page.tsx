/**
 * Professional Credential Verification - Results Page
 * Displays verified Statement of Results and NYSC Certificate credentials
 */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerificationResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [verifiedData, setVerifiedData] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchProofData = async () => {
      try {
        const response = await fetch(`/api/proofs/request?sessionId=${sessionId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const presentedAttrs = data.data.presentedAttributes || {};

          // Transform attributes for display
          const transformedData = {
            ...presentedAttrs,
            full_name: presentedAttrs.full_name ||
                      (presentedAttrs.surname && presentedAttrs.othernames
                        ? `${presentedAttrs.surname} ${presentedAttrs.othernames}`
                        : ""),
            graduation_year: presentedAttrs.year_end || "",
          };

          setVerifiedData(transformedData);
          setLoading(false);
        } else {
          setError("Failed to retrieve verified credentials");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching proof data:", err);
        setError("Error loading your verified credentials");
        setLoading(false);
      }
    };

    fetchProofData();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verified credentials...</p>
        </div>
      </div>
    );
  }

  if (error || !verifiedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error || "Invalid request"}</p>
          <button
            onClick={() => router.push("/professional")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/professional")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Start New Verification
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Successful</h2>
          </div>
          <p className="text-green-100">
            Academic and NYSC credentials have been cryptographically verified
          </p>
        </div>

        <div className="p-6">
          {/* Verification Info */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">All credentials verified</p>
                <p className="text-xs text-green-700 mt-1">
                  Information below has been cryptographically verified and cannot be forged
                </p>
              </div>
            </div>
          </div>

          {/* Academic Credentials */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Statement of Results
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.full_name || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.matric_number || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.programme || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class of Degree</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.class_of_degree || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree Awarded</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.awarded_degree || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.graduation_year || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* NYSC Credentials */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              NYSC Certificate
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call-up Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.call_up_number || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.certificate_number || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Start Date</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.start_date || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service End Date</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.end_date || "N/A"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Issued Date</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.issued_date || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push("/professional")}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Verify Another Candidate
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Demos
            </button>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How Verification Works
        </h4>
        <p className="text-sm text-blue-800">
          This demo requested proof of two credentials: Statement of Results and NYSC Certificate. The ConfirmD platform
          cryptographically verified both credentials and returned only the requested attributes. The issuing institutions'
          digital signatures ensure these credentials cannot be forged or tampered with.
        </p>
      </div>
    </div>
  );
}

export default function ProfessionalApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerificationResultsContent />
    </Suspense>
  );
}
