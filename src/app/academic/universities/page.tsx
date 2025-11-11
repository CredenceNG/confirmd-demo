
export default function AcademicUniversitiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-4 sm:p-6 mb-12 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">🏛️</div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-1">
                  You are: University Registrar
                </h2>
                <p className="text-purple-100 text-sm sm:text-base">
                  Goal: Issue verifiable Statement of Results to graduating students
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium">Demo Active</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Ready to Issue a Statement of Results?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Duration: ~3 minutes • No wallet required • Browser only
            </p>
          </div>

          {/* Primary CTA */}
          <a
            href="/academic/universities/issue"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>Start Demo</span>
            <span>→</span>
          </a>

          {/* Secondary Options */}
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <a
              href="/"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-purple-500 hover:text-purple-600 transition-colors"
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

          {/* Credential Details Section */}
          <div className="mt-8 max-w-4xl w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Statement of Results Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-purple-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Student Identity
                    </h4>
                    <p className="text-sm text-gray-600">
                      Full name, matric number, admission number
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-purple-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Academic Performance
                    </h4>
                    <p className="text-sm text-gray-600">
                      CGPA, degree classification, year of graduation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-purple-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Programme Details
                    </h4>
                    <p className="text-sm text-gray-600">
                      Department, faculty, degree programme
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-purple-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Verification Data
                    </h4>
                    <p className="text-sm text-gray-600">
                      Issue date, certificate number, school seal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Information */}
          <div className="mt-8 max-w-4xl w-full">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>🔗</span> Where This Credential is Used
              </h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-green-600">→</span>
                  <span><strong>NYSC Registration:</strong> Required for Phase 1 registration to obtain Green Card</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span><strong>Employment Verification:</strong> Employers can verify academic qualifications instantly</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-600">→</span>
                  <span><strong>Further Education:</strong> Graduate schools and professional programs</span>
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
