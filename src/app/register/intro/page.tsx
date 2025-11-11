"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterIntroPage() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  const handleProceed = () => {
    if (confirmed) {
      router.push("/register/connect");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">NELFUND Demo - Apply for Funding</h2>
              <p className="text-green-100 mt-1">
                Before you proceed, please ensure you meet the requirements
              </p>
            </div>

            <div className="p-6">
              {/* Requirements */}
              <div className="space-y-6 mb-8">
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold text-green-900 mb-4">
                    Prerequisites
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm mt-0.5">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-900">
                          Download the ConfirmD App
                        </p>
                        <p className="text-sm text-green-700 mt-1 mb-3">
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
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-green-900">
                          Obtain NELFUND Clearance Credential
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          You must have requested and received your NELFUND Clearance
                          Credential to proceed with your funding application.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-900 mb-3">
                    What happens next?
                  </h2>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">▸</span>
                      <p>
                        You will be presented with a QR code to scan using the
                        ConfirmD App
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">▸</span>
                      <p>
                        Your wallet will establish a secure connection with the
                        NELFUND platform
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">▸</span>
                      <p>
                        You will receive a request in your wallet for the necessary
                        registration details
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">▸</span>
                      <p>
                        Approve the request, and your details will be securely
                        shared and auto-populated in the funding application form
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700 select-none group-hover:text-gray-900">
                    I confirm that I have the ConfirmD App installed and have
                    received my NELFUND Clearance Credential
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={handleProceed}
                  disabled={!confirmed}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
                    confirmed
                      ? "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Proceed to Connect
                </button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Need help?{" "}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
