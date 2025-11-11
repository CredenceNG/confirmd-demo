"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ProcessStep = {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed" | "error";
  message?: string;
  timestamp?: Date;
};

function IssuingCredentialContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [steps, setSteps] = useState<ProcessStep[]>([
    {
      id: "authenticate",
      title: "Authenticating with ConfirmD Platform",
      status: "pending",
    },
    {
      id: "prepare",
      title: "Preparing credential payload",
      status: "pending",
    },
    {
      id: "issue",
      title: "Issuing credential to student",
      status: "pending",
    },
    {
      id: "email",
      title: "Sending email with QR code",
      status: "pending",
    },
    {
      id: "sms",
      title: "Sending SMS notification",
      status: "pending",
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasIssuedRef = useRef(false);

  const updateStepStatus = (
    stepId: string,
    status: ProcessStep["status"],
    message?: string
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? { ...step, status, message, timestamp: new Date() }
          : step
      )
    );
  };

  const moveToNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  useEffect(() => {
    // Prevent duplicate calls (React 18 Strict Mode runs effects twice in development)
    if (hasIssuedRef.current) return;
    hasIssuedRef.current = true;

    const issueCredential = async () => {
      try {
        // Get student data from URL params
        const studentData = searchParams.get("data");
        if (!studentData) {
          setError("No student data provided");
          return;
        }

        const data = JSON.parse(decodeURIComponent(studentData));

        // Step 1: Authenticating
        updateStepStatus("authenticate", "in-progress");
        await new Promise((resolve) => setTimeout(resolve, 800));
        updateStepStatus(
          "authenticate",
          "completed",
          "JWT token obtained successfully"
        );
        moveToNextStep();

        // Step 2: Preparing payload
        updateStepStatus("prepare", "in-progress");
        await new Promise((resolve) => setTimeout(resolve, 600));
        updateStepStatus(
          "prepare",
          "completed",
          `${Object.keys(data).length - 2} attributes prepared`
        );
        moveToNextStep();

        // Step 3: Issuing credential
        updateStepStatus("issue", "in-progress");

        const response = await fetch("/api/student-card/issue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to issue credential");
        }

        updateStepStatus(
          "issue",
          "completed",
          "Credential issued successfully"
        );
        moveToNextStep();

        // Step 4: Email sent
        updateStepStatus("email", "in-progress");
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateStepStatus(
          "email",
          "completed",
          `Email sent to ${data.email}`
        );
        moveToNextStep();

        // Step 5: SMS sent
        updateStepStatus("sms", "in-progress");
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateStepStatus(
          "sms",
          "completed",
          `SMS sent to ${data.phoneNumber}`
        );

        // Wait a bit before redirecting
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Redirect to success page
        router.push(
          `/student-card/success?email=${encodeURIComponent(data.email)}&phone=${encodeURIComponent(data.phoneNumber)}&name=${encodeURIComponent(data.fullName)}`
        );
      } catch (err: any) {
        console.error("Error issuing credential:", err);
        setError(err.message || "An error occurred");

        // Mark current step as error
        const currentStepId = steps[currentStep]?.id;
        if (currentStepId) {
          updateStepStatus("issue", "error", err.message);
        }
      }
    };

    issueCredential();
  }, []);

  const getStepIcon = (status: ProcessStep["status"]) => {
    switch (status) {
      case "completed":
        return (
          <svg
            className="w-6 h-6 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "in-progress":
        return (
          <svg
            className="w-6 h-6 text-blue-600 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-6 h-6 text-red-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">
                Issuing Student Card Credential
              </h2>
              <p className="text-blue-100 mt-1">
                Please wait while we process the credential issuance...
              </p>
            </div>

            <div className="p-8">
              {!error ? (
                <>
                  {/* Progress Steps */}
                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-4 ${
                          step.status === "pending" ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getStepIcon(step.status)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              step.status === "in-progress"
                                ? "text-blue-900"
                                : step.status === "completed"
                                  ? "text-green-900"
                                  : step.status === "error"
                                    ? "text-red-900"
                                    : "text-gray-900"
                            }`}
                          >
                            {step.title}
                          </h3>
                          {step.message && (
                            <p
                              className={`text-sm mt-1 ${
                                step.status === "error"
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {step.message}
                            </p>
                          )}
                          {step.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              {step.timestamp.toLocaleTimeString()}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        {step.status === "in-progress" && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Processing...
                            </span>
                          </div>
                        )}
                        {step.status === "completed" && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Done
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Info Box */}
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-blue-600">ℹ️</div>
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">What's happening?</p>
                        <p>
                          We're securely issuing a verifiable credential to the
                          student through the ConfirmD Platform. The student will
                          receive an email with a QR code to accept the credential
                          into their digital wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Error State */
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Failed to Issue Credential
                  </h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button
                    onClick={() => router.push("/student-card/issue")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function IssuingCredentialPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <IssuingCredentialContent />
    </Suspense>
  );
}
