"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NYSCRegistrationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId") || "";

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Success Content */}
          <div className="p-8 sm:p-12 text-center">
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
                Green Card Issued Successfully!
              </h2>
              <p className="text-lg text-gray-600">
                Your NYSC Green Card credential has been issued to your wallet
              </p>
            </div>

            {/* Details */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">💚</span>
                    <p className="text-sm text-green-800 font-medium">
                      NYSC Green Card Credential
                    </p>
                  </div>
                  <p className="text-sm text-green-700">
                    Check your ConfirmD wallet to view your Green Card
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">
                What happens next?
              </h3>
              <ul className="text-left text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">1.</span>
                  <span>
                    Your Green Card credential is now stored in your digital wallet
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">2.</span>
                  <span>
                    This Green Card contains your academic verification and NYSC call-up details
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">3.</span>
                  <span>
                    You'll use this Green Card to complete Phase 2: Camp Onboarding
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">4.</span>
                  <span>
                    At the NYSC camp, you'll present this Green Card to receive your NYSC ID
                  </span>
                </li>
              </ul>
            </div>

            {/* Educational Content */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <span>💡</span> What You Just Learned
              </h3>
              <ul className="text-left text-sm text-purple-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Multi-credential verification:</strong> NYSC requested proof from two different credentials (Student Card + Statement of Result)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Credential chaining:</strong> One credential (Green Card) was issued based on verification of other credentials
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Zero-knowledge proofs:</strong> NYSC verified your credentials without contacting your university
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Privacy-preserving:</strong> Your university has no knowledge of your NYSC registration
                  </span>
                </li>
              </ul>
            </div>

            {/* Continue to Phase 2 */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 max-w-lg mx-auto mb-8 text-white">
              <h3 className="font-bold text-xl mb-2">
                Ready for Phase 2?
              </h3>
              <p className="text-emerald-100 mb-4">
                Continue to <strong>Camp Onboarding</strong> to complete your NYSC journey and receive your NYSC ID Card
              </p>
              <button
                onClick={() => router.push("/nysc/onboarding")}
                className="w-full px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors mb-3"
              >
                Continue to Onboarding →
              </button>
              <p className="text-xs text-emerald-200">
                You'll need your Green Card for the next phase
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/nysc")}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                ← Back to NYSC Demo
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-green-500 hover:text-green-600 transition-colors"
              >
                View All Demos
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NYSCRegistrationSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>}>
      <NYSCRegistrationSuccessContent />
    </Suspense>
  );
}
