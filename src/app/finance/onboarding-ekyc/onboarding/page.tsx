"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [accountType, setAccountType] = useState<string>("savings");
  const [initialDeposit, setInitialDeposit] = useState<string>("10000");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Account type options
  const accountTypes = [
    { value: "savings", label: "Savings Account", minDeposit: 5000 },
    { value: "current", label: "Current Account", minDeposit: 10000 },
    { value: "fixed", label: "Fixed Deposit Account", minDeposit: 50000 },
  ];

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchProofData = async () => {
      try {
        const response = await fetch(`/api/proofs/request?sessionId=${sessionId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const presentedAttrs = data.data.presentedAttributes || {};

          // Transform attributes for display
          const transformedData = {
            ...presentedAttrs,
          };

          setVerifiedData(transformedData);
          setLoading(false);
        } else {
          setError("Failed to retrieve verified credentials");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching proof data:", err);
        setError("Error loading your verified credentials");
        setLoading(false);
      }
    };

    fetchProofData();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      alert("Please accept the terms and conditions to proceed");
      return;
    }

    const selectedAccount = accountTypes.find(a => a.value === accountType);
    const depositAmount = parseInt(initialDeposit);

    if (selectedAccount && depositAmount < selectedAccount.minDeposit) {
      alert(`Minimum deposit for ${selectedAccount.label} is ₦${selectedAccount.minDeposit.toLocaleString()}`);
      return;
    }

    setSubmitting(true);

    // Simulate account opening submission
    try {
      console.log("[OnboardingEKYC] Submitting account opening:", {
        sessionId,
        customerData: verifiedData,
        accountType,
        initialDeposit: depositAmount,
      });

      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to success page
      router.push(`/finance/onboarding-ekyc/success?accountId=ACC-${Date.now()}`);
    } catch (err: any) {
      console.error("[OnboardingEKYC] Error submitting account opening:", err);
      alert("Failed to submit account opening. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verified credentials...</p>
        </div>
      </div>
    );
  }

  if (error || !verifiedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error || "Invalid request"}</p>
          <button
            onClick={() => router.push("/finance/onboarding-ekyc")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/finance/onboarding-ekyc")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Start New Application
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Identity Verified</h2>
          </div>
          <p className="text-blue-100">
            Your eKYC credentials have been verified. Complete the form below to open your account.
          </p>
        </div>

        <div className="p-6">
          {/* Verification Info */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Credentials verified</p>
                <p className="text-xs text-green-700 mt-1">
                  Your identity has been cryptographically verified
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.full_name || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.national_id_number || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BVN</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.bank_verification_number || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.phone_number || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.gender || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.kyc_status || "N/A"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.residential_address || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Account Opening Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Account Details
              </h3>

              {/* Account Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Account Type
                </label>
                <div className="space-y-3">
                  {accountTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        accountType === type.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="accountType"
                          value={type.value}
                          checked={accountType === type.value}
                          onChange={(e) => setAccountType(e.target.value)}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{type.label}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Minimum deposit: ₦{type.minDeposit.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Initial Deposit */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Deposit Amount (₦)
                </label>
                <input
                  type="number"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I accept the terms and conditions, and I confirm that all information provided is accurate
                  </span>
                </label>
              </div>
            </div>

            {/* Summary */}
            {acceptedTerms && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">Account Opening Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-800">Account Type:</span>
                    <span className="font-semibold text-blue-900">
                      {accountTypes.find(a => a.value === accountType)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-300">
                    <span className="text-blue-900">Initial Deposit:</span>
                    <span className="text-blue-900">₦{parseInt(initialDeposit).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/finance/onboarding-ekyc")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !acceptedTerms}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Open Account & Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How Verification Works
        </h4>
        <p className="text-sm text-blue-800">
          This demo requested proof of your eKYC credential. The ConfirmD platform cryptographically
          verified your identity without accessing your full credential data. The issuing authority's
          digital signature ensures these credentials cannot be forged or tampered with.
        </p>
      </div>
    </div>
  );
}

export default function OnboardingEKYCPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
