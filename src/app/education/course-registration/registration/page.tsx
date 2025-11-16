"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Available courses for selection
  const availableCourses = [
    { code: "CSC301", title: "Data Structures and Algorithms", units: 3, amount: 15000 },
    { code: "CSC302", title: "Database Management Systems", units: 3, amount: 15000 },
    { code: "CSC303", title: "Web Development", units: 3, amount: 15000 },
    { code: "CSC304", title: "Computer Networks", units: 3, amount: 15000 },
    { code: "MTH301", title: "Linear Algebra", units: 3, amount: 15000 },
    { code: "MTH302", title: "Numerical Analysis", units: 3, amount: 15000 },
    { code: "ENG301", title: "Technical Writing", units: 2, amount: 10000 },
    { code: "PHY301", title: "Applied Physics", units: 3, amount: 15000 },
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
            full_name: presentedAttrs.surname && presentedAttrs.othernames
              ? `${presentedAttrs.surname} ${presentedAttrs.othernames}`
              : presentedAttrs.full_name || "",
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

  // Calculate total payment amount
  useEffect(() => {
    const total = selectedCourses.reduce((sum, courseCode) => {
      const course = availableCourses.find(c => c.code === courseCode);
      return sum + (course?.amount || 0);
    }, 0);
    setPaymentAmount(total);
  }, [selectedCourses]);

  const handleCourseToggle = (courseCode: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseCode)) {
        return prev.filter(c => c !== courseCode);
      } else {
        return [...prev, courseCode];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCourses.length === 0) {
      alert("Please select at least one course to register");
      return;
    }

    setSubmitting(true);

    // Simulate course registration submission
    try {
      console.log("[CourseReg] Submitting registration:", {
        sessionId,
        studentData: verifiedData,
        courses: selectedCourses,
        paymentAmount,
      });

      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to success page
      router.push(`/education/course-registration/success?registrationId=REG-${Date.now()}`);
    } catch (err: any) {
      console.error("[CourseReg] Error submitting registration:", err);
      alert("Failed to submit registration. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            onClick={() => router.push("/education/course-registration")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const totalUnits = selectedCourses.reduce((sum, courseCode) => {
    const course = availableCourses.find(c => c.code === courseCode);
    return sum + (course?.units || 0);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/education/course-registration")}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Start New Registration
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Student Verified</h2>
          </div>
          <p className="text-purple-100">
            Your student credentials have been verified. Select courses below to complete registration.
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
                  Your student identity has been cryptographically verified
                </p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Student Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.full_name || `${verifiedData.surname || ""} ${verifiedData.othernames || ""}`.trim() || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matric Number</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.matric_number || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.programme || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {verifiedData.department || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Course Selection Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Select Courses
              </h3>
              <div className="space-y-3">
                {availableCourses.map((course) => {
                  const isSelected = selectedCourses.includes(course.code);
                  return (
                    <label
                      key={course.code}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCourseToggle(course.code)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{course.code}</div>
                          <div className="text-sm text-gray-600">{course.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{course.units} units</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₦{course.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">per course</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {selectedCourses.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-purple-900 mb-3">Registration Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-800">Total Courses:</span>
                    <span className="font-semibold text-purple-900">{selectedCourses.length} courses</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-800">Total Units:</span>
                    <span className="font-semibold text-purple-900">{totalUnits} units</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-purple-300">
                    <span className="text-purple-900">Total Payment:</span>
                    <span className="text-purple-900">₦{paymentAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/education/course-registration")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || selectedCourses.length === 0}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    Complete Registration & Pay
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
          This demo requested proof of your Student Card credential. The ConfirmD platform cryptographically
          verified your student identity without accessing your full credential data. The institution's
          digital signature ensures these credentials cannot be forged or tampered with.
        </p>
      </div>
    </div>
  );
}

export default function CourseRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegistrationContent />
    </Suspense>
  );
}
