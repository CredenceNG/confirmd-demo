"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NYSCOnboardingSuccessContent() {
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
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg
                  className="w-10 h-10 text-emerald-600"
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
                NYSC ID Card Issued Successfully!
              </h2>
              <p className="text-lg text-gray-600">
                Your official NYSC ID Card credential is now in your wallet
              </p>
            </div>

            {/* Celebration Banner */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-6">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-bold mb-2">
                  Congratulations!
                </h3>
                <p className="text-sm text-emerald-100">
                  You've completed the entire NYSC credential journey from registration to onboarding
                </p>
              </div>
            </div>

            {/* Credentials Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">
                Your Credential Journey
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                    🎓
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">Student Credentials</p>
                    <p className="text-xs text-blue-700">Student Card + Statement of Result</p>
                  </div>
                  <div className="text-blue-600">✓</div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                    💚
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">NYSC Green Card</p>
                    <p className="text-xs text-green-700">Registration & Call-up Verification</p>
                  </div>
                  <div className="text-green-600">✓</div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                    🪪
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-900">NYSC ID Card</p>
                    <p className="text-xs text-emerald-700">Official Service Year Identification</p>
                  </div>
                  <div className="text-emerald-600">✓</div>
                </div>
              </div>
            </div>

            {/* Educational Content */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <span>💡</span> What You Learned
              </h3>
              <ul className="text-left text-sm text-purple-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Multi-stage workflows:</strong> How credentials can be chained together - one credential enables access to the next
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Progressive trust building:</strong> Each credential verifies previous credentials without contacting issuers
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Decentralized verification:</strong> Organizations verify credentials cryptographically without a central database
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>User privacy:</strong> Your university doesn't know about your NYSC registration, and NYSC doesn't store your full academic records
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>
                    <strong>Selective disclosure:</strong> You only share the specific attributes needed at each step, not your entire credential
                  </span>
                </li>
              </ul>
            </div>

            {/* Real-World Applications */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
              <h3 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                <span>🌍</span> Real-World Applications
              </h3>
              <p className="text-sm text-cyan-800 text-left mb-3">
                This same credential chaining pattern is used for:
              </p>
              <ul className="text-left text-sm text-cyan-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Professional licensing (degree → license → specialty certifications)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Immigration & travel documents (passport → visa → entry permits)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Employment verification (education → work history → security clearance)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Healthcare access (identity → insurance → medical records)</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/nysc")}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  ← Back to NYSC Demo
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Explore More Demos →
                </button>
              </div>

              <p className="text-sm text-gray-500">
                Try other demos to learn more about verifiable credentials
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function NYSCOnboardingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>}>
      <NYSCOnboardingSuccessContent />
    </Suspense>
  );
}
