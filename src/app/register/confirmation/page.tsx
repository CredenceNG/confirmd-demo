"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationNumber = searchParams.get("applicationNumber");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!applicationNumber) {
      setError("No application number provided");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [applicationNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !applicationNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-red-600 mb-4">{error || "Invalid request"}</p>
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Message Card */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              NELFUND Demo - Application Submitted!
            </h1>
            <p className="text-gray-600 mb-8">
              Your loan application has been received and is pending approval
            </p>

            {/* Application Number Card */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Your Application Number
              </p>
              <p className="text-2xl font-bold text-blue-900 tracking-wider">
                {applicationNumber}
              </p>
              <p className="text-xs text-blue-700 mt-2">
                Save this number for tracking your application
              </p>
            </div>

            {/* What Happens Next */}
            <div className="text-left mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                What Happens Next?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      Application Review
                    </h3>
                    <p className="text-sm text-gray-600">
                      Our team will review your application and verified credentials
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      Verification & Assessment
                    </h3>
                    <p className="text-sm text-gray-600">
                      We'll verify your eligibility and assess your loan request
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      Approval & Notification
                    </h3>
                    <p className="text-sm text-gray-600">
                      You'll receive an email with the decision within 3-5 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      Loan Disbursement
                    </h3>
                    <p className="text-sm text-gray-600">
                      If approved, funds will be disbursed to your provided account
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Important Information
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • Check your email regularly for updates on your application
                    </li>
                    <li>
                      • Your application status is currently:{" "}
                      <span className="font-semibold">PENDING APPROVAL</span>
                    </li>
                    <li>
                      • Keep your contact information up to date
                    </li>
                    <li>
                      • For inquiries, quote your application number: {applicationNumber}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Print Confirmation
              </button>
              <button
                onClick={() => router.push("/register")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Home
              </button>
            </div>

            {/* Contact Information */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a
                  href="mailto:support@nelfund.gov.ng"
                  className="text-blue-600 hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Application Status
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Status:</span>
              <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                PENDING APPROVAL
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Submitted:</span>
              <span className="text-gray-800">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
