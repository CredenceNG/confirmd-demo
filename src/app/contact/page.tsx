/**
 * Contact Page
 */
"use client";

import Link from "next/link";

export default function ContactPage() {
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
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Reach out to learn more about Confirmd Platform.
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Company Info */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Credence Networks, Inc</h3>

            <div className="space-y-6">
              {/* Website */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Website</h4>
                  <a
                    href="https://credence.ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    credence.ng
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                  <a
                    href="mailto:info@credence.ng"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    info@credence.ng
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                  <p className="text-gray-600">Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </section>

          {/* Support & Documentation */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Platform Resources</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Documentation */}
              <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Documentation</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Comprehensive guides and API references
                    </p>
                    <a
                      href="https://docs.confamd.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Visit Docs →
                    </a>
                  </div>
                </div>
              </div>

              {/* GitHub */}
              <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💻</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">GitHub</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Open source SDKs and sample applications
                    </p>
                    <a
                      href="https://github.com/Credence-AI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Repositories →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Partnership & Enterprise */}
          <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Enterprise & Partnership Inquiries</h3>
            <p className="text-blue-50 mb-6 leading-relaxed">
              Interested in implementing verifiable credentials for your organization?
              Looking to partner with us? We'd love to discuss how Confirmd Platform can help.
            </p>
            <a
              href="mailto:info@credence.ng?subject=Enterprise%20Inquiry"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Contact Sales Team
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
