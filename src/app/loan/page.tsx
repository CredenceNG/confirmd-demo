import Link from "next/link";

export default function LoanPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 mb-12 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">🎓</div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-1">
                  You are: Student / Loan Applicant
                </h2>
                <p className="text-green-100 text-sm sm:text-base">
                  Goal: Apply for student loan using verifiable credentials
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
              Ready to Apply for Student Loan?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Duration: ~2 minutes • Requires Confirmd mobile app • Verify credentials
            </p>
          </div>

          {/* Primary CTA */}
          <Link
            href="/loan/connect"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <span>Start Application</span>
            <span>→</span>
          </Link>

          {/* Secondary Options */}
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <Link
              href="/"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-green-500 hover:text-green-600 transition-colors"
            >
              ← Back to All Demos
            </Link>
            <Link
              href="/student-card"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              Get Student Card First →
            </Link>
          </div>

          {/* Requirements Section */}
          <div className="mt-8 max-w-4xl w-full">
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                What You'll Need
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Confirmd Mobile App
                    </h4>
                    <p className="text-sm text-gray-600">
                      Download and install the Confirmd wallet on your mobile device
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Student Card Credential
                    </h4>
                    <p className="text-sm text-gray-600">
                      A valid Student Card credential in your wallet
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-500 text-xl">✓</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      QR Code Scanner
                    </h4>
                    <p className="text-sm text-gray-600">
                      Camera access to scan the verification QR code
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don't have a Student Card credential yet?{" "}
                  <Link href="/student-card" className="text-green-600 hover:text-green-700 font-semibold">
                    Get one here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
