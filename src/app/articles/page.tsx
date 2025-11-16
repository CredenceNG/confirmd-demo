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
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-black hover:underline mb-6">
            ← Back to Demos
          </Link>

          <h1 className="text-4xl font-bold text-black mb-4">
            Articles & Resources
          </h1>
          <p className="text-lg text-black">
            Learn about verifiable credentials, legal frameworks, and technical concepts
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mb-12 space-y-8">
          {/* eKYC Article */}
          <div className="border-b border-black pb-6">
            <Link href="/articles/understanding-ekyc" className="block hover:underline">
              <h2 className="text-2xl font-bold text-black mb-2">
                Understanding eKYC: The Future of Digital Credential Verification
              </h2>
              <p className="text-black mb-2">
                Discover how electronic Know Your Customer (eKYC) processes are transforming identity verification across industries. Learn about the technologies powering eKYC, its benefits, use cases, and how it's creating seamless customer onboarding experiences.
              </p>
              <span className="text-sm text-black">Read article →</span>
            </Link>
          </div>

          {/* Evidence Act Article */}
          <div className="border-b border-black pb-6">
            <Link href="/articles/evidence-act-2023" className="block hover:underline">
              <h2 className="text-2xl font-bold text-black mb-2">
                Enabling the Nigerian Evidence Act 2023
              </h2>
              <p className="text-black mb-2">
                How Confirmd Platform creates court-ready verifiable credentials that comply with the Nigerian Evidence Act 2023. Learn about Sections 83, 84, 85, 93A and how cryptographic signatures meet statutory requirements for electronic evidence admissibility.
              </p>
              <span className="text-sm text-black">Read article →</span>
            </Link>
          </div>
        </div>

        {/* Glossary Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">Glossary of Terms</h2>
          <p className="text-black">Key concepts in the verifiable credentials ecosystem</p>
        </div>

        {/* Definitions List */}
        <div className="space-y-8">
          {definitions.map((item, index) => (
            <div key={index} className="border-b border-gray-300 pb-6">
              <h3 className="text-xl font-bold text-black mb-2">
                {item.term}
              </h3>
              <p className="text-black leading-relaxed mb-3">
                {item.definition}
              </p>

              {item.examples && item.examples.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-black mb-1">Examples:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {item.examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-black">
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 pt-8 border-t border-black text-center">
          <h3 className="text-2xl font-bold text-black mb-4">Ready to See It in Action?</h3>
          <p className="text-black mb-6">
            Try our interactive demos to experience verifiable credentials firsthand
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 border-2 border-black text-black font-semibold hover:bg-black hover:text-white transition-colors"
          >
            Explore Demos
          </Link>
        </div>
      </main>
    </div>
  );
}
