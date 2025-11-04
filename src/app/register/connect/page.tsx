"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "requesting-proof" | "proof-received";

interface StudentData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  nin: string;
  bvn: string;
  gender: string;
  stateOfOrigin: string;
  lga: string;
  address: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    console.log('[Page] WebSocket status update:', wsStatus, connectionData);

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
  }, [wsStatus, connectionData, sessionId, connectionStatus, router]);

  // Create a connection session and use WebSocket for updates
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");

    try {
      // Create a new connection session
      const response = await fetch('/api/connections/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'registration' }),
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
    console.log('[Page] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting your student credentials...");

    try {
      const response = await fetch('/api/proofs/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Page] Proof request sent successfully', data.data);
        setProofStatus(data.data.status);
        // Store proofId for later verification
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        setConnectionMessage("Proof request sent! Please approve in your wallet...");
      } else {
        console.error('[Page] Failed to send proof request:', data.error);
        setConnectionMessage("Failed to request credentials. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[Page] Error sending proof request:', error);
      setConnectionMessage("Error requesting credentials. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Verify proof presentation after receiving it
  const verifyProof = async (proofIdToVerify: string) => {
    console.log('[Page] Verifying proof presentation', { proofId: proofIdToVerify });
    setIsVerifying(true);
    setConnectionMessage("Verifying your credentials...");

    try {
      const response = await fetch('/api/proofs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify }),
      });

      const data = await response.json();

      console.log('[Page] Verify API response:', { status: response.status, data });

      // The verify endpoint returns the proof record with isVerified: true and state: 'done' when verified
      if (data.success && data.data?.isVerified === true && data.data?.state === 'done') {
        console.log('[Page] Proof verification successful', data.data);
        setConnectionMessage("Credentials verified! Redirecting...");

        // Navigate immediately after successful verification
        router.push(`/register/application?sessionId=${sessionId}`);
      } else {
        const errorMsg = data.error?.error_description || data.error?.error ||
          `Verification failed (isVerified: ${data.data?.isVerified}, state: ${data.data?.state})`;
        console.error('[Page] Proof verification failed:', errorMsg, data);
        setConnectionMessage(`Failed to verify credentials: ${errorMsg}`);
        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('[Page] Error verifying proof:', error);
      setConnectionMessage("Error verifying credentials. Please try again.");
      setConnectionStatus("connected");
      setIsVerifying(false);
    }
  };

  // Handle proof status updates from WebSocket
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[Page] Proof status update:', connectionData);
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
          console.log('[Page] Triggering verification for proofId:', proofIdToVerify);
          verifyProof(proofIdToVerify);
        } else {
          console.error('[Page] No proofId available for verification');
          setConnectionMessage("Error: Missing proof ID. Please try again.");
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Proof request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }
  }, [connectionData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Replace with actual API call to submit registration
    setTimeout(() => {
      alert("Registration successful! You will receive a confirmation email.");
      setIsSubmitting(false);
      // Redirect to login or dashboard
    }, 1500);
  };

  // Use the actual organization connection invitation URL for the QR code
  const qrCodeValue = invitationUrl || `nelfund://connect?sessionId=${sessionId}&requestType=registration`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
            <h2 className="text-2xl font-bold text-white">NELFUND Demo - Student Registration</h2>
            <p className="text-green-100 mt-1">
              Connect your digital wallet to auto-fill registration details
            </p>
          </div>

          <div className="p-6">
            {connectionStatus === "disconnected" && (
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Connect Your Digital Wallet
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Click the button below to generate a QR code. Scan it with your digital
                    wallet app to automatically share your registration information.
                  </p>
                  <button
                    onClick={initiateConnection}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    Connect Wallet
                  </button>
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
                          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
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
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {connectionStatus === "proof-received" ? "Credentials Verified!" : "Requesting Student Credentials"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {connectionMessage || "Please approve the credential request in your wallet app..."}
                  </p>
                  {proofStatus && (
                    <div className="text-sm text-gray-500">
                      Status: <span className="font-medium">{proofStatus}</span>
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
                    Connection Established
                  </h3>
                  <p className="text-gray-600">
                    {connectionMessage}
                  </p>
                </div>
              </div>
            )}

            {connectionStatus === "connected" && studentData && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-green-800">Wallet Connected</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your information has been automatically populated. Please review and
                        submit.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={studentData.firstName}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={studentData.middleName || ""}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={studentData.lastName}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={studentData.dateOfBirth}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <input
                        type="text"
                        value={studentData.gender}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={studentData.email}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={studentData.phoneNumber}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Identity Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Identity Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        National Identification Number (NIN)
                      </label>
                      <input
                        type="text"
                        value={studentData.nin}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Verification Number (BVN)
                      </label>
                      <input
                        type="text"
                        value={studentData.bvn}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Location Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State of Origin
                      </label>
                      <input
                        type="text"
                        value={studentData.stateOfOrigin}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Local Government Area
                      </label>
                      <input
                        type="text"
                        value={studentData.lga}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Residential Address
                      </label>
                      <textarea
                        value={studentData.address}
                        readOnly
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setConnectionStatus("disconnected");
                      setStudentData(null);
                      setSessionId("");
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Disconnect & Start Over
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Complete Registration"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
