"use client";

import { useState } from "react";

export interface PreDemoChecklistProps {
  demoName: string;
  requiredCredentials: string[];
  onConfirm: () => void;
  isVisible?: boolean;
}

/**
 * Pre-Demo Checklist Component
 *
 * Displays wallet cleanup instructions and prerequisites before starting a demo.
 * Requires user confirmation before allowing them to proceed.
 *
 * @param demoName - Display name of the demo (e.g., "Loan Application")
 * @param requiredCredentials - List of credentials needed for this demo
 * @param onConfirm - Callback when user confirms they've completed the checklist
 * @param isVisible - Whether the checklist is currently visible (default: true)
 */
export default function PreDemoChecklist({
  demoName,
  requiredCredentials,
  onConfirm,
  isVisible = true,
}: PreDemoChecklistProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isVisible) return null;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
          !
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Before Starting the {demoName} Demo
          </h3>
          <p className="text-sm text-gray-600">
            Please complete the following steps to ensure a smooth experience
          </p>
        </div>
      </div>

      <div className="space-y-4 ml-11">
        {/* Step 1: Clear Wallet Connections */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            Clear Previous Wallet Connections
          </h4>
          <p className="text-sm text-gray-700 mb-3 ml-8">
            If you've used this demo before, please delete any existing connections from your wallet app:
          </p>
          <ol className="list-decimal ml-12 space-y-1 text-sm text-gray-600">
            <li>Open your ConfirmD wallet app</li>
            <li>Go to "Connections" or "My Connections"</li>
            <li>Find and delete the connection (usually named after the organization/agent)</li>
            <li>Close and reopen the wallet app to ensure changes take effect</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2 ml-8 italic">
            Note: The connection name in your wallet matches the organization name from ConfirmD Platform, not the demo name.
          </p>
        </div>

        {/* Step 2: Required Credentials */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            Ensure Required Credentials
          </h4>
          <p className="text-sm text-gray-700 mb-3 ml-8">
            Make sure you have the following credentials in your wallet:
          </p>
          <ul className="ml-8 space-y-2">
            {requiredCredentials.map((credential, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{credential}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-3 ml-8">
            Don't have these credentials?{" "}
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium underline">
              Get them from our demo pages
            </a>
          </p>
        </div>

        {/* Step 3: Have Wallet Ready */}
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            Have Your Wallet Ready
          </h4>
          <p className="text-sm text-gray-700 ml-8">
            Keep your ConfirmD wallet app open and ready to scan the QR code when prompted.
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
              I have cleared my wallet connections and have the required credentials
            </span>
          </label>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!isConfirmed}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            isConfirmed
              ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02] cursor-pointer"
              : "bg-gray-300 cursor-not-allowed opacity-60"
          }`}
        >
          {isConfirmed ? "I'm Ready - Continue to Demo" : "Please Complete the Checklist Above"}
        </button>
      </div>
    </div>
  );
}
