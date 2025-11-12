"use client";

import { useRouter } from "next/navigation";

export default function TelecomsSignupPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Demos
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-8 text-center">
          <div className="text-5xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Telecoms Service Signup
          </h1>
          <p className="text-teal-100">
            Reuse your eKYC credential for instant mobile service activation
          </p>
        </div>

        <div className="p-6">
          {/* Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              This demo shows how telecommunications companies can verify a customer's existing eKYC credential
              for instant service activation. No need to visit a physical store or submit documents - simply
              present your verified digital identity from a trusted financial institution.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Skip Physical Registration</h3>
                  <p className="text-sm text-gray-600">No need to visit stores or submit physical documents</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Instant Service Activation</h3>
                  <p className="text-sm text-gray-600">Start using your mobile service immediately</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Regulatory Compliance</h3>
                  <p className="text-sm text-gray-600">Meet NCC SIM registration requirements automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-medium text-gray-900">Enhanced Security</h3>
                  <p className="text-sm text-gray-600">Cryptographically verified identity prevents fraud</p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Select Service Plan</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose to signup for mobile service using your existing eKYC credential
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Connect Digital Wallet</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Scan QR code to establish a secure connection with your digital wallet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Reuse Your eKYC Credential</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Telecoms provider requests proof of your existing eKYC credential
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Approve Sharing</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Review and approve sharing your eKYC information in your wallet app
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 font-semibold">5</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Service Activated Instantly</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your mobile service is activated immediately - start calling and browsing right away
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Feature Highlight */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <svg className="w-8 h-8 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-teal-900 mb-2">Cross-Industry Credential Reuse</h3>
                <p className="text-teal-800">
                  Your eKYC credential was issued by your financial institution but works seamlessly with
                  telecoms providers. This demonstrates the power of interoperable digital identity - verify
                  once, use everywhere. No more repetitive registration processes across different services.
                </p>
              </div>
            </div>
          </div>

          {/* Use Case */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Real-World Use Case
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Imagine getting a new SIM card from any telecoms provider in Nigeria. Instead of:
            </p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-blue-800 mb-3">
              <li>Visiting a physical registration center</li>
              <li>Providing photocopies of your NIN, ID card, and utility bills</li>
              <li>Waiting days for verification</li>
            </ul>
            <p className="text-sm text-blue-800">
              You simply scan a QR code, present your eKYC credential from your bank, and your service is
              activated instantly. This is the future of customer onboarding.
            </p>
          </div>

          {/* Prerequisites */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-yellow-900 mb-2">Prerequisites</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You must have an existing eKYC credential issued by a trusted financial institution
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ConfirmD digital wallet app installed with your eKYC credential stored
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Telecoms provider configured as a verifier on ConfirmD Platform
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={() => router.push("/telecoms/signup/connect")}
              className="px-8 py-4 bg-teal-600 text-white text-lg font-semibold rounded-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl"
            >
              Signup for Mobile Service
            </button>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Technical Implementation
        </h4>
        <p className="text-sm text-blue-800">
          This demo demonstrates cross-industry credential reusability. Your eKYC credential can be presented
          to any verifier (banks, telecoms, insurance, etc.) without requiring the issuer's permission or
          involvement. The telecoms provider verifies your credential cryptographically using zero-knowledge
          proofs, ensuring privacy while maintaining compliance with regulatory requirements.
        </p>
      </div>
    </div>
  );
}
