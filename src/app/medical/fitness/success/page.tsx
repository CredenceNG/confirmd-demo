"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MedicalFitnessSuccessContent() {
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
                  Medical Fitness Certificate Issued Successfully!
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  Medical Fitness Certificate has been issued to
                </p>
                <p className="text-xl font-semibold text-teal-600">{name}</p>
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
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
                <h3 className="font-semibold text-teal-900 mb-3">
                  What happens next?
                </h3>
                <ul className="text-left text-sm text-teal-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">1.</span>
                    <span>
                      The student will receive an email with a QR code
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">2.</span>
                    <span>
                      They can scan the QR code using the ConfirmD mobile app
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">3.</span>
                    <span>
                      Once accepted, the credential will be stored in their
                      digital wallet
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">4.</span>
                    <span>
                      They can use it for NYSC registration, employment, and travel
                    </span>
                  </li>
                </ul>
              </div>

              {/* Educational Content - What You Learned */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <span>💡</span> What You Just Learned
                </h3>
                <ul className="text-left text-sm text-purple-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>
                      <strong>Health data privacy:</strong> Medical information is cryptographically secured and only shared with explicit consent
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>
                      <strong>Verifiable health credentials:</strong> Medical centers can issue tamper-proof certificates that can be verified instantly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>
                      <strong>Multi-purpose certificates:</strong> One certificate serves NYSC, employers, and immigration authorities
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>
                      <strong>Credential chaining:</strong> This medical fitness certificate is one of three credentials required for NYSC registration
                    </span>
                  </li>
                </ul>
              </div>

              {/* Try the Other Side */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 max-w-lg mx-auto mb-8 text-white">
                <h3 className="font-bold text-xl mb-2">
                  See How It's Used
                </h3>
                <p className="text-green-100 mb-4">
                  You just issued a Medical Fitness Certificate. Want to see how NYSC <strong>verifies</strong> this credential along with two others?
                </p>
                <button
                  onClick={() => router.push("/nysc")}
                  className="w-full px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                  Try NYSC Registration Demo →
                </button>
              </div>

              {/* Certificate Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-lg mx-auto mb-8">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🏥</span> Certificate Includes
                </h3>
                <div className="grid grid-cols-2 gap-3 text-left text-sm">
                  <div>
                    <p className="text-gray-600">• Student identity</p>
                    <p className="text-gray-600">• Blood pressure</p>
                    <p className="text-gray-600">• Height & weight</p>
                  </div>
                  <div>
                    <p className="text-gray-600">• Blood group & genotype</p>
                    <p className="text-gray-600">• Fitness declaration</p>
                    <p className="text-gray-600">• Doctor details</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/medical/fitness/issue")}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Issue Another Certificate
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← All Demos
                </button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  This demonstration shows how medical centers can issue verifiable health credentials.
                  In production, this would integrate with your medical records system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MedicalFitnessSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>}>
      <MedicalFitnessSuccessContent />
    </Suspense>
  );
}
