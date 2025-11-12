"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CustomerRecord {
  nin: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  stateOfOrigin: string;
  lga: string;
  bvn: string;
  nationality: string;
  photoUrl: string;
}

export default function IssueEKYCPage() {
  const router = useRouter();

  // Step 1: Customer selection state
  const [customerName, setCustomerName] = useState("");
  const [nin, setNin] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Step 2: Verified customer data
  const [verifiedCustomer, setVerifiedCustomer] = useState<CustomerRecord | null>(null);
  const [nameMatch, setNameMatch] = useState(false);
  const [email, setEmail] = useState("");

  // UI State
  const [currentStep, setCurrentStep] = useState(1); // 1 = Enter NIN, 2 = Review & Issue

  // Handle NIN verification
  const handleVerifyNIN = async () => {
    if (!nin || !customerName) {
      setVerificationError("Please enter both customer name and NIN");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const response = await fetch("/api/finance/ekyc/verify-nin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nin,
          expectedName: customerName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setVerificationError(
          data.message || "Failed to verify NIN. Please check the NIN and try again."
        );
        return;
      }

      // Verification successful
      setVerifiedCustomer(data.data.record);
      setNameMatch(data.data.nameMatch);
      setEmail(""); // Reset email for new customer
      setCurrentStep(2);

      console.log("[eKYC] NIN verified successfully:", {
        nin: data.data.record.nin,
        fullName: data.data.record.fullName,
        nameMatch: data.data.nameMatch,
      });
    } catch (error: any) {
      console.error("[eKYC] Error verifying NIN:", error);
      setVerificationError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle credential issuance
  const handleIssueCredential = () => {
    if (!verifiedCustomer || !email) {
      return;
    }

    // Navigate to issuing page with customer data
    const data = {
      ...verifiedCustomer,
      email,
    };

    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(`/finance/issue-ekyc/issuing?data=${encodedData}`);
  };

  // Reset form
  const handleReset = () => {
    setCustomerName("");
    setNin("");
    setVerifiedCustomer(null);
    setNameMatch(false);
    setEmail("");
    setVerificationError(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`flex items-center ${currentStep >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                    {currentStep > 1 ? "✓" : "1"}
                  </div>
                  <span className="ml-3 font-medium hidden sm:block">Verify NIN</span>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                <div className={`flex items-center ${currentStep >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                    2
                  </div>
                  <span className="ml-3 font-medium hidden sm:block">Review & Issue</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
            <h2 className="text-2xl font-bold text-white">
              {currentStep === 1 && "Step 1: Verify Customer Identity"}
              {currentStep === 2 && "Step 2: Review & Issue eKYC Credential"}
            </h2>
            <p className="text-blue-100 mt-1">
              {currentStep === 1 && "Enter customer name and NIN to retrieve verified identity information from NIMC"}
              {currentStep === 2 && "Review verified customer information and issue eKYC credential"}
            </p>
          </div>

          <div className="p-6">
            {currentStep === 1 && (
              <>
                {/* Step 1: NIN Verification Form */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer's full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isVerifying}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      This name will be compared with NIMC records
                    </p>
                  </div>

                  <div>
                    <label htmlFor="nin" className="block text-sm font-medium text-gray-700 mb-2">
                      National Identification Number (NIN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nin"
                      value={nin}
                      onChange={(e) => setNin(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="Enter 11-digit NIN"
                      maxLength={11}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
                      disabled={isVerifying}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {nin.length}/11 digits • Try: 12345678901, 23456789012, 34567890123, or 45678901234
                    </p>
                  </div>

                  {verificationError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <div className="text-red-600 text-xl">⚠️</div>
                        <div>
                          <h4 className="font-semibold text-red-900 mb-1">Verification Failed</h4>
                          <p className="text-sm text-red-800">{verificationError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="text-blue-600 text-xl">ℹ️</div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">How it works</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Enter the customer's name as it appears in your records</li>
                          <li>• Provide their 11-digit National Identification Number (NIN)</li>
                          <li>• We'll verify the NIN with NIMC and retrieve their official details</li>
                          <li>• Verified information includes: full name, DOB, address, BVN, and photo</li>
                          <li>• If the name matches, you can proceed to issue the eKYC credential</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => router.push("/")}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      ← Back to Demos
                    </button>
                    <button
                      onClick={handleVerifyNIN}
                      disabled={!customerName || nin.length !== 11 || isVerifying}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                        !customerName || nin.length !== 11 || isVerifying
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isVerifying ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying with NIMC...
                        </span>
                      ) : (
                        "Verify NIN →"
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && verifiedCustomer && (
              <>
                {/* Step 2: Review Verified Information */}
                <div className="space-y-6">
                  {/* Name Match Status */}
                  <div className={`border-2 rounded-lg p-4 ${nameMatch ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`text-2xl ${nameMatch ? "text-green-600" : "text-yellow-600"}`}>
                        {nameMatch ? "✓" : "⚠️"}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${nameMatch ? "text-green-900" : "text-yellow-900"}`}>
                          {nameMatch ? "Name Match Confirmed" : "Name Mismatch Detected"}
                        </h3>
                        <p className={`text-sm mt-1 ${nameMatch ? "text-green-800" : "text-yellow-800"}`}>
                          {nameMatch
                            ? `The name "${customerName}" matches the NIMC record "${verifiedCustomer.fullName}"`
                            : `Warning: "${customerName}" does not match NIMC record "${verifiedCustomer.fullName}". Please verify before proceeding.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Photo and Details */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Verified Customer Information</h3>

                    <div className="flex items-start gap-6">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        <img
                          src={verifiedCustomer.photoUrl}
                          alt={verifiedCustomer.fullName}
                          className="w-32 h-32 rounded-lg border-2 border-gray-300 object-cover"
                        />
                        <p className="text-xs text-gray-500 text-center mt-2">Official Photo</p>
                      </div>

                      {/* Details Grid */}
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{verifiedCustomer.fullName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{verifiedCustomer.dateOfBirth}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">NIN</label>
                          <p className="text-sm font-mono font-semibold text-gray-900 mt-1">{verifiedCustomer.nin}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">BVN</label>
                          <p className="text-sm font-mono font-semibold text-gray-900 mt-1">{verifiedCustomer.bvn}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{verifiedCustomer.gender}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{verifiedCustomer.phoneNumber}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-gray-500 uppercase">Residential Address</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{verifiedCustomer.address}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">State of Origin</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{verifiedCustomer.stateOfOrigin}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">LGA</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{verifiedCustomer.lga}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Credential Delivery</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      The eKYC credential will be sent to the email address below. The customer can scan the QR code with the ConfirmD App to accept it.
                    </p>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {email && !email.includes("@") && (
                        <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
                      )}
                    </div>
                  </div>

                  {/* Information Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="text-blue-600 text-xl">ℹ️</div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">What happens next?</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• A verifiable eKYC credential will be created with the verified information from NIMC</li>
                          <li>• An email with a QR code will be sent to <span className="font-semibold">{email || "the email address"}</span></li>
                          <li>• The customer scans the QR code with the ConfirmD App to accept the credential</li>
                          <li>• The credential is stored securely in their digital wallet</li>
                          <li>• They can reuse this eKYC credential for onboarding with other institutions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      ← Start Over
                    </button>
                    <button
                      onClick={handleIssueCredential}
                      disabled={!email || !email.includes("@")}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                        !email || !email.includes("@")
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Issue eKYC Credential →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
