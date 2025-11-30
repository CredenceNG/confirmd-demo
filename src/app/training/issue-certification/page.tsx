"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function IssueCertificationPage() {
  const router = useRouter();

  // Sample certificate holders - offshore workers completing mandatory safety training
  const sampleHolders = [
    {
      id: "1",
      surname: "Okonkwo",
      othernames: "Chukwuemeka Daniel",
      nationalIdNumber: "12345678901",
      email: "c.okonkwo@atlanticenergy.ng",
      certificationTitle: "HUET - Helicopter Underwater Escape Training",
      trainingOrganization: "SafetyFirst Academy Nigeria",
      courseCode: "SFA-HUET-2024-0892",
      completionDate: "2024-11-28",
      issueDate: "2024-11-29",
      expiryDate: "2028-11-29",
      grade: "Competent",
      credentialNumber: "SFA/HUET/2024/00892",
      skills: "Underwater Escape, Emergency Breathing, Helicopter Egress, Sea Survival",
    },
    {
      id: "2",
      surname: "Adeyemi",
      othernames: "Oluwaseun Babatunde",
      nationalIdNumber: "23456789012",
      email: "o.adeyemi@shellnigeria.com",
      certificationTitle: "H2S Safety & Breathing Apparatus",
      trainingOrganization: "SafetyFirst Academy Nigeria",
      courseCode: "SFA-H2S-2024-0456",
      completionDate: "2024-11-25",
      issueDate: "2024-11-26",
      expiryDate: "2026-11-26",
      grade: "Competent",
      credentialNumber: "SFA/H2S/2024/00456",
      skills: "H2S Detection, SCBA Operation, Emergency Response, Gas Hazard Assessment",
    },
    {
      id: "3",
      surname: "Ibrahim",
      othernames: "Mohammed Sani",
      nationalIdNumber: "34567890123",
      email: "m.ibrahim@totalenergies.ng",
      certificationTitle: "Offshore Fire Fighting & Prevention",
      trainingOrganization: "SafetyFirst Academy Nigeria",
      courseCode: "SFA-FIRE-2024-0234",
      completionDate: "2024-11-20",
      issueDate: "2024-11-21",
      expiryDate: "2027-11-21",
      grade: "Distinction",
      credentialNumber: "SFA/FIRE/2024/00234",
      skills: "Fire Suppression, SCBA Use, Fire Prevention, Emergency Evacuation",
    },
    {
      id: "4",
      surname: "Eze",
      othernames: "Ngozi Blessing",
      nationalIdNumber: "45678901234",
      email: "n.eze@chevron.com",
      certificationTitle: "Basic Offshore Safety Induction & Emergency Training (BOSIET)",
      trainingOrganization: "SafetyFirst Academy Nigeria",
      courseCode: "SFA-BOSIET-2024-0567",
      completionDate: "2024-11-22",
      issueDate: "2024-11-23",
      expiryDate: "2028-11-23",
      grade: "Competent",
      credentialNumber: "SFA/BOSIET/2024/00567",
      skills: "Sea Survival, Helicopter Safety, Fire Fighting, First Aid, HUET",
    },
    {
      id: "5",
      surname: "Williams",
      othernames: "Tunde Michael",
      nationalIdNumber: "56789012345",
      email: "t.williams@exxonmobil.ng",
      certificationTitle: "Advanced First Aid & Medical Emergency Response",
      trainingOrganization: "SafetyFirst Academy Nigeria",
      courseCode: "SFA-AFAMER-2024-0789",
      completionDate: "2024-11-18",
      issueDate: "2024-11-19",
      expiryDate: "2026-11-19",
      grade: "Competent",
      credentialNumber: "SFA/AFAMER/2024/00789",
      skills: "CPR, AED Operation, Trauma Management, Medical Evacuation",
    },
    {
      id: "6",
      surname: "Bakare",
      othernames: "Adebayo Folarin",
      nationalIdNumber: "67890123456",
      email: "a.bakare@oando.com",
      certificationTitle: "Confined Space Entry & Rescue",
      trainingOrganization: "SafetyFirst Academy Nigeria",
      courseCode: "SFA-CSE-2024-0345",
      completionDate: "2024-11-15",
      issueDate: "2024-11-16",
      expiryDate: "2027-11-16",
      grade: "Competent",
      credentialNumber: "SFA/CSE/2024/00345",
      skills: "Gas Testing, Rescue Techniques, Ventilation, PPE Selection",
    },
  ];

  const [holders, setHolders] = useState(sampleHolders);
  const [selectedHolder, setSelectedHolder] = useState<typeof sampleHolders[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [surname, setSurname] = useState("");
  const [othernames, setOthernames] = useState("");
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [certificationTitle, setCertificationTitle] = useState("");
  const [trainingOrganization, setTrainingOrganization] = useState("SafetyFirst Academy Nigeria");
  const [courseCode, setCourseCode] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [grade, setGrade] = useState("");
  const [credentialNumber, setCredentialNumber] = useState("");
  const [skills, setSkills] = useState("");

  const handleSelectHolder = (holder: typeof sampleHolders[0]) => {
    setSelectedHolder(holder);
    setEmail(holder.email);
    setSurname(holder.surname);
    setOthernames(holder.othernames);
    setNationalIdNumber(holder.nationalIdNumber);
    setCertificationTitle(holder.certificationTitle);
    setTrainingOrganization(holder.trainingOrganization);
    setCourseCode(holder.courseCode);
    setCompletionDate(holder.completionDate);
    setIssueDate(holder.issueDate);
    setExpiryDate(holder.expiryDate);
    setGrade(holder.grade);
    setCredentialNumber(holder.credentialNumber);
    setSkills(holder.skills);
  };

  const handleAddNewCandidate = () => {
    const newCandidate = {
      id: `${holders.length + 1}`,
      surname,
      othernames,
      nationalIdNumber,
      email,
      certificationTitle,
      trainingOrganization,
      courseCode,
      completionDate,
      issueDate,
      expiryDate,
      grade,
      credentialNumber,
      skills,
    };

    setHolders([...holders, newCandidate]);
    setSelectedHolder(newCandidate);
    setShowAddForm(false);
  };

  const handleIssueCredential = () => {
    const formData = {
      email,
      surname,
      othernames,
      nationalIdNumber,
      certificationTitle,
      trainingOrganization,
      courseCode,
      completionDate,
      issueDate,
      expiryDate,
      grade,
      credentialNumber,
      skills,
    };

    router.push(`/training/issuing?data=${encodeURIComponent(JSON.stringify(formData))}`);
  };

  const filteredHolders = holders.filter((holder) => {
    const fullName = `${holder.othernames || ""} ${holder.surname || ""}`;
    const query = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(query) ||
      (holder.surname || "").toLowerCase().includes(query) ||
      (holder.othernames || "").toLowerCase().includes(query) ||
      (holder.nationalIdNumber || "").toLowerCase().includes(query) ||
      (holder.credentialNumber || "").toLowerCase().includes(query) ||
      (holder.certificationTitle || "").toLowerCase().includes(query) ||
      (holder.email || "").toLowerCase().includes(query)
    );
  });

  // Certification types for dropdown
  const certificationTypes = [
    "HUET - Helicopter Underwater Escape Training",
    "H2S Safety & Breathing Apparatus",
    "Offshore Fire Fighting & Prevention",
    "Basic Offshore Safety Induction & Emergency Training (BOSIET)",
    "Advanced First Aid & Medical Emergency Response",
    "Confined Space Entry & Rescue",
    "Working at Heights & Fall Protection",
    "Rigging & Lifting Operations",
    "Permit to Work System",
    "Personal Survival Techniques (PST)",
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 px-6 py-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🛡️</span>
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                      SafetyFirst Academy Nigeria
                    </h1>
                  </div>
                  <p className="text-orange-100">
                    NSITF-Accredited Safety Training Provider | Issue Verifiable Certifications
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

            {/* Story Context Banner */}
            <div className="bg-orange-50 border-b border-orange-200 px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📋</div>
                <div>
                  <h3 className="font-semibold text-orange-900">The Challenge</h3>
                  <p className="text-sm text-orange-800 mt-1">
                    Before DLT adoption, SafetyFirst Academy issued paper certificates that were easily forged.
                    Employers like Atlantic Energy Nigeria couldn't verify if workers' certifications were authentic,
                    leading to unqualified personnel being deployed to hazardous offshore sites.
                  </p>
                  <p className="text-sm text-orange-800 mt-2">
                    <strong>The Solution:</strong> SafetyFirst now issues cryptographically signed digital credentials
                    directly to workers' digital wallets. Each certification is tamper-proof, instantly verifiable,
                    and includes automatic expiry tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Certificate Holder Selection */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👷</span>
                  Workers Completing Training
                </h2>

                {/* Add New Button */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setSelectedHolder(null);
                      // Clear form
                      setEmail("");
                      setSurname("");
                      setOthernames("");
                      setNationalIdNumber("");
                      setCertificationTitle("");
                      setTrainingOrganization("SafetyFirst Academy Nigeria");
                      setCourseCode("");
                      setCompletionDate("");
                      setIssueDate("");
                      setExpiryDate("");
                      setGrade("");
                      setCredentialNumber("");
                      setSkills("");
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Register New Trainee
                    </div>
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search workers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Certificate Holders List */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredHolders.map((holder) => (
                    <button
                      key={holder.id}
                      onClick={() => handleSelectHolder(holder)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedHolder?.id === holder.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">
                        {holder.othernames} {holder.surname}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{holder.certificationTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {holder.grade}
                        </span>
                        <span className="text-xs text-gray-500">
                          Expires: {holder.expiryDate}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Today's Certifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{holders.length}</p>
                    <p className="text-xs text-green-700">Pending Issuance</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">47</p>
                    <p className="text-xs text-blue-700">Issued This Week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certification Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📜</span>
                  Safety Certification Details
                </h2>

                {!selectedHolder && !showAddForm ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛡️</div>
                    <p className="text-gray-500 mb-2">Select a worker who completed training</p>
                    <p className="text-sm text-gray-400">or register a new trainee to issue their certification</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                        <span className="text-orange-600">●</span>
                        Worker Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Surname
                          </label>
                          <input
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Other Names
                          </label>
                          <input
                            type="text"
                            value={othernames}
                            onChange={(e) => setOthernames(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            National ID Number (NIN)
                          </label>
                          <input
                            type="text"
                            value={nationalIdNumber}
                            onChange={(e) => setNationalIdNumber(e.target.value)}
                            placeholder="e.g., 12345678901"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Work Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Certification Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                        <span className="text-orange-600">●</span>
                        Safety Certification Details
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certification Type
                          </label>
                          <select
                            value={certificationTitle}
                            onChange={(e) => setCertificationTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">Select Certification Type</option>
                            {certificationTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Training Provider
                          </label>
                          <input
                            type="text"
                            value={trainingOrganization}
                            onChange={(e) => setTrainingOrganization(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-gray-50"
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Code
                          </label>
                          <input
                            type="text"
                            value={courseCode}
                            onChange={(e) => setCourseCode(e.target.value)}
                            placeholder="e.g., SFA-HUET-2024-0001"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificate Number
                          </label>
                          <input
                            type="text"
                            value={credentialNumber}
                            onChange={(e) => setCredentialNumber(e.target.value)}
                            placeholder="e.g., SFA/HUET/2024/00001"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assessment Result
                          </label>
                          <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">Select Result</option>
                            <option value="Distinction">Distinction</option>
                            <option value="Competent">Competent</option>
                            <option value="Not Yet Competent">Not Yet Competent</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Competencies Demonstrated
                          </label>
                          <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g., Underwater Escape, Emergency Breathing, Sea Survival"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dates Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center gap-2">
                        <span className="text-orange-600">●</span>
                        Validity Period
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Completion Date
                          </label>
                          <input
                            type="date"
                            value={completionDate}
                            onChange={(e) => setCompletionDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certification Issue Date
                          </label>
                          <input
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            HUET/BOSIET: 4 years | H2S/Fire Safety: 2-3 years
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-900">NSITF Compliance</p>
                          <p className="text-xs text-blue-800 mt-1">
                            This certification will be issued as a cryptographically signed verifiable credential
                            compliant with Nigeria Social Insurance Trust Fund (NSITF) requirements. The worker
                            will receive it in their digital wallet and can present it to any employer for
                            instant verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4">
                      {showAddForm ? (
                        <div className="flex gap-4">
                          <button
                            onClick={handleAddNewCandidate}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <div className="flex items-center justify-center gap-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Add Trainee
                            </div>
                          </button>
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleIssueCredential}
                          className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Issue Safety Certification
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
