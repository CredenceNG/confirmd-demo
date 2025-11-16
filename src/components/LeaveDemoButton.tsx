"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { endDemoSession } from "@/lib/utils/demo-session";

interface LeaveDemoButtonProps {
  demoType: string;
  demoName?: string;
  className?: string;
  onLeave?: () => void;
}

export default function LeaveDemoButton({
  demoType,
  demoName,
  className = "",
  onLeave,
}: LeaveDemoButtonProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLeaveDemo = async () => {
    setIsLeaving(true);

    try {
      const result = await endDemoSession(demoType);

      if (result.success) {
        console.log('[LeaveDemoButton] Demo session ended successfully');

        // Call onLeave callback if provided
        if (onLeave) {
          onLeave();
        }

        // Redirect to home page
        router.push('/');
      } else {
        console.error('[LeaveDemoButton] Failed to end demo session');
        alert('Failed to leave demo. Please try again.');
        setIsLeaving(false);
      }
    } catch (error) {
      console.error('[LeaveDemoButton] Error leaving demo:', error);
      alert('Error leaving demo. Please try again.');
      setIsLeaving(false);
    }
  };

  const displayName = demoName || demoType;

  return (
    <>
      <button
        onClick={() => setShowConfirmation(true)}
        disabled={isLeaving}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title={`Leave ${displayName} Demo`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {isLeaving ? 'Leaving...' : 'Leave Demo'}
      </button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Leave {displayName} Demo?
                </h3>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to leave this demo? Your connection will be cleared.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-900 mb-2">
                    <strong>Important:</strong> After leaving, please delete the connection from your wallet app before starting a new demo session.
                  </p>
                  <p className="text-xs text-yellow-800 italic">
                    The connection name in your wallet matches the organization name from ConfirmD Platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isLeaving}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  handleLeaveDemo();
                }}
                disabled={isLeaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLeaving ? 'Leaving...' : 'Leave Demo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
