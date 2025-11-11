/**
 * Professional Job Portal Landing Page
 * Demonstrates graduate onboarding requiring Statement of Result and NYSC Certificate verification
 */
"use client";

import { useRouter } from "next/navigation";

export default function ProfessionalJobPortalPage() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl shadow-lg p-4 sm:p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-5xl">💼</div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1">
                You are: Recent Graduate
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">
                Goal: Apply for a job at TechCorp Nigeria using your verified academic and NYSC credentials
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium">Professional Onboarding</span>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Demos
        </button>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                TechCorp Nigeria
              </h1>
              <p className="text-blue-100 text-lg">
                Building Africa's Digital Future
              </p>
            </div>

            <div className="p-8">
              {/* Job Listing */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Junior Software Engineer
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Lagos, Nigeria
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Full-time
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ₦2,500,000 - ₦3,500,000 / year
                      </span>
                    </div>
                  </div>
                  <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full whitespace-nowrap">
                    Now Hiring
                  </span>
                </div>

                <div className="prose max-w-none text-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Role</h3>
                  <p className="mb-4">
                    We are seeking talented recent graduates to join our engineering team. As a Junior Software Engineer,
                    you'll work on building scalable web applications and contributing to our mission of digital transformation
                    across Africa.
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Bachelor's degree in Computer Science, Software Engineering, or related field</li>
                    <li>Completed NYSC service year</li>
                    <li>Strong programming skills in JavaScript, TypeScript, or Python</li>
                    <li>Understanding of web development fundamentals</li>
                    <li>Excellent problem-solving and communication skills</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What We Offer</h3>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>Competitive salary and benefits package</li>
                    <li>Professional development opportunities</li>
                    <li>Modern office in Victoria Island, Lagos</li>
                    <li>Flexible work arrangements</li>
                    <li>Health insurance and pension</li>
                  </ul>
                </div>
              </div>

              {/* Verification Requirements */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Instant Credential Verification
                </h3>
                <p className="text-blue-800 mb-4">
                  TechCorp Nigeria uses verifiable credentials technology to instantly verify your academic qualifications
                  and NYSC completion. No need to wait weeks for document verification!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      ✓
                    </div>
                    <span className="text-blue-900">Statement of Result (Academic Transcript)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      ✓
                    </div>
                    <span className="text-blue-900">NYSC Certificate of National Service</span>
                  </div>
                </div>
              </div>

              {/* Benefits of Using Verifiable Credentials */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Instant Verification</h4>
                  <p className="text-sm text-gray-600">
                    Your credentials are verified in real-time, eliminating weeks of waiting
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy Protected</h4>
                  <p className="text-sm text-gray-600">
                    You control what information is shared. Only necessary details are disclosed
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tamper-Proof</h4>
                  <p className="text-sm text-gray-600">
                    Cryptographically secured credentials that cannot be forged or altered
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={() => router.push("/professional/intro")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Apply Now with Verified Credentials
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  Application takes less than 5 minutes with instant verification
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <h2 className="text-xl font-bold text-white">How Instant Verification Works</h2>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start Application</h3>
                  <p className="text-sm text-gray-600">
                    Begin your job application on our portal
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Scan QR Code</h3>
                  <p className="text-sm text-gray-600">
                    Use ConfirmD App to scan and share your credentials
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Verification</h3>
                  <p className="text-sm text-gray-600">
                    Your credentials are verified in seconds
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">✓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Submit Application</h3>
                  <p className="text-sm text-gray-600">
                    Complete your application with verified data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
