"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";
import QRCodeWithDeepLink from "@/components/QRCodeWithDeepLink";
import { getStoredConnection, clearConnection } from "@/lib/utils/connection-storage";

type AuthStatus = "unauthenticated" | "authenticating" | "authenticated";

interface CorpMember {
  surname: string;
  othernames: string;
  idNumber: string;
  serviceState: string;
  serviceStartDate: string;
  serviceEndDate: string;
  callUpNumber?: string;
  phoneNumber?: string;
  school?: string;
  programme?: string;
  bloodGroup?: string;
}

export default function NYSCPortalPage() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("unauthenticated");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [authMessage, setAuthMessage] = useState<string>("");
  const [proofId, setProofId] = useState<string>("");
  const [corpMember, setCorpMember] = useState<CorpMember | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearStorage = () => {
    clearConnection();
    setShowClearConfirm(false);
    setAuthMessage('Connection data cleared! Please reconnect your wallet.');
  };

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[NYSC Portal] WebSocket status update:', wsStatus, connectionData);

    const isProofEvent = connectionData?.eventType === 'proof';

    if (isProofEvent) {
      if (wsStatus === "request-sent") {
        setAuthMessage("Proof request sent! Please approve in your wallet...");
      } else if (connectionData?.status === "presentation-received") {
        setAuthMessage("NYSC ID Card received! Verifying credentials...");

        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify && sessionId) {
          verifyAndAuthenticate(proofIdToVerify);
        } else if (!sessionId) {
          console.error('[NYSC Portal] Cannot verify - sessionId is missing');
          setAuthMessage("Session error. Please refresh and try again.");
          setAuthStatus("unauthenticated");
        }
      } else if (connectionData?.status === "abandoned") {
        setAuthMessage("Authentication cancelled. Please try again.");
        setAuthStatus("unauthenticated");
      }
    } else {
      if (wsStatus === "active" || wsStatus === "completed") {
        if (authStatus === "authenticating" && connectionData?.connectionId) {
          setConnectionId(connectionData.connectionId);
          // Automatically send proof request for NYSC ID Card
          sendAuthProofRequest(sessionId, connectionData.connectionId);
        }
      } else if (wsStatus === "response") {
        setAuthMessage(`Connecting to ${connectionData?.theirLabel || 'wallet'}...`);
      } else if (wsStatus === "abandoned" || wsStatus === "error") {
        setAuthMessage("Connection failed or expired. Please try again.");
        setAuthStatus("unauthenticated");
      }
    }
  }, [wsStatus, connectionData, sessionId, authStatus]);

  // Create connection session
  const initiateAuthentication = async () => {
    setIsLoadingInvitation(true);
    setAuthMessage("Creating authentication session...");

    try {
      const response = await fetch('/api/nysc/portal/create-auth-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'nysc-portal-auth' }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setInvitationUrl(data.data.invitationUrl);
        setAuthStatus("authenticating");
        setAuthMessage("Waiting for wallet connection...");
      } else {
        console.error('Failed to create session:', data.error);
        setAuthMessage("Failed to create authentication session. Please try again.");
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setAuthMessage("Connection error. Please try again.");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send proof request for NYSC ID Card
  const sendAuthProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[NYSC Portal] Sending auth proof request', { sessionId, connectionId });
    setAuthMessage("Requesting your NYSC ID Card for authentication...");

    try {
      const response = await fetch('/api/nysc/portal/request-id-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[NYSC Portal] Auth proof request sent successfully', data.data);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        setAuthMessage("Proof request sent! Please share your NYSC ID Card from your wallet...");
      } else {
        console.error('[NYSC Portal] Failed to send proof request:', data.error);
        setAuthMessage("Failed to request credentials. Please try again.");
        setAuthStatus("unauthenticated");
      }
    } catch (error) {
      console.error('[NYSC Portal] Error sending proof request:', error);
      setAuthMessage("Error requesting credentials. Please try again.");
      setAuthStatus("unauthenticated");
    }
  };

  // Verify proof and authenticate user
  const verifyAndAuthenticate = async (proofIdToVerify: string) => {
    console.log('[NYSC Portal] Verifying credentials and authenticating', {
      proofId: proofIdToVerify,
      sessionId,
      hasSessionId: !!sessionId
    });

    if (!sessionId) {
      console.error('[NYSC Portal] Cannot authenticate - sessionId is empty');
      setAuthMessage("Session error. Please refresh the page and try again.");
      setAuthStatus("unauthenticated");
      return;
    }

    setAuthMessage("Verifying your NYSC ID Card...");

    try {
      const response = await fetch('/api/nysc/portal/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify, sessionId }),
      });

      const data = await response.json();

      console.log('[NYSC Portal] Authentication API response:', { status: response.status, data });

      if (data.success && data.data?.authenticated) {
        console.log('[NYSC Portal] Authentication successful', data.data);
        setCorpMember(data.data.corpMember);
        setAuthStatus("authenticated");
        setAuthMessage("Authentication successful! Welcome to NYSC Portal.");
      } else {
        const errorMsg = data.error?.error_description || data.error?.error || 'Authentication failed';
        console.error('[NYSC Portal] Authentication failed:', errorMsg, data);
        setAuthMessage(`Authentication failed: ${errorMsg}`);
        setAuthStatus("unauthenticated");
      }
    } catch (error) {
      console.error('[NYSC Portal] Error during authentication:', error);
      setAuthMessage("Error during authentication. Please try again.");
      setAuthStatus("unauthenticated");
    }
  };

  // Handle "Already Connected" flow - use existing connectionId from localStorage
  const handleAlreadyConnected = async () => {
    console.log('[NYSC Portal] User clicked Already Connected');

    // Check if we have a stored connection using unified storage
    const storedConnection = getStoredConnection();

    if (!storedConnection) {
      setAuthMessage("No previous connection found. Please use 'Login with NYSC ID Card' option.");
      console.warn('[NYSC Portal] No connectionId found in storage');
      return;
    }

    const storedConnectionId = storedConnection.connectionId;
    console.log('[NYSC Portal] Using stored connectionId:', storedConnectionId);
    setIsLoadingInvitation(true);
    setAuthMessage("Using existing connection...");

    try {
      // Create a session with the existing connectionId
      const response = await fetch('/api/nysc/portal/create-auth-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'nysc-portal-auth',
          useExistingConnection: true,
          connectionId: storedConnectionId
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const newSessionId = data.data.sessionId;

        setSessionId(newSessionId);
        setConnectionId(storedConnectionId);
        setAuthStatus("authenticating");
        setAuthMessage(`Using existing connection. Sending authentication request...`);
        console.log('[NYSC Portal] Session created with existing connection', {
          sessionId: newSessionId,
          connectionId: storedConnectionId
        });

        // Automatically send proof request
        await sendAuthProofRequest(newSessionId, storedConnectionId);
      } else {
        console.error('[NYSC Portal] Failed to create session:', data.error);
        setAuthMessage("Failed to use existing connection. Please reconnect.");
        setAuthStatus("unauthenticated");
        // Clear invalid connection
        localStorage.removeItem('nysc_connectionId');
        localStorage.removeItem('nysc_connectionId_timestamp');
      }
    } catch (error) {
      console.error('[NYSC Portal] Error creating session:', error);
      setAuthMessage("Error using existing connection. Please reconnect.");
      setAuthStatus("unauthenticated");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  const qrCodeValue = invitationUrl || `nysc://portal-auth?sessionId=${sessionId}`;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Unauthenticated State - Login */}
          {authStatus === "unauthenticated" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">NYSC Portal</h1>
                <p className="text-emerald-100">Corps Member Dashboard</p>
              </div>

              <div className="p-8">
                <div className="max-w-2xl mx-auto">
                  {/* Login Info */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🔐</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                          Secure Login with NYSC ID Card
                        </h3>
                        <p className="text-blue-800 mb-3">
                          Access your NYSC portal by authenticating with your NYSC ID Card credential.
                        </p>
                        <p className="text-sm text-blue-700">
                          You must have completed camp onboarding and received your NYSC ID Card to access the portal.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* What You Can Do */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-emerald-900 mb-3">
                      What You Can Do
                    </h3>
                    <div className="space-y-3 text-sm text-emerald-800">
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-500 font-bold">📊</span>
                        <p>View your personal profile and service details</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-500 font-bold">📝</span>
                        <p>Submit monthly service reports</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-500 font-bold">📅</span>
                        <p>Track your service progress and milestones</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-emerald-500 font-bold">💼</span>
                        <p>Access NYSC resources and announcements</p>
                      </div>
                    </div>
                  </div>

                  {/* Login Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={initiateAuthentication}
                      disabled={isLoadingInvitation}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingInvitation ? "Setting up..." : "Login with NYSC ID Card"}
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="h-px bg-gray-300 w-8"></div>
                      <span className="text-gray-500 text-sm">or</span>
                      <div className="h-px bg-gray-300 w-8"></div>
                    </div>

                    <button
                      onClick={handleAlreadyConnected}
                      disabled={isLoadingInvitation}
                      className="px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-lg hover:bg-emerald-50 transition-all border-2 border-emerald-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingInvitation ? "Setting up..." : "I'm Already Connected"}
                    </button>
                  </div>

                  {/* Back Link and Clear Connection */}
                  <div className="text-center mt-6 space-y-2">
                    <Link
                      href="/nysc"
                      className="text-sm text-emerald-600 hover:text-emerald-700 underline block"
                    >
                      ← Back to NYSC Demo Home
                    </Link>
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear saved connection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clear Connection Confirmation Modal */}
          {showClearConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Clear Connection Data?
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  This will remove your saved wallet connection. You'll need to scan the QR code again or reconnect your wallet.
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

          {/* Authenticating State - QR Code */}
          {authStatus === "authenticating" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6">
                <h2 className="text-2xl font-bold text-white text-center">Authenticate with Your Wallet</h2>
              </div>

              <div className="p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Scan QR Code with Your Wallet
                </h3>

                <QRCodeWithDeepLink
                  invitationUrl={invitationUrl}
                  qrCodeValue={qrCodeValue}
                  isLoading={isLoadingInvitation}
                  instructionText="Open your ConfirmD App and scan the QR code to authenticate"
                />

                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                    {authMessage || "Waiting for wallet connection..."}
                  </div>
                </div>

                {/* Already Connected Button */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={handleAlreadyConnected}
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mb-4"
                  >
                    Already connected? Use existing connection →
                  </button>
                </div>

                <button
                  onClick={() => setAuthStatus("unauthenticated")}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Authenticated State - Dashboard */}
          {authStatus === "authenticated" && corpMember && (
            <div className="space-y-6">
              {/* Header with Logout */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Welcome, {corpMember.othernames} {corpMember.surname}!
                    </h1>
                    <p className="text-gray-600">NYSC ID: {corpMember.idNumber}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthStatus("unauthenticated");
                      setCorpMember(null);
                      setSessionId("");
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Personal Profile</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {corpMember.surname} {corpMember.othernames}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">NYSC ID Number</label>
                      <p className="text-lg font-semibold text-gray-900">{corpMember.idNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service State</label>
                      <p className="text-lg font-semibold text-gray-900">{corpMember.serviceState}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Call-Up Number</label>
                      <p className="text-lg font-semibold text-gray-900">{corpMember.callUpNumber || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service Period</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {corpMember.serviceStartDate} - {corpMember.serviceEndDate}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-lg font-semibold text-gray-900">{corpMember.phoneNumber || "N/A"}</p>
                    </div>
                    {corpMember.school && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Institution</label>
                        <p className="text-lg font-semibold text-gray-900">{corpMember.school}</p>
                      </div>
                    )}
                    {corpMember.programme && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Programme</label>
                        <p className="text-lg font-semibold text-gray-900">{corpMember.programme}</p>
                      </div>
                    )}
                    {corpMember.bloodGroup && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Blood Group</label>
                        <p className="text-lg font-semibold text-gray-900">{corpMember.bloodGroup}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Monthly Report Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Monthly Report</h2>
                </div>
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">📝</div>
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Submit Your Monthly Report</h3>
                        <p className="text-sm text-blue-800 mb-3">
                          Corps members are required to submit monthly reports detailing their activities and contributions during service.
                        </p>
                        <p className="text-xs text-blue-700">
                          <strong>Note:</strong> This is a demo interface. In a production system, you would fill out a detailed form here.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Month
                      </label>
                      <input
                        type="month"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        defaultValue={new Date().toISOString().slice(0, 7)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Activities Summary
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        rows={6}
                        placeholder="Describe your activities, projects, and contributions during this month..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attendance (Days Present)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 22"
                        min="0"
                        max="31"
                      />
                    </div>

                    <button
                      className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
                      onClick={() => alert('Monthly report submitted successfully! (Demo)')}
                    >
                      Submit Monthly Report
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Resources</h3>
                  <p className="text-sm text-gray-600">Access NYSC materials</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-3">📢</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Announcements</h3>
                  <p className="text-sm text-gray-600">View latest updates</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-3">💬</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Support</h3>
                  <p className="text-sm text-gray-600">Get help and assistance</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
