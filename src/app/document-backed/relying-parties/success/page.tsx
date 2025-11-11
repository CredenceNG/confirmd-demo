"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12 text-center">
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
                Verification Complete!
              </h1>
              <p className="text-purple-100 text-lg">
                Driver's license credential verified successfully
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
                      <span>Customer connected their digital wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Driver's license credential requested</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Customer shared credential from wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Credential cryptographically verified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Customer information extracted securely</span>
                    </li>
                  </ul>
                </div>

                {/* Benefits for Insurance Companies */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Benefits for Your Organization
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Instant Verification:</strong> No waiting days for background checks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Zero Fraud Risk:</strong> Credentials are cryptographically signed and tamper-proof</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Cost Savings:</strong> No manual document verification needed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Better UX:</strong> Customers complete applications in minutes, not days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span><strong>Compliance:</strong> Automated verification trail for audit purposes</span>
                    </li>
                  </ul>
                </div>

                {/* Privacy Protection */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privacy & Security
                  </h3>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>No physical documents stored (GDPR compliant)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>Customer controls what information is shared</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>Reduced data breach risk - minimal data retention</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🔒</span>
                      <span>Full audit trail of verification requests</span>
                    </li>
                  </ul>
                </div>

                {/* Use Cases */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Other Use Cases for Your Industry
                  </h3>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Vehicle rental companies - instant license verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Employers - verify driving eligibility for job roles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Age-restricted services - verify age without seeing full DOB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Financial institutions - identity verification for KYC</span>
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
                  href="/document-backed/relying-parties"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-center"
                >
                  Verify Another License
                </Link>
                <Link
                  href="/document-backed/issuers"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-center"
                >
                  Try Issuance Demo
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

export default function DocumentBackedRelyingPartiesSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
