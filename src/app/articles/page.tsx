/**
 * Articles Page - Key Verifiable Credentials Definitions
 */
"use client";

import Link from "next/link";

interface Definition {
  term: string;
  definition: string;
  examples?: string[];
}

const definitions: Definition[] = [
  {
    term: "Verifiable Credentials (VCs)",
    definition: "Digital credentials that are cryptographically secure, tamper-proof, and instantly verifiable. Unlike physical documents or PDFs, verifiable credentials can be verified without contacting the issuer.",
    examples: [
      "Digital driver's license",
      "Student ID card",
      "Professional certification",
      "Medical fitness certificate"
    ]
  },
  {
    term: "Decentralized Identifiers (DIDs)",
    definition: "Unique identifiers that are created, owned, and controlled by individuals or organizations without relying on a central authority. DIDs enable self-sovereign identity.",
    examples: [
      "did:indy:bcovrin:testnet:NxbvVcdwR5a2oyiYa6UbPP",
      "did:peer:2.Vz6Mkm8gVQkqR12HghHmiDXHG92..."
    ]
  },
  {
    term: "Issuer",
    definition: "An organization or authority that creates and issues verifiable credentials. Issuers cryptographically sign credentials to prove their authenticity.",
    examples: [
      "Universities issuing degree certificates",
      "Government agencies issuing driver's licenses",
      "Medical centers issuing fitness certificates",
      "Professional bodies issuing membership credentials"
    ]
  },
  {
    term: "Holder",
    definition: "An individual or entity that receives, stores, and presents verifiable credentials. Holders have full control over their credentials and decide when and with whom to share them.",
    examples: [
      "Students with digital student IDs",
      "Graduates with degree certificates",
      "Professionals with membership credentials"
    ]
  },
  {
    term: "Verifier (Relying Party)",
    definition: "An organization that requests and verifies credentials from holders. Verifiers can cryptographically confirm credential authenticity without contacting the issuer.",
    examples: [
      "Employers verifying job applicant qualifications",
      "NYSC verifying student academic credentials",
      "Insurance companies verifying driver's licenses",
      "Banks verifying customer identity"
    ]
  },
  {
    term: "Digital Wallet",
    definition: "A secure application that stores verifiable credentials and enables holders to manage and share their credentials. Wallets protect private keys and facilitate credential presentations.",
    examples: [
      "Confirmd Mobile Wallet",
      "Browser-based credential wallets"
    ]
  },
  {
    term: "Proof Request",
    definition: "A request from a verifier asking a holder to present specific attributes from their credentials. Holders can choose to accept or reject proof requests.",
    examples: [
      "Loan application requesting student credentials",
      "NYSC registration requesting academic results",
      "Employer requesting degree verification"
    ]
  },
  {
    term: "Proof Presentation",
    definition: "The act of a holder sharing requested credential attributes with a verifier. Presentations include cryptographic proofs that verify authenticity without revealing the full credential.",
    examples: [
      "Student sharing name, matric number, and graduation year",
      "Graduate proving degree class without sharing full transcript"
    ]
  },
  {
    term: "Schema",
    definition: "A template that defines the structure and attributes of a credential type. Schemas specify what data fields a credential contains.",
    examples: [
      "Student Card Schema: name, matric number, department, graduation year",
      "Driver's License Schema: name, license number, expiry date, class"
    ]
  },
  {
    term: "Credential Definition (CredDef)",
    definition: "A specification created by an issuer based on a schema. The credential definition includes cryptographic keys used to sign and verify credentials of that type.",
    examples: [
      "University of Lagos Student Card CredDef based on Student Card Schema",
      "FRSC Driver's License CredDef based on Driver's License Schema"
    ]
  },
  {
    term: "Self-Sovereign Identity (SSI)",
    definition: "An identity model where individuals own and control their digital identities without relying on centralized authorities. Users decide what information to share and with whom.",
  },
  {
    term: "Zero-Knowledge Proof (ZKP)",
    definition: "A cryptographic method that allows proving a statement is true without revealing the underlying information. Enables privacy-preserving credential verification.",
    examples: [
      "Proving you're over 18 without revealing your exact birthdate",
      "Proving you have a degree without sharing your grades"
    ]
  },
  {
    term: "DIDComm",
    definition: "A secure, encrypted messaging protocol for communication between decentralized identities. Used for credential issuance and proof exchanges.",
  },
  {
    term: "Credential Lifecycle",
    definition: "The complete journey of a credential from creation to expiration: issuance, storage, presentation, verification, renewal, and revocation.",
  },
  {
    term: "Revocation",
    definition: "The process of invalidating a previously issued credential. Revoked credentials can no longer be successfully verified, even if the holder still possesses them.",
    examples: [
      "Revoking a driver's license after suspension",
      "Revoking employee credentials after termination",
      "Revoking expired certifications"
    ]
  },
  {
    term: "Out-of-Band (OOB) Invitation",
    definition: "A mechanism to establish connections between wallets and issuers/verifiers outside of the normal DIDComm flow. Often delivered via QR codes or deep links.",
    examples: [
      "Scanning QR code to connect wallet to platform",
      "Clicking email link to receive credential"
    ]
  },
];

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Demos
          </Link>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Articles & Resources
          </h2>
          <p className="text-lg text-gray-600">
            Learn about verifiable credentials, legal frameworks, and technical concepts
          </p>
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          <Link href="/articles/evidence-act-2023">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="text-5xl">⚖️</div>
                <div className="flex-1">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    FEATURED ARTICLE
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    Enabling the Nigerian Evidence Act 2023
                  </h3>
                  <p className="text-purple-100 mb-4 leading-relaxed">
                    How Confirmd Platform creates court-ready verifiable credentials that comply with the Nigerian Evidence Act 2023. Learn about Sections 83, 84, 85, 93A and how cryptographic signatures meet statutory requirements for electronic evidence admissibility.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>Read Full Article</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Glossary of Terms</h3>
          <p className="text-gray-600 mt-2">Key concepts in the verifiable credentials ecosystem</p>
        </div>

        {/* Definitions List */}
        <div className="space-y-6">
          {definitions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {item.term}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {item.definition}
              </p>

              {item.examples && item.examples.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Examples:</p>
                  <ul className="space-y-1">
                    {item.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-blue-500 flex-shrink-0">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to See It in Action?</h3>
          <p className="mb-6 text-blue-50">
            Try our interactive demos to experience verifiable credentials firsthand
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Explore Demos
          </Link>
        </div>
      </main>
    </div>
  );
}
