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

function IssuingStatementOfResultsContent() {
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
      title: "Preparing Statement of Results payload",
      status: "pending",
    },
    {
      id: "issue",
      title: "Issuing Statement of Results credential",
      status: "pending",
    },
    {
      id: "email",
      title: "Sending email with QR code to student",
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
  const [isConfigError, setIsConfigError] = useState(false);
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
          setError("No student data provided. Please go back and fill out the form.");
          updateStepStatus("authenticate", "error", "Missing student data");
          return;
        }

        let data;
        try {
          data = JSON.parse(decodeURIComponent(studentData));
        } catch (parseError) {
          console.error("Failed to parse student data:", parseError);
          setError("Invalid student data format. Please try again.");
          updateStepStatus("authenticate", "error", "Invalid data format");
          return;
        }

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
        const studentName = `${data.surname} ${data.othernames}`;
        updateStepStatus(
          "prepare",
          "completed",
          `Academic results for ${studentName} prepared`
        );
        moveToNextStep();

        // Step 3: Issuing credential
        updateStepStatus("issue", "in-progress");

        let response;
        let result;

        try {
          response = await fetch("/api/statement-of-results/issue", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          result = await response.json();
        } catch (fetchError: any) {
          console.error("Network error:", fetchError);
          updateStepStatus(
            "issue",
            "error",
            "Network error - unable to connect to server"
          );
          setError("Network error: Unable to connect to the server. Please check your connection and try again.");
          return;
        }

        if (!response.ok) {
          // Check if it's a configuration error
          if (result.error === "Configuration Error") {
            setIsConfigError(true);
            updateStepStatus(
              "issue",
              "error",
              "Configuration required - see instructions below"
            );
          } else if (result.error === "Authentication failed") {
            updateStepStatus(
              "issue",
              "error",
              "Failed to authenticate with ConfirmD Platform"
            );
          } else {
            updateStepStatus(
              "issue",
              "error",
              result.message || "Failed to issue credential"
            );
          }

          const errorMessage = result.message || result.error || "Failed to issue Statement of Results";
          console.error("API Error:", {
            status: response.status,
            error: result.error,
            message: result.message,
            details: result.details,
          });

          setError(errorMessage);
          return;
        }

        updateStepStatus(
          "issue",
          "completed",
          "Statement of Results issued successfully"
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
        const fullName = `${data.surname} ${data.othernames}`;
        router.push(
          `/academic/universities/success?email=${encodeURIComponent(data.email)}&phone=${encodeURIComponent(data.phoneNumber)}&name=${encodeURIComponent(fullName)}`
        );
      } catch (err: any) {
        console.error("Unexpected error issuing Statement of Results:", err);

        const errorMessage = err.message || "An unexpected error occurred. Please try again.";
        setError(errorMessage);

        // Mark the issue step as error if not already marked
        const issueStep = steps.find(s => s.id === "issue");
        if (issueStep && issueStep.status !== "error") {
          updateStepStatus("issue", "error", errorMessage);
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
            className="w-6 h-6 text-purple-600 animate-spin"
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
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">
                Issuing Statement of Results Credential
              </h2>
              <p className="text-purple-100 mt-1">
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
                                ? "text-purple-900"
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
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
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
                  <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-purple-600">ℹ️</div>
                      <div className="text-sm text-purple-800">
                        <p className="font-semibold mb-1">What's happening?</p>
                        <p>
                          We're securely issuing a verifiable Statement of Results credential
                          through the ConfirmD Platform. The student will receive an email with
                          a QR code to accept the credential into their digital wallet. This
                          credential is required for NYSC Phase 1 registration.
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
                    Failed to Issue Statement of Results
                  </h3>
                  <p className="text-gray-600 mb-6">{error}</p>

                  {/* Configuration Help for Config Errors */}
                  {isConfigError && (
                    <div className="max-w-2xl mx-auto mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-left">
                      <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                        <span>⚙️</span> Configuration Required
                      </h4>
                      <div className="text-sm text-yellow-800 space-y-2">
                        <p className="font-medium">
                          To issue Statement of Results credentials, you need to configure the credential definition ID:
                        </p>
                        <ol className="list-decimal ml-5 space-y-2">
                          <li>
                            Open your <code className="bg-yellow-100 px-2 py-1 rounded">.env</code> file
                          </li>
                          <li>
                            Add or update: <code className="bg-yellow-100 px-2 py-1 rounded">STATEMENT_OF_RESULT_CRED_DEF_ID=your-credential-definition-id</code>
                          </li>
                          <li>
                            Restart the development server
                          </li>
                        </ol>
                        <p className="mt-3 pt-3 border-t border-yellow-300">
                          <strong>Note:</strong> For this demo, you can use the same credential definition ID as the Student Card demo by setting it to the value of <code className="bg-yellow-100 px-2 py-1 rounded">ISSUE_CRED_DEF_ID</code>.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => router.push("/academic/universities/issue")}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => router.push("/")}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Back to Demos
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function IssuingStatementOfResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <IssuingStatementOfResultsContent />
    </Suspense>
  );
}
