/**
 * Course Registration Demo - Main Page
 * Semester course registration with Student Card verification
 */
"use client";

import { useRouter } from "next/navigation";

export default function CourseRegistrationPage() {
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

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Semester Course Registration
          </h1>
          <p className="text-purple-100">
            Verify student identity and register for courses using verifiable credentials
          </p>
        </div>

        <div className="p-8">
          {/* Demo Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What This Demo Shows</h2>
            <p className="text-gray-700 mb-4">
              This demonstration shows how universities can streamline course registration by verifying student identity
              with Student Card credentials. The system requests proof of studentship and allows students to
              complete payment and course selection in one seamless flow.
            </p>
          </div>

          {/* Key Features */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Instant student verification with Student Card</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Cryptographically verified student information</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Automated eligibility verification</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Prevents impersonation and fraud</span>
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-8">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900 mb-1">Before You Begin</h4>
                <p className="text-sm text-yellow-800">
                  You need the <strong>ConfirmD mobile app</strong> installed with a <strong>Student Card credential</strong> in your wallet.
                  If you don't have a Student Card, you can issue one from the Student Card demo on the homepage first.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Connect Your Wallet</p>
                  <p className="text-sm text-gray-600">Scan QR code with ConfirmD app to establish secure connection</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verify Student Identity</p>
                  <p className="text-sm text-gray-600">Share your Student Card credential to prove you're an enrolled student</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Registration Details</p>
                  <p className="text-sm text-gray-600">See your verified student information and semester details</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Complete Registration</p>
                  <p className="text-sm text-gray-600">Process payment and select courses for the semester</p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => router.push("/education/course-registration/connect")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Course Registration
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
