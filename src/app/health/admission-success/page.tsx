"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AdmissionSuccessContent() {
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patientName") || "";
  const patientId = searchParams.get("patientId") || "";
  const admissionReason = searchParams.get("admissionReason") || "";

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
                    Patient Admitted Successfully
                  </h1>
                  <p className="text-green-100 mt-1">
                    Admission processed for {patientName}
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
                  Admission Complete!
                </h2>
                <p className="text-xl text-gray-700 mb-8">
                  Patient has been successfully admitted to the hospital
                </p>

                {/* Admission Details */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Admission Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <span className="text-gray-600">Patient Name:</span>
                      <span className="font-semibold text-gray-900">{patientName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-semibold text-teal-600">{patientId}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-green-100 pb-2">
                      <span className="text-gray-600">Reason for Admission:</span>
                      <span className="font-semibold text-gray-900">{admissionReason}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Admission Time:</span>
                      <span className="font-semibold text-gray-900">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">Next Steps</h3>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Patient admission has been recorded in the hospital system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Medical staff will be notified of the new admission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Patient's medical history has been verified and is accessible to authorized personnel</span>
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/health/verify-patient"
                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl text-center"
                  >
                    Admit Another Patient
                  </Link>
                  <Link
                    href="/"
                    className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-teal-600 text-center"
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

export default function AdmissionSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AdmissionSuccessContent />
    </Suspense>
  );
}
