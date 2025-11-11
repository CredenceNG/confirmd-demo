"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";
import QRCodeWithDeepLink from "@/components/QRCodeWithDeepLink";
import { storeConnection, getStoredConnection, clearConnection } from "@/lib/utils/connection-storage";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "requesting-proof" | "proof-received" | "issuing-id-card";

export default function NYSCOnboardingPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [proofStatus, setProofStatus] = useState<string>("");
  const [proofId, setProofId] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[NYSC Onboarding] WebSocket status update:', wsStatus, connectionData);

    const isProofEvent = connectionData?.eventType === 'proof';

    if (isProofEvent) {
      if (wsStatus === "request-sent") {
        setConnectionStatus("requesting-proof");
        setConnectionMessage("Proof request sent! Please approve in your wallet...");
      }
    } else {
      if (wsStatus === "active" || wsStatus === "completed") {
        if (connectionStatus === "connecting") {
          setConnectionStatus("connected");
          setConnectionMessage(`Connection established! Connected to ${connectionData?.theirLabel || 'wallet'}`);

          if (connectionData?.connectionId) {
            setConnectionId(connectionData.connectionId);
            // Store connectionId in localStorage for "Already Connected" feature
            storeConnection(connectionData.connectionId);
            console.log('[NYSC Onboarding] Stored connectionId in localStorage:', connectionData.connectionId);

            // Automatically send proof request for Green Card
            sendProofRequest(sessionId, connectionData.connectionId);
          }
        }
      } else if (wsStatus === "response") {
        setConnectionMessage(`Connecting to ${connectionData?.theirLabel || 'wallet'}...`);
      } else if (wsStatus === "abandoned" || wsStatus === "error") {
        setConnectionMessage("Connection failed or expired. Please try again.");
        setConnectionStatus("disconnected");
      }
    }
  }, [wsStatus, connectionData, sessionId, connectionStatus]);

  // Create connection session
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");

    try {
      const response = await fetch('/api/nysc/onboarding/create-proof-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'nysc-onboarding' }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setInvitationUrl(data.data.invitationUrl);
        setConnectionStatus("connecting");
        setConnectionMessage("Waiting for wallet connection...");
      } else {
        console.error('Failed to create session:', data.error);
        setConnectionMessage("Failed to create connection. Please try again.");
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setConnectionMessage("Connection error. Please try again.");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send comprehensive proof request for all 4 credentials
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[NYSC Onboarding] Sending comprehensive proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting all credentials (Green Card, Student Card, Statement of Results, Medical Fitness)...");

    try {
      const response = await fetch('/api/nysc/onboarding/request-green-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[NYSC Onboarding] Comprehensive proof request sent successfully', data.data);
        setProofStatus(data.data.status);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        if (data.data.proofUrl) {
          setProofUrl(data.data.proofUrl);
        }
        setConnectionMessage("Proof request sent! Please share all 4 required credentials from your wallet...");
      } else {
        console.error('[NYSC Onboarding] Failed to send proof request:', data.error);
        setConnectionMessage("Failed to request credentials. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[NYSC Onboarding] Error sending proof request:', error);
      setConnectionMessage("Error requesting credentials. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Handle "Already Connected" flow - use existing connectionId from localStorage
  const handleAlreadyConnected = async () => {
    console.log('[NYSC Onboarding] User clicked Already Connected');

    // Check if we have a stored connectionId
    const storedConnection = getStoredConnection();

    if (!storedConnection) {
      setConnectionMessage("No previous connection found. Please use 'Connect Wallet' option.");
      console.warn('[NYSC Onboarding] No connectionId found in storage');
      return;
    }

    const storedConnectionId = storedConnection.connectionId;
    console.log('[NYSC Onboarding] Using stored connectionId:', storedConnectionId);
    setIsLoadingInvitation(true);
    setConnectionMessage("Using existing connection...");

    try {
      // Create a session with the existing connectionId
      const response = await fetch('/api/nysc/onboarding/create-proof-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'nysc-onboarding',
          useExistingConnection: true,
          connectionId: storedConnectionId
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const newSessionId = data.data.sessionId;

        setSessionId(newSessionId);
        setConnectionId(storedConnectionId);
        setConnectionStatus("connected");
        setConnectionMessage(`Using existing connection. Ready to send proof request.`);
        console.log('[NYSC Onboarding] Session created with existing connection', {
          sessionId: newSessionId,
          connectionId: storedConnectionId
        });
      } else {
        console.error('[NYSC Onboarding] Failed to create session:', data.error);
        setConnectionMessage("Failed to use existing connection. Please reconnect.");
        setConnectionStatus("disconnected");
        // Clear invalid connection
        clearConnection();
      }
    } catch (error) {
      console.error('[NYSC Onboarding] Error creating session:', error);
      setConnectionMessage("Error using existing connection. Please reconnect.");
      setConnectionStatus("disconnected");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Verify comprehensive proof and issue NYSC ID Card
  const verifyAndIssueIDCard = async (proofIdToVerify: string) => {
    console.log('[NYSC Onboarding] Verifying all credentials and issuing NYSC ID', { proofId: proofIdToVerify });
    setIsVerifying(true);
    setConnectionStatus("issuing-id-card");
    setConnectionMessage("Verifying all credentials (Green Card, Student Card, Statement of Results, Medical Fitness)...");

    try {
      const response = await fetch('/api/nysc/onboarding/issue-id-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify, sessionId }),
      });

      const data = await response.json();

      console.log('[NYSC Onboarding] Issue ID Card API response:', { status: response.status, data });

      if (data.success && data.data?.idCardIssued) {
        console.log('[NYSC Onboarding] NYSC ID Card API call successful', data.data);
        setConnectionMessage("Preparing NYSC ID Card offer...");
        // Don't redirect yet - wait for webhook events to confirm acceptance
      } else {
        const errorMsg = data.error?.error_description || data.error?.error || 'Failed to issue NYSC ID Card';
        console.error('[NYSC Onboarding] Failed to issue ID Card:', errorMsg, data);
        setConnectionMessage(`Failed to issue NYSC ID: ${errorMsg}`);
        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('[NYSC Onboarding] Error issuing ID Card:', error);
      setConnectionMessage("Error issuing NYSC ID Card. Please try again.");
      setConnectionStatus("connected");
      setIsVerifying(false);
    }
  };

  // Handle proof status updates from WebSocket
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[NYSC Onboarding] Proof status update:', connectionData);
      setProofStatus(connectionData.status || "");

      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      // When presentation is received, trigger verification and ID Card issuance
      if (connectionData.status === "presentation-received" && !isVerifying) {
        setConnectionStatus("proof-received");
        setConnectionMessage("All credentials received! Verifying and issuing NYSC ID Card...");

        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify) {
          console.log('[NYSC Onboarding] Triggering comprehensive verification and ID Card issuance for proofId:', proofIdToVerify);
          verifyAndIssueIDCard(proofIdToVerify);
        } else {
          console.error('[NYSC Onboarding] No proofId available for verification');
          setConnectionMessage("Error: Missing proof ID. Please try again.");
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Proof request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }

    // Handle credential status updates (ID Card issuance)
    if (connectionData?.eventType === "credential") {
      console.log('[NYSC Onboarding] Credential status update:', connectionData);

      if (connectionData.status === "offer-sent") {
        setConnectionMessage("🎉 NYSC ID Card offer sent to your wallet! Please accept it in your app.");
      } else if (connectionData.status === "request-received") {
        setConnectionMessage("📱 ID Card offer received by your wallet...");
      } else if (connectionData.status === "credential-issued") {
        setConnectionMessage("✅ NYSC ID Card accepted and issued!");
        // Give user time to see the success message before redirecting
        setTimeout(() => {
          router.push(`/nysc/onboarding/success?sessionId=${sessionId}`);
        }, 2500);
      } else if (connectionData.status === "done") {
        setConnectionMessage("✅ NYSC ID Card successfully added to your wallet! Redirecting...");
        // Give user time to see the success message before redirecting
        setTimeout(() => {
          router.push(`/nysc/onboarding/success?sessionId=${sessionId}`);
        }, 2000);
      } else if (connectionData.status === "abandoned" || connectionData.status === "declined") {
        setConnectionMessage("❌ ID Card offer was declined. Please try again.");
        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    }
  }, [connectionData]);

  const qrCodeValue = invitationUrl || `nysc://onboarding?sessionId=${sessionId}`;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">NYSC Camp Onboarding - Phase 2</h2>
                  <p className="text-emerald-100 mt-1">
                    Present your Green Card to receive your NYSC ID
                  </p>
                </div>
                <Link
                  href="/nysc"
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  ← Back to NYSC Demo
                </Link>
              </div>
            </div>

            <div className="p-6">
          {/* Disconnected State */}
          {connectionStatus === "disconnected" && (
            <div className="p-8">
              {/* Prerequisites Warning - Multiple Credentials Required */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📋</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">
                      Multiple Credentials Required for Onboarding
                    </h3>
                    <p className="text-blue-800 mb-4">
                      NYSC Camp requires comprehensive verification. You must have the following credentials in your wallet:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-blue-900">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <div>
                          <strong>NYSC Green Card</strong>
                          <p className="text-blue-700 text-xs">Your call-up and contact info</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-900">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <div>
                          <strong>Student Card</strong>
                          <p className="text-blue-700 text-xs">Current enrollment verification</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-900">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <div>
                          <strong>Statement of Results</strong>
                          <p className="text-blue-700 text-xs">Academic transcript</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-900">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <div>
                          <strong>Medical Fitness Certificate</strong>
                          <p className="text-blue-700 text-xs">Health clearance</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-700 bg-blue-100 rounded-lg p-3 border border-blue-200">
                      <strong>💡 Demo Note:</strong> This comprehensive verification demonstrates how NYSC Camp can verify multiple credentials in a single proof request, ensuring you have all required documents before issuing your ID Card.
                    </p>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-emerald-900 mb-3">
                  Comprehensive Verification Process
                </h3>
                <div className="space-y-3 text-sm text-emerald-800">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold">1.</span>
                    <p>Connect your wallet by scanning the QR code</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold">2.</span>
                    <p><strong>Single proof request for all 4 credentials</strong> - You'll be asked to share Green Card, Student Card, Statement of Results, and Medical Fitness in one go</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold">3.</span>
                    <p>NYSC Camp verifies all your credentials automatically</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 font-bold">4.</span>
                    <p>Upon successful verification, you receive your official NYSC ID Card that incorporates verified data from all your credentials</p>
                  </div>
                </div>
              </div>

              {/* Connect Buttons */}
              <div className="text-center space-y-4">
                <button
                  onClick={initiateConnection}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Connect Wallet for Onboarding
                </button>

                <div className="flex items-center gap-4 justify-center">
                  <div className="h-px bg-gray-300 flex-1 max-w-xs"></div>
                  <span className="text-sm text-gray-500">OR</span>
                  <div className="h-px bg-gray-300 flex-1 max-w-xs"></div>
                </div>

                <button
                  onClick={handleAlreadyConnected}
                  disabled={isLoadingInvitation}
                  className="px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-lg hover:bg-emerald-50 transition-all border-2 border-emerald-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingInvitation ? "Setting up..." : "I'm Already Connected"}
                </button>
              </div>
            </div>
          )}

          {/* Connecting State - QR Code */}
          {connectionStatus === "connecting" && (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Scan QR Code with Your Wallet
              </h3>

              <QRCodeWithDeepLink
                invitationUrl={invitationUrl}
                qrCodeValue={qrCodeValue}
                isLoading={isLoadingInvitation}
                instructionText="Open your ConfirmD App and scan the QR code to connect"
              />

              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                  {connectionMessage || "Waiting for wallet connection..."}
                </div>
              </div>

              <button
                onClick={() => setConnectionStatus("disconnected")}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Requesting Proof State */}
          {(connectionStatus === "requesting-proof" || connectionStatus === "proof-received" || connectionStatus === "issuing-id-card") && (
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {connectionStatus === "issuing-id-card"
                  ? "🎉 Issuing NYSC ID Card"
                  : connectionStatus === "proof-received"
                  ? "✅ All Credentials Verified!"
                  : "📋 Requesting Multiple Credentials"}
              </h3>
              <p className="text-xl text-gray-700 mb-6 font-semibold">
                {connectionMessage || "Please share all 4 required credentials in your wallet app..."}
              </p>
              {proofStatus && (
                <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-lg px-6 py-3">
                  <div className="text-sm font-medium text-emerald-800">
                    Status: <span className="font-bold">{proofStatus}</span>
                  </div>
                </div>
              )}

              {/* Open in Wallet button for mobile users */}
              {proofUrl && connectionStatus === "requesting-proof" && (
                <div className="mt-6">
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Open in Wallet
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    Tap to open the proof request directly in your wallet app
                  </p>
                </div>
              )}

              {/* Progress indicator for ID Card issuance */}
              {connectionStatus === "issuing-id-card" && (
                <div className="mt-8">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-emerald-800 font-semibold">
                      Preparing your NYSC ID Card credential...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connected State (waiting for proof) */}
          {connectionStatus === "connected" && !proofStatus && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Ready to Request Green Card
              </h3>
              <p className="text-gray-600 mb-6">{connectionMessage || "Click below to send a proof request for your Green Card."}</p>

              {sessionId && (
                <button
                  onClick={() => {
                    if (connectionId) {
                      sendProofRequest(sessionId, connectionId);
                    } else {
                      setConnectionMessage("No connection ID available. Please reconnect or create a new connection.");
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Request Green Card Proof
                </button>
              )}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
