/**
 * About Us Page
 */
"use client";

import Link from "next/link";

export default function AboutPage() {
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
            About Confirmd Platform
          </h2>
          <p className="text-lg text-gray-600">
            Empowering trust through verifiable credentials
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* What is Confirmd Platform */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What is Confirmd Platform?</h3>
            <p className="text-gray-700 leading-relaxed">
              Confirmd Platform provides enterprise-grade infrastructure for issuing, managing, and verifying digital credentials based on W3C Verifiable Credentials standards and decentralized identity principles. We enable organizations to issue tamper-proof, instantly verifiable credentials while giving individuals complete control over their personal information.
            </p>
          </section>

          {/* Mission */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              To revolutionize digital credentials and verification across Africa and beyond by building secure, privacy-preserving infrastructure that empowers individuals and organizations.
            </p>
          </section>

          {/* Use Cases */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Use Cases</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Confirmd Platform supports verifiable credentials across multiple sectors:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Education</h4>
                    <p className="text-sm text-gray-600">Digital degrees, transcripts, and student IDs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏥</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Healthcare</h4>
                    <p className="text-sm text-gray-600">Medical records and health certificates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🏢</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Government</h4>
                    <p className="text-sm text-gray-600">Licenses, permits, and official documents</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💼</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Professional</h4>
                    <p className="text-sm text-gray-600">Certifications and memberships</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Credence Networks */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">About Credence Networks, Inc</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Confirmd Platform is a product of{" "}
              <a
                href="https://credence.ng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Credence Networks, Inc
              </a>
              , a technology company pioneering digital credential solutions across Africa. Credence Networks is committed to building secure, privacy-preserving infrastructure that empowers individuals and organizations.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our team combines expertise in cryptography, distributed systems, and identity management to deliver world-class verifiable credentials solutions tailored for African markets and beyond.
            </p>
          </section>

          {/* Why Verifiable Credentials */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Verifiable Credentials?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Instant Verification</h4>
                  <p className="text-sm text-gray-600">Verify credentials in seconds without contacting issuers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Tamper-Proof</h4>
                  <p className="text-sm text-gray-600">Cryptographic signatures prevent fraud and forgery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Privacy-Preserving</h4>
                  <p className="text-sm text-gray-600">Share only what's needed, nothing more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl flex-shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-gray-900">User Control</h4>
                  <p className="text-sm text-gray-600">Individuals own and control their credentials</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Experience the Platform</h3>
          <p className="mb-6 text-blue-50">
            Try our interactive demos to see verifiable credentials in action
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Explore Demos
            </Link>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
