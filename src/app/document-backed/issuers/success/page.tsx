"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DocumentBackedIssuersSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg
                  className="w-12 h-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Credential Issued Successfully!
              </h1>
              <p className="text-blue-100 text-lg">
                The driver's license credential has been successfully issued to the wallet
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-10">
              <div className="space-y-6">
                {/* What Happened */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What Just Happened?
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Document uploaded and processed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Information extracted and verified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Verifiable driver's license credential created</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Credential securely stored in citizen's wallet</span>
                    </li>
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Benefits of Document-Backed Credentials
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Tamper-Proof:</strong> Credentials are cryptographically signed and cannot be forged</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Instantly Verifiable:</strong> Organizations can verify authenticity in seconds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Privacy-Preserving:</strong> Citizens control what information they share</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Always Accessible:</strong> No physical card needed - always in your digital wallet</span>
                    </li>
                  </ul>
                </div>

                {/* Next Steps */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Next Steps
                  </h3>
                  <p className="text-sm text-purple-800 mb-3">
                    The citizen can now use this credential for:
                  </p>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Insurance applications (verify with relying party demo)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Vehicle rentals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Employment verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Age verification</span>
                    </li>
                  </ul>
                </div>

                {sessionId && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-mono">
                      Session ID: {sessionId}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/document-backed/issuers"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-center"
                >
                  Issue Another Credential
                </Link>
                <Link
                  href="/document-backed/relying-parties"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-center"
                >
                  Try Verification Demo
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Back to Demos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DocumentBackedIssuersSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <DocumentBackedIssuersSuccessContent />
    </Suspense>
  );
}
