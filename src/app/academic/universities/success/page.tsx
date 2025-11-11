"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StatementOfResultsSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const name = searchParams.get("name") || "";

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Success Content */}
            <div className="p-12 text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Statement of Results Issued Successfully!
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  Statement of Results credential has been issued to
                </p>
                <p className="text-xl font-semibold text-purple-600">{name}</p>
              </div>

              {/* Details */}
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="space-y-3 text-left">
                    <div>
                      <p className="text-sm text-green-800 font-medium mb-1">
                        📧 Email Sent
                      </p>
                      <p className="text-sm text-green-700">{email}</p>
                    </div>
                    <div className="border-t border-green-200 pt-3">
                      <p className="text-sm text-green-800 font-medium mb-1">
                        📱 SMS Notification Sent
                      </p>
                      <p className="text-sm text-green-700">{phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
                <h3 className="font-semibold text-purple-900 mb-3">
                  What happens next?
                </h3>
                <ul className="text-left text-sm text-purple-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">1.</span>
                    <span>
                      The student will receive an email with a QR code
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">2.</span>
                    <span>
                      They can scan the QR code using the ConfirmD mobile app
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">3.</span>
                    <span>
                      Once accepted, the credential will be stored in their
                      digital wallet
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">4.</span>
                    <span>
                      They can use it for NYSC registration and employment verification
                    </span>
                  </li>
                </ul>
              </div>

              {/* Educational Content - What You Learned */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <span>💡</span> What You Just Learned
                </h3>
                <ul className="text-left text-sm text-indigo-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>
                      <strong>Academic credentials:</strong> Universities can issue tamper-proof
                      digital transcripts and certificates
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>
                      <strong>Instant verification:</strong> NYSC and employers can verify
                      academic qualifications without contacting the university
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>
                      <strong>Credential lifecycle:</strong> This Statement of Results is required
                      for NYSC Phase 1 registration (along with Student Card and Medical Fitness)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>
                      <strong>Student ownership:</strong> Graduates control their own credentials
                      and can share them anywhere, anytime
                    </span>
                  </li>
                </ul>
              </div>

              {/* Try the NYSC Demo */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 max-w-lg mx-auto mb-8 text-white">
                <h3 className="font-bold text-xl mb-2">
                  See This Credential in Action
                </h3>
                <p className="text-green-100 mb-4">
                  You just issued a Statement of Results. Want to see how students use it for NYSC registration?
                </p>
                <button
                  onClick={() => router.push("/nysc")}
                  className="w-full px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Try NYSC Registration Demo →
                </button>
                <p className="text-green-100 text-xs mt-3">
                  Note: The NYSC demo requires Student Card, Statement of Results, and Medical Fitness Certificate
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/academic/universities/issue")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Issue Another Statement of Results
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← All Demos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function StatementOfResultsSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>}>
      <StatementOfResultsSuccessContent />
    </Suspense>
  );
}
