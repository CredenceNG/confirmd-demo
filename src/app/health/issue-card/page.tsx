"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function IssueHealthCardPage() {
  const router = useRouter();

  // Sample patients for demo
  const samplePatients = [
    {
      id: "1",
      surname: "Okonkwo",
      othernames: "Chukwuemeka Emmanuel",
      dateOfBirth: "1985-06-15",
      gender: "M",
      email: "c.okonkwo@example.com",
      patientId: "UCH/2020/045678",
      healthInsuranceNumber: "NHIS-LAG-2020-045678",
      bloodType: "O+",
      genotype: "AA",
      allergies: "Penicillin",
      chronicConditions: "Hypertension",
      issuingHospital: "University College Hospital, Ibadan",
      issuedDate: "2020-03-15",
      expiryDate: "2027-03-15",
    },
    {
      id: "2",
      surname: "Ibrahim",
      othernames: "Fatima Aisha",
      dateOfBirth: "1978-11-22",
      gender: "F",
      email: "f.ibrahim@example.com",
      patientId: "LUTH/2018/032145",
      healthInsuranceNumber: "NHIS-LAG-2018-032145",
      bloodType: "A+",
      genotype: "AS",
      allergies: "None",
      chronicConditions: "Type 2 Diabetes",
      issuingHospital: "Lagos University Teaching Hospital",
      issuedDate: "2018-05-10",
      expiryDate: "2028-05-10",
    },
    {
      id: "3",
      surname: "Adeleke",
      othernames: "Oluwaseun Michael",
      dateOfBirth: "1992-03-08",
      gender: "M",
      email: "o.adeleke@example.com",
      patientId: "ABUTH/2021/056789",
      healthInsuranceNumber: "NHIS-ABJ-2021-056789",
      bloodType: "B+",
      genotype: "AA",
      allergies: "Sulfa drugs",
      chronicConditions: "None",
      issuingHospital: "Ahmadu Bello University Teaching Hospital",
      issuedDate: "2021-08-20",
      expiryDate: "2028-08-20",
    },
    {
      id: "4",
      surname: "Eze",
      othernames: "Chidinma Joy",
      dateOfBirth: "1995-09-30",
      gender: "F",
      email: "c.eze@example.com",
      patientId: "UNTH/2022/067890",
      healthInsuranceNumber: "NHIS-ENU-2022-067890",
      bloodType: "AB+",
      genotype: "AA",
      allergies: "Latex",
      chronicConditions: "Asthma",
      issuingHospital: "University of Nigeria Teaching Hospital",
      issuedDate: "2022-01-12",
      expiryDate: "2029-01-12",
    },
    {
      id: "5",
      surname: "Yusuf",
      othernames: "Abdullahi Musa",
      dateOfBirth: "1980-12-05",
      gender: "M",
      email: "a.yusuf@example.com",
      patientId: "AKTH/2019/023456",
      healthInsuranceNumber: "NHIS-KAN-2019-023456",
      bloodType: "O-",
      genotype: "AA",
      allergies: "Aspirin",
      chronicConditions: "None",
      issuingHospital: "Aminu Kano Teaching Hospital",
      issuedDate: "2019-07-25",
      expiryDate: "2026-07-25",
    },
  ];

  const [selectedPatient, setSelectedPatient] = useState<typeof samplePatients[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [surname, setSurname] = useState("");
  const [othernames, setOthernames] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [patientId, setPatientId] = useState("");
  const [healthInsuranceNumber, setHealthInsuranceNumber] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [genotype, setGenotype] = useState("");
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [issuingHospital, setIssuingHospital] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSelectPatient = (patient: typeof samplePatients[0]) => {
    setSelectedPatient(patient);
    setEmail(patient.email);
    setSurname(patient.surname);
    setOthernames(patient.othernames);
    setDateOfBirth(patient.dateOfBirth);
    setGender(patient.gender);
    setPatientId(patient.patientId);
    setHealthInsuranceNumber(patient.healthInsuranceNumber);
    setBloodType(patient.bloodType);
    setGenotype(patient.genotype);
    setAllergies(patient.allergies);
    setChronicConditions(patient.chronicConditions);
    setIssuingHospital(patient.issuingHospital);
    setIssuedDate(patient.issuedDate);
    setExpiryDate(patient.expiryDate);
  };

  const handleIssueCredential = () => {
    const formData = {
      email,
      surname,
      othernames,
      dateOfBirth,
      gender,
      patientId,
      healthInsuranceNumber,
      bloodType,
      genotype,
      allergies,
      chronicConditions,
      issuingHospital,
      issuedDate,
      expiryDate,
    };

    router.push(`/health/issuing?data=${encodeURIComponent(JSON.stringify(formData))}`);
  };

  const filteredPatients = samplePatients.filter((patient) => {
    const fullName = `${patient.othernames || ""} ${patient.surname || ""}`;
    const query = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(query) ||
      (patient.surname || "").toLowerCase().includes(query) ||
      (patient.othernames || "").toLowerCase().includes(query) ||
      (patient.patientId || "").toLowerCase().includes(query) ||
      (patient.email || "").toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-6 py-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">🏥</span>
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                      Issue Medical Health Card
                    </h1>
                  </div>
                  <p className="text-cyan-100">
                    Issue verifiable health credentials to patients
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
            {/* Patient Selection */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👤</span>
                  Select Patient
                </h2>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Patient List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedPatient?.id === patient.id
                          ? "border-teal-500 bg-teal-50"
                          : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">
                        {patient.othernames} {patient.surname}
                      </p>
                      <p className="text-sm text-gray-600">{patient.patientId}</p>
                      <p className="text-xs text-teal-600 mt-1">{patient.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Credential Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📋</span>
                  Health Card Details
                </h2>

                {!selectedPatient ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏥</div>
                    <p className="text-gray-500">Select a patient to begin issuing their health card</p>
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
                            Surname
                          </label>
                          <input
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Medical Identifiers */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Medical Identifiers
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Patient ID
                          </label>
                          <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Health Insurance Number
                          </label>
                          <input
                            type="text"
                            value={healthInsuranceNumber}
                            onChange={(e) => setHealthInsuranceNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Medical Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Medical Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blood Type
                          </label>
                          <select
                            value={bloodType}
                            onChange={(e) => setBloodType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Blood Type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Genotype
                          </label>
                          <select
                            value={genotype}
                            onChange={(e) => setGenotype(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Genotype</option>
                            <option value="AA">AA</option>
                            <option value="AS">AS</option>
                            <option value="AC">AC</option>
                            <option value="SS">SS</option>
                            <option value="SC">SC</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allergies
                          </label>
                          <input
                            type="text"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                            placeholder="e.g., Penicillin, Sulfa drugs"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chronic Conditions
                          </label>
                          <input
                            type="text"
                            value={chronicConditions}
                            onChange={(e) => setChronicConditions(e.target.value)}
                            placeholder="e.g., Hypertension, Diabetes"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Issuing Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Issuing Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issuing Hospital
                          </label>
                          <input
                            type="text"
                            value={issuingHospital}
                            onChange={(e) => setIssuingHospital(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issued Date
                          </label>
                          <input
                            type="date"
                            value={issuedDate}
                            onChange={(e) => setIssuedDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        onClick={handleIssueCredential}
                        className="w-full px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Issue Health Card
                        </div>
                      </button>
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
