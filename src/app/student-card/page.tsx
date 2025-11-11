export default function StudentCardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 mb-12 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">🎓</div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-1">
                  You are: University Administrator
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  Goal: Issue verifiable student ID credentials to enrolled students
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
              Ready to Issue a Student Credential?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Duration: ~2 minutes • No wallet required • Browser only
            </p>
          </div>

          {/* Primary CTA */}
          <a
            href="/student-card/issue"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>Start Demo</span>
            <span>→</span>
          </a>

          {/* Secondary Options */}
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <a
              href="/"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              ← Back to All Demos
            </a>
            <a
              href="/loan"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-green-500 hover:text-green-600 transition-colors"
            >
              Try Verification Demo →
            </a>
          </div>

          {/* Credential Details Section */}
          <div className="mt-8 max-w-4xl w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Student Credential Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Personal Details
                    </h4>
                    <p className="text-sm text-gray-600">
                      Full name and student photograph
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Identification Numbers
                    </h4>
                    <p className="text-sm text-gray-600">
                      Admission number and matriculation number
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Academic Information
                    </h4>
                    <p className="text-sm text-gray-600">
                      Department, faculty, and programme
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Graduation Details
                    </h4>
                    <p className="text-sm text-gray-600">
                      Expected year of graduation
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
