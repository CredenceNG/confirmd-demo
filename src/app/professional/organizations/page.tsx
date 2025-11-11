
export default function ProfessionalOrganizationsPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Role Banner */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 mb-12 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">🏢</div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-1">
                  You are: Professional Organization Administrator
                </h2>
                <p className="text-indigo-100 text-sm sm:text-base">
                  Goal: Issue verifiable membership credentials to your members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium">Demo Active</span>
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm sm:text-base">1</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base">Select Member</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm sm:text-base">2</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base hidden sm:inline">Review & Edit Details</span>
              <span className="text-gray-700 font-medium text-xs sm:hidden">Review</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm sm:text-base">3</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base hidden sm:inline">Issue Credential</span>
              <span className="text-gray-700 font-medium text-xs sm:hidden">Issue</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base">→</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm sm:text-base">✓</div>
              <span className="text-gray-700 font-medium text-xs sm:text-base hidden sm:inline">Email Sent to Member</span>
              <span className="text-gray-700 font-medium text-xs sm:hidden">Sent</span>
            </div>
          </div>
        </div>

        {/* What You'll Do & Learn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-indigo-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> What You'll Do
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-1">1.</span>
                <span>Choose from sample members in your organization</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-1">2.</span>
                <span>Review and edit membership information (all fields editable)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-1">3.</span>
                <span>Click "Issue Credential" to send via email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold mt-1">4.</span>
                <span>See confirmation that credential was issued</span>
              </li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>💡</span> What You'll Learn
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-purple-600">✓</span>
                <span>How organizations issue verifiable membership credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600">✓</span>
                <span>What data is included in a membership credential (7 attributes)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600">✓</span>
                <span>How out-of-band (email) credential delivery works</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600">✓</span>
                <span>How members can use credentials for instant verification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Ready to Issue a Membership Credential?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Duration: ~2 minutes • No wallet required • Browser only
            </p>
          </div>

          {/* Primary CTA */}
          <a
            href="/professional/organizations/issue"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>Start Demo</span>
            <span>→</span>
          </a>

          {/* Secondary Options */}
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <a
              href="/"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            >
              ← Back to All Demos
            </a>
            <a
              href="/professional/members"
              className="px-6 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:border-purple-500 hover:text-purple-600 transition-colors"
            >
              View Member Demo →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
