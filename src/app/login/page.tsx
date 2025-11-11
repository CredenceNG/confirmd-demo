"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

type AuthMethod = "wallet" | "password";
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "authenticating";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("wallet");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wallet Authentication
  const initiateWalletAuth = () => {
    const newSessionId = `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setConnectionStatus("connecting");

    // TODO: Replace with actual API call to create authentication session
    // The QR code will contain a deep link to the wallet app
    // Example: nelfund://auth?sessionId=${newSessionId}&requestType=login
  };

  const handleWalletConnected = () => {
    setConnectionStatus("connected");
    // TODO: Call API to authenticate user via wallet
    authenticateWithWallet();
  };

  const authenticateWithWallet = async () => {
    setConnectionStatus("authenticating");

    // TODO: Replace with actual API call to authenticate via wallet
    // The API should verify the wallet signature and log the user in
    setTimeout(() => {
      alert("Authentication successful! Redirecting to dashboard...");
      window.location.href = "/dashboard";
    }, 2000);
  };

  // Traditional Email/Password Authentication
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with actual API call for password authentication
    setTimeout(() => {
      if (email && password) {
        alert("Login successful! Redirecting to dashboard...");
        window.location.href = "/dashboard";
      } else {
        alert("Please enter your email and password");
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const qrCodeValue = `nelfund://auth?sessionId=${sessionId}&requestType=login`;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">N</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-800">NELFUND</h1>
              <p className="text-sm text-gray-600">Student Portal</p>
            </div>
          </div>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Wallet Authentication */}
            <div className="p-8 md:p-12 border-r border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Quick Sign In
                </h2>
                <p className="text-gray-600 text-sm">
                  Use your digital wallet for secure, passwordless authentication
                </p>
              </div>

              {connectionStatus === "disconnected" && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-green-800 text-sm">
                          Fast & Secure
                        </h4>
                        <p className="text-xs text-green-700 mt-1">
                          No passwords needed. Authenticate directly from your wallet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={initiateWalletAuth}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Sign In with Wallet
                    </div>
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Don't have an account?{" "}
                      <Link
                        href="/register"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Register here
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {connectionStatus === "connecting" && (
                <div className="text-center space-y-6">
                  <div className="bg-white p-6 rounded-xl border-2 border-green-200 inline-block">
                    <QRCodeSVG value={qrCodeValue} size={220} level="H" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      Waiting for wallet connection...
                    </div>
                    <p className="text-xs text-gray-500">
                      Scan with your digital wallet app to authenticate
                    </p>
                  </div>
                  <button
                    onClick={handleWalletConnected}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Simulate Wallet Auth (Demo)
                  </button>
                  <div>
                    <button
                      onClick={() => setConnectionStatus("disconnected")}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {(connectionStatus === "connected" ||
                connectionStatus === "authenticating") && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <svg
                      className="w-10 h-10 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Authenticating...
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Please wait while we verify your credentials
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Traditional Login */}
            <div className="p-8 md:p-12 bg-gray-50">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Traditional Sign In
                </h2>
                <p className="text-gray-600 text-sm">
                  Use your email and password if you prefer
                </p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    Remember me
                  </label>
                  <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-md"
                >
                  {isSubmitting ? "Signing In..." : "Sign In with Password"}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  By signing in, you agree to our{" "}
                  <a href="#" className="text-green-600 hover:text-green-700">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-green-600 hover:text-green-700">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
