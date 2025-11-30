"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";

type ConnectionStatus = "idle" | "connecting" | "connected" | "requesting-proof" | "proof-received" | "verified";

export default function HospitalKioskPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [proofStatus, setProofStatus] = useState<string>("");
  const [proofId, setProofId] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Update clock every second - only on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date()); // Set initial time on client
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData, isConnected: wsConnected } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[Kiosk] WebSocket status update:', wsStatus, connectionData);

    const isProofEvent = connectionData?.eventType === 'proof';

    if (isProofEvent) {
      if (wsStatus === "request-sent") {
        setConnectionStatus("requesting-proof");
        setStatusMessage("Please approve the request in your wallet app...");
      }
    } else {
      if (wsStatus === "active" || wsStatus === "completed") {
        if (connectionStatus === "connecting") {
          setConnectionStatus("connected");
          setStatusMessage(`Connected to ${connectionData?.theirLabel || 'wallet'}`);

          if (connectionData?.connectionId) {
            setConnectionId(connectionData.connectionId);
            console.log('[Kiosk] Connection established:', connectionData.connectionId);
            sendProofRequest(sessionId, connectionData.connectionId);
          }
        }
      } else if (wsStatus === "response") {
        setStatusMessage(`Connecting to ${connectionData?.theirLabel || 'wallet'}...`);
      } else if (wsStatus === "abandoned" || wsStatus === "error") {
        setStatusMessage("Connection failed. Please try again.");
        setConnectionStatus("idle");
      }
    }
  }, [wsStatus, connectionData, sessionId, connectionStatus]);

  // Start kiosk session
  const startCheckIn = async () => {
    setIsLoadingInvitation(true);
    setStatusMessage("Preparing check-in...");

    try {
      const response = await fetch('/api/connections/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'health-checkin' }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setInvitationUrl(data.data.invitationUrl);
        setConnectionStatus("connecting");
        setStatusMessage("Scan QR code with your wallet app");
      } else {
        console.error('Failed to create session:', data.error);
        setStatusMessage("Failed to start check-in. Please try again.");
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setStatusMessage("Connection error. Please try again.");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send proof request for Health Card
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[Kiosk] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setStatusMessage("Requesting your Health Card credentials...");

    try {
      const response = await fetch('/api/health/kiosk/request-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Kiosk] Proof request sent', data.data);
        setProofStatus(data.data.status);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        if (data.data.proofUrl) {
          setProofUrl(data.data.proofUrl);
        }
        setStatusMessage("Please approve the credential request in your wallet...");
      } else {
        console.error('[Kiosk] Failed to send proof request:', data.error);
        setStatusMessage("Failed to request credentials. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[Kiosk] Error sending proof request:', error);
      setStatusMessage("Error requesting credentials. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Verify proof presentation
  const verifyProof = async (proofIdToVerify: string) => {
    console.log('[Kiosk] Verifying proof', { proofId: proofIdToVerify });
    setIsVerifying(true);
    setStatusMessage("Verifying your Health Card...");

    try {
      const response = await fetch('/api/proofs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify }),
      });

      const data = await response.json();

      console.log('[Kiosk] Verify API response:', { status: response.status, data });

      if (data.success && data.data?.isVerified === true && data.data?.state === 'done') {
        console.log('[Kiosk] Verification successful', data.data);
        setConnectionStatus("verified");
        setStatusMessage("Health Card verified! Generating visit number...");

        // Generate visit number and redirect
        const visitNumber = generateVisitNumber();

        // Extract patient name from presentedAttributes (returned directly from verify API)
        const presentedAttrs = data.data.presentedAttributes || {};
        const patientName = presentedAttrs.othernames || "Patient";
        const patientSurname = presentedAttrs.surname || "";

        console.log('[Kiosk] Patient details:', { patientName, patientSurname, presentedAttrs });

        setTimeout(() => {
          router.push(`/health/kiosk/success?visitNumber=${visitNumber}&patientName=${encodeURIComponent(patientName + " " + patientSurname)}&sessionId=${sessionId}`);
        }, 1500);
      } else {
        const errorMsg = data.error?.error_description || data.error?.error ||
          `Verification failed (isVerified: ${data.data?.isVerified}, state: ${data.data?.state})`;
        console.error('[Kiosk] Verification failed:', errorMsg, data);
        setStatusMessage(`Verification failed: ${errorMsg}`);
        setConnectionStatus("idle");
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('[Kiosk] Error verifying proof:', error);
      setStatusMessage("Error verifying credentials. Please try again.");
      setConnectionStatus("idle");
      setIsVerifying(false);
    }
  };

  // Handle proof status updates from WebSocket
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[Kiosk] Proof status update:', connectionData);
      setProofStatus(connectionData.status || "");

      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      if (connectionData.status === "presentation-received" && !isVerifying) {
        setConnectionStatus("proof-received");
        setStatusMessage("Credentials received! Verifying...");

        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify) {
          console.log('[Kiosk] Triggering verification:', proofIdToVerify);
          verifyProof(proofIdToVerify);
        } else {
          console.error('[Kiosk] No proofId available');
          setStatusMessage("Error: Missing proof ID. Please try again.");
        }
      } else if (connectionData.status === "abandoned") {
        setStatusMessage("Request was declined. Please try again.");
        setConnectionStatus("idle");
      }
    }
  }, [connectionData]);

  // Generate visit number
  const generateVisitNumber = () => {
    const date = new Date();
    const prefix = "V";
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}${dateStr}-${random}`;
  };

  const qrCodeValue = invitationUrl || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Kiosk Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">General Hospital</h1>
              <p className="text-sm text-blue-200">Patient Check-In Kiosk</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-white">
              {currentTime ? currentTime.toLocaleTimeString() : "--:--:--"}
            </p>
            <p className="text-sm text-blue-200">
              {currentTime ? currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Loading..."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">

          {/* Idle State - Touch to Start */}
          {connectionStatus === "idle" && (
            <div className="text-center">
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/30 animate-pulse">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Patient Check-In
                </h2>
                <p className="text-xl text-blue-200 mb-8">
                  Use your Medical Health Card to check in
                </p>
              </div>

              <button
                onClick={startCheckIn}
                disabled={isLoadingInvitation}
                className="px-16 py-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-2xl font-bold rounded-2xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingInvitation ? (
                  <span className="flex items-center gap-3">
                    <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Touch to Check In
                  </span>
                )}
              </button>

              {statusMessage && (
                <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-200">{statusMessage}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-4xl mb-3">📱</div>
                  <p className="text-sm text-blue-200">Open your wallet app</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-sm text-blue-200">Scan the QR code</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-sm text-blue-200">Approve the request</p>
                </div>
              </div>
            </div>
          )}

          {/* Connecting State - QR Code Display */}
          {(connectionStatus === "connecting" || connectionStatus === "connected" || connectionStatus === "requesting-proof") && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                {connectionStatus === "requesting-proof" ? "Approve Request in Wallet" : "Scan QR Code"}
              </h2>

              {/* QR Code */}
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-30"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
                  {isLoadingInvitation || !invitationUrl ? (
                    <div className="w-72 h-72 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Generating QR Code...</p>
                      </div>
                    </div>
                  ) : (
                    <QRCodeSVG value={qrCodeValue} size={288} level="H" />
                  )}
                </div>
                {connectionStatus === "requesting-proof" && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    Waiting for approval
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 text-xl text-blue-200">
                  <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
                  {statusMessage || "Waiting for connection..."}
                </div>
                {proofStatus && (
                  <p className="text-sm text-blue-300 mt-2">Status: {proofStatus}</p>
                )}
              </div>

              {/* Open in Wallet button */}
              {proofUrl && connectionStatus === "requesting-proof" && (
                <div className="mb-8">
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Open in Wallet App
                  </a>
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setConnectionStatus("idle");
                  setSessionId("");
                  setInvitationUrl("");
                  setStatusMessage("");
                  setProofStatus("");
                  setProofId("");
                  setProofUrl("");
                }}
                className="text-blue-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Proof Received / Verifying State */}
          {(connectionStatus === "proof-received" || connectionStatus === "verified") && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
                {connectionStatus === "verified" ? (
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-16 h-16 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {connectionStatus === "verified" ? "Check-In Complete!" : "Verifying Health Card..."}
              </h2>
              <p className="text-xl text-green-200">
                {statusMessage || "Processing..."}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-sm text-blue-300">
            Need assistance? Please visit the reception desk.
          </p>
          <a href="/" className="text-sm text-blue-300 hover:text-white transition-colors">
            Back to Demos
          </a>
        </div>
      </div>
    </div>
  );
}
