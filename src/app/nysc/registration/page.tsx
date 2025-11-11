"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";
import QRCodeWithDeepLink from "@/components/QRCodeWithDeepLink";
import { storeConnection, getStoredConnection, clearConnection } from "@/lib/utils/connection-storage";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "requesting-proof" | "proof-received" | "filling-form" | "issuing-green-card";

export default function NYSCRegistrationPage() {
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
  const [greenCardDeepLink, setGreenCardDeepLink] = useState<string>("");
  const [credentialStatus, setCredentialStatus] = useState<string>("");

  // Form data for additional student information
  const [formData, setFormData] = useState({
    callUpNumber: "",
    contactAddress: "",
    contactPhone: "",
    isServicePersonnel: "no",
    servicePersonnelType: "",
    emergencyContact: {
      fullName: "",
      address: "",
      phoneNumber: "",
      relationship: "",
    },
  });

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[NYSC Registration] WebSocket status update:', wsStatus, connectionData);

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
            // Store connectionId for reuse across all demos (unified connection)
            storeConnection(connectionData.connectionId);
            console.log('[NYSC Registration] Stored connectionId:', connectionData.connectionId);

            // Automatically send proof request for Student Card + Statement of Result
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
      const response = await fetch('/api/nysc/registration/create-proof-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'nysc-registration' }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setInvitationUrl(data.data.invitationUrl);
        setConnectionStatus("connecting");
        setConnectionMessage("Waiting for wallet connection...");
      } else {
        console.error('=== FAILED TO CREATE SESSION ===');
        console.error('Error:', data.error);
        console.error('Message:', data.message);
        console.error('Details:', data.details);
        console.error('Full response:', data);

        const errorMsg = data.details?.errorDescription || data.message || 'Failed to create connection';
        setConnectionMessage(errorMsg);
        alert(`Session Creation Failed:\n\n${errorMsg}\n\nCheck the browser console for details.`);
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
    console.log('[NYSC Registration] User clicked Already Connected');

    // Check if we have a stored connection using unified storage
    const storedConnection = getStoredConnection();

    if (!storedConnection) {
      setConnectionMessage("No previous connection found in this browser session. If your wallet says 'already connected', please use 'Connect Wallet' to re-establish the connection.");
      console.warn('[NYSC Registration] No connectionId found in storage');

      // Show an alert with more guidance
      alert(
        "No Previous Connection Found\n\n" +
        "This can happen if:\n" +
        "• You're using a different browser\n" +
        "• You cleared your browser data\n" +
        "• This is your first time on this device\n" +
        "• Your previous connection expired (24 hours)\n\n" +
        "Solution:\n" +
        "Click 'Connect Wallet to Register' to scan the QR code. " +
        "If your wallet shows 'already connected', that's okay - " +
        "it will reuse the existing connection."
      );
      return;
    }

    const storedConnectionId = storedConnection.connectionId;
    console.log('[NYSC Registration] Using stored connectionId:', storedConnectionId);
    setIsLoadingInvitation(true);
    setConnectionMessage("Using existing connection...");

    try {
      // Create a session with the existing connectionId
      const response = await fetch('/api/nysc/registration/create-proof-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'nysc-registration',
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
        console.log('[NYSC Registration] Session created with existing connection', {
          sessionId: newSessionId,
          connectionId: storedConnectionId
        });

        // Automatically send proof request
        await sendProofRequest(newSessionId, storedConnectionId);
      } else {
        console.error('[NYSC Registration] Failed to create session:', data.error);
        setConnectionMessage("Failed to use existing connection. Please reconnect.");
        setConnectionStatus("disconnected");
        // Clear invalid connection
        clearConnection();
      }
    } catch (error) {
      console.error('[NYSC Registration] Error creating session:', error);
      setConnectionMessage("Error using existing connection. Please reconnect.");
      setConnectionStatus("disconnected");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send proof request for Student Card + Statement of Result
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[NYSC Registration] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting your academic credentials...");

    try {
      const response = await fetch('/api/nysc/registration/request-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[NYSC Registration] Proof request sent successfully', data.data);
        setProofStatus(data.data.status);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        setConnectionMessage("Proof request sent! Please share your Student Card and Statement of Result from your wallet...");
      } else {
        console.error('[NYSC Registration] Failed to send proof request:', data.error);
        setConnectionMessage("Failed to request credentials. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[NYSC Registration] Error sending proof request:', error);
      setConnectionMessage("Error requesting credentials. Please try again.");
      setConnectionStatus("connected");
    }
  };


  // Verify proof and issue Green Card
  const verifyAndIssueGreenCard = async (proofIdToVerify: string, registrationData: typeof formData) => {
    console.log('[NYSC Registration] Verifying proof and issuing Green Card', { proofId: proofIdToVerify, registrationData });
    setIsVerifying(true);
    setConnectionStatus("issuing-green-card");
    setConnectionMessage("Verifying your credentials...");

    try {
      const response = await fetch('/api/nysc/registration/issue-green-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofId: proofIdToVerify,
          sessionId,
          registrationData,
        }),
      });

      const data = await response.json();

      console.log('[NYSC Registration] Issue Green Card API response:', { status: response.status, data });

      if (data.success && data.data?.greenCardIssued) {
        console.log('[NYSC Registration] Green Card API call successful', data.data);

        // Store deep link URL if available
        if (data.data.deepLinkUrl) {
          setGreenCardDeepLink(data.data.deepLinkUrl);
          console.log('[NYSC Registration] Deep link URL available:', data.data.deepLinkUrl);
        } else {
          console.warn('[NYSC Registration] No deep link URL in response');
        }

        setConnectionMessage("✅ Green Card offer prepared! Please accept it in your wallet.");
        // Don't redirect yet - wait for webhook events to confirm acceptance
      } else {
        const errorType = data.error?.error;
        const errorMsg = data.error?.error_description || data.error?.error || 'Failed to issue Green Card';
        console.error('[NYSC Registration] Failed to issue Green Card:', errorMsg, data);

        // Special handling for missing national ID error
        if (errorType === 'missing_national_id') {
          setConnectionMessage(
            "⚠️ Missing National ID Number: Your Student Card credential needs to include a valid National ID Number (NIN). " +
            "Please get a new Student Card with your NIN included."
          );
          alert(
            "Missing National ID Number\n\n" +
            "Your Student Card credential was issued without a valid National ID Number (NIN).\n\n" +
            "To continue with NYSC registration, you need to:\n" +
            "1. Go to the Student Card issuance demo\n" +
            "2. Enter your National ID Number (NIN)\n" +
            "3. Issue a new Student Card credential\n" +
            "4. Return here and try registration again\n\n" +
            "Your NIN is required to link your NYSC records to your national identity."
          );
        } else {
          setConnectionMessage(`Failed to issue Green Card: ${errorMsg}`);
        }

        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('[NYSC Registration] Error issuing Green Card:', error);
      setConnectionMessage("Network error: Unable to issue Green Card. Please try again.");
      setConnectionStatus("connected");
      setIsVerifying(false);
    }
  };

  // Handle proof status updates from WebSocket
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[NYSC Registration] Proof status update:', connectionData);
      setProofStatus(connectionData.status || "");

      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      // When presentation is received, show form to collect additional information
      if (connectionData.status === "presentation-received" && !isVerifying) {
        setConnectionStatus("filling-form");
        setConnectionMessage("Credentials received! Please complete your registration details...");

        const proofIdToVerify = connectionData.proofId;
        if (!proofIdToVerify) {
          console.error('[NYSC Registration] No proofId available');
          setConnectionMessage("Error: Missing proof ID. Please try again.");
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Proof request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }

    // Handle credential status updates (Green Card issuance)
    if (connectionData?.eventType === "credential") {
      console.log('[NYSC Registration] Credential status update:', connectionData);

      // Update credential status
      setCredentialStatus(connectionData.status || "");

      if (connectionData.status === "offer-sent") {
        setConnectionMessage("🎉 Green Card offer sent to your wallet! Please accept it in your app.");
      } else if (connectionData.status === "request-received") {
        setConnectionMessage("📱 Green Card offer received by your wallet...");
      } else if (connectionData.status === "credential-issued" || connectionData.status === "done") {
        const message = connectionData.status === "credential-issued"
          ? "✅ Green Card accepted and issued! Redirecting..."
          : "✅ Green Card successfully added to your wallet! Redirecting...";

        setConnectionMessage(message);

        // Navigate immediately based on WebSocket status update
        router.push(`/nysc/registration/success?sessionId=${sessionId}`);
      } else if (connectionData.status === "abandoned" || connectionData.status === "declined") {
        setConnectionMessage("❌ Green Card offer was declined. Please try again.");
        setConnectionStatus("connected");
        setIsVerifying(false);
        setGreenCardDeepLink(""); // Clear deep link
      }
    }
  }, [connectionData, router, sessionId]);

  const qrCodeValue = invitationUrl || `nysc://registration?sessionId=${sessionId}`;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">NYSC Registration - Phase 1</h2>
                  <p className="text-green-100 mt-1">
                    Prove your academic credentials to register for NYSC
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
              {/* Prerequisites Warning */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Prerequisites Required
                    </h3>
                    <p className="text-gray-800 mb-3">
                      To register for NYSC, you must have the following credentials in your wallet:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-2 mb-4">
                      <li className="flex items-center gap-2">
                        <span className="font-semibold">✓</span> Student Card credential
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-semibold">✓</span> Statement of Result credential
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-semibold">✓</span> Medical Fitness Certificate
                      </li>
                    </ul>
                    <div className="bg-white/50 rounded-lg p-4 border border-gray-300">
                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        Don't have these credentials? Get them from these demos:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          href="/student-card"
                          className="flex-1 px-4 py-2 bg-white border-2 border-blue-500 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center text-sm"
                        >
                          🎓 Student Card
                        </Link>
                        <Link
                          href="/statement-of-results"
                          className="flex-1 px-4 py-2 bg-white border-2 border-purple-500 text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors text-center text-sm"
                        >
                          📜 Statement of Results
                        </Link>
                        <Link
                          href="/medical"
                          className="flex-1 px-4 py-2 bg-white border-2 border-pink-500 text-pink-700 rounded-lg font-semibold hover:bg-pink-50 transition-colors text-center text-sm"
                        >
                          🏥 Medical Fitness
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-blue-900 mb-3">
                  What Happens Next?
                </h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">1.</span>
                    <p>Connect your wallet by scanning the QR code</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">2.</span>
                    <p>Share your Student Card, Statement of Result, and Medical Fitness Certificate credentials</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">3.</span>
                    <p>NYSC will verify your credentials cryptographically</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">4.</span>
                    <p>If verified, you'll receive your NYSC Green Card credential</p>
                  </div>
                </div>
              </div>

              {/* Connect Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={initiateConnection}
                  disabled={isLoadingInvitation}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingInvitation ? "Setting up..." : "Connect Wallet to Register"}
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px bg-gray-300 w-8"></div>
                  <span className="text-gray-500 text-sm">or</span>
                  <div className="h-px bg-gray-300 w-8"></div>
                </div>

                <button
                  onClick={handleAlreadyConnected}
                  disabled={isLoadingInvitation}
                  className="px-8 py-4 bg-white text-green-600 text-lg font-semibold rounded-lg hover:bg-green-50 transition-all border-2 border-green-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
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
                  className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-all border-2 border-green-600 shadow-md hover:shadow-lg"
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
          )}

          {/* Requesting Proof State */}
          {(connectionStatus === "requesting-proof" || connectionStatus === "proof-received" || connectionStatus === "issuing-green-card") && (
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                <svg
                  className="w-12 h-12 text-green-600"
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
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {connectionStatus === "issuing-green-card"
                  ? "🎉 Issuing Green Card"
                  : connectionStatus === "proof-received"
                  ? "✅ Credentials Received!"
                  : "📋 Requesting Academic Credentials"}
              </h3>
              <p className="text-xl text-gray-700 mb-6 font-semibold">
                {connectionMessage || "Please approve the credential request in your wallet app..."}
              </p>
              {/* Show proof status for proof-related states, credential status for credential states */}
              {connectionStatus === "issuing-green-card" && credentialStatus && (
                <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-3">
                  <div className="text-sm font-medium text-green-800">
                    Credential Status: <span className="font-bold">{credentialStatus}</span>
                  </div>
                </div>
              )}
              {connectionStatus !== "issuing-green-card" && proofStatus && (
                <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-6 py-3">
                  <div className="text-sm font-medium text-green-800">
                    Proof Status: <span className="font-bold">{proofStatus}</span>
                  </div>
                </div>
              )}

              {/* Progress indicator for Green Card issuance */}
              {connectionStatus === "issuing-green-card" && (
                <div className="mt-8">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <p className="text-green-800 font-semibold mb-4">
                      Preparing your NYSC Green Card credential...
                    </p>

                    {/* Mobile Deep Link Button */}
                    {greenCardDeepLink && false && (
                      <div className="mt-6 pt-4 border-t border-green-300">
                        <p className="text-sm text-green-700 mb-3 text-center">
                          📱 Open this page on your mobile device?
                        </p>
                        <a
                          href={greenCardDeepLink}
                          className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg text-center"
                        >
                          Open in ConfirmD Wallet
                        </a>
                        <p className="text-xs text-green-600 mt-2 text-center">
                          Tap to accept your Green Card directly in your wallet app
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connected State (waiting for proof) */}
          {connectionStatus === "connected" && !proofStatus && (
            <div className="p-8 text-center">
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
              <p className="text-gray-600">{connectionMessage}</p>
            </div>
          )}

          {/* Registration Form State */}
          {connectionStatus === "filling-form" && (
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Registration</h3>
                  <p className="text-gray-600">Please provide additional information to complete your NYSC registration</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (proofId) {
                    verifyAndIssueGreenCard(proofId, formData);
                  }
                }} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📋</span>
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Call-Up Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.callUpNumber}
                          onChange={(e) => setFormData({ ...formData, callUpNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="NYSC/LAG/2025/12345"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Your NYSC call-up number</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.contactPhone}
                          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="+234 xxx xxx xxxx"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.contactAddress}
                          onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={3}
                          placeholder="Enter your full contact address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Personnel Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎖️</span>
                      Service Personnel Status
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Are you a service personnel? (Police, Army, Navy, Air Force, etc.) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="isServicePersonnel"
                              value="no"
                              checked={formData.isServicePersonnel === "no"}
                              onChange={(e) => setFormData({ ...formData, isServicePersonnel: e.target.value, servicePersonnelType: "" })}
                              className="w-4 h-4 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">No</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="isServicePersonnel"
                              value="yes"
                              checked={formData.isServicePersonnel === "yes"}
                              onChange={(e) => setFormData({ ...formData, isServicePersonnel: e.target.value })}
                              className="w-4 h-4 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Yes</span>
                          </label>
                        </div>
                      </div>

                      {formData.isServicePersonnel === "yes" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.servicePersonnelType}
                            onChange={(e) => setFormData({ ...formData, servicePersonnelType: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select service type</option>
                            <option value="Police">Police</option>
                            <option value="Army">Army</option>
                            <option value="Navy">Navy</option>
                            <option value="Air Force">Air Force</option>
                            <option value="DSS">DSS (Department of State Services)</option>
                            <option value="Civil Defence">Civil Defence</option>
                            <option value="Immigration">Immigration</option>
                            <option value="Customs">Customs</option>
                            <option value="Fire Service">Fire Service</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🚨</span>
                      Emergency Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContact.fullName}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, fullName: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter emergency contact's full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.emergencyContact.phoneNumber}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, phoneNumber: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="+234 xxx xxx xxxx"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relationship <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.emergencyContact.relationship}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select relationship</option>
                          <option value="Parent">Parent</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Relative">Relative</option>
                          <option value="Friend">Friend</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.emergencyContact.address}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, address: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          rows={3}
                          placeholder="Enter emergency contact's address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? "Processing..." : "Complete Registration & Issue Green Card"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConnectionStatus("connected");
                        setConnectionMessage("Registration cancelled");
                      }}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
