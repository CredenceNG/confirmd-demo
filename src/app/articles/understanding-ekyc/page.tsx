/**
 * Understanding eKYC Article
 * The Future of Digital Credential Verification
 */
"use client";

import Link from "next/link";

export default function UnderstandingEKYCPage() {
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
            Understanding eKYC: The Future of Digital Credential Verification
          </h1>
          <p className="text-lg text-gray-600">
            How electronic Know Your Customer processes are transforming identity verification across industries
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is eKYC?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            eKYC (electronic Know Your Customer) is a digital transformation of traditional identity verification processes. By replacing paper-based methods with secure digital verification, organizations can remotely confirm identities in seconds rather than days. This technological leap leverages advanced authentication methods to automate verification workflows, delivering unprecedented speed, efficiency, and security.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">Experience eKYC in Action:</p>
            <div className="space-y-2">
              <Link href="/finance/issue-ekyc" className="block text-blue-700 hover:text-blue-800 font-medium">
                → Issue eKYC Credentials
              </Link>
              <Link href="/finance/onboarding-ekyc" className="block text-blue-700 hover:text-blue-800 font-medium">
                → Bank Onboarding with eKYC
              </Link>
              <Link href="/finance/investment-account" className="block text-blue-700 hover:text-blue-800 font-medium">
                → Investment Account Opening
              </Link>
            </div>
          </div>
        </section>

        {/* KYC Background */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Is Know Your Customer (KYC)?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Know Your Customer (KYC) is a critical regulatory framework designed to prevent financial crimes including money laundering, terrorist financing, identity theft, and fraud. By verifying customer identities, KYC protects the integrity of financial systems and ensures customers are who they claim to be.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">The Traditional KYC Process</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Collecting personal information (name, address, date of birth)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Verifying identity documents (passports, national IDs, utility bills)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Assessing potential risks posed by the customer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Continuous monitoring of customer activities</span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">Key Components of KYC:</p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-purple-900">Customer Identification Program (CIP)</p>
                  <p className="text-purple-800">Collects basic details including name, address, date of birth, and unique identification numbers.</p>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">Customer Due Diligence (CDD)</p>
                  <p className="text-purple-800">Recommended by FinCEN, this step assesses customer profiles and fraud risks to enhance financial sector transparency.</p>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">Ongoing Monitoring</p>
                  <p className="text-purple-800">Continuous observation of customer activities to detect and report suspicious behavior.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KYC vs eKYC Comparison */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC vs. eKYC: The Digital Evolution</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">Traditional KYC</th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900">eKYC</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr>
                  <td className="border border-gray-200 px-4 py-3">Physical document submission</td>
                  <td className="border border-gray-200 px-4 py-3 bg-green-50">Digital document upload</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">In-person verification</td>
                  <td className="border border-gray-200 px-4 py-3 bg-green-50">Remote verification</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">Extensive paperwork</td>
                  <td className="border border-gray-200 px-4 py-3 bg-green-50">Paperless process</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">Manual processing</td>
                  <td className="border border-gray-200 px-4 py-3 bg-green-50">Automated workflows</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">Days to weeks</td>
                  <td className="border border-gray-200 px-4 py-3 bg-green-50">Minutes to hours</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">Error-prone</td>
                  <td className="border border-gray-200 px-4 py-3 bg-green-50">AI-enhanced accuracy</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-gray-700 mt-4">
            eKYC's digital-first approach utilizes biometric authentication, artificial intelligence, and blockchain technology, delivering superior speed, accuracy, and security.
          </p>
        </section>

        {/* How eKYC Works */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How eKYC Works: The Process Explained</h2>

          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Document Submission",
                description: "Users submit identity documents (passports, driver's licenses) through secure platforms or mobile apps"
              },
              {
                step: "2",
                title: "Advanced Verification",
                description: "Documents are verified using OCR, AI, and biometric technologies"
              },
              {
                step: "3",
                title: "Risk Assessment",
                description: "Profile analysis identifies potential fraud or money laundering risks"
              },
              {
                step: "4",
                title: "Compliance Check",
                description: "Regulatory requirements are verified automatically"
              },
              {
                step: "5",
                title: "Approval/Rejection",
                description: "Applications are processed based on comprehensive risk and compliance analysis"
              }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-900 font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-700 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mt-6">
            <p className="text-sm font-semibold text-blue-900 mb-2">See Credential Reusability in Action:</p>
            <Link href="/finance/investment-account" className="text-blue-700 hover:text-blue-800 font-medium">
              → Experience how one eKYC credential can be reused across multiple services
            </Link>
          </div>
        </section>

        {/* Technologies */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technologies Powering eKYC</h2>

          {/* OCR */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-purple-100 text-purple-900 font-bold px-4 py-2 rounded-lg">
                OCR
              </div>
              <h3 className="text-xl font-bold text-gray-900">Optical Character Recognition</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Extracts information from identity documents—passports, driver's licenses, utility bills—by converting printed or handwritten text into machine-readable data. OCR enables rapid, accurate document verification and seamless data integration.
            </p>
          </div>

          {/* Biometrics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-indigo-100 text-indigo-900 font-bold px-4 py-2 rounded-lg">
                Bio
              </div>
              <h3 className="text-xl font-bold text-gray-900">Biometric Authentication</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Provides unparalleled security through unique physical or behavioral characteristics. Beyond security, biometrics deliver convenient, user-friendly authentication experiences.
            </p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {["Facial recognition", "Fingerprint scans", "Iris scans", "Voice recognition"].map((tech) => (
                <div key={tech} className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded">
                  <span className="text-indigo-600">✓</span>
                  <span className="text-indigo-900">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Liveness Detection */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-teal-100 text-teal-900 font-bold px-4 py-2 rounded-lg">
                Live
              </div>
              <h3 className="text-xl font-bold text-gray-900">Liveness Detection</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Prevents impersonation attacks using static images or recorded videos. By requiring dynamic actions (blinking, smiling) during authentication, liveness detection confirms physical presence and active participation.
            </p>
          </div>

          {/* AI/ML */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-orange-100 text-orange-900 font-bold px-4 py-2 rounded-lg">
                AI/ML
              </div>
              <h3 className="text-xl font-bold text-gray-900">Artificial Intelligence & Machine Learning</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              AI/ML algorithms elevate eKYC accuracy and efficiency by:
            </p>
            <ul className="space-y-2 text-gray-700">
              {[
                "Analyzing vast datasets",
                "Recognizing patterns",
                "Continuously learning from new information",
                "Adapting to evolving fraud tactics"
              ].map((capability) => (
                <li key={capability} className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Blockchain */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-100 text-blue-900 font-bold px-4 py-2 rounded-lg">
                Chain
              </div>
              <h3 className="text-xl font-bold text-gray-900">Blockchain</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Provides secure, decentralized storage and verification of customer data. Blockchain enhances security by reducing data breach risks while empowering individuals with greater control over their identity information.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits of Electronic Know Your Customer (eKYC)</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seamless Customer Onboarding</h3>
              <p className="text-gray-700 leading-relaxed">
                Traditional onboarding took 30% of organizations over two months (Thomson Reuters survey). eKYC transforms this: businesses now verify identities remotely and instantaneously, drastically reducing paperwork and wait times.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Improved Security</h3>
              <p className="text-gray-700 leading-relaxed">
                Advanced technologies—biometric authentication, blockchain—deliver superior security, reducing fraud and identity theft risks significantly.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Regulatory Compliance</h3>
              <p className="text-gray-700 leading-relaxed">
                eKYC ensures adherence to evolving legal standards across regulated industries (finance, healthcare), maintaining organizational reputation and customer trust.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Reach and Inclusivity</h3>
              <p className="text-gray-700 leading-relaxed">
                eKYC extends services to broader audiences, creating more inclusive financial ecosystems by removing geographical barriers.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Customer Experience</h3>
              <p className="text-gray-700 leading-relaxed mb-2">Customers enjoy:</p>
              <ul className="space-y-1 text-gray-700 text-sm">
                {[
                  "Greater convenience",
                  "Faster access to services",
                  "Enhanced security for personal information",
                  "Robust encryption and security frameworks"
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Use Cases for eKYC</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Financial Services */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Services</h3>
              <p className="text-gray-700 text-sm mb-3">
                Banks, insurance companies, and financial institutions use eKYC for account openings, loan applications, and investment transactions.
              </p>
              <Link href="/finance/onboarding-ekyc" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Try Financial Onboarding →
              </Link>
            </div>

            {/* Telecommunications */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Telecommunications</h3>
              <p className="text-gray-700 text-sm mb-3">
                Mobile operators and ISPs leverage eKYC for SIM card activation and new account signup.
              </p>
              <Link href="/telecoms/signup" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                See Telecoms Signup →
              </Link>
            </div>

            {/* Investment Services */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Investment Services</h3>
              <p className="text-gray-700 text-sm mb-3">
                Investment platforms use eKYC for instant account opening, eliminating lengthy KYC processes.
              </p>
              <Link href="/finance/investment-account" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Open an Investment Account →
              </Link>
            </div>

            {/* Other Industries */}
            {[
              {
                title: "Online Gaming",
                description: "Age verification and fraud prevention for safe gaming environments"
              },
              {
                title: "Fintech",
                description: "Secure, compliant transactions in fast-evolving fintech landscape"
              },
              {
                title: "Healthcare",
                description: "Patient registration ensuring data accuracy and medical record confidentiality"
              },
              {
                title: "Government",
                description: "Secure access to online services, tax filings, voter registration"
              },
              {
                title: "Cryptocurrency",
                description: "User onboarding, identity verification, and regulatory compliance"
              }
            ].map((useCase) => (
              <div key={useCase.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-700 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Challenges */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Challenges in Implementing eKYC</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Privacy and Cybersecurity</h3>
              <p className="text-gray-700">
                Collecting sensitive personal information requires robust security measures. Organizations must balance innovation with privacy protection through stringent cybersecurity protocols, encryption, and ethical data management.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Technological Hurdles</h3>
              <p className="text-gray-700">
                Effective eKYC requires continuous investment in technology and infrastructure, including security protocols to protect user data from unauthorized access.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigating the Regulatory Landscape</h3>
              <p className="text-gray-700">
                Organizations must adapt eKYC systems to varying data protection and privacy laws across jurisdictions while maintaining seamless user experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">eKYC Compliance with Regulatory Standards</h2>

          <p className="text-gray-700 mb-6">
            eKYC processes help organizations comply with stringent regulations designed to safeguard identities, prevent financial crimes, and uphold data privacy:
          </p>

          <div className="space-y-4">
            {[
              {
                title: "Anti-Money Laundering (AML) and Counter-Terrorism Financing (CFT)",
                description: "Prevents misuse of financial systems for illegal activities (U.S. Bank Secrecy Act, EU Anti-Money Laundering Directives)."
              },
              {
                title: "Data Protection Regulations",
                description: "Ensures compliance with GDPR, CPRA, POPIA, and PIPEDA through explicit consent, data accuracy, and robust security."
              },
              {
                title: "Electronic Signature Laws",
                description: "Compliance with eIDAS and similar laws ensures legally binding electronic signatures."
              },
              {
                title: "PCI DSS Compliance",
                description: "Required for industries handling payment information during eKYC processes."
              },
              {
                title: "Industry-Specific Regulations",
                description: "Sector-specific requirements (HIPAA for healthcare) ensure system integrity."
              }
            ].map((regulation) => (
              <div key={regulation.title} className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">{regulation.title}</h3>
                <p className="text-gray-700 text-sm">{regulation.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Electronic Know Your Customer (eKYC) is foundational to our digital age, where secure and efficient identity verification is both a compliance requirement and an enabler of seamless interactions. From banking to healthcare, eKYC marks a new era of trust, convenience, and compliance.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            As technologies advance, identity verification continues evolving toward more user-friendly, secure, and interconnected systems—transforming how we prove who we are in the digital world.
          </p>

          <div className="bg-white rounded-lg border border-blue-200 p-6">
            <p className="text-lg font-semibold text-gray-900 mb-4">Experience the Future of Identity Verification</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/finance/issue-ekyc"
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
              >
                Issue eKYC Credentials
              </Link>
              <Link
                href="/finance/onboarding-ekyc"
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center font-medium"
              >
                Try Bank Onboarding
              </Link>
              <Link
                href="/finance/investment-account"
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
              >
                Open Investment Account
              </Link>
              <Link
                href="/"
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
              >
                Explore All Demos
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
