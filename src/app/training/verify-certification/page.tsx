"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface VerifiedTrainingData {
  fullName: string;
  email: string;
  certificationTitle: string;
  trainingOrganization: string;
  courseCode: string;
  completionDate: string;
  issueDate: string;
  expiryDate: string;
  grade: string;
  credentialNumber: string;
  skills: string;
}

interface TrainingRecord {
  id: string;
  title: string;
  category: string;
  completedDate: string;
  expiryDate: string;
  status: "active" | "expiring-soon" | "expired";
  organization: string;
  grade: string;
}

interface ActivityItem {
  id: string;
  type: "training-submitted" | "credential-updated" | "compliance-alert";
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

type SubmissionStatus = "idle" | "generating-qr" | "waiting-scan" | "submitted" | "recorded";
type ViewMode = "dashboard" | "submit-training";

export default function EmployeeCompliancePortalPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [submittedTraining, setSubmittedTraining] = useState<VerifiedTrainingData | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [trainingCategory, setTrainingCategory] = useState("");

  // Mock logged-in employee data
  const loggedInEmployee = {
    name: "Chukwuemeka Okafor",
    email: "c.okafor@techcorp.ng",
    employeeId: "EMP-2024-0157",
    department: "Operations",
    position: "Senior Operations Manager",
    joinDate: "2023-03-15",
    location: "Lagos, Nigeria",
    phone: "+234 803 123 4567",
    manager: "Adebayo Adeleke",
    avatarBg: "bg-gradient-to-br from-blue-500 to-indigo-600"
  };

  // Mock training history
  const trainingHistory: TrainingRecord[] = [
    {
      id: "1",
      title: "Workplace Health and Safety Certification",
      category: "Health & Safety",
      completedDate: "2024-10-15",
      expiryDate: "2025-10-15",
      status: "active",
      organization: "National Safety Council of Nigeria",
      grade: "Pass"
    },
    {
      id: "2",
      title: "Fire Safety and Prevention Certification",
      category: "Fire Safety",
      completedDate: "2024-09-20",
      expiryDate: "2025-09-20",
      status: "active",
      organization: "National Safety Council of Nigeria",
      grade: "Pass"
    },
    {
      id: "3",
      title: "Data Protection and Privacy Compliance",
      category: "Data Protection",
      completedDate: "2024-08-10",
      expiryDate: "2025-02-10",
      status: "expiring-soon",
      organization: "National IT Development Agency",
      grade: "Pass"
    }
  ];

  // Mock recent activity
  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "training-submitted",
      title: "Training Credential Submitted",
      description: "Health & Safety certification successfully submitted",
      timestamp: "2 hours ago",
      icon: "✅"
    },
    {
      id: "2",
      type: "compliance-alert",
      title: "Compliance Reminder",
      description: "Data Protection certification expires in 3 months",
      timestamp: "1 day ago",
      icon: "⚠️"
    },
    {
      id: "3",
      type: "credential-updated",
      title: "Profile Updated",
      description: "Emergency contact information updated",
      timestamp: "3 days ago",
      icon: "📝"
    }
  ];

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleSubmitTraining = async () => {
    if (!trainingCategory) {
      alert("Please select a training category");
      return;
    }

    try {
      setSubmissionStatus("generating-qr");

      // Simulate API call to generate proof request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock QR code
      const mockQrCode = `confirmd://proof-request/${Date.now()}`;
      setQrCodeValue(mockQrCode);
      setSubmissionStatus("waiting-scan");

      // Simulate waiting for wallet app scan and credential sharing
      const mockInterval = setInterval(() => {
        // Simulate random submission completion after 5-15 seconds
        const shouldComplete = Math.random() > 0.7;
        if (shouldComplete) {
          clearInterval(mockInterval);

          // Mock submitted training data
          const mockTraining: VerifiedTrainingData = {
            fullName: loggedInEmployee.name,
            email: loggedInEmployee.email,
            certificationTitle: getCertificationTitle(trainingCategory),
            trainingOrganization: "National Safety Council of Nigeria",
            courseCode: getCourseCode(trainingCategory),
            completionDate: "2024-10-15",
            issueDate: "2024-10-16",
            expiryDate: "2025-10-16",
            grade: "Pass",
            credentialNumber: `CERT-${Date.now().toString().slice(-8)}`,
            skills: getSkills(trainingCategory)
          };

          setSubmittedTraining(mockTraining);
          setSubmissionStatus("submitted");
        }
      }, 3000);

      setPollInterval(mockInterval);
    } catch (error) {
      console.error("Error submitting training:", error);
      alert("Failed to submit training. Please try again.");
      setSubmissionStatus("idle");
    }
  };

  const getCertificationTitle = (category: string): string => {
    const titles: Record<string, string> = {
      "health-safety": "Workplace Health and Safety Certification",
      "fire-safety": "Fire Safety and Prevention Certification",
      "first-aid": "First Aid and CPR Certification",
      "data-protection": "Data Protection and Privacy Compliance",
      "cybersecurity": "Cybersecurity Awareness Certification"
    };
    return titles[category] || "Training Certification";
  };

  const getCourseCode = (category: string): string => {
    const codes: Record<string, string> = {
      "health-safety": "HS-101",
      "fire-safety": "FS-101",
      "first-aid": "FA-101",
      "data-protection": "DP-201",
      "cybersecurity": "CS-301"
    };
    return codes[category] || "TRN-001";
  };

  const getSkills = (category: string): string => {
    const skills: Record<string, string> = {
      "health-safety": "Risk Assessment, Emergency Response, PPE Compliance, Incident Reporting, Hazard Identification",
      "fire-safety": "Fire Extinguisher Use, Evacuation Procedures, Fire Prevention, Emergency Response",
      "first-aid": "CPR, Basic Life Support, Wound Care, Emergency Response, AED Use",
      "data-protection": "GDPR Compliance, Data Security, Privacy Policy, Information Management",
      "cybersecurity": "Phishing Detection, Password Security, Data Encryption, Network Security"
    };
    return skills[category] || "Professional Training Skills";
  };

  const handleRecordCompliance = () => {
    setSubmissionStatus("recorded");
  };

  const resetSubmission = () => {
    setSubmissionStatus("idle");
    setQrCodeValue("");
    setSubmittedTraining(null);
    setTrainingCategory("");
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  const getStatusBadge = (status: TrainingRecord["status"]) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Active</span>;
      case "expiring-soon":
        return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Expiring Soon</span>;
      case "expired":
        return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Demos
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className={`w-10 h-10 ${loggedInEmployee.avatarBg} rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
                  {loggedInEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-32 relative">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>
            </div>
            <div className="px-8 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-16 relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  <div className={`w-32 h-32 ${loggedInEmployee.avatarBg} rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-xl border-4 border-white`}>
                    {loggedInEmployee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="pb-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{loggedInEmployee.name}</h1>
                    <p className="text-lg text-gray-600 mb-2">{loggedInEmployee.position}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {loggedInEmployee.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {loggedInEmployee.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {loggedInEmployee.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setViewMode("submit-training")}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Training
                  </button>
                </div>
              </div>
            </div>
          </div>

          {viewMode === "dashboard" ? (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">{trainingHistory.length}</span>
                  </div>
                  <p className="text-gray-600 font-medium">Active Certifications</p>
                  <p className="text-xs text-gray-500 mt-1">All training credentials</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">100%</span>
                  </div>
                  <p className="text-gray-600 font-medium">Compliance Rate</p>
                  <p className="text-xs text-gray-500 mt-1">All requirements met</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">1</span>
                  </div>
                  <p className="text-gray-600 font-medium">Expiring Soon</p>
                  <p className="text-xs text-gray-500 mt-1">Within 3 months</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-3xl font-bold text-gray-900">1.8y</span>
                  </div>
                  <p className="text-gray-600 font-medium">Tenure</p>
                  <p className="text-xs text-gray-500 mt-1">Since {new Date(loggedInEmployee.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Training History */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Training Certifications */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        My Training Certifications
                      </h2>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                      {trainingHistory.map((training) => (
                        <div key={training.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-gray-900 text-base">{training.title}</h3>
                                {getStatusBadge(training.status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{training.organization}</p>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-xs text-gray-500">Category</p>
                                  <p className="font-semibold text-gray-900">{training.category}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Grade</p>
                                  <p className="font-semibold text-green-600">{training.grade}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Completed</p>
                                  <p className="font-semibold text-gray-900">{new Date(training.completedDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Expires</p>
                                  <p className="font-semibold text-gray-900">{new Date(training.expiryDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Employee Information */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Employee Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Employee ID</p>
                        <p className="font-semibold text-gray-900">{loggedInEmployee.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Department</p>
                        <p className="font-semibold text-gray-900">{loggedInEmployee.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Position</p>
                        <p className="font-semibold text-gray-900">{loggedInEmployee.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Manager</p>
                        <p className="font-semibold text-gray-900">{loggedInEmployee.manager}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">{loggedInEmployee.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Join Date</p>
                        <p className="font-semibold text-gray-900">{new Date(loggedInEmployee.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Activity & Quick Actions */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                      <button
                        onClick={() => setViewMode("submit-training")}
                        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Submit Training</p>
                          <p className="text-xs text-gray-600">Share new credential</p>
                        </div>
                      </button>
                      <Link
                        href="/training/issue-certification"
                        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all"
                      >
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Get Credential</p>
                          <p className="text-xs text-gray-600">Acquire new training</p>
                        </div>
                      </Link>
                      <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">View Reports</p>
                          <p className="text-xs text-gray-600">Training history</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recent Activity
                    </h2>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Submit Training View (existing functionality)
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <div className="mb-6">
                <button
                  onClick={() => setViewMode("dashboard")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>

            {submissionStatus === "idle" && (
              <>
                {/* Important Notice */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="font-bold text-amber-900 mb-2">📱 Prerequisites: Have Your Training Credential Ready</h3>
                      <p className="text-sm text-amber-800 mb-3">
                        To submit your training compliance, you must first have a training credential in your digital wallet. If you don't have one yet:
                      </p>
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <ol className="space-y-2 text-sm text-amber-900">
                          <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>Go to the{' '}
                              <Link href="/training/issue-certification" className="text-blue-600 underline font-semibold hover:text-blue-800">
                                Training Organization Demo
                              </Link>
                              {' '}to acquire a training credential
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Complete the issuance process and receive the credential via email</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>Accept the credential into your ConfirmD wallet app</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">4.</span>
                            <span>Return here to submit it to your employer for compliance tracking</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Introduction */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Submit Training Credential
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                    Share your completed training credential from your digital wallet to report compliance to your employer
                  </p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                    <p className="text-sm text-blue-900 flex items-start gap-2 text-left">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        <strong>How it works:</strong> Select the training category below, scan the QR code with your ConfirmD wallet app, approve sharing your credential, and it will be instantly verified and recorded in the company's compliance system.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Training Selection */}
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Training Category</h4>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Which training credential do you want to submit? <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={trainingCategory}
                        onChange={(e) => setTrainingCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-base"
                      >
                        <option value="">Select training category</option>
                        <option value="health-safety">🏥 Health & Safety (Mandatory)</option>
                        <option value="fire-safety">🔥 Fire Safety (Mandatory)</option>
                        <option value="first-aid">🚑 First Aid & CPR</option>
                        <option value="data-protection">🔒 Data Protection & Privacy</option>
                        <option value="cybersecurity">💻 Cybersecurity Awareness</option>
                      </select>
                      {trainingCategory && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                          <p className="text-sm text-green-800 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Ready to submit: <strong>{getCertificationTitle(trainingCategory)}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitTraining}
                    disabled={!trainingCategory}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Training Credential
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* Waiting to Scan - QR Code Display */}
            {submissionStatus === "waiting-scan" && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Scan with Your Wallet App
                  </h3>
                  <p className="text-gray-600">
                    Open your ConfirmD wallet and scan this QR code to share your training credential
                  </p>
                </div>

                {/* QR Code */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 mb-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg mx-auto w-fit">
                    <QRCodeSVG value={qrCodeValue} size={280} level="H" />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      Waiting for your wallet app
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Next Steps
                  </h4>
                  <ol className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>Open the ConfirmD wallet app on your mobile device</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>Tap the scan button (📷) in your wallet app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>Point your camera at this QR code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>Review the credential request and approve sharing</span>
                    </li>
                  </ol>
                </div>

                <button
                  onClick={resetSubmission}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel Submission
                </button>
              </div>
            )}

            {/* Submitted State */}
            {submissionStatus === "submitted" && submittedTraining && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Training Submitted Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Your training credential has been verified and submitted to your employer
                  </p>
                </div>

                {/* Submitted Training Details */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>✅</span>
                    Submitted Training Details
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Your Name</p>
                      <p className="font-bold text-gray-900">{submittedTraining.fullName}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="font-bold text-gray-900">{submittedTraining.email}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Certification</p>
                      <p className="font-bold text-gray-900">{submittedTraining.certificationTitle}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Training Organization</p>
                      <p className="font-bold text-gray-900">{submittedTraining.trainingOrganization}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Credential Number</p>
                      <p className="font-bold text-green-600">{submittedTraining.credentialNumber}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Course Code</p>
                      <p className="font-bold text-gray-900">{submittedTraining.courseCode}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Grade/Result</p>
                      <p className="font-bold text-green-600 text-lg">{submittedTraining.grade}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Completion Date</p>
                      <p className="font-bold text-gray-900">{submittedTraining.completionDate}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                      <p className="font-bold text-gray-900">{submittedTraining.expiryDate}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Skills/Competencies</p>
                      <p className="font-bold text-gray-900">{submittedTraining.skills}</p>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What Happens Next?
                  </h4>
                  <p className="text-sm text-blue-800">
                    Your training compliance has been automatically recorded in the company's system. Your employer can now see that you've completed this mandatory training. No further action is required from you.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={resetSubmission}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                  >
                    Submit Another Training
                  </button>
                  <Link
                    href="/"
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Back to Demos
                  </Link>
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
