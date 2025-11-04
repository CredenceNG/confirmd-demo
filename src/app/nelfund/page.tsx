import Header from "@/components/Header";

export default function NelfundPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
      {/* Organization Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✓</div>
            <div>
              <h2 className="font-semibold text-green-900">NELFUND</h2>
              <p className="text-sm text-green-700">
                Student loan application system is online and operational
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-green-700 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Welcome to NELFUND Demo
          </h1>
          <p className="text-lg text-gray-600">
            Verifiable Credential-based Student Loan Application Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Apply for Funding Button */}
          <a
            href="/nelfund/intro"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative flex flex-col items-center justify-center gap-4 rounded-xl bg-white p-12 transition-all duration-300 group-hover:bg-green-50">
              <div className="text-6xl transition-transform duration-300 group-hover:scale-110">
                📝
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Apply for Funding</h2>
              <p className="text-center text-gray-600">
                Student? Connect your digital wallet to apply for NELFUND
              </p>
              <div className="mt-2 flex items-center gap-2 text-green-600 font-semibold">
                <span>Get Started</span>
                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </div>
            </div>
          </a>

          {/* Sign In Button */}
          <a
            href="/login"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-1 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="relative flex flex-col items-center justify-center gap-4 rounded-xl bg-white p-12 transition-all duration-300 group-hover:bg-blue-50">
              <div className="text-6xl transition-transform duration-300 group-hover:scale-110">
                🔐
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
              <p className="text-center text-gray-600">
                Already applied? Sign in to check your application status
              </p>
              <div className="mt-2 flex items-center gap-2 text-blue-600 font-semibold">
                <span>Continue</span>
                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
