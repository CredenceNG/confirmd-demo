"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function IssueCertificationPage() {
  const router = useRouter();

  // Sample certificate holders for demo
  const sampleHolders = [
    {
      id: "1",
      title: "Mr.",
      surname: "Adeyemi",
      othernames: "Babatunde Oluwaseun",
      email: "b.adeyemi@example.com",
      certificationTitle: "Certified Data Analyst Professional",
      trainingOrganization: "Data Science Academy Nigeria",
      courseCode: "DSA-2024-001",
      completionDate: "2024-10-15",
      issueDate: "2024-10-20",
      expiryDate: "2027-10-20",
      grade: "Distinction",
      credentialNumber: "DSA/2024/00145",
      skills: "Python, SQL, Data Visualization, Machine Learning",
    },
    {
      id: "2",
      title: "Mrs.",
      surname: "Okafor",
      othernames: "Chioma Grace",
      email: "c.okafor@example.com",
      certificationTitle: "Advanced Project Management Professional",
      trainingOrganization: "Lagos Business School",
      courseCode: "LBS-PM-2024-056",
      completionDate: "2024-09-28",
      issueDate: "2024-10-01",
      expiryDate: "2029-10-01",
      grade: "Excellent",
      credentialNumber: "LBS/2024/00892",
      skills: "Agile, Scrum, Risk Management, Stakeholder Management",
    },
    {
      id: "3",
      title: "Engr.",
      surname: "Ibrahim",
      othernames: "Mohammed Sani",
      email: "m.ibrahim@example.com",
      certificationTitle: "Certified Cloud Solutions Architect",
      trainingOrganization: "TechHub Academy Abuja",
      courseCode: "THA-CSA-2024-023",
      completionDate: "2024-08-30",
      issueDate: "2024-09-05",
      expiryDate: "2027-09-05",
      grade: "Distinction",
      credentialNumber: "THA/2024/00234",
      skills: "AWS, Azure, Cloud Security, Infrastructure as Code",
    },
    {
      id: "4",
      title: "Miss",
      surname: "Eze",
      othernames: "Ngozi Faith",
      email: "n.eze@example.com",
      certificationTitle: "Digital Marketing Specialist Certification",
      trainingOrganization: "Enugu Digital Marketing Institute",
      courseCode: "EDMI-DMS-2024-089",
      completionDate: "2024-11-10",
      issueDate: "2024-11-15",
      expiryDate: "2026-11-15",
      grade: "Very Good",
      credentialNumber: "EDMI/2024/00567",
      skills: "SEO, Social Media Marketing, Content Strategy, Analytics",
    },
    {
      id: "5",
      title: "Dr.",
      surname: "Williams",
      othernames: "Tunde Michael",
      email: "t.williams@example.com",
      certificationTitle: "Certified Cybersecurity Professional",
      trainingOrganization: "Port Harcourt Cybersecurity Institute",
      courseCode: "PHCI-CSP-2024-012",
      completionDate: "2024-07-20",
      issueDate: "2024-07-25",
      expiryDate: "2027-07-25",
      grade: "Distinction",
      credentialNumber: "PHCI/2024/00089",
      skills: "Network Security, Penetration Testing, SIEM, Incident Response",
    },
  ];

  const [holders, setHolders] = useState(sampleHolders);
  const [selectedHolder, setSelectedHolder] = useState<typeof sampleHolders[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [surname, setSurname] = useState("");
  const [othernames, setOthernames] = useState("");
  const [certificationTitle, setCertificationTitle] = useState("");
  const [trainingOrganization, setTrainingOrganization] = useState("");
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
    setTitle(holder.title);
    setSurname(holder.surname);
    setOthernames(holder.othernames);
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
      title,
      surname,
      othernames,
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
      title,
      surname,
      othernames,
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
    const fullName = `${holder.title || ""} ${holder.othernames || ""} ${holder.surname || ""}`;
    const query = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(query) ||
      (holder.surname || "").toLowerCase().includes(query) ||
      (holder.othernames || "").toLowerCase().includes(query) ||
      (holder.credentialNumber || "").toLowerCase().includes(query) ||
      (holder.certificationTitle || "").toLowerCase().includes(query) ||
      (holder.email || "").toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🎓</span>
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                      Issue Training Certification
                    </h1>
                  </div>
                  <p className="text-indigo-100">
                    Issue verifiable professional certifications to course graduates
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
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Certificate Holder Selection */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👤</span>
                  Select Certificate Holder
                </h2>

                {/* Add New Button */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setSelectedHolder(null);
                      // Clear form
                      setEmail("");
                      setTitle("");
                      setSurname("");
                      setOthernames("");
                      setCertificationTitle("");
                      setTrainingOrganization("");
                      setCourseCode("");
                      setCompletionDate("");
                      setIssueDate("");
                      setExpiryDate("");
                      setGrade("");
                      setCredentialNumber("");
                      setSkills("");
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New Candidate
                    </div>
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search certificate holders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Certificate Holders List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredHolders.map((holder) => (
                    <button
                      key={holder.id}
                      onClick={() => handleSelectHolder(holder)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedHolder?.id === holder.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">
                        {holder.title} {holder.othernames} {holder.surname}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{holder.certificationTitle}</p>
                      <p className="text-xs text-purple-600 mt-1">{holder.credentialNumber}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Certification Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📜</span>
                  Certification Details
                </h2>

                {!selectedHolder && !showAddForm ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎓</div>
                    <p className="text-gray-500">Select a certificate holder or add a new candidate to begin issuing certification</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Personal Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <select
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Title</option>
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Miss">Miss</option>
                            <option value="Ms.">Ms.</option>
                            <option value="Dr.">Dr.</option>
                            <option value="Prof.">Prof.</option>
                            <option value="Engr.">Engr.</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Surname
                          </label>
                          <input
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Certification Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Certification Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certification Title
                          </label>
                          <input
                            type="text"
                            value={certificationTitle}
                            onChange={(e) => setCertificationTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Training Organization
                          </label>
                          <input
                            type="text"
                            value={trainingOrganization}
                            onChange={(e) => setTrainingOrganization(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Credential Number
                          </label>
                          <input
                            type="text"
                            value={credentialNumber}
                            onChange={(e) => setCredentialNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grade
                          </label>
                          <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Grade</option>
                            <option value="Distinction">Distinction</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Very Good">Very Good</option>
                            <option value="Good">Good</option>
                            <option value="Pass">Pass</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skills Acquired
                          </label>
                          <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g., Python, SQL, Data Visualization"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dates Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Dates Information
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Completion Date
                          </label>
                          <input
                            type="date"
                            value={completionDate}
                            onChange={(e) => setCompletionDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
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
                              Add Candidate
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
                          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center gap-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Issue Certification
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
