/**
 * Professional Job Portal - Success Page
 * Confirmation page after successful application submission
 */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationNumber = searchParams.get("applicationNumber");
  const name = searchParams.get("name");

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
            onClick={() => router.push("/professional")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Job Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl shadow-lg p-4 sm:p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-5xl">🎉</div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1">
                Application Submitted Successfully!
              </h2>
              <p className="text-green-100 text-sm sm:text-base">
                Your application to TechCorp Nigeria has been received
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
            <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
            <span className="text-xs sm:text-sm font-medium">Step 4 of 4 - Complete</span>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Message Card */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
              {/* Success Icon */}
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-green-600"
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
                Application Received!
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Thank you{name ? `, ${name}` : ""}, for applying to TechCorp Nigeria
              </p>

              {/* Application Number Card */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  Your Application Reference Number
                </p>
                <p className="text-2xl font-bold text-blue-900 tracking-wider mb-2">
                  {applicationNumber}
                </p>
                <p className="text-xs text-blue-700">
                  Save this number to track your application status
                </p>
              </div>

              {/* Key Benefits of Using Verifiable Credentials */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">
                  ⚡ Why Verifiable Credentials Make a Difference
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-purple-900">Instant Verification</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Your credentials were verified in seconds, not weeks
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-purple-900">Tamper-Proof</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Cryptographically secured credentials that cannot be forged
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-purple-900">Privacy First</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      You control what information is shared
                    </p>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  What Happens Next?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        Application Review (1-2 business days)
                      </h3>
                      <p className="text-sm text-gray-600">
                        Our HR team will review your application and verified credentials
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        Technical Assessment (if shortlisted)
                      </h3>
                      <p className="text-sm text-gray-600">
                        You'll receive a link to complete a coding challenge (2-3 hours)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        Technical Interview
                      </h3>
                      <p className="text-sm text-gray-600">
                        Video interview with our engineering team (45-60 minutes)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        HR Interview & Culture Fit
                      </h3>
                      <p className="text-sm text-gray-600">
                        Final discussion about role expectations and company culture
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        Job Offer
                      </h3>
                      <p className="text-sm text-gray-600">
                        If successful, you'll receive an offer letter via email
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Confirmation Note */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Check Your Email</h4>
                  <p className="text-sm text-blue-800">
                    We've sent a confirmation email with your application details and reference number.
                    If you don't see it in your inbox, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Estimate */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-8">
              <h4 className="font-semibold text-gray-900 mb-2">📅 Estimated Timeline</h4>
              <p className="text-sm text-gray-700">
                The entire recruitment process typically takes 2-3 weeks from application to offer.
                We'll keep you updated at every stage via email.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/professional")}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Back to Job Listing
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Explore More Demos
              </button>
            </div>

            {/* Contact Information */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p className="mb-2">
                Questions about your application? Contact us at{" "}
                <a href="mailto:hr@techcorp.ng" className="text-blue-600 hover:text-blue-700 font-medium">
                  hr@techcorp.ng
                </a>
              </p>
              <p>
                Follow us on LinkedIn for company updates and job opportunities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfessionalSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
