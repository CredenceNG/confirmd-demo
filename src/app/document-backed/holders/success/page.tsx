"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DocumentBackedHoldersSuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
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
                Application Submitted!
              </h1>
              <p className="text-green-100 text-lg">
                Your driver's license application has been successfully submitted
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-10">
              <div className="space-y-6">
                {applicationId && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Application ID:</strong>
                    </p>
                    <p className="text-lg font-mono text-gray-900">{applicationId}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Keep this ID for your records
                    </p>
                  </div>
                )}

                {/* What Happens Next */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What Happens Next?
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Your application has been sent to FRSC for review</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>FRSC staff will verify your information (usually 1-3 business days)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Once approved, you'll receive an email with a link to your digital credential</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>Click the link and accept the credential in your digital wallet</span>
                    </li>
                  </ul>
                </div>

                {/* Email Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Check Your Email
                  </h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    You've received a confirmation email. Once your application is approved, you'll receive:
                  </p>
                  <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-center gap-2">
                      <span>📧</span>
                      <span>An email with a link to accept your credential</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🔗</span>
                      <span>The link will open your digital wallet app</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Accept the credential and it's ready to use!</span>
                    </li>
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Your Digital Driver's License Benefits
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="text-xl mb-1">📱</div>
                      <p className="text-xs font-semibold text-purple-900">Always with you</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="text-xl mb-1">🔒</div>
                      <p className="text-xs font-semibold text-purple-900">Cannot be forged</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="text-xl mb-1">⚡</div>
                      <p className="text-xs font-semibold text-purple-900">Instant verification</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="text-xl mb-1">🔐</div>
                      <p className="text-xs font-semibold text-purple-900">You control sharing</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/document-backed/relying-parties"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-center"
                >
                  Try Verification Demo →
                </Link>
                <Link
                  href="/document-backed/holders"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Submit Another Application
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

export default function DocumentBackedHoldersSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>}>
      <DocumentBackedHoldersSuccessContent />
    </Suspense>
  );
}
