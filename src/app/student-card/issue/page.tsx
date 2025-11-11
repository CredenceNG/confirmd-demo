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
        className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

// Sample student data from SIS
const sampleStudents = [
  {
    id: "1",
    fullName: "Adewale Johnson",
    email: "adewale.johnson@university.edu.ng",
    admissionNumber: "ADM/2021/0234",
    matricNumber: "UNI/CSC/21/0234",
    department: "Computer Science",
    faculty: "Science",
    programme: "B.Sc. Computer Science",
    yearOfGraduation: "2025",
    level: "400 Level",
    nationalIdNumber: "12345678901",
    bvn: "22334455667",
    jambNumber: "12121212AA",
    schoolNucNumber: "NUC/001/2024",
    schoolName: "University of Lagos",
    dateOfBirth: "2001-05-15",
    gender: "M",
  },
  {
    id: "2",
    fullName: "Chioma Okafor",
    email: "chioma.okafor@university.edu.ng",
    admissionNumber: "ADM/2020/1156",
    matricNumber: "UNI/ENG/20/1156",
    department: "Electrical Engineering",
    faculty: "Engineering",
    programme: "B.Eng. Electrical Engineering",
    yearOfGraduation: "2025",
    level: "500 Level",
    nationalIdNumber: "98765432109",
    bvn: "77665544332",
    jambNumber: "98989898BB",
    schoolNucNumber: "NUC/001/2024",
    schoolName: "University of Lagos",
    dateOfBirth: "2000-08-22",
    gender: "F",
  },
  {
    id: "3",
    fullName: "Ibrahim Musa",
    email: "ibrahim.musa@university.edu.ng",
    admissionNumber: "ADM/2022/0789",
    matricNumber: "UNI/MED/22/0789",
    department: "Medicine and Surgery",
    faculty: "Medicine",
    programme: "MBBS",
    yearOfGraduation: "2028",
    level: "200 Level",
    nationalIdNumber: "55667788990",
    bvn: "11223344556",
    jambNumber: "45454545CC",
    schoolNucNumber: "NUC/001/2024",
    schoolName: "University of Lagos",
    dateOfBirth: "2003-03-10",
    gender: "M",
  },
  {
    id: "4",
    fullName: "Grace Eze",
    email: "grace.eze@university.edu.ng",
    admissionNumber: "ADM/2021/0445",
    matricNumber: "UNI/LAW/21/0445",
    department: "Law",
    faculty: "Law",
    programme: "LL.B. Law",
    yearOfGraduation: "2026",
    level: "400 Level",
    nationalIdNumber: "44556677889",
    bvn: "99887766554",
    jambNumber: "78787878DD",
    schoolNucNumber: "NUC/001/2024",
    schoolName: "University of Lagos",
    dateOfBirth: "2001-11-30",
    gender: "F",
  },
];

export default function IssueStudentCardPage() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<typeof sampleStudents[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Editable form fields
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [programme, setProgramme] = useState("");
  const [yearOfGraduation, setYearOfGraduation] = useState("");
  const [level, setLevel] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [bvn, setBvn] = useState("");
  const [jambNumber, setJambNumber] = useState("");
  const [schoolNucNumber, setSchoolNucNumber] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const filteredStudents = sampleStudents.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectStudent = (student: typeof sampleStudents[0]) => {
    setSelectedStudent(student);
    // Populate all form fields with student data
    setEmail(student.email);
    setPhoneNumber(""); // Phone number not in sample data, so leave empty for operator to fill
    setFullName(student.fullName);
    setAdmissionNumber(student.admissionNumber);
    setMatricNumber(student.matricNumber);
    setDepartment(student.department);
    setFaculty(student.faculty);
    setProgramme(student.programme);
    setYearOfGraduation(student.yearOfGraduation);
    setLevel(student.level);
    setDateOfBirth(student.dateOfBirth);
    setGender(student.gender);
    setNationalIdNumber(student.nationalIdNumber);
    setBvn(student.bvn);
    setJambNumber(student.jambNumber);
    setSchoolNucNumber(student.schoolNucNumber);
    setSchoolName(student.schoolName);
  };

  const handleIssueCredential = () => {
    if (!selectedStudent || !email || !phoneNumber) return;

    // Prepare data to pass to issuing page (using form state instead of selectedStudent)
    const data = {
      email,
      phoneNumber,
      fullName,
      admissionNumber,
      matricNumber,
      department,
      faculty,
      programme,
      yearOfGraduation,
      level,
      dateOfBirth,
      gender,
      nationalIdNumber,
      bvn,
      jambNumber,
      schoolNucNumber,
      schoolName,
    };

    // Navigate to issuing page with data
    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(`/student-card/issuing?data=${encodedData}`);
  };

  const isFormValid = selectedStudent && email && phoneNumber && email.includes("@");

  // Determine current step
  const getCurrentStep = () => {
    if (isSuccess) return 3;
    if (selectedStudent) return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      {currentStep > 1 ? '✓' : '1'}
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">Select Student</span>
                  </div>
                  <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      {currentStep > 2 ? '✓' : '2'}
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">Review & Edit</span>
                  </div>
                  <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  <div className={`flex items-center ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                      {currentStep >= 3 ? '✓' : '3'}
                    </div>
                    <span className="ml-3 font-medium hidden sm:block">Issue Credential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">
                {currentStep === 1 && "Step 1: Select Student"}
                {currentStep === 2 && "Step 2: Review & Edit Information"}
                {currentStep === 3 && "Step 3: Credential Issued Successfully"}
              </h2>
              <p className="text-blue-100 mt-1">
                {currentStep === 1 && "Choose a student from your Student Information System"}
                {currentStep === 2 && "Review and edit student information before issuing the credential"}
                {currentStep === 3 && "Digital student card credential has been sent"}
              </p>
            </div>

            <div className="p-6">
              {!isSuccess ? (
                <>
                  {/* Search Section */}
                  <div className="mb-6">
                    <label
                      htmlFor="search"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Search Students
                    </label>
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, matric number, or admission number..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Students List */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Select Student
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedStudent?.id === student.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {student.fullName}
                              </h4>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Matric:</span>{" "}
                                  {student.matricNumber}
                                </div>
                                <div>
                                  <span className="font-medium">Admission:</span>{" "}
                                  {student.admissionNumber}
                                </div>
                                <div>
                                  <span className="font-medium">Department:</span>{" "}
                                  {student.department}
                                </div>
                                <div>
                                  <span className="font-medium">Level:</span>{" "}
                                  {student.level}
                                </div>
                              </div>
                            </div>
                            {selectedStudent?.id === student.id && (
                              <div className="ml-4 text-blue-500">
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

                  {/* Selected Student Details */}
                  {selectedStudent && (
                    <>
                      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">
                          Student Credential Details
                        </h3>
                        <p className="text-sm text-blue-700 mb-4">
                          Review and edit the student information as needed before issuing the credential
                        </p>
                        <div className="bg-white rounded-lg p-6 border border-blue-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                                <Tooltip text="The student's complete legal name as it appears on official documents. This will be included in the verifiable credential." />
                              </label>
                              <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Admission Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admission Number
                                <Tooltip text="The unique identifier assigned when the student was admitted to the university. Used for administrative purposes and verification." />
                              </label>
                              <input
                                type="text"
                                value={admissionNumber}
                                onChange={(e) => setAdmissionNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Matriculation Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Matriculation Number
                                <Tooltip text="Also called 'matric number' - a permanent student ID assigned after matriculation. Often includes department code and year (e.g., UNI/CSC/21/0234)." />
                              </label>
                              <input
                                type="text"
                                value={matricNumber}
                                onChange={(e) => setMatricNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Department */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Department
                                <Tooltip text="The academic department where the student is enrolled (e.g., Computer Science, Engineering). This appears on the credential and can be verified." />
                              </label>
                              <input
                                type="text"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Faculty */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Faculty
                              </label>
                              <input
                                type="text"
                                value={faculty}
                                onChange={(e) => setFaculty(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Programme */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Programme
                              </label>
                              <input
                                type="text"
                                value={programme}
                                onChange={(e) => setProgramme(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Current Level */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Level
                              </label>
                              <input
                                type="text"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Expected Year of Graduation */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Year of Graduation
                                <Tooltip text="The year the student is expected to complete their programme. Important for verifying current student status and loan eligibility periods." />
                              </label>
                              <input
                                type="text"
                                value={yearOfGraduation}
                                onChange={(e) => setYearOfGraduation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Date of Birth */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Gender */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
                              </label>
                              <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select Gender</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                              </select>
                            </div>

                            {/* National ID Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                National ID Number (Required for NYSC)
                                <Tooltip text="Government-issued national identification number (NIN). Links the student's credential to their official government identity. REQUIRED for NYSC registration." />
                              </label>
                              <input
                                type="text"
                                value={nationalIdNumber}
                                onChange={(e) => setNationalIdNumber(e.target.value)}
                                placeholder="Enter 11-digit NIN"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {!nationalIdNumber && (
                                <p className="mt-1 text-sm text-amber-600">
                                  ⚠️ National ID Number is required for NYSC registration
                                </p>
                              )}
                            </div>

                            {/* BVN */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Verification Number (BVN)
                                <Tooltip text="An 11-digit unique identifier for banking in Nigeria. Links the student's identity across financial institutions. Used for loan disbursement verification." />
                              </label>
                              <input
                                type="text"
                                value={bvn}
                                onChange={(e) => setBvn(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* JAMB Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                JAMB Number
                                <Tooltip text="Joint Admissions and Matriculation Board registration number from the university entrance exam. Links student to their pre-admission records." />
                              </label>
                              <input
                                type="text"
                                value={jambNumber}
                                onChange={(e) => setJambNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* School NUC Number */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                School NUC Number
                                <Tooltip text="National Universities Commission registration number for the institution. Verifies the university is officially accredited in Nigeria." />
                              </label>
                              <input
                                type="text"
                                value={schoolNucNumber}
                                onChange={(e) => setSchoolNucNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* School Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                School Name
                              </label>
                              <input
                                type="text"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          The credential will be sent to the email address below, and an SMS notification will be sent to the phone number.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Email Address <span className="text-red-500">*</span>
                              <Tooltip text="The credential will be sent to this email as a QR code. The student scans it with their wallet app to accept and store the credential." />
                            </label>
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="student@university.edu.ng"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                              <Tooltip text="An SMS notification will be sent to this number alerting the student that a credential has been issued to their email." />
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+234 800 000 0000"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  {selectedStudent && (
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
                              • A verifiable credential will be created with the
                              student's information
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
                              • The student can scan the QR code with the ConfirmD App
                              to accept the credential
                            </li>
                            <li>
                              • Once accepted, the credential will be stored in the
                              student's digital wallet
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
                    {selectedStudent && (
                      <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 border border-blue-300 rounded-lg text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Start Over
                      </button>
                    )}
                    <button
                      onClick={handleIssueCredential}
                      disabled={!isFormValid || isIssuing}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                        !isFormValid || isIssuing
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isIssuing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
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
                          Issuing Credential...
                        </span>
                      ) : (
                        "Issue Student Card Credential"
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Success Message */
                <div className="py-12 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-green-600"
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Credential Issued Successfully!
                    </h2>
                    <p className="text-gray-600 mb-4">
                      An email with a QR code has been sent to{" "}
                      <span className="font-semibold">{email}</span>
                      <br />
                      An SMS notification has been sent to{" "}
                      <span className="font-semibold">{phoneNumber}</span>
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-green-800">
                        {selectedStudent?.fullName} can now scan the QR code with the
                        ConfirmD App to accept and store the student card credential
                        in their digital wallet.
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Redirecting to home page...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
