"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  fullName: string;
  email: string;
  studentId: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  university: string;
  programme: string;
};

const sampleStudents: Student[] = [
  {
    id: "1",
    fullName: "Adewale Johnson",
    email: "adewale.johnson@university.edu.ng",
    studentId: "UNI/CSC/21/0234",
    dateOfBirth: "2003-05-15",
    gender: "Male",
    phoneNumber: "+234 803 456 7890",
    university: "University of Lagos",
    programme: "B.Sc. Computer Science",
  },
  {
    id: "2",
    fullName: "Chidinma Okafor",
    email: "chidinma.okafor@university.edu.ng",
    studentId: "UNI/MED/21/0456",
    dateOfBirth: "2002-11-22",
    gender: "Female",
    phoneNumber: "+234 805 678 9012",
    university: "University of Lagos",
    programme: "MBBS Medicine and Surgery",
  },
  {
    id: "3",
    fullName: "Ibrahim Mohammed",
    email: "ibrahim.mohammed@university.edu.ng",
    studentId: "UNI/ENG/21/0789",
    dateOfBirth: "2003-02-08",
    gender: "Male",
    phoneNumber: "+234 806 789 0123",
    university: "University of Lagos",
    programme: "B.Eng. Electrical Engineering",
  },
  {
    id: "4",
    fullName: "Blessing Nwankwo",
    email: "blessing.nwankwo@university.edu.ng",
    studentId: "UNI/LAW/21/0567",
    dateOfBirth: "2003-08-30",
    gender: "Female",
    phoneNumber: "+234 807 890 1234",
    university: "University of Lagos",
    programme: "LL.B. Law",
  },
];

export default function IssueMedicalFitnessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    studentId: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    phoneNumber: "",
    university: "",
    programme: "",
    // Medical examination details
    examinationDate: new Date().toISOString().split("T")[0],
    bloodPressure: "120/80",
    height: "170",
    weight: "65",
    bloodGroup: "O+",
    genotype: "AA",
    fitnessDeclaration: "Fit for National Service",
    medicalConditions: "None",
    // Medical center details
    centerName: "University Health Services Center",
    doctorName: "Dr. Oluwaseun Adebayo",
    medicalLicense: "MDCN/2015/12345",
    centerLocation: "Lagos, Nigeria",
    centerRegistration: "HC/LAG/2010/001",
    // Certificate details
    certificateNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    validityPeriod: "12 months",
  });

  const filteredStudents = sampleStudents.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      ...formData,
      fullName: student.fullName,
      studentId: student.studentId,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      email: student.email,
      phoneNumber: student.phoneNumber,
      university: student.university,
      programme: student.programme,
    });
    setCurrentStep(2);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Split full name into surname and othernames
    const nameParts = formData.fullName.trim().split(" ");
    const surname = nameParts[0];
    const othernames = nameParts.slice(1).join(" ") || surname;

    // Generate unique certificate number and dates
    const issuerReferenceNumber = `MFC/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;
    const issuedDate = formData.issueDate;
    const expiryDate = new Date(new Date(issuedDate).setMonth(new Date(issuedDate).getMonth() + parseInt(formData.validityPeriod)));

    // Map form data to API expected fields
    const dataToSubmit = {
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      surname: surname,
      othernames: othernames,
      nationalIdNumber: formData.studentId, // Using student ID as national ID for demo
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      examinationDate: formData.examinationDate,
      bloodPressure: formData.bloodPressure,
      bloodGroup: formData.bloodGroup,
      genotype: formData.genotype,
      fitnessDeclaration: formData.fitnessDeclaration,
      otherFitnessInfo: formData.medicalConditions,
      issuerReferenceNumber: issuerReferenceNumber,
      issuedDate: issuedDate,
      expiryDate: expiryDate.toISOString().split("T")[0],
    };

    // Navigate to issuing page with form data
    const queryString = encodeURIComponent(JSON.stringify(dataToSubmit));
    router.push(`/medical/fitness/issuing?data=${queryString}`);
  };

  const renderTooltip = (fieldName: string, text: string) => (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        className="text-teal-500 hover:text-teal-600 transition-colors"
        onMouseEnter={() => setShowTooltip(fieldName)}
        onMouseLeave={() => setShowTooltip(null)}
        onClick={(e) => {
          e.preventDefault();
          setShowTooltip(showTooltip === fieldName ? null : fieldName);
        }}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {showTooltip === fieldName && (
        <div className="absolute z-10 w-64 p-3 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-2 left-6">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-4"></div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Role Banner */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg p-4 sm:p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-4xl sm:text-5xl">🏥</div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold mb-1">
                    Issue Medical Fitness Certificate
                  </h2>
                  <p className="text-teal-100 text-sm sm:text-base">
                    Select a student and enter their medical examination details
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs sm:text-sm font-medium">Demo Active</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 1
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > 1 ? "✓" : "1"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Select Student</p>
                  <p className="text-sm text-gray-500">Choose from sample students</p>
                </div>
              </div>
              <div className="hidden sm:block flex-1 h-1 bg-gray-200 mx-4">
                <div
                  className={`h-full transition-all ${
                    currentStep >= 2 ? "bg-teal-600" : "bg-gray-200"
                  }`}
                  style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                ></div>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 2
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > 2 ? "✓" : "2"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Enter Details</p>
                  <p className="text-sm text-gray-500">Medical examination data</p>
                </div>
              </div>
              <div className="hidden sm:block flex-1 h-1 bg-gray-200 mx-4">
                <div
                  className={`h-full transition-all ${
                    currentStep >= 3 ? "bg-teal-600" : "bg-gray-200"
                  }`}
                  style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                ></div>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= 3
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Issue Certificate</p>
                  <p className="text-sm text-gray-500">Send to student</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Select Student */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Select a Student for Medical Clearance
              </h3>

              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by name, student ID, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Student List */}
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleStudentSelect(student)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {student.fullName}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Student ID:</span>{" "}
                            {student.studentId}
                          </p>
                          <p>
                            <span className="font-medium">DOB:</span>{" "}
                            {student.dateOfBirth}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span>{" "}
                            {student.email}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span>{" "}
                            {student.phoneNumber}
                          </p>
                          <p className="sm:col-span-2">
                            <span className="font-medium">Programme:</span>{" "}
                            {student.programme}
                          </p>
                        </div>
                      </div>
                      <button className="ml-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No students found matching your search.
                </div>
              )}
            </div>
          )}

          {/* Step 2: Enter Medical Details */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Medical Examination Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    ← Change Student
                  </button>
                </div>

                {/* Student Identity Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">👤</span>
                    Student Identity
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                        {renderTooltip("fullName", "Student's full legal name as appears on official documents")}
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID
                        {renderTooltip("studentId", "Unique student identification number")}
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Examination Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🩺</span>
                    Medical Examination Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Examination Date
                        {renderTooltip("examinationDate", "Date when the medical examination was conducted")}
                      </label>
                      <input
                        type="date"
                        name="examinationDate"
                        value={formData.examinationDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Pressure (mmHg)
                        {renderTooltip("bloodPressure", "Format: Systolic/Diastolic (e.g., 120/80)")}
                      </label>
                      <input
                        type="text"
                        name="bloodPressure"
                        value={formData.bloodPressure}
                        onChange={handleInputChange}
                        placeholder="120/80"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Genotype
                      </label>
                      <select
                        name="genotype"
                        value={formData.genotype}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="AA">AA</option>
                        <option value="AS">AS</option>
                        <option value="AC">AC</option>
                        <option value="SS">SS</option>
                        <option value="SC">SC</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fitness Declaration
                        {renderTooltip("fitnessDeclaration", "Medical professional's assessment of fitness for national service")}
                      </label>
                      <select
                        name="fitnessDeclaration"
                        value={formData.fitnessDeclaration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="Fit for National Service">Fit for National Service</option>
                        <option value="Fit with Minor Restrictions">Fit with Minor Restrictions</option>
                        <option value="Temporarily Unfit">Temporarily Unfit</option>
                        <option value="Permanently Unfit">Permanently Unfit</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Conditions / Remarks
                        {renderTooltip("medicalConditions", "Any relevant medical conditions or additional remarks")}
                      </label>
                      <textarea
                        name="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter any relevant medical conditions or write 'None'"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Center Details Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🏥</span>
                    Medical Center Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical Center Name
                      </label>
                      <input
                        type="text"
                        name="centerName"
                        value={formData.centerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Examining Doctor Name
                      </label>
                      <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medical License Number
                        {renderTooltip("medicalLicense", "Doctor's MDCN registration number")}
                      </label>
                      <input
                        type="text"
                        name="medicalLicense"
                        value={formData.medicalLicense}
                        onChange={handleInputChange}
                        placeholder="MDCN/YYYY/XXXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Center Location
                      </label>
                      <input
                        type="text"
                        name="centerLocation"
                        value={formData.centerLocation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Center Registration Number
                        {renderTooltip("centerRegistration", "Health facility registration number")}
                      </label>
                      <input
                        type="text"
                        name="centerRegistration"
                        value={formData.centerRegistration}
                        onChange={handleInputChange}
                        placeholder="HC/XXX/YYYY/XXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validity Period
                      </label>
                      <select
                        name="validityPeriod"
                        value={formData.validityPeriod}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="6 months">6 months</option>
                        <option value="12 months">12 months</option>
                        <option value="24 months">24 months</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Review and Submit */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                  <h4 className="font-semibold text-teal-900 mb-3 flex items-center gap-2">
                    <span>📋</span> Review and Submit
                  </h4>
                  <p className="text-sm text-teal-800 mb-4">
                    Please review all the details above. Once submitted, a Medical Fitness Certificate will be issued and sent to the student via email and SMS.
                  </p>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-md"
                    >
                      Issue Medical Fitness Certificate →
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/medical/fitness")}
                      className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
