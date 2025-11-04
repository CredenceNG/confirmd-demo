"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

interface ProofAttribute {
  raw: string;
  encoded: string;
}

interface ProofData {
  id: string;
  sessionId: string;
  connectionId: string;
  proofId: string;
  status: string;
  requestedAttributes: any;
  presentedAttributes: Record<string, ProofAttribute> | null;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: ProofData;
  error?: {
    error: string;
    error_description: string;
  };
}

export default function ApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [proofData, setProofData] = useState<ProofData | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loanData, setLoanData] = useState({
    contactPhone: "",
    contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch proof data on mount
  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided. Please start from the beginning.");
      setLoading(false);
      return;
    }

    fetchProofData();
  }, [sessionId]);

  const fetchProofData = async () => {
    try {
      setLoading(true);
      console.log("[Application] Fetching proof data for sessionId:", sessionId);
      const response = await fetch(`/api/proofs/request?sessionId=${sessionId}`);
      const result: ApiResponse = await response.json();

      console.log("[Application] API Response:", {
        success: result.success,
        hasData: !!result.data,
        data: result.data,
      });

      if (!result.success || !result.data) {
        setError(result.error?.error_description || "Failed to load proof data");
        setLoading(false);
        return;
      }

      setProofData(result.data);

      // Pre-fill form with presented attributes
      if (result.data.presentedAttributes) {
        console.log("[Application] presentedAttributes:", {
          type: typeof result.data.presentedAttributes,
          keys: Object.keys(result.data.presentedAttributes),
          sample: Object.entries(result.data.presentedAttributes)[0],
          full: result.data.presentedAttributes,
        });

        const formValues: Record<string, string> = {};
        Object.entries(result.data.presentedAttributes).forEach(([name, attr]) => {
          console.log("[Application] Processing attribute:", { name, attr });
          // Attributes are stored as plain strings, not objects with .raw property
          formValues[name] = typeof attr === 'string' ? attr : (attr as any).raw || String(attr);
        });
        console.log("[Application] Form values to set:", formValues);
        setFormData(formValues);
      } else {
        console.warn("[Application] No presentedAttributes in response");
      }

      setLoading(false);
    } catch (err: any) {
      console.error("[Application] Error fetching proof data:", err);
      setError("Failed to load your verified credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLoanDataChange = (field: string, value: string) => {
    setLoanData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate contact fields
    if (!loanData.contactPhone) {
      alert("Please provide a contact phone number");
      return;
    }

    if (!loanData.contactEmail) {
      alert("Please provide a contact email");
      return;
    }

    setSubmitting(true);

    try {
      console.log("[Application] Submitting application:", {
        sessionId,
        ...loanData,
      });

      const response = await fetch("/api/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          ...loanData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Submission failed");
      }

      console.log("[Application] Submission successful:", result);

      // Redirect to confirmation page with application number
      router.push(
        `/register/confirmation?applicationNumber=${result.application.applicationNumber}`
      );
    } catch (err: any) {
      console.error("[Application] Error submitting application:", err);
      alert(err.message || "Failed to submit application. Please try again.");
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Your Credentials
          </h2>
          <p className="text-gray-600">
            Please wait while we retrieve your verified student information...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Error Loading Application
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // No proof data
  if (!proofData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No proof data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                NELFUND Demo - Application Form
              </h1>
              <p className="text-sm text-gray-600">
                Your credentials have been verified successfully
              </p>
            </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The information below has been verified
                from your student credential. Please review and confirm the
                details before submitting your loan application.
              </p>
            </div>
          </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Surname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Surname
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.surname || ""}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Other Names */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Names
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.othernames || ""}
                onChange={(e) => handleInputChange("othernames", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.date_of_birth || ""}
                onChange={(e) =>
                  handleInputChange("date_of_birth", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* National ID Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID Number
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.national_id_number || ""}
                onChange={(e) =>
                  handleInputChange("national_id_number", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* BVN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Verification Number (BVN)
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.bank_verification_number || ""}
                onChange={(e) =>
                  handleInputChange("bank_verification_number", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* JAMB Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JAMB Registration Number
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.jamb_number || ""}
                onChange={(e) => handleInputChange("jamb_number", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-6 mt-8">
            Academic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.school_name || ""}
                onChange={(e) => handleInputChange("school_name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* School NUC Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School NUC Number
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.school_nuc_number || ""}
                onChange={(e) =>
                  handleInputChange("school_nuc_number", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Admission Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.admission_number || ""}
                onChange={(e) =>
                  handleInputChange("admission_number", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Matric Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matriculation Number
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.matric_number || ""}
                onChange={(e) =>
                  handleInputChange("matric_number", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.department || ""}
                onChange={(e) => handleInputChange("department", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Programme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programme
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.programme || ""}
                onChange={(e) => handleInputChange("programme", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Graduation Year
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.graduation_year || ""}
                onChange={(e) => handleInputChange("graduation_year", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Credential Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential Issue Date
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.date_issued || ""}
                onChange={(e) => handleInputChange("date_issued", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            {/* Credential Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential Expiry Date
                <span className="text-green-600 ml-1" title="Verified">
                  ✓
                </span>
              </label>
              <input
                type="text"
                value={formData.date_expiry || ""}
                onChange={(e) => handleInputChange("date_expiry", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Verification Note */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-600 mr-3 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-1">
                  All Credentials Verified
                </p>
                <p className="text-sm text-green-700">
                  All information displayed above has been cryptographically verified
                  from your Student Clearance credential issued by {formData.school_name || "your institution"}.
                  This data cannot be tampered with or falsified.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <h2 className="text-xl font-semibold text-gray-800 mb-6 mt-8">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={loanData.contactPhone}
                onChange={(e) => handleLoanDataChange("contactPhone", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="08012345678"
                required
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={loanData.contactEmail}
                onChange={(e) => handleLoanDataChange("contactEmail", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Debug Info
              </summary>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify({ proofData, formData }, null, 2)}
              </pre>
            </details>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
