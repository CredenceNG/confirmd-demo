"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ProofAttribute {
  name: string;
  value: string;
}

function InvestmentAccountSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [proofData, setProofData] = useState<ProofAttribute[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProofData = async () => {
      const sessionId = searchParams.get("sessionId");

      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/proofs/request?sessionId=${sessionId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const presentedAttrs = data.data.presentedAttributes || {};

          // Convert presented attributes to ProofAttribute array
          const attributes: ProofAttribute[] = Object.entries(presentedAttrs).map(
            ([name, value]: [string, any]) => ({
              name,
              value: String(value || ""),
            })
          );

          setProofData(attributes);
        } else {
          setError(data.error?.error_description || "Failed to fetch proof data");
        }
      } catch (err: any) {
        console.error("Error fetching proof data:", err);
        setError(err.message || "An error occurred while fetching proof data");
      } finally {
        setLoading(false);
      }
    };

    fetchProofData();
  }, [searchParams]);

  // Format attribute names for display
  const formatAttributeName = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your verified information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/finance/investment-account"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Investment Account Opened Successfully!
            </h1>
            <p className="text-purple-100">
              Your identity was verified using your existing eKYC credential
            </p>
          </div>

          <div className="p-6">
            {/* Key Benefits Highlight */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Instant Account Opening</h3>
                  <p className="text-purple-800 mb-3">
                    Your investment account was opened in minutes instead of days! By reusing your existing
                    eKYC credential, you skipped the entire KYC verification process.
                  </p>
                  <ul className="space-y-2 text-sm text-purple-900">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      No document uploads required
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      No waiting for KYC verification
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Cryptographically verified credentials
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verified Information</h2>
            <p className="text-gray-600 mb-6">
              The following information was cryptographically verified from your eKYC credential:
            </p>

            {proofData && proofData.length > 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {proofData.map((attr, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <dt className="text-sm font-medium text-gray-500 mb-1">
                        {formatAttributeName(attr.name)}
                      </dt>
                      <dd className="text-base font-semibold text-gray-900">
                        {attr.value || "Not provided"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  No credential data found. This might be a demo or test run.
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Next Steps
              </h3>
              <ol className="list-decimal ml-5 space-y-2 text-sm text-blue-800">
                <li>Check your email for your investment account credentials</li>
                <li>Fund your account to start investing</li>
                <li>Download our mobile app for easy portfolio management</li>
                <li>Schedule a call with your assigned investment advisor</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-purple-600 text-white text-center font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Back to Demos
              </Link>
              <button
                onClick={() => router.push("/finance/investment-account")}
                className="flex-1 px-6 py-3 bg-white text-purple-600 text-center font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-colors"
              >
                Open Another Account
              </button>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How Credential Reusability Works
          </h4>
          <p className="text-sm text-gray-700 mb-3">
            Your eKYC credential was issued once by your primary financial institution but can be presented
            to multiple verifiers (like this investment platform) without requiring re-issuance. This is a
            key feature of Self-Sovereign Identity (SSI) and verifiable credentials.
          </p>
          <div className="bg-gray-50 rounded p-4 text-sm text-gray-700">
            <h5 className="font-medium mb-2">Key Technical Features:</h5>
            <ul className="list-disc ml-5 space-y-1">
              <li>
                <strong>Cryptographic Verification:</strong> Your credential is mathematically verified without
                contacting the issuing bank
              </li>
              <li>
                <strong>Zero-Knowledge Proofs:</strong> Only requested attributes are shared, maintaining your
                privacy
              </li>
              <li>
                <strong>Portable Identity:</strong> Use your credential across multiple platforms without
                creating new accounts
              </li>
              <li>
                <strong>User Control:</strong> You decide when and where to share your verified information
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvestmentAccountSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <InvestmentAccountSuccessContent />
    </Suspense>
  );
}
