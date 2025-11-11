/**
 * Professional Job Portal - Intro/Prerequisites Page
 * Explains what credentials are needed before starting the application
 */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfessionalIntroPage() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  const handleProceed = () => {
    if (confirmed) {
      router.push("/professional/connect");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl shadow-lg p-4 sm:p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-5xl">💼</div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1">
                You are: Recent Graduate
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">
                Goal: Apply for Junior Software Engineer position at TechCorp Nigeria
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium">Step 1 of 4</span>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/professional")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Job Listing
        </button>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">TechCorp Job Application - Prerequisites</h2>
              <p className="text-blue-100 mt-1">
                Before you proceed, please ensure you meet the requirements
              </p>
            </div>

            <div className="p-6">
              {/* Requirements */}
              <div className="space-y-6 mb-8">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-900 mb-4">
                    Prerequisites
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mt-0.5">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">
                          Download the ConfirmD App
                        </p>
                        <p className="text-sm text-blue-700 mt-1 mb-3">
                          You must have downloaded and installed the ConfirmD mobile
                          application on your device.
                        </p>
                        {/* App Store Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <a
                            href="https://apps.apple.com/app/confirmd/id6504173780"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            <div className="text-left">
                              <div className="text-xs">Download on the</div>
                              <div className="text-sm font-semibold -mt-1">App Store</div>
                            </div>
                          </a>
                          <a
                            href="https://play.google.com/store/apps/details?id=ng.credence.confirmd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                            </svg>
                            <div className="text-left">
                              <div className="text-xs">GET IT ON</div>
                              <div className="text-sm font-semibold -mt-1">Google Play</div>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">
                          Have Your Academic Credentials
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          You must have your <strong>Statement of Result (Academic Transcript)</strong> credential
                          in your ConfirmD wallet. This should have been issued by your university.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">
                          Have Your NYSC Certificate
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          You must have your <strong>NYSC Certificate of National Service</strong> credential
                          in your ConfirmD wallet, proving you completed your service year.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What Information Will Be Shared */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold text-purple-900 mb-4">
                    <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Privacy & Information Sharing
                  </h2>
                  <p className="text-sm text-purple-700 mb-4">
                    TechCorp Nigeria will request the following information from your credentials:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-purple-900 mb-2">From Statement of Result:</h3>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Full Name</li>
                        <li>• Matric Number</li>
                        <li>• Programme/Course of Study</li>
                        <li>• Class of Degree</li>
                        <li>• Graduation Year</li>
                        <li>• Institution Name</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-900 mb-2">From NYSC Certificate:</h3>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Full Name</li>
                        <li>• Call-up Number</li>
                        <li>• Service Start Date</li>
                        <li>• Service End Date</li>
                        <li>• Certificate Number</li>
                        <li>• Certificate Issued Date</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-xs text-purple-600">
                      <strong>Note:</strong> You are in full control of what you share. You can choose to decline
                      this request at any time. The information shared is cryptographically verified and cannot be tampered with.
                    </p>
                  </div>
                </div>

                {/* Application Process Timeline */}
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    What Happens Next
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Connect Your Wallet</p>
                        <p className="text-sm text-gray-600">Scan the QR code with your ConfirmD app to establish a secure connection</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Share Your Credentials</p>
                        <p className="text-sm text-gray-600">Approve the request to share your Statement of Result and NYSC Certificate</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Complete Your Application</p>
                        <p className="text-sm text-gray-600">Review your verified information and submit your job application</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Wait for HR Review</p>
                        <p className="text-sm text-gray-600">Our team will review your application and get back to you within 5-7 business days</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <input
                    type="checkbox"
                    id="confirmed"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="confirmed" className="flex-1 text-sm text-gray-700 cursor-pointer">
                    I confirm that I have downloaded the ConfirmD app and have both my Statement of Result
                    and NYSC Certificate credentials available in my wallet. I understand that these will be requested
                    for verification.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleProceed}
                  disabled={!confirmed}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    !confirmed
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Proceed to Verification →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
