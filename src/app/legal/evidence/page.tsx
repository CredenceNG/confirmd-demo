/**
 * Legal Evidence Demo - Court-Ready Credentials
 * Placeholder for future activation
 */
"use client";

import Link from "next/link";

export default function LegalEvidencePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl shadow-lg p-4 sm:p-6 mb-12 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-5xl">⚖️</div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1">
                You are: Legal Professional / Court Clerk
              </h2>
              <p className="text-purple-100 text-sm sm:text-base">
                Goal: Verify court-ready credentials that meet evidentiary standards
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
            <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Court-Ready Verifiable Credentials
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience how verifiable credentials meet modern evidence law requirements
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="w-full max-w-4xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-purple-900 mb-3">
              Demo Under Development
            </h3>
            <p className="text-purple-800 text-lg">
              This demonstration is currently being designed and will be activated soon.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-purple-200">
            <h4 className="font-bold text-purple-900 mb-4">What This Demo Will Showcase (Nigerian Evidence Act 2023 Compliance):</h4>
            <ul className="space-y-3 text-purple-800">
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">§83</span>
                <div>
                  <strong>Electronic Evidence Admissibility:</strong> Demonstrating how verifiable credentials satisfy Section 83(1) requirements for authentic electronic evidence maintained in ordinary course of business
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">§84</span>
                <div>
                  <strong>Authentication of Electronic Records:</strong> How cryptographic digital signatures prove the electronic record was signed by the person it purports to be signed by (Section 84)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">§85</span>
                <div>
                  <strong>Presumption of Integrity:</strong> Blockchain-anchored credentials meeting Section 85 requirements that electronic evidence has not been altered
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">§93A</span>
                <div>
                  <strong>Computer-Generated Evidence:</strong> Automated issuance systems satisfying Section 93A requirements that computer was operating properly and information regularly supplied
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">§83(4)</span>
                <div>
                  <strong>Digital Chain of Custody:</strong> Immutable audit trails showing who accessed or transmitted evidence, as required by Section 83(4)
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold flex-shrink-0">§84(4)</span>
                <div>
                  <strong>Certificate of Compliance:</strong> Generating statutory certificates identifying electronic record and confirming accuracy of production method
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Use Cases */}
        <div className="w-full max-w-4xl">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Legal Use Cases</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                <div className="text-3xl mb-3">👨‍⚖️</div>
                <h4 className="font-bold text-purple-900 mb-2">Employment Disputes</h4>
                <p className="text-sm text-purple-800">
                  Submitting cryptographically-verified educational credentials as evidence in wrongful termination cases
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-200">
                <div className="text-3xl mb-3">🏥</div>
                <h4 className="font-bold text-indigo-900 mb-2">Medical Malpractice</h4>
                <p className="text-sm text-indigo-800">
                  Verifying if medical professional's license was valid at time of treatment
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <div className="text-3xl mb-3">🚗</div>
                <h4 className="font-bold text-blue-900 mb-2">Traffic Court</h4>
                <p className="text-sm text-blue-800">
                  Presenting tamper-proof digital driver's licenses with verifiable issuance dates
                </p>
              </div>

              <div className="bg-violet-50 rounded-lg p-5 border border-violet-200">
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="font-bold text-violet-900 mb-2">Cross-Border Cases</h4>
                <p className="text-sm text-violet-800">
                  African credentials verified in international courts through W3C standards
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Framework */}
        <div className="w-full max-w-4xl">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Nigerian Evidence Act 2023 - Key Provisions</h3>
            <div className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg">
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-bold text-purple-900">Section 83(1)</span>
                  <h4 className="font-semibold text-purple-900">Admissibility of Electronic Evidence</h4>
                </div>
                <p className="text-sm text-purple-800 italic mb-2">
                  "In any proceedings, a statement contained in a document produced by a computer shall be admissible as evidence of any fact stated therein of which direct oral evidence would be admissible..."
                </p>
                <p className="text-xs text-purple-700">
                  <strong>How Confirmd Complies:</strong> Verifiable credentials are computer-generated documents with cryptographically verifiable statements, admissible as electronic evidence.
                </p>
              </div>

              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg">
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-bold text-indigo-900">Section 84</span>
                  <h4 className="font-semibold text-indigo-900">Authentication of Electronic Records</h4>
                </div>
                <p className="text-sm text-indigo-800 italic mb-2">
                  "The authentication of an electronic record or electronic signature may be proved by showing that a digital signature has been affixed..."
                </p>
                <p className="text-xs text-indigo-700">
                  <strong>How Confirmd Complies:</strong> Every credential includes cryptographic digital signatures proving authenticity and issuer identity.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-bold text-blue-900">Section 85</span>
                  <h4 className="font-semibold text-blue-900">Presumption as to Integrity</h4>
                </div>
                <p className="text-sm text-blue-800 italic mb-2">
                  "In any proceedings involving a secure electronic record, there shall be a presumption that the secure electronic record has not been altered since the specific point in time to which the secure status relates."
                </p>
                <p className="text-xs text-blue-700">
                  <strong>How Confirmd Complies:</strong> Blockchain-anchored credentials with cryptographic hashes ensure tamper-evidence and integrity presumption.
                </p>
              </div>

              <div className="bg-violet-50 border-l-4 border-violet-600 p-4 rounded-r-lg">
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-bold text-violet-900">Section 93A</span>
                  <h4 className="font-semibold text-violet-900">Admissibility of Computer Evidence</h4>
                </div>
                <p className="text-sm text-violet-800 italic mb-2">
                  "A statement in a document produced by a computer shall not be admissible as evidence unless it is shown that... the computer was operating properly... and the information was regularly and ordinarily supplied in the course of activities..."
                </p>
                <p className="text-xs text-violet-700">
                  <strong>How Confirmd Complies:</strong> Platform maintains audit logs proving system integrity and regular operation during credential issuance.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg">
                <div className="flex items-start gap-3 mb-2">
                  <span className="font-bold text-green-900">Section 84(4)</span>
                  <h4 className="font-semibold text-green-900">Certificate of Compliance</h4>
                </div>
                <p className="text-sm text-green-800 italic mb-2">
                  "For the purpose of this section, a certificate... identifying the electronic record... describing the manner in which the electronic record was produced... shall be evidence of the matters stated in the certificate."
                </p>
                <p className="text-xs text-green-700">
                  <strong>How Confirmd Complies:</strong> System generates statutory certificates for each credential describing issuance method, timestamp, and issuer details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Learn More CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Learn more about how verifiable credentials enable modern evidence law
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              <span>Read Articles</span>
              <span>→</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all shadow-md hover:shadow-lg"
            >
              <span>←</span>
              <span>Back to All Demos</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
