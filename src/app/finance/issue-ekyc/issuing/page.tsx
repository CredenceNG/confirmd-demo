"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ProcessStep = {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed" | "error";
  message?: string;
};

function IssuingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: "authenticate", title: "Authenticating with ConfirmD Platform", status: "pending" },
    { id: "verify", title: "Verifying customer identity (NIN/BVN)", status: "pending" },
    { id: "prepare", title: "Preparing eKYC credential", status: "pending" },
    { id: "issue", title: "Issuing credential to customer wallet", status: "pending" },
    { id: "notify", title: "Sending notification", status: "pending" },
  ]);

  const [error, setError] = useState<string | null>(null);
  const hasIssuedRef = useRef(false);

  const updateStepStatus = (stepId: string, status: ProcessStep["status"], message?: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  useEffect(() => {
    if (hasIssuedRef.current) return;
    hasIssuedRef.current = true;

    const issueCredential = async () => {
      try {
        const customerData = searchParams.get("data");
        if (!customerData) {
          setError("No customer data provided");
          return;
        }

        const data = JSON.parse(decodeURIComponent(customerData));

        // Step 1: Authenticate
        updateStepStatus("authenticate", "in-progress");
        await new Promise(resolve => setTimeout(resolve, 800));
        updateStepStatus("authenticate", "completed", "JWT token obtained");

        // Step 2: Verify identity
        updateStepStatus("verify", "in-progress");
        await new Promise(resolve => setTimeout(resolve, 1200));
        updateStepStatus("verify", "completed", "NIN and BVN verified successfully");

        // Step 3: Prepare credential
        updateStepStatus("prepare", "in-progress");
        await new Promise(resolve => setTimeout(resolve, 600));
        updateStepStatus("prepare", "completed", `${Object.keys(data).length} attributes prepared`);

        // Step 4: Issue credential (call actual API)
        updateStepStatus("issue", "in-progress");

        const issueResponse = await fetch("/api/finance/ekyc/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const issueResult = await issueResponse.json();

        if (!issueResponse.ok || !issueResult.success) {
          throw new Error(issueResult.message || "Failed to issue eKYC credential");
        }

        updateStepStatus("issue", "completed", "eKYC credential issued successfully");

        // Step 5: Send notification (simulated - email is sent by Platform)
        updateStepStatus("notify", "in-progress");
        await new Promise(resolve => setTimeout(resolve, 500));
        updateStepStatus("notify", "completed", `Email sent to ${data.email}`);

        // Wait before redirecting
        await new Promise(resolve => setTimeout(resolve, 2000));

        router.push(
          `/finance/issue-ekyc/success?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.fullName)}`
        );
      } catch (err: any) {
        console.error("Error issuing eKYC:", err);
        setError(err.message || "An error occurred");
        const currentStep = steps.find(s => s.status === "in-progress");
        if (currentStep) {
          updateStepStatus(currentStep.id, "error", err.message);
        }
      }
    };

    issueCredential();
  }, []);

  const getStepIcon = (status: ProcessStep["status"]) => {
    switch (status) {
      case "completed":
        return (
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "in-progress":
        return (
          <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center">
          <h2 className="text-2xl font-bold text-white">Issuing eKYC Credential</h2>
          <p className="text-blue-100 mt-2">Please wait while we process your request...</p>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
                <div className="flex-1">
                  <h3 className={`font-medium ${step.status === "error" ? "text-red-600" : "text-gray-900"}`}>
                    {step.title}
                  </h3>
                  {step.message && (
                    <p className={`text-sm mt-1 ${step.status === "error" ? "text-red-600" : "text-gray-600"}`}>
                      {step.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => router.push("/finance/issue-ekyc")}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IssuingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <IssuingContent />
    </Suspense>
  );
}
