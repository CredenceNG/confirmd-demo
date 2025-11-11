/**
 * Professional Job Portal - Connect/Verification Page
 * Handles proof request for Statement of Result and NYSC Certificate
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";
import QRCodeWithDeepLink from "@/components/QRCodeWithDeepLink";
import { storeConnection, getStoredConnection, clearConnection } from "@/lib/utils/connection-storage";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "requesting-proof" | "proof-received";

export default function ProfessionalConnectPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [proofStatus, setProofStatus] = useState<string>("");
  const [proofId, setProofId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData, isConnected: wsConnected } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[Professional] WebSocket status update:', wsStatus, connectionData);

    // Check if this is a proof event
    const isProofEvent = connectionData?.eventType === 'proof';

    if (isProofEvent) {
      // Handle proof status updates
      if (wsStatus === "request-sent") {
        setConnectionStatus("requesting-proof");
        setConnectionMessage("Proof request sent! Please approve in your wallet...");
      }
    } else {
      // Handle connection status updates
      if (wsStatus === "active" || wsStatus === "completed") {
        if (connectionStatus === "connecting") {
          setConnectionStatus("connected");
          setConnectionMessage(`Connection established! Connected to ${connectionData?.theirLabel || 'wallet'}`);

          // Store connectionId for proof request
          if (connectionData?.connectionId) {
            setConnectionId(connectionData.connectionId);
            // Store connectionId for reuse across all demos (unified connection)
            storeConnection(connectionData.connectionId);
            console.log('[Professional] Stored connectionId:', connectionData.connectionId);
            // Automatically send proof request with professional-specific config
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

  // Create a connection session
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");

    try {
      // Create a new connection session
      const response = await fetch('/api/connections/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'professional' }),
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

  // Handle "Already Connected" flow - use existing connectionId from unified storage
  const handleAlreadyConnected = async () => {
    console.log('[Professional] User clicked Already Connected');

    // Check if we have a stored connection using unified storage
    const storedConnection = getStoredConnection();

    if (!storedConnection) {
      setConnectionMessage("No previous connection found in this browser session. If your wallet says 'already connected', please use 'Connect Wallet' to re-establish the connection.");
      console.warn('[Professional] No connectionId found in storage');

      // Show an alert with more guidance
      alert(
        "No Previous Connection Found\n\n" +
        "This can happen if:\n" +
        "• You're using a different browser\n" +
        "• You cleared your browser data\n" +
        "• This is your first time on this device\n" +
        "• Your previous connection expired (24 hours)\n\n" +
        "Solution:\n" +
        "Click 'Connect Wallet' to scan the QR code. " +
        "If your wallet shows 'already connected', that's okay - " +
        "it will reuse the existing connection."
      );
      return;
    }

    const storedConnectionId = storedConnection.connectionId;
    console.log('[Professional] Using stored connectionId:', storedConnectionId);
    setIsLoadingInvitation(true);
    setConnectionMessage("Using existing connection...");

    try {
      // Create a session with the existing connectionId
      const response = await fetch('/api/connections/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'professional',
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
        setConnectionMessage(`Using existing connection. Sending proof request...`);
        console.log('[Professional] Session created with existing connection', {
          sessionId: newSessionId,
          connectionId: storedConnectionId
        });

        // Automatically send proof request
        await sendProofRequest(newSessionId, storedConnectionId);
      } else {
        console.error('[Professional] Failed to create session:', data.error);
        setConnectionMessage("Failed to use existing connection. Please reconnect.");
        setConnectionStatus("disconnected");
        // Clear invalid connection
        clearConnection();
      }
    } catch (error) {
      console.error('[Professional] Error creating session:', error);
      setConnectionMessage("Error using existing connection. Please reconnect.");
      setConnectionStatus("disconnected");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send proof request for Statement of Result + NYSC Certificate
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[Professional] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting your academic and NYSC credentials...");

    try {
      const response = await fetch('/api/professional/request-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          connectionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Professional] Proof request sent successfully', data.data);
        setProofStatus(data.data.status);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        setConnectionMessage("Proof request sent! Please approve in your wallet...");
      } else {
        console.error('[Professional] Failed to send proof request:', data.error);
        setConnectionMessage("Failed to request credentials. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[Professional] Error sending proof request:', error);
      setConnectionMessage("Error requesting credentials. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Verify proof presentation after receiving it
  const verifyProof = async (proofIdToVerify: string) => {
    console.log('[Professional] Verifying proof presentation', { proofId: proofIdToVerify });
    setIsVerifying(true);
    setConnectionMessage("Verifying your credentials...");

    try {
      const response = await fetch('/api/proofs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify }),
      });

      const data = await response.json();

      console.log('[Professional] Verify API response:', { status: response.status, data });

      if (data.success && data.data?.isVerified === true && data.data?.state === 'done') {
        console.log('[Professional] Proof verification successful', data.data);
        setConnectionMessage("Credentials verified! Redirecting...");

        // Navigate to application form with verified data
        router.push(`/professional/application?sessionId=${sessionId}`);
      } else {
        const errorMsg = data.error?.error_description || data.error?.error ||
          `Verification failed (isVerified: ${data.data?.isVerified}, state: ${data.data?.state})`;
        console.error('[Professional] Proof verification failed:', errorMsg, data);
        setConnectionMessage(`Failed to verify credentials: ${errorMsg}`);
        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('[Professional] Error verifying proof:', error);
      setConnectionMessage("Error verifying credentials. Please try again.");
      setConnectionStatus("connected");
      setIsVerifying(false);
    }
  };

  // Handle proof status updates from WebSocket
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[Professional] Proof status update:', connectionData);
      setProofStatus(connectionData.status || "");

      // Store proofId if not already set
      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      // When presentation is received, trigger verification
      if (connectionData.status === "presentation-received" && !isVerifying) {
        setConnectionStatus("proof-received");
        setConnectionMessage("Credentials received! Verifying...");

        // Trigger verification
        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify) {
          console.log('[Professional] Triggering verification for proofId:', proofIdToVerify);
          verifyProof(proofIdToVerify);
        } else {
          console.error('[Professional] No proofId available for verification');
          setConnectionMessage("Error: Missing proof ID. Please try again.");
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Proof request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }
  }, [connectionData]);

  const qrCodeValue = invitationUrl || `techcorp://connect?sessionId=${sessionId}&requestType=professional`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl shadow-lg p-4 sm:p-6 mb-8 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-4xl sm:text-5xl">💼</div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1">
                You are: Recent Graduate
              </h2>
              <p className="text-blue-100 text-sm sm:text-base">
                Goal: Share your verified credentials to complete job application
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg self-start sm:self-auto">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-medium">Step 2 of 4</span>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/professional/intro")}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Prerequisites
        </button>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <h2 className="text-2xl font-bold text-white">TechCorp Job Application - Credential Verification</h2>
              <p className="text-blue-100 mt-1">
                Connect your digital wallet to share your verified academic and NYSC credentials
              </p>
            </div>

            <div className="p-6">
              {connectionStatus === "disconnected" && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-10 h-10 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      Connect Your Digital Wallet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click the button below to generate a QR code. Scan it with your ConfirmD App
                      to securely share your academic credentials and NYSC certificate.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                      <h4 className="font-semibold text-blue-900 mb-2">What will be requested:</h4>
                      <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                        <div>
                          <p className="font-medium mb-1">📜 Statement of Result:</p>
                          <ul className="space-y-0.5 pl-4">
                            <li>• Full Name</li>
                            <li>• Matric Number</li>
                            <li>• Programme/Course</li>
                            <li>• Class of Degree</li>
                            <li>• Graduation Year</li>
                            <li>• School Name</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">🎓 NYSC Certificate:</p>
                          <ul className="space-y-0.5 pl-4">
                            <li>• Full Name</li>
                            <li>• Call-up Number</li>
                            <li>• Service Start Date</li>
                            <li>• Service End Date</li>
                            <li>• Certificate Number</li>
                            <li>• Issue Date</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button
                        onClick={initiateConnection}
                        disabled={isLoadingInvitation}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingInvitation ? "Setting up..." : "Connect Wallet"}
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-300 w-8"></div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="h-px bg-gray-300 w-8"></div>
                      </div>

                      <button
                        onClick={handleAlreadyConnected}
                        disabled={isLoadingInvitation}
                        className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-all border-2 border-blue-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoadingInvitation ? "Setting up..." : "I'm Already Connected"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {connectionStatus === "connecting" && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      Scan QR Code with Your ConfirmD App
                    </h3>

                    <QRCodeWithDeepLink
                      invitationUrl={invitationUrl}
                      qrCodeValue={qrCodeValue}
                      isLoading={isLoadingInvitation}
                      instructionText="Open your ConfirmD App and scan the QR code to connect"
                    />

                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        {connectionMessage || "Waiting for wallet connection..."}
                      </div>
                    </div>

                    {/* Help text for "already connected" scenario */}
                    <div className="mb-6 max-w-md mx-auto">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>💡 Tip:</strong> If your wallet shows "You have already accepted this connection",
                          that's okay! The connection will be reused and you'll proceed to the next step automatically.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
                      <button
                        onClick={handleAlreadyConnected}
                        className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all border-2 border-blue-600 shadow-md hover:shadow-lg"
                      >
                        I'm Already Connected
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-300 w-8"></div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="h-px bg-gray-300 w-8"></div>
                      </div>

                      <button
                        onClick={() => setConnectionStatus("disconnected")}
                        className="px-6 py-3 text-gray-500 hover:text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all"
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
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <svg
                        className="w-10 h-10 text-purple-600"
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
                      {connectionStatus === "proof-received" ? "Credentials Verified!" : "Requesting Academic & NYSC Credentials"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {connectionMessage || "Please approve the credential request in your wallet app..."}
                    </p>
                    {proofStatus && (
                      <div className="text-sm text-gray-500">
                        Status: <span className="font-medium">{proofStatus}</span>
                      </div>
                    )}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You will be asked to approve sharing both your Statement of Result
                        and NYSC Certificate in your wallet app.
                      </p>
                    </div>
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
                      Connection Established
                    </h3>
                    <p className="text-gray-600">
                      {connectionMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>Don't have the ConfirmD App?</strong> Download it from the App Store or Google Play.
              </p>
              <p>
                <strong>Missing credentials?</strong> Contact your university for Statement of Result or NYSC for your certificate.
              </p>
              <p>
                <strong>Having connection issues?</strong> Make sure you have a stable internet connection and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
