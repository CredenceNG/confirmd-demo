
export default function MedicalFitnessPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Role Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-lg p-4 sm:p-6 mb-12 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">🏥</div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-1">
                  You are: Medical Center Administrator
                </h2>
                <p className="text-teal-100 text-sm sm:text-base">
                  Goal: Issue verifiable Medical Fitness Certificates to graduating students
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium">Demo Active</span>
            </div>
          </div>
        </div>

        {/* Demo Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800 mb-1">
                Demo Environment Notice
              </h3>
              <p className="text-sm text-amber-700">
                <strong>Single Organization Setup:</strong> This demo uses one organization to issue all credentials for simplicity.
                In production, each entity (Universities, Hospitals, NYSC, etc.) would be separate organizations with their own Decentralized Identifiers (DIDs),
                ensuring proper trust chains and credential verification.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 sm:p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">
                Required for NYSC Registration
              </h3>
              <p className="text-blue-800 text-xs sm:text-sm">
                The Medical Fitness Certificate issued here is one of the three required
                credentials for NYSC Registration (along with Student Card and Statement of Results).
                Students will use this credential during NYSC Phase 1 registration.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Flow Preview */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-8 mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
            Demo Flow
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm sm:text-base">1</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base">Select Student</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm sm:text-base">2</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base hidden sm:inline">Enter Health Details</span>
              <span className="text-gray-700 font-medium text-xs sm:hidden">Health Details</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm sm:text-base">3</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base hidden sm:inline">Issue Certificate</span>
              <span className="text-gray-700 font-medium text-xs sm:hidden">Issue</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm sm:text-base">✓</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base hidden sm:inline">Sent to Student</span>
              <span className="text-gray-700 font-medium text-xs sm:hidden">Sent</span>
            </div>
          </div>
        </div>

        {/* What You'll Do & Learn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-teal-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> What You'll Do
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold mt-1">1.</span>
                <span>Choose from sample students requiring medical clearance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold mt-1">2.</span>
                <span>Enter health examination details and fitness declaration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold mt-1">3.</span>
                <span>Review medical clearance information</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-teal-600 font-bold mt-1">4.</span>
                <span>Issue Medical Fitness Certificate via email to student</span>
              </li>
            </ul>
          </div>
          <div className="bg-cyan-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💡</span> What You'll Learn
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-cyan-600">✓</span>
                <span>How medical centers issue health credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-600">✓</span>
                <span>What data is included in Medical Fitness Certificate</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-600">✓</span>
                <span>How students use it for NYSC and employment</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cyan-600">✓</span>
                <span>Tamper-proof health verification and privacy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Ready to Issue a Medical Fitness Certificate?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Duration: ~3 minutes • No wallet required • Browser only
            </p>
          </div>

          {/* Primary CTA */}
          <a
            href="/medical/fitness/issue"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold text-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>Start Demo</span>
            <span>→</span>
          </a>

          {/* Secondary Options */}
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <a
              href="/"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-teal-500 hover:text-teal-600 transition-colors"
            >
              ← Back to All Demos
            </a>
            <a
              href="/nysc"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-green-500 hover:text-green-600 transition-colors"
            >
              Use in NYSC Demo →
            </a>
          </div>

          {/* Certificate Details Section */}
          <div className="mt-8 max-w-4xl w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Medical Fitness Certificate Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-teal-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Student Identity
                    </h4>
                    <p className="text-sm text-gray-600">
                      Full name, date of birth, student ID
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-teal-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Health Status
                    </h4>
                    <p className="text-sm text-gray-600">
                      Medical examination date, fitness declaration
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-teal-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Medical Center Details
                    </h4>
                    <p className="text-sm text-gray-600">
                      Center name, doctor name, medical license
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-teal-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Verification Data
                    </h4>
                    <p className="text-sm text-gray-600">
                      Issue date, certificate number, validity period
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Information */}
          <div className="mt-8 max-w-4xl w-full">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🔗</span> Where This Certificate is Used
              </h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-green-600">→</span>
                  <span><strong>NYSC Registration:</strong> Required for Phase 1 registration to obtain Green Card</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span><strong>Employment Verification:</strong> Employers can verify health fitness instantly</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-600">→</span>
                  <span><strong>Travel & Immigration:</strong> Health clearance for international travel</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
