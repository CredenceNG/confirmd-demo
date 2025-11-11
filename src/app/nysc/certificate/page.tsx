/**
 * NYSC Certificate Issuance Page
 * Phase 4: NYSC Administrator issues Certificate of National Service
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Tooltip Component
const Tooltip = ({ text }: { text: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-purple-500 rounded-full hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
        aria-label="Help"
      >
        ?
      </button>
      {isVisible && (
        <div className="absolute z-10 w-64 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6 transform">
          <div className="relative">
            {text}
            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-4 top-2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CorpMember {
  id: string;
  fullName: string;
  callUpNumber: string;
  startDate: string;
  endDate: string;
  issuedDate: string;
  certificateNumber: string;
  email: string;
  phoneNumber?: string;
  status: "completed" | "in-progress";
}

// Sample corp members who completed service
const sampleCorpMembers: CorpMember[] = [
  {
    id: "1",
    callUpNumber: "NYSC/LA/2024/001234",
    fullName: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+234 803 123 4567",
    startDate: "2024-01-15",
    endDate: "2024-10-15",
    issuedDate: "2024-10-20",
    certificateNumber: "NYSC/CERT/2024/001234",
    status: "completed",
  },
  {
    id: "2",
    callUpNumber: "NYSC/AB/2024/001235",
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+234 805 987 6543",
    startDate: "2024-01-15",
    endDate: "2024-10-15",
    issuedDate: "2024-10-20",
    certificateNumber: "NYSC/CERT/2024/001235",
    status: "completed",
  },
  {
    id: "3",
    callUpNumber: "NYSC/KN/2024/001236",
    fullName: "Ahmed Ibrahim",
    email: "ahmed.ibrahim@example.com",
    phoneNumber: "+234 807 555 6677",
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    issuedDate: "",
    certificateNumber: "",
    status: "in-progress",
  },
  {
    id: "4",
    callUpNumber: "NYSC/EN/2024/001237",
    fullName: "Blessing Okonkwo",
    email: "blessing.okonkwo@example.com",
    phoneNumber: "+234 809 445 5667",
    startDate: "2024-01-15",
    endDate: "2024-10-15",
    issuedDate: "2024-10-20",
    certificateNumber: "NYSC/CERT/2024/001237",
    status: "completed",
  },
];

export default function NYSCCertificatePage() {
  const router = useRouter();
  const [selectedCorpMember, setSelectedCorpMember] = useState<CorpMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Editable form fields
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [callUpNumber, setCallUpNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");

  const filteredMembers = sampleCorpMembers.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.callUpNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCorpMember = (member: CorpMember) => {
    setSelectedCorpMember(member);
    // Populate all form fields with corp member data
    setEmail(member.email);
    setPhoneNumber(member.phoneNumber || "");
    setFullName(member.fullName);
    setCallUpNumber(member.callUpNumber);
    setStartDate(member.startDate);
    setEndDate(member.endDate);
    setIssuedDate(member.issuedDate);
    setCertificateNumber(member.certificateNumber);
  };

  const handleIssueCertificate = () => {
    if (!selectedCorpMember || !email || !phoneNumber) return;

    // Prepare data to pass to issuing page (using form state)
    const data = {
      // Communication fields
      email,
      phoneNumber,
      // Certificate attributes
      fullName,
      callUpNumber,
      startDate,
      endDate,
      issuedDate,
      certificateNumber,
    };

    // Navigate to issuing page with data
    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(`/nysc/certificate/issuing?data=${encodedData}`);
  };

  const isFormValid =
    selectedCorpMember &&
    email &&
    phoneNumber &&
    email.includes("@") &&
    fullName &&
    callUpNumber &&
    startDate &&
    endDate &&
    issuedDate &&
    certificateNumber;

  // Determine current step
  const getCurrentStep = () => {
    if (selectedCorpMember) return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl shadow-lg p-4 sm:p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-5xl">🎓</div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1">
                You are: NYSC Administrator
              </h2>
              <p className="text-purple-100 text-sm sm:text-base">
                Goal: Issue Certificate of National Service to corps members who completed their service year
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium">Phase 4</span>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/nysc")}
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to NYSC Journey
        </button>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className={`flex items-center ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                      {currentStep > 1 ? '✓' : '1'}
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">Select Corps Member</span>
                  </div>
                  <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                      {currentStep > 2 ? '✓' : '2'}
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">Review & Edit</span>
                  </div>
                  <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                      {currentStep >= 3 ? '✓' : '3'}
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">Issue Certificate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">
                {currentStep === 1 && "Step 1: Select Corps Member"}
                {currentStep === 2 && "Step 2: Review & Edit Information"}
              </h2>
              <p className="text-purple-100 mt-1">
                {currentStep === 1 && "Choose a corps member who has completed their service year"}
                {currentStep === 2 && "Review and edit corps member information before issuing the certificate"}
              </p>
            </div>

            <div className="p-6">
              {/* Search Section */}
              <div className="mb-6">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search Corps Members
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or call-up number..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Corps Members List */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Select Corps Member
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => member.status === "completed" ? handleSelectCorpMember(member) : null}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        member.status === "completed"
                          ? selectedCorpMember?.id === member.id
                            ? "border-purple-500 bg-purple-50 cursor-pointer"
                            : "border-gray-200 hover:border-purple-300 hover:bg-gray-50 cursor-pointer"
                          : "border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {member.fullName}
                            </h4>
                            {member.status === "completed" ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                ✓ Completed
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                In Progress
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Call-up:</span>{" "}
                              {member.callUpNumber}
                            </div>
                            <div>
                              <span className="font-medium">Service Period:</span>{" "}
                              {member.startDate} to {member.endDate}
                            </div>
                            {member.certificateNumber && (
                              <div className="col-span-2">
                                <span className="font-medium">Certificate No:</span>{" "}
                                {member.certificateNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedCorpMember?.id === member.id && (
                          <div className="ml-4 text-purple-500">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Corps Member Details */}
              {selectedCorpMember && (
                <>
                  <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">
                      Certificate Details
                    </h3>
                    <p className="text-sm text-purple-700 mb-4">
                      Review and edit the corps member information as needed before issuing the certificate
                    </p>
                    <div className="bg-white rounded-lg p-6 border border-purple-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                            <Tooltip text="The corps member's complete legal name as it appears on official documents." />
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Call-up Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Call-up Number <span className="text-red-500">*</span>
                            <Tooltip text="Unique NYSC call-up number assigned during registration." />
                          </label>
                          <input
                            type="text"
                            value={callUpNumber}
                            onChange={(e) => setCallUpNumber(e.target.value)}
                            placeholder="NYSC/XX/2024/XXXXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Start Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date <span className="text-red-500">*</span>
                            <Tooltip text="The date the corps member started their NYSC service year." />
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date <span className="text-red-500">*</span>
                            <Tooltip text="The date the corps member completed their NYSC service year." />
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Issued Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issued Date <span className="text-red-500">*</span>
                            <Tooltip text="The date the NYSC Certificate is being issued." />
                          </label>
                          <input
                            type="date"
                            value={issuedDate}
                            onChange={(e) => setIssuedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Certificate Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificate Number <span className="text-red-500">*</span>
                            <Tooltip text="Unique NYSC Certificate number assigned to this certificate." />
                          </label>
                          <input
                            type="text"
                            value={certificateNumber}
                            onChange={(e) => setCertificateNumber(e.target.value)}
                            placeholder="NYSC/CERT/2024/XXXXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Form */}
                  <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Contact Information
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      The certificate will be sent to the email address below, and an SMS notification will be sent to the phone number.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email Address <span className="text-red-500">*</span>
                          <Tooltip text="The certificate credential will be sent to this email as a QR code." />
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="corpmember@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        {email && !email.includes("@") && (
                          <p className="mt-1 text-sm text-red-600">
                            Please enter a valid email address
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Phone Number <span className="text-red-500">*</span>
                          <Tooltip text="An SMS notification will be sent to this number." />
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+234 800 000 0000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                        {phoneNumber && phoneNumber.length < 10 && (
                          <p className="mt-1 text-sm text-red-600">
                            Please enter a valid phone number
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Information Box */}
              {selectedCorpMember && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-yellow-600 text-xl">
                      ℹ️
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">
                        What happens next?
                      </h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>
                          • A verifiable NYSC Certificate credential will be created
                        </li>
                        <li>
                          • An email will be sent to{" "}
                          <span className="font-semibold">{email || "the email address"}</span>{" "}
                          with a QR code
                        </li>
                        <li>
                          • An SMS notification will be sent to{" "}
                          <span className="font-semibold">{phoneNumber || "the phone number"}</span>
                        </li>
                        <li>
                          • The corps member can scan the QR code with the Confirmd App
                          to accept the certificate
                        </li>
                        <li>
                          • Once accepted, the certificate will be stored in their
                          digital wallet
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                {selectedCorpMember && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 border border-purple-300 rounded-lg text-purple-600 font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Start Over
                  </button>
                )}
                <button
                  onClick={handleIssueCertificate}
                  disabled={!isFormValid}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    !isFormValid
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  Issue NYSC Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
