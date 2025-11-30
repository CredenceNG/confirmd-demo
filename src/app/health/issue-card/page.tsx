"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function IssueHealthCardPage() {
  const router = useRouter();

  // Sample patients for demo - rural community members in Kwara State
  const samplePatients = [
    {
      id: "1",
      surname: "Abdulkareem",
      othernames: "Aminat Folashade",
      dateOfBirth: "1988-03-12",
      gender: "F",
      email: "aminat.abdulkareem@gmail.com",
      patientId: "SHI/OKE-ERO/2024/00156",
      healthInsuranceNumber: "KWSHIA-2024-00156",
      bloodType: "O+",
      genotype: "AS",
      allergies: "Penicillin, Sulfonamides",
      chronicConditions: "Sickle Cell Trait (carrier)",
      issuedDate: "2024-11-15",
      expiryDate: "2029-11-15",
    },
    {
      id: "2",
      surname: "Oyedeji",
      othernames: "Adebayo Samuel",
      dateOfBirth: "1965-08-20",
      gender: "M",
      email: "adebayo.oyedeji@yahoo.com",
      patientId: "SHI/ILORIN-W/2024/00089",
      healthInsuranceNumber: "KWSHIA-2024-00089",
      bloodType: "A+",
      genotype: "AA",
      allergies: "None",
      chronicConditions: "Type 2 Diabetes, Hypertension",
      issuedDate: "2024-10-05",
      expiryDate: "2029-10-05",
    },
    {
      id: "3",
      surname: "Mohammed",
      othernames: "Halima Zainab",
      dateOfBirth: "1995-12-03",
      gender: "F",
      email: "halima.mohammed@gmail.com",
      patientId: "SHI/PATIGI/2024/00234",
      healthInsuranceNumber: "KWSHIA-2024-00234",
      bloodType: "B-",
      genotype: "AA",
      allergies: "Latex, Iodine contrast",
      chronicConditions: "Asthma",
      issuedDate: "2024-11-20",
      expiryDate: "2029-11-20",
    },
    {
      id: "4",
      surname: "Afolabi",
      othernames: "Kehinde Oluwole",
      dateOfBirth: "1972-05-18",
      gender: "M",
      email: "kehinde.afolabi@hotmail.com",
      patientId: "SHI/OFFA/2024/00067",
      healthInsuranceNumber: "KWSHIA-2024-00067",
      bloodType: "AB+",
      genotype: "AA",
      allergies: "Aspirin, NSAIDs",
      chronicConditions: "Peptic Ulcer Disease",
      issuedDate: "2024-09-12",
      expiryDate: "2029-09-12",
    },
    {
      id: "5",
      surname: "Balogun",
      othernames: "Fatimah Aduke",
      dateOfBirth: "2001-01-25",
      gender: "F",
      email: "fatimah.balogun@gmail.com",
      patientId: "SHI/ILORIN-E/2024/00312",
      healthInsuranceNumber: "KWSHIA-2024-00312",
      bloodType: "O-",
      genotype: "SS",
      allergies: "Codeine, Tramadol",
      chronicConditions: "Sickle Cell Disease (HbSS)",
      issuedDate: "2024-11-28",
      expiryDate: "2029-11-28",
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
            <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 px-6 py-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-3xl">🌅</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                        Sunrise Health Initiative
                      </h1>
                      <p className="text-emerald-200 text-sm">Primary Healthcare Center Network • Kwara State</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 rounded-full text-xs font-medium">
                    Community Health Worker Portal
                  </span>
                  <Link
                    href="/"
                    className="text-sm text-white/90 hover:text-white underline"
                  >
                    ← Back to Demos
                  </Link>
                </div>
              </div>
            </div>
            {/* Story Context Banner */}
            <div className="bg-emerald-900/90 px-6 py-4 border-t border-emerald-600/30">
              <div className="flex items-start gap-3">
                <div className="text-xl">📋</div>
                <div>
                  <p className="text-sm text-emerald-100">
                    <strong>The Challenge:</strong> Sunrise Health Initiative serves 47 rural communities with limited internet.
                    Paper records were lost to floods and fires. When patients traveled to referral hospitals in Ilorin,
                    doctors had no access to their medical history, blood type, or known allergies.
                  </p>
                  <p className="text-sm text-emerald-200 mt-2">
                    <strong>The Solution:</strong> Community Health Workers now issue digital health cards directly to patients' phones.
                    These credentials work offline and travel with the patient. When they visit any hospital,
                    their critical health information is instantly accessible - no phone calls, no paper, no lost records.
                  </p>
                  <p className="text-sm text-emerald-300 mt-2">
                    <strong>For Planning:</strong> Every credential issued creates anonymized data for the State Ministry of Health -
                    genotype distribution, chronic disease prevalence, allergy patterns. For the first time,
                    Kwara State has real data for healthcare planning and resource allocation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Patient Selection */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👤</span>
                  Community Members
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Select a patient who has completed registration at your PHC
                </p>

                {/* Search */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search by name or patient ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">
                        {patient.othernames} {patient.surname}
                      </p>
                      <p className="text-sm text-gray-600">{patient.patientId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">{patient.bloodType}</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">{patient.genotype}</span>
                      </div>
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
                  Digital Health Card Details
                </h2>

                {!selectedPatient ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue a Digital Health Card</h3>
                    <p className="text-gray-500 mb-4">Select a community member to issue their digital health card</p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 max-w-md mx-auto text-left">
                      <p className="text-sm text-emerald-800 font-medium mb-2">This credential will include:</p>
                      <ul className="text-xs text-emerald-700 space-y-1">
                        <li>• Blood type and genotype (critical for emergencies)</li>
                        <li>• Known allergies (prevents medication errors)</li>
                        <li>• Chronic conditions (ensures continuity of care)</li>
                        <li>• Kwara State Health Insurance number</li>
                      </ul>
                    </div>
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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

                    {/* Validity Dates */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        Validity Dates
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
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
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600">⚠️</span>
                          <div>
                            <p className="text-sm text-amber-800 font-medium">Before issuing:</p>
                            <p className="text-xs text-amber-700 mt-1">
                              Verify blood type and genotype from lab results. Confirm allergies with patient.
                              This information will be used by referral hospitals in emergencies.
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleIssueCredential}
                        className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Issue Digital Health Card
                        </div>
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-3">
                        The health card will be sent to the patient's email and can be stored in their mobile wallet.
                      </p>
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
