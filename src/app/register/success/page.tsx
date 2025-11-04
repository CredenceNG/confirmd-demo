"use client";

import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Application Submitted Successfully!
        </h1>
        <p className="text-gray-600 mb-6">
          Your student loan application has been submitted. We will review your
          application and notify you of the outcome via email.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>We will verify your submitted information</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>You will receive an email confirmation within 24 hours</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>
                If approved, loan disbursement details will be sent to your
                email
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
          <button
            onClick={() => router.push("/register")}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Submit Another Application
          </button>
        </div>

        {/* Support Contact */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Questions? Contact our support team at{" "}
            <a
              href="mailto:support@nelfund.gov.ng"
              className="text-blue-600 hover:underline"
            >
              support@nelfund.gov.ng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
