"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";

type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "requesting-proof"
  | "proof-received"
  | "verifying-proof"
  | "verification-complete";

interface DriverLicenseData {
  licenseNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  issueDate: string;
  expiryDate: string;
  licenseClass: string;
  state: string;
}

export default function DocumentBackedRelyingPartiesPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [proofId, setProofId] = useState<string>("");
  const [proofStatus, setProofStatus] = useState<string>("");
  const [verifiedData, setVerifiedData] = useState<DriverLicenseData | null>(null);

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[Insurance Verification] WebSocket status update:', wsStatus, connectionData);

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
            // Store connectionId in localStorage for future use
            localStorage.setItem('insurance_connectionId', connectionData.connectionId);
            localStorage.setItem('insurance_connectionId_timestamp', Date.now().toString());
            console.log('[Insurance Verification] Stored connectionId in localStorage:', connectionData.connectionId);

            // Automatically send proof request for driver's license
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

  // Handle proof status updates from WebSocket
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[Insurance Verification] Proof status update:', connectionData);
      setProofStatus(connectionData.status || "");

      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      // When presentation is received, verify it
      if (connectionData.status === "presentation-received") {
        setConnectionStatus("proof-received");
        setConnectionMessage("Driver's License credential received! Verifying...");

        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify) {
          verifyProof(proofIdToVerify);
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Proof request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }
  }, [connectionData]);

  // Create connection session
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");

    try {
      const response = await fetch('/api/document-backed/create-verification-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'insurance-verification' }),
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

  // Handle "Already Connected" flow
  const handleAlreadyConnected = async () => {
    const storedConnectionId = localStorage.getItem('insurance_connectionId');
    const storedTimestamp = localStorage.getItem('insurance_connectionId_timestamp');

    if (!storedConnectionId) {
      setConnectionMessage("No previous connection found. Please use 'Connect Wallet' option.");
      return;
    }

    // Check if connection is still valid (24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (storedTimestamp && (Date.now() - parseInt(storedTimestamp)) > twentyFourHours) {
      setConnectionMessage("Previous connection expired. Please reconnect using 'Connect Wallet' option.");
      localStorage.removeItem('insurance_connectionId');
      localStorage.removeItem('insurance_connectionId_timestamp');
      return;
    }

    setIsLoadingInvitation(true);
    setConnectionMessage("Using existing connection...");

    try {
      const response = await fetch('/api/document-backed/create-verification-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'insurance-verification',
          useExistingConnection: true,
          connectionId: storedConnectionId
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setConnectionId(storedConnectionId);
        setConnectionStatus("connected");
        setConnectionMessage("Connection established! Requesting driver's license...");

        // Automatically send proof request
        sendProofRequest(data.data.sessionId, storedConnectionId);
      } else {
        console.error('Failed to use existing connection:', data.error);
        setConnectionMessage("Failed to use existing connection. Please reconnect.");
        localStorage.removeItem('insurance_connectionId');
        localStorage.removeItem('insurance_connectionId_timestamp');
      }
    } catch (error) {
      console.error('Error using existing connection:', error);
      setConnectionMessage("Connection error. Please try again.");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send proof request for driver's license
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[Insurance Verification] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting driver's license credential...");

    try {
      const response = await fetch('/api/document-backed/request-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Insurance Verification] Proof request sent successfully', data.data);
        setProofStatus(data.data.status);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        if (data.data.proofUrl) {
          setProofUrl(data.data.proofUrl);
        }
        setConnectionMessage("Proof request sent! Please share your Driver's License credential from your wallet...");
      } else {
        console.error('[Insurance Verification] Failed to send proof request:', data.error);
        setConnectionMessage("Failed to request credential. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[Insurance Verification] Error sending proof request:', error);
      setConnectionMessage("Error requesting credential. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Verify the received proof
  const verifyProof = async (proofIdToVerify: string) => {
    console.log('[Insurance Verification] Verifying proof', { proofId: proofIdToVerify });
    setConnectionStatus("verifying-proof");
    setConnectionMessage("Verifying driver's license credential...");

    try {
      const response = await fetch('/api/document-backed/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proofId: proofIdToVerify,
          sessionId,
        }),
      });

      const data = await response.json();

      console.log('[Insurance Verification] Verify proof API response:', { status: response.status, data });

      if (data.success && data.data?.verified) {
        console.log('[Insurance Verification] Proof verified successfully', data.data);
        setVerifiedData(data.data.credentials);
        setConnectionStatus("verification-complete");
        setConnectionMessage("✅ Driver's License verified successfully!");
      } else {
        const errorMsg = data.error?.error_description || data.error?.error || 'Verification failed';
        console.error('[Insurance Verification] Verification failed:', errorMsg, data);
        setConnectionMessage(`Verification failed: ${errorMsg}`);
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[Insurance Verification] Error verifying proof:', error);
      setConnectionMessage("Error verifying credential. Please try again.");
      setConnectionStatus("connected");
    }
  };

  const qrCodeValue = invitationUrl || `insurance://verification?sessionId=${sessionId}`;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Document-Backed Credentials - For Relying Parties</h2>
                  <p className="text-purple-100 mt-1">
                    Insurance Company: Verify driver's license credentials
                  </p>
                </div>
                <Link
                  href="/"
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  ← Back to Demos
                </Link>
              </div>
            </div>

            <div className="p-6">
              {/* Disconnected State */}
              {connectionStatus === "disconnected" && (
                <div className="p-8">
                  {/* Info Section */}
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🏢</div>
                      <div>
                        <h3 className="text-lg font-bold text-purple-900 mb-2">
                          For Insurance Companies & Organizations
                        </h3>
                        <p className="text-purple-800 mb-3">
                          This demo shows how insurance companies and other organizations can verify
                          driver's license credentials without storing sensitive personal data.
                        </p>
                        <ul className="text-sm text-purple-700 space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> Request driver's license credential from customer
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> Verify authenticity cryptographically
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> Extract only required information
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> No physical document handling needed
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Use Case */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">
                      Use Case: Auto Insurance Verification
                    </h3>
                    <div className="space-y-3 text-sm text-blue-800">
                      <p>
                        When a customer applies for auto insurance, the company needs to verify
                        their driver's license. Traditional methods involve:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Manual document inspection (prone to errors)</li>
                        <li>Storing copies of sensitive documents (privacy risk)</li>
                        <li>Waiting for verification (slow process)</li>
                      </ul>
                      <p className="font-semibold pt-2">
                        With verifiable credentials, verification is instant, secure, and privacy-preserving!
                      </p>
                    </div>
                  </div>

                  {/* What Happens Next */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-green-900 mb-3">
                      Verification Process
                    </h3>
                    <div className="space-y-3 text-sm text-green-800">
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">1.</span>
                        <p>Customer connects their digital wallet to your insurance portal</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">2.</span>
                        <p>Request driver's license credential from customer's wallet</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">3.</span>
                        <p>Customer approves sharing their verified credential</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">4.</span>
                        <p>System verifies authenticity and extracts relevant information</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">5.</span>
                        <p>Complete insurance application with verified information</p>
                      </div>
                    </div>
                  </div>

                  {/* Connect Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={initiateConnection}
                      disabled={isLoadingInvitation}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingInvitation ? "Setting up..." : "Connect Customer Wallet"}
                    </button>
                    <button
                      onClick={handleAlreadyConnected}
                      disabled={isLoadingInvitation}
                      className="bg-white text-purple-600 text-lg font-semibold px-8 py-3 rounded-lg hover:bg-purple-50 transition-all border-2 border-purple-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Scan QR Code with Customer's Wallet
                  </h3>

                  {isLoadingInvitation ? (
                    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-6">
                      <div className="w-64 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-gray-600">Loading QR Code...</p>
                        </div>
                      </div>
                    </div>
                  ) : invitationUrl ? (
                    <div className="bg-white p-8 rounded-lg border-2 border-purple-200 inline-block mb-6">
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
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                      {connectionMessage || "Waiting for wallet connection..."}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Customer should open their ConfirmD App and scan the QR code
                  </p>

                  {proofUrl && (
                    <div className="mt-6">
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Open in Wallet
                      </a>
                    </div>
                  )}

                  <button
                    onClick={() => setConnectionStatus("disconnected")}
                    className="text-gray-500 hover:text-gray-700 text-sm mt-4"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Connected State */}
              {connectionStatus === "connected" && (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
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

              {/* Requesting Proof State */}
              {(connectionStatus === "requesting-proof" || connectionStatus === "proof-received") && (
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg
                      className="w-12 h-12 text-purple-600"
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
                    {connectionStatus === "proof-received"
                      ? "✅ License Received!"
                      : "📋 Requesting Driver's License"}
                  </h3>
                  <p className="text-xl text-gray-700 mb-6 font-semibold">
                    {connectionMessage || "Please approve the credential request in your wallet app..."}
                  </p>
                  {proofStatus && (
                    <div className="inline-block bg-purple-50 border border-purple-200 rounded-lg px-6 py-3">
                      <div className="text-sm font-medium text-purple-800">
                        Status: <span className="font-bold">{proofStatus}</span>
                      </div>
                    </div>
                  )}

                  {proofUrl && connectionStatus === "requesting-proof" && (
                    <div className="mt-6">
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Open in Wallet
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Verifying Proof State */}
              {connectionStatus === "verifying-proof" && (
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    🔍 Verifying Credential
                  </h3>
                  <p className="text-xl text-gray-700 mb-6 font-semibold">
                    {connectionMessage}
                  </p>
                  <div className="mt-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className="text-blue-800 font-semibold">
                        Cryptographically verifying driver's license...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Complete State */}
              {connectionStatus === "verification-complete" && verifiedData && (
                <div className="p-8">
                  <div className="max-w-3xl mx-auto">
                    <div className="mb-8 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-2">
                        ✅ Verification Complete
                      </h3>
                      <p className="text-lg text-gray-600">{connectionMessage}</p>
                    </div>

                    {/* Verified Data Display */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                      <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Verified Driver's License Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">License Number</p>
                          <p className="text-lg font-bold text-gray-900">{verifiedData.licenseNumber}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Full Name</p>
                          <p className="text-lg font-bold text-gray-900">{verifiedData.fullName}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Date of Birth</p>
                          <p className="text-lg font-bold text-gray-900">{verifiedData.dateOfBirth}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">License Class</p>
                          <p className="text-lg font-bold text-gray-900">{verifiedData.licenseClass}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">State</p>
                          <p className="text-lg font-bold text-gray-900">{verifiedData.state}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Expiry Date</p>
                          <p className="text-lg font-bold text-gray-900">{verifiedData.expiryDate}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200 md:col-span-2">
                          <p className="text-xs font-semibold text-green-700 uppercase mb-1">Address</p>
                          <p className="text-lg font-bold text-gray-900">{verifiedData.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => router.push(`/document-backed/relying-parties/success?sessionId=${sessionId}`)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                      >
                        Complete Insurance Application
                      </button>
                      <button
                        onClick={() => {
                          setConnectionStatus("disconnected");
                          setVerifiedData(null);
                          setSessionId("");
                          setConnectionId("");
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Start New Verification
                      </button>
                    </div>
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
