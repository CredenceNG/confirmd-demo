"use client";

import { useState } from "react";
import Link from "next/link";
import { clearConnection } from "@/lib/utils/connection-storage";

export default function NYSCIntroPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleClearStorage = () => {
    clearConnection();
    setShowClearConfirm(false);
    alert('Connection data cleared! You will need to reconnect your wallet for "Already Connected" features.');
  };

  const handleResetDemo = async () => {
    setIsResetting(true);

    try {
      // Clear localStorage
      localStorage.removeItem('nysc_connectionId');
      localStorage.removeItem('nysc_connectionId_timestamp');

      // Clear database records
      const response = await fetch('/api/nysc/clear-demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        alert(`Demo reset successfully!\n\n${data.data.deletedRecords.registrations} registration record(s) deleted.\n\nYou can now start from the beginning.`);
      } else {
        alert(`Failed to reset demo: ${data.error?.error_description || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error resetting demo:', error);
      alert(`Error resetting demo: ${error.message}`);
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 mb-12 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">🇳🇬</div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold mb-1">
                  NYSC Verifiable Credentials
                </h2>
                <p className="text-green-100 text-sm sm:text-base">
                  Experience credential-based NYSC registration, onboarding, and portal access
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-medium">Demo Active</span>
            </div>
          </div>

          {/* Demo Controls */}
          <div className="mt-4 flex items-center gap-4 flex-wrap text-xs">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-white/80 hover:text-white underline"
            >
              Reset Connection
            </button>
            <span className="text-green-200">•</span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-white/80 hover:text-white underline"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* Clear Connection Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Clear Connection Data?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This will remove your saved wallet connection. You'll need to scan QR codes again or reconnect your wallet for the "Already Connected" feature to work.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearStorage}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Clear Connection
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Demo Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Reset Entire Demo?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    This will permanently delete all demo data:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      All NYSC registration records
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      Saved wallet connections
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      All progress through the phases
                    </li>
                  </ul>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    <strong>Note:</strong> Your issued credentials in your wallet will NOT be deleted. This only clears the demo's database records.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleResetDemo}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? "Resetting..." : "Reset Everything"}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div id="phases" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Complete NYSC Journey
            </h2>

            {/* Phase Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Phase 1: Registration */}
              <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex flex-col min-h-[200px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Registration</h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Submit 3 credentials (Student Card, Transcript, Medical) to receive NYSC Green Card
                </p>

                <Link
                  href="/nysc/registration"
                  className="block w-full px-4 py-3 bg-green-600 text-white text-center rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Start Registration →
                </Link>
              </div>

              {/* Phase 2: Onboarding */}
              <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex flex-col min-h-[200px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Camp Onboarding</h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Verify all 4 credentials at camp to receive NYSC ID Card
                </p>

                <Link
                  href="/nysc/onboarding"
                  className="block w-full px-4 py-3 bg-emerald-600 text-white text-center rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Start Onboarding →
                </Link>
              </div>

              {/* Phase 3: Portal */}
              <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex flex-col min-h-[200px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Portal Access</h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  Passwordless login with NYSC ID Card to access portal and submit reports
                </p>

                <Link
                  href="/nysc/portal"
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Access Portal →
                </Link>
              </div>

              {/* Phase 4: Certificate Issuance */}
              <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow flex flex-col min-h-[200px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Certificate Issuance</h3>
                </div>

                <p className="text-sm text-gray-600 mb-4 flex-grow">
                  NYSC Admin issues Certificate of National Service upon successful completion
                </p>

                <Link
                  href="/nysc/certificate"
                  className="block w-full px-4 py-3 bg-purple-600 text-white text-center rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Issue Certificate →
                </Link>
              </div>
            </div>
        </div>
    </div>
  );
}
