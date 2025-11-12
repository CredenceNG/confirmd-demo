"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "requesting-proof" | "proof-received";

export default function TelecomsSignupConnectPage() {
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
  const { status: wsStatus, connectionData, isConnected: wsConnected } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[TelecomsSignup] WebSocket status update:', wsStatus, connectionData);

    // Check if this is a proof event by looking at the 'eventType' field
    const isProofEvent = connectionData?.eventType === 'proof';

    if (isProofEvent) {
      // Handle proof status updates
      if (wsStatus === "request-sent") {
        setConnectionStatus("requesting-proof");
        setConnectionMessage("Proof request sent! Please approve in your wallet...");
      }
      // Note: presentation-received is handled in the dedicated useEffect below
      // to trigger verification before navigation
    } else {
      // Handle connection status updates
      if (wsStatus === "active" || wsStatus === "completed") {
        if (connectionStatus === "connecting") {
          setConnectionStatus("connected");
          setConnectionMessage(`Connection established! Connected to ${connectionData?.theirLabel || 'wallet'}`);

          // Store connectionId for proof request
          if (connectionData?.connectionId) {
            setConnectionId(connectionData.connectionId);
            console.log('[TelecomsSignup] Connection established with connectionId:', connectionData.connectionId);

            // Automatically send proof request
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

  // Create a connection session and use WebSocket for updates
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");

    try {
      // Create a new connection session
      const response = await fetch('/api/connections/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'telecoms' }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setInvitationUrl(data.data.invitationUrl);
        setConnectionStatus("connecting");
        setConnectionMessage("Waiting for wallet connection...");
        // WebSocket will automatically connect via useConnectionWebSocket hook
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


  // Send proof request to connected wallet
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[TelecomsSignup] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting your eKYC credentials...");

    try {
      const response = await fetch('/api/telecoms/signup/request-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[TelecomsSignup] Proof request sent successfully', data.data);
        setProofStatus(data.data.status);
        // Store proofId for later verification
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        // Store proofUrl for mobile deeplink
        if (data.data.proofUrl) {
          setProofUrl(data.data.proofUrl);
        }
        setConnectionMessage("Proof request sent! Please approve in your wallet...");
      } else {
        console.error('[TelecomsSignup] Failed to send proof request:', data.error);
        setConnectionMessage("Failed to request credentials. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[TelecomsSignup] Error sending proof request:', error);
      setConnectionMessage("Error requesting credentials. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Verify proof presentation after receiving it
  const verifyProof = async (proofIdToVerify: string) => {
    console.log('[TelecomsSignup] Verifying proof presentation', { proofId: proofIdToVerify });
    setIsVerifying(true);
    setConnectionMessage("Verifying your credentials...");

    try {
      const response = await fetch('/api/proofs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify }),
      });

      const data = await response.json();

      console.log('[TelecomsSignup] Verify API response:', { status: response.status, data });

      // The verify endpoint returns the proof record with isVerified: true and state: 'done' when verified
      if (data.success && data.data?.isVerified === true && data.data?.state === 'done') {
        console.log('[TelecomsSignup] Proof verification successful', data.data);
        setConnectionMessage("Credentials verified! Redirecting...");

        // Navigate immediately after successful verification
        router.push(`/telecoms/signup/success?sessionId=${sessionId}`);
      } else {
        const errorMsg = data.error?.error_description || data.error?.error ||
          `Verification failed (isVerified: ${data.data?.isVerified}, state: ${data.data?.state})`;
        console.error('[TelecomsSignup] Proof verification failed:', errorMsg, data);
        setConnectionMessage(`Failed to verify credentials: ${errorMsg}`);
        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('[TelecomsSignup] Error verifying proof:', error);
      setConnectionMessage("Error verifying credentials. Please try again.");
      setConnectionStatus("connected");
      setIsVerifying(false);
    }
  };

  // Handle proof status updates from WebSocket
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[TelecomsSignup] Proof status update:', connectionData);
      setProofStatus(connectionData.status || "");

      // Store proofId if not already set
      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      // When presentation is received, trigger verification
      if (connectionData.status === "presentation-received" && !isVerifying) {
        setConnectionStatus("proof-received");
        setConnectionMessage("Credentials received! Verifying...");

        // Trigger verification with the proofId from WebSocket
        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify) {
          console.log('[TelecomsSignup] Triggering verification for proofId:', proofIdToVerify);
          verifyProof(proofIdToVerify);
        } else {
          console.error('[TelecomsSignup] No proofId available for verification');
          setConnectionMessage("Error: Missing proof ID. Please try again.");
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Proof request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }
  }, [connectionData]);

  // Use the actual organization connection invitation URL for the QR code
  const qrCodeValue = invitationUrl || `confirmd://connect?sessionId=${sessionId}&requestType=telecoms`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Telecoms Service Signup</h2>
                <p className="text-teal-100 mt-1">
                  Reuse your eKYC credential for instant service activation
                </p>
              </div>
              <Link
                href="/finance/telecoms/signup"
                className="inline-flex items-center gap-2 text-white hover:text-teal-100 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            </div>
          </div>

          <div className="p-6">
            {connectionStatus === "disconnected" && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-teal-600"
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
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Connect Your Digital Wallet
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Click the button below to generate a QR code. Scan it with your digital
                    wallet app to reuse your existing eKYC credential - no need to upload documents again!
                  </p>

                  <button
                    onClick={initiateConnection}
                    disabled={isLoadingInvitation}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isLoadingInvitation ? "Setting up..." : "Connect Wallet"}
                  </button>

                  {connectionMessage && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{connectionMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {connectionStatus === "connecting" && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Scan QR Code with Your Wallet
                  </h3>

                  {isLoadingInvitation ? (
                    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-6">
                      <div className="w-64 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-gray-600">Loading QR Code...</p>
                        </div>
                      </div>
                    </div>
                  ) : invitationUrl ? (
                    <div className="bg-white p-8 rounded-lg border-2 border-gray-200 inline-block mb-6">
                      <QRCodeSVG value={qrCodeValue} size={320} level="H" />
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-lg border-2 border-red-200 inline-block mb-6">
                      <div className="w-64 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <p className="text-sm text-red-600">Failed to load invitation</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
                      {connectionMessage || "Waiting for wallet connection..."}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Open your ConfirmD App and scan the QR code to connect
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => setConnectionStatus("disconnected")}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(connectionStatus === "requesting-proof" || connectionStatus === "proof-received") && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <svg
                      className="w-10 h-10 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {connectionStatus === "proof-received" ? "Credentials Verified!" : "Requesting eKYC Credentials"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {connectionMessage || "Please approve the credential request in your wallet app..."}
                  </p>
                  {proofStatus && (
                    <div className="text-sm text-gray-500 mb-4">
                      Status: <span className="font-medium">{proofStatus}</span>
                    </div>
                  )}

                  {/* Open in Wallet button for mobile users */}
                  {proofUrl && connectionStatus === "requesting-proof" && (
                    <div className="mt-6">
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
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
                </div>
              </div>
            )}

            {connectionStatus === "connected" && !proofStatus && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Ready to Request Credentials
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {connectionMessage || "Click below to send a proof request for your eKYC credentials."}
                  </p>

                  {sessionId && (
                    <button
                      onClick={() => {
                        if (connectionId) {
                          sendProofRequest(sessionId, connectionId);
                        } else {
                          setConnectionMessage("No connection ID available. Please reconnect or create a new connection.");
                        }
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-lg font-semibold rounded-lg hover:from-teal-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      Request eKYC Credentials
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
          <h4 className="font-medium text-teal-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Credential Reusability
          </h4>
          <p className="text-sm text-teal-800">
            Your eKYC credential was issued once by your primary bank but can be reused here for telecoms
            account opening. No need to repeat the KYC process - just present your existing verified credential!
          </p>
        </div>
      </div>
    </div>
  );
}
