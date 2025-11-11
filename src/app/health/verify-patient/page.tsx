"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyPatientPage() {
  const router = useRouter();

  // State management
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "verified">("disconnected");
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [patientData, setPatientData] = useState<any>(null);
  const [verificationPollInterval, setVerificationPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Form state for visit
  const [visitReason, setVisitReason] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    return () => {
      if (verificationPollInterval) {
        clearInterval(verificationPollInterval);
      }
    };
  }, [verificationPollInterval]);

  const handleVerifyPatient = async () => {
    try {
      setConnectionStatus("connecting");

      // Request proof from patient
      const response = await fetch("/api/health/verify-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "request_proof",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrCodeValue(data.data.qrCode || "");

        // Start polling for verification status
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch("/api/health/verify-patient", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "check_status",
                proofRecordId: data.data.proofRecordId,
              }),
            });

            const statusData = await statusResponse.json();

            if (statusData.success && statusData.data?.verified) {
              clearInterval(pollInterval);
              setPatientData(statusData.data.patient);
              setConnectionStatus("verified");
            }
          } catch (error) {
            console.error("[Health Verify] Error checking status:", error);
          }
        }, 3000);

        setVerificationPollInterval(pollInterval);
      } else {
        alert("Failed to initiate verification: " + (data.message || "Unknown error"));
        setConnectionStatus("disconnected");
      }
    } catch (error) {
      console.error("[Health Verify] Error verifying patient:", error);
      alert("An error occurred while initiating verification");
      setConnectionStatus("disconnected");
    }
  };

  const handleRegisterVisit = () => {
    if (!visitReason || !emergencyContact) {
      alert("Please fill in all required fields");
      return;
    }

    // In a real application, this would submit the visit data to a backend
    router.push(
      `/health/visit-success?patientName=${encodeURIComponent(patientData.fullName)}&patientId=${encodeURIComponent(patientData.patientId)}&visitReason=${encodeURIComponent(visitReason)}`
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 px-6 py-8 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl animate-bounce">🏥</span>
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">Patient Visit Registration</h2>
                  </div>
                  <p className="text-cyan-100 text-lg">
                    Verify patient credentials for hospital visit
                  </p>
                </div>
                <Link
                  href="/"
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  ← Back to Demos
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {connectionStatus === "disconnected" && (
              <div className="text-center py-12">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-16 h-16 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Verify Patient Medical Health Card
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Request the patient to present their medical health card credential for verification before admission.
                </p>

                {/* Information Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="text-4xl mb-3">🔒</div>
                    <p className="font-bold text-teal-900 text-lg mb-2">Secure</p>
                    <p className="text-sm text-teal-700">Zero-knowledge proof verification</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="text-4xl mb-3">⚡</div>
                    <p className="font-bold text-blue-900 text-lg mb-2">Instant</p>
                    <p className="text-sm text-blue-700">Real-time credential verification</p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border-2 border-cyan-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="text-4xl mb-3">🎯</div>
                    <p className="font-bold text-cyan-900 text-lg mb-2">Accurate</p>
                    <p className="text-sm text-cyan-700">Verified medical information</p>
                  </div>
                </div>

                <button
                  onClick={handleVerifyPatient}
                  className="px-10 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verify Patient Credentials
                  </div>
                </button>
              </div>
            )}

            {/* QR Code Modal */}
            {connectionStatus === "connecting" && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full transform animate-slideUp">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-5 rounded-t-3xl">
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Patient Verification</h3>
                          <p className="text-sm text-cyan-100">Scan to verify health card</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setConnectionStatus("disconnected");
                          if (verificationPollInterval) {
                            clearInterval(verificationPollInterval);
                          }
                        }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl blur-xl opacity-50"></div>
                      <div className="relative bg-white p-8 rounded-2xl border-4 border-teal-200 shadow-xl">
                        <QRCodeSVG value={qrCodeValue} size={280} level="H" />
                      </div>
                      <div className="absolute -top-3 -right-3 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                        Active
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-6 border-2 border-teal-100">
                      <h4 className="font-bold text-teal-900 mb-3">How to Verify:</h4>
                      <ol className="text-left text-sm text-teal-800 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">1.</span>
                          <span>Open the ConfirmD wallet app on your mobile device</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">2.</span>
                          <span>Scan this QR code with the app</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">3.</span>
                          <span>Review and approve the credential request</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">4.</span>
                          <span>Your information will be verified securely</span>
                        </li>
                      </ol>
                    </div>

                    <button className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Open in Mobile Wallet
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Verified State with Visit Form */}
            {connectionStatus === "verified" && patientData && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Patient Verified Successfully!
                  </h3>
                  <p className="text-gray-600">Medical health card verified and validated</p>
                </div>

                {/* Patient Medical Information */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 mb-8 border-2 border-teal-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>👤</span>
                    Patient Medical Record
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-teal-100">
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="font-bold text-gray-900">{patientData.fullName}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-100">
                      <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                      <p className="font-bold text-gray-900">{patientData.dateOfBirth}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-100">
                      <p className="text-xs text-gray-500 mb-1">Patient ID</p>
                      <p className="font-bold text-teal-600">{patientData.patientId}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-100">
                      <p className="text-xs text-gray-500 mb-1">Health Insurance Number</p>
                      <p className="font-bold text-gray-900">{patientData.healthInsuranceNumber}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <p className="text-xs text-gray-500 mb-1">Blood Type</p>
                      <p className="font-bold text-red-600 text-lg">{patientData.bloodType}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-100">
                      <p className="text-xs text-gray-500 mb-1">Genotype</p>
                      <p className="font-bold text-gray-900">{patientData.genotype}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <p className="text-xs text-gray-500 mb-1">Allergies</p>
                      <p className="font-bold text-orange-600">{patientData.allergies || "None"}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-100">
                      <p className="text-xs text-gray-500 mb-1">Chronic Conditions</p>
                      <p className="font-bold text-gray-900">{patientData.chronicConditions || "None"}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-100 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Issuing Hospital</p>
                      <p className="font-bold text-gray-900">{patientData.issuingHospital}</p>
                    </div>
                  </div>
                </div>

                {/* Visit Form */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Complete Patient Visit Registration</h4>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Visit <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={visitReason}
                        onChange={(e) => setVisitReason(e.target.value)}
                        className="w-full px-4 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        rows={3}
                        placeholder="Describe the reason for hospital visit..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full px-4 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="+234 xxx xxx xxxx"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        rows={3}
                        placeholder="Any additional information or special requirements..."
                      />
                    </div>
                  </div>

                  {/* Validation Warning */}
                  {(!visitReason || !emergencyContact) && (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-amber-900">Required Fields Missing</p>
                          <p className="text-xs text-amber-700 mt-1">Please fill in the reason for visit and emergency contact to continue.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleRegisterVisit}
                    disabled={!visitReason || !emergencyContact}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Register Visit
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setConnectionStatus("disconnected");
                      setPatientData(null);
                      setVisitReason("");
                      setEmergencyContact("");
                      setAdditionalNotes("");
                    }}
                    className="px-6 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-300"
                  >
                    Verify Another Patient
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
