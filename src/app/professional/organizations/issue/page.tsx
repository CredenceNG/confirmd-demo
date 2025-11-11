"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Sample members data from membership database
const sampleMembers = [
  {
    id: "1",
    title: "Dr.",
    surname: "Adebayo",
    othernames: "Oluwaseun",
    email: "oluwaseun.adebayo@example.com",
    membershipNumber: "NIPE/2015/12345",
    designation: "Fellow",
    organization: "Nigerian Institute of Professional Engineers",
    memberSince: "2015-03-15",
    issuedDate: "2015-03-15",
    expiryDate: "2026-03-15",
    goodStanding: "Yes",
  },
  {
    id: "2",
    title: "Prof.",
    surname: "Okonkwo",
    othernames: "Chinwe",
    email: "chinwe.okonkwo@example.com",
    membershipNumber: "NIPE/2005/67890",
    designation: "Emeritus",
    organization: "Nigerian Institute of Professional Engineers",
    memberSince: "2005-07-20",
    issuedDate: "2005-07-20",
    expiryDate: "2027-07-20",
    goodStanding: "Yes",
  },
  {
    id: "3",
    title: "Eng.",
    surname: "Ibrahim",
    othernames: "Mohammed",
    email: "mohammed.ibrahim@example.com",
    membershipNumber: "NIPE/2018/34567",
    designation: "Senior Member",
    organization: "Nigerian Institute of Professional Engineers",
    memberSince: "2018-01-10",
    issuedDate: "2018-01-10",
    expiryDate: "2026-01-10",
    goodStanding: "Yes",
  },
  {
    id: "4",
    title: "Mrs.",
    surname: "Eze",
    othernames: "Grace",
    email: "grace.eze@example.com",
    membershipNumber: "NIPE/2021/98765",
    designation: "Member",
    organization: "Nigerian Institute of Professional Engineers",
    memberSince: "2021-09-05",
    issuedDate: "2021-09-05",
    expiryDate: "2025-09-05",
    goodStanding: "Yes",
  },
  {
    id: "5",
    title: "Engr.",
    surname: "Bello",
    othernames: "Ibrahim",
    email: "ibrahim.bello@example.com",
    membershipNumber: "NIPE/2019/55443",
    designation: "Senior Member",
    organization: "Nigerian Institute of Professional Engineers",
    memberSince: "2019-04-18",
    issuedDate: "2019-04-18",
    expiryDate: "2026-04-18",
    goodStanding: "No",
  },
];

export default function IssueMembershipPage() {
  const router = useRouter();
  const [selectedMember, setSelectedMember] = useState<typeof sampleMembers[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Editable form fields
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [surname, setSurname] = useState("");
  const [othernames, setOthernames] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [designation, setDesignation] = useState("");
  const [organization, setOrganization] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [goodStanding, setGoodStanding] = useState("");

  const filteredMembers = sampleMembers.filter(
    (member) => {
      const fullName = `${member.title || ""} ${member.othernames || ""} ${member.surname || ""}`;
      const query = searchQuery.toLowerCase();
      return (
        fullName.toLowerCase().includes(query) ||
        (member.surname || "").toLowerCase().includes(query) ||
        (member.othernames || "").toLowerCase().includes(query) ||
        (member.membershipNumber || "").toLowerCase().includes(query) ||
        (member.email || "").toLowerCase().includes(query)
      );
    }
  );

  const handleSelectMember = (member: typeof sampleMembers[0]) => {
    setSelectedMember(member);
    // Populate all form fields with member data
    setEmail(member.email);
    setTitle(member.title);
    setSurname(member.surname);
    setOthernames(member.othernames);
    setMembershipNumber(member.membershipNumber);
    setDesignation(member.designation);
    setOrganization(member.organization);
    setMemberSince(member.memberSince);
    setIssuedDate(member.issuedDate);
    setExpiryDate(member.expiryDate);
    setGoodStanding(member.goodStanding);
  };

  const handleIssueCredential = () => {
    if (!selectedMember || !email) return;

    // Prepare data to pass to issuing page
    const data = {
      email,
      title,
      surname,
      othernames,
      membershipNumber,
      designation,
      organization,
      memberSince,
      issuedDate,
      expiryDate,
      goodStanding,
    };

    // Navigate to issuing page with data
    const encodedData = encodeURIComponent(JSON.stringify(data));
    router.push(`/professional/organizations/issuing?data=${encodedData}`);
  };

  const isFormValid = selectedMember && email && email.includes("@");

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <a
            href="/professional/organizations"
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            ← Back
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 text-white">
            <h1 className="text-2xl font-bold">Issue Membership Credential</h1>
            <p className="text-indigo-100 mt-1">Select a member and review their details</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Step 1: Select Member */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold">1</span>
                Select Member from Database
              </h2>

              {/* Search Input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search by name, membership number, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                />
              </div>

              {/* Member List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member)}
                    className={`text-left p-4 border-2 rounded-lg transition-all ${
                      selectedMember?.id === member.id
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-indigo-300 hover:shadow"
                    }`}
                  >
                    <div className="font-bold text-gray-900 mb-1">{member.title} {member.othernames} {member.surname}</div>
                    <div className="text-sm text-gray-600 mb-2">{member.membershipNumber}</div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        member.designation === "Emeritus" ? "bg-purple-100 text-purple-700" :
                        member.designation === "Fellow" ? "bg-blue-100 text-blue-700" :
                        member.designation === "Senior Member" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {member.designation}
                      </span>
                      {member.goodStanding === "No" && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                          Not in Good Standing
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No members found matching "{searchQuery}"
                </div>
              )}
            </div>

            {/* Step 2: Review and Edit */}
            {selectedMember && (
              <div className="border-t pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold">2</span>
                  Review & Edit Member Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="member@example.com"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Title</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Eng.">Eng.</option>
                      <option value="Engr.">Engr.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                  </div>

                  {/* Surname */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Othernames */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Othernames <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={othernames}
                      onChange={(e) => setOthernames(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Membership Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Membership Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={membershipNumber}
                      onChange={(e) => setMembershipNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Member">Member</option>
                      <option value="Senior Member">Senior Member</option>
                      <option value="Fellow">Fellow</option>
                      <option value="Emeritus">Emeritus</option>
                    </select>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={memberSince}
                      onChange={(e) => setMemberSince(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Issued Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issued Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={issuedDate}
                      onChange={(e) => setIssuedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Good Standing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Good Standing <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={goodStanding}
                      onChange={(e) => setGoodStanding(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Issue Credential */}
            {selectedMember && (
              <div className="border-t pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold">3</span>
                  Issue Credential
                </h2>

                <button
                  onClick={handleIssueCredential}
                  disabled={!isFormValid}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                >
                  {isFormValid ? "Issue Credential via Email →" : "Please fill all required fields"}
                </button>

                {!isFormValid && selectedMember && (
                  <p className="mt-3 text-sm text-gray-600">
                    * All fields are required. Credential will be sent to: <strong>{email || "no email provided"}</strong>
                  </p>
                )}
              </div>
            )}

            {/* No Member Selected */}
            {!selectedMember && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-4">👆</div>
                <p className="text-lg">Select a member from the list above to continue</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
