"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerificationSuccessContent() {
  const searchParams = useSearchParams();
  const candidateName = searchParams.get("candidateName") || "";
  const certificationTitle = searchParams.get("certificationTitle") || "";
  const position = searchParams.get("position") || "";
  const department = searchParams.get("department") || "";

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Certification Verified Successfully
                  </h1>
                  <p className="text-green-100 mt-1">
                    Candidate credentials verified for {candidateName}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Verification Complete!
                </h2>
                <p className="text-xl text-gray-700 mb-8">
                  Training certification has been successfully verified for employment consideration
                </p>

                {/* Verification Details */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Verification Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <span className="text-gray-600">Candidate Name:</span>
                      <span className="font-semibold text-gray-900">{candidateName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <span className="text-gray-600">Certification:</span>
                      <span className="font-semibold text-gray-900">{certificationTitle}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <span className="text-gray-600">Position Applied:</span>
                      <span className="font-semibold text-teal-600">{position}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-semibold text-gray-900">{department}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Verification Time:</span>
                      <span className="font-semibold text-gray-900">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-xl font-bold text-green-900">Certification Authenticated</h3>
                  </div>
                  <p className="text-sm text-green-800">
                    The candidate's training certification has been cryptographically verified and authenticated.
                    The credentials are legitimate and issued by a recognized training organization.
                  </p>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Next Steps</h3>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Verification results have been recorded in your HR system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>You can proceed with the next stages of the hiring process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>The candidate's verified skills and training are confirmed for the role</span>
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/training/verify-certification"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-center"
                  >
                    Verify Another Candidate
                  </Link>
                  <Link
                    href="/"
                    className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-purple-600 text-center"
                  >
                    Back to Demos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VerificationSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerificationSuccessContent />
    </Suspense>
  );
}
