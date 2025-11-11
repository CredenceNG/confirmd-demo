/**
 * Nigerian Evidence Act 2023 Article
 * How Confirmd Platform Enables Modern Evidence Law
 */
"use client";

import Link from "next/link";

export default function EvidenceAct2023Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <Link href="/articles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enabling the Nigerian Evidence Act 2023
          </h1>
          <p className="text-lg text-gray-600">
            How Confirmd Platform creates court-ready verifiable credentials that comply with Nigerian law
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Nigerian Evidence Act 2023 modernized the country's legal framework to accommodate electronic evidence in court proceedings. Confirmd Platform creates legally sound digital credentials that fully comply with the Act's requirements, providing courts with authentication, integrity verification, and non-repudiation guarantees.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our cryptographically signed verifiable credentials meet all statutory requirements for electronic evidence admissibility, offering stronger proof of authenticity than traditional paper documents while maintaining complete audit trails required under Nigerian law.
          </p>
        </section>

        {/* Key Provisions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Provisions of the Evidence Act 2023</h2>

          {/* Section 83(1) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-purple-100 text-purple-900 font-bold px-4 py-2 rounded-lg text-lg">
                §83(1)
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Admissibility of Electronic Evidence</h3>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">The Law States:</p>
              <p className="text-gray-800 italic leading-relaxed">
                "In any proceedings, a statement contained in a document produced by a computer shall be admissible as evidence of any fact stated therein of which direct oral evidence would be admissible, if it is shown that the conditions in subsection (2) are satisfied in relation to the statement and computer in question."
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">How Confirmd Platform Complies:</p>
              <p className="text-gray-700 leading-relaxed">
                Verifiable credentials are computer-generated electronic documents containing cryptographically verifiable statements. Each credential issued through Confirmd Platform satisfies the admissibility requirements as it contains statements of fact (identity attributes, qualifications, licenses) that would be admissible through direct oral evidence. The platform ensures all subsection (2) conditions are met through proper system operation, regular data maintenance, and secure custody protocols.
              </p>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Practical Application:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>A digital degree certificate issued by a university can be presented in court during employment disputes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>A digital driver's license can serve as evidence in traffic court proceedings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Professional licenses can be verified in malpractice cases without physical documents</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 84 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-indigo-100 text-indigo-900 font-bold px-4 py-2 rounded-lg text-lg">
                §84
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Authentication of Electronic Records</h3>
              </div>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-indigo-900 mb-2">The Law States:</p>
              <p className="text-gray-800 italic leading-relaxed">
                "The authentication of an electronic record or electronic signature may be proved by showing that a digital signature, as defined in subsection (2), has been affixed to such electronic record or electronic signature with the intention of authenticating the same."
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">How Confirmd Platform Complies:</p>
              <p className="text-gray-700 leading-relaxed">
                Every credential issued through Confirmd Platform includes cryptographic digital signatures that prove authenticity and issuer identity. The platform uses public-key cryptography to create unforgeable signatures that bind the issuer's digital identity (DID) to the credential content. Courts can independently verify these signatures to confirm the credential was genuinely issued by the claimed organization and has not been tampered with.
              </p>
            </div>

            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">Legal Advantages:</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span><strong>Non-repudiation:</strong> Issuers cannot deny having issued a credential due to cryptographic proof</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span><strong>Forgery prevention:</strong> Recipients cannot claim credentials were forged when signatures are invalid</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span><strong>Independent verification:</strong> Courts can verify authenticity without contacting the issuer</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 85 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 text-blue-900 font-bold px-4 py-2 rounded-lg text-lg">
                §85
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Presumption as to Integrity of Electronic Records</h3>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">The Law States:</p>
              <p className="text-gray-800 italic leading-relaxed">
                "In any proceedings involving a secure electronic record, there shall be a presumption that the secure electronic record has not been altered since the specific point in time to which the secure status relates."
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">How Confirmd Platform Complies:</p>
              <p className="text-gray-700 leading-relaxed mb-3">
                Confirmd Platform issues verifiable credentials with cryptographic hashes that are anchored to blockchain ledgers. Any alteration to the credential content would change the hash value, making tampering immediately detectable. This creates a "secure electronic record" under Section 85, entitling credentials to a legal presumption of integrity.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The cryptographic binding ensures that if a credential verifies successfully, Nigerian courts can presume it has not been altered since issuance—shifting the burden of proof to anyone claiming the record was tampered with.
              </p>
            </div>
          </div>

          {/* Section 93A */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-violet-100 text-violet-900 font-bold px-4 py-2 rounded-lg text-lg">
                §93A
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Admissibility of Computer-Generated Evidence</h3>
              </div>
            </div>

            <div className="bg-violet-50 border-l-4 border-violet-600 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-violet-900 mb-2">The Law States:</p>
              <p className="text-gray-800 italic leading-relaxed">
                "A statement in a document produced by a computer shall not be admissible as evidence of any fact stated therein unless it is shown that: (a) there are no reasonable grounds for believing that the statement is inaccurate because of improper use of the computer; (b) at all material times the computer was operating properly, or if not, that any respect in which it was not operating properly or was out of operation was not such as to affect the production of the document or the accuracy of its contents; and (c) any relevant conditions specified in rules of court under subsection (2) are satisfied."
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">How Confirmd Platform Complies:</p>
              <p className="text-gray-700 leading-relaxed">
                Confirmd Platform maintains comprehensive audit logs and system integrity monitoring that prove:
              </p>
              <ul className="mt-2 text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 font-bold">a)</span>
                  <span>The system operates according to documented procedures with regular security audits, demonstrating no improper use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 font-bold">b)</span>
                  <span>System uptime and operation logs demonstrate the computer was functioning properly during credential issuance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 font-bold">c)</span>
                  <span>The platform can generate certificates of compliance satisfying court rules on computer evidence</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 84(4) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-green-100 text-green-900 font-bold px-4 py-2 rounded-lg text-lg">
                §84(4)
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Certificate of Compliance</h3>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-green-900 mb-2">The Law States:</p>
              <p className="text-gray-800 italic leading-relaxed">
                "For the purpose of this section, a certificate... (a) identifying the electronic record to which it relates; (b) describing the manner in which the electronic record was produced; and (c) giving such particulars of any device involved in the production of that electronic record as may be appropriate for the purpose of showing that the electronic record was produced by a computer, shall be evidence of the matters stated in the certificate."
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">How Confirmd Platform Complies:</p>
              <p className="text-gray-700 leading-relaxed mb-3">
                For every credential issued, Confirmd Platform can generate a statutory certificate of compliance that includes:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Credential identification:</strong> Unique credential ID, issuance date, and recipient details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Production method:</strong> Description of cryptographic signing process and W3C standard compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>System particulars:</strong> Details of the Confirmd Platform infrastructure, security measures, and audit trail</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 83(4) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-orange-100 text-orange-900 font-bold px-4 py-2 rounded-lg text-lg">
                §83(4)
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Digital Chain of Custody</h3>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">How Confirmd Platform Complies:</p>
              <p className="text-gray-700 leading-relaxed">
                Section 83(4) requires proof that electronic evidence was in proper custody and not altered. Confirmd Platform creates immutable audit trails showing who accessed, modified, or transmitted credentials at every stage. This satisfies court requirements for evidence integrity by providing:
              </p>
              <ul className="mt-2 text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Timestamp records for all credential operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Cryptographic proof of who performed each action</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Blockchain anchoring ensuring audit trail cannot be retroactively modified</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cross-Border Recognition */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cross-Border Evidence Recognition</h2>

          <div className="mb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-purple-100 text-purple-900 font-bold px-3 py-1 rounded text-sm">
                §126
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Foreign Public Documents</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              The Nigerian Evidence Act 2023 includes provisions for recognizing foreign public documents. W3C verifiable credentials issued by Confirmd Platform comply with Section 126 on foreign public documents, enabling Nigerian courts to accept electronic credentials from foreign issuers with proper authentication.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">International Use Cases:</p>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Nigerian universities issuing credentials accepted by UK courts in immigration proceedings</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Foreign educational credentials verified in Nigerian employment disputes</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Professional licenses from other jurisdictions authenticated in Nigerian regulatory proceedings</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Practical Benefits */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Practical Benefits for Legal Proceedings</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">For Courts</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Instant verification without contacting issuers</li>
                <li>• Reduced case delays from document authentication</li>
                <li>• Tamper-proof evidence with cryptographic guarantees</li>
                <li>• Clear audit trails for evidence integrity</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">For Litigants</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• No need to obtain certified true copies</li>
                <li>• Present evidence remotely without physical documents</li>
                <li>• Reduced litigation costs and time</li>
                <li>• Protection against document fraud</li>
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">For Legal Practitioners</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Simplified evidence authentication procedures</li>
                <li>• Stronger evidentiary foundation for documents</li>
                <li>• Ability to verify credentials during case preparation</li>
                <li>• Reduced risk of presenting forged documents</li>
              </ul>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">For Credential Issuers</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Reduced verification request workload</li>
                <li>• Protection against forgery of their credentials</li>
                <li>• Clear legal framework for digital issuance</li>
                <li>• Compliance with statutory requirements</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Experience Court-Ready Credentials?</h3>
          <p className="mb-6 text-blue-50">
            See how Confirmd Platform creates legally compliant verifiable credentials
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/legal/evidence"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
            >
              View Demo (Coming Soon)
            </Link>
            <Link
              href="/articles"
              className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors text-center"
            >
              ← Back to Articles
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
