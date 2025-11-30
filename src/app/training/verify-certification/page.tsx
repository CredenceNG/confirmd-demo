"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useConnectionWebSocket } from "@/hooks/useConnectionWebSocket";

type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "requesting-proof"
  | "proof-received"
  | "verifying"
  | "verified"
  | "error";

interface VerifiedCertificationData {
  fullName: string;
  surname: string;
  othernames: string;
  nationalIdNumber: string;
  certificationTitle: string;
  trainingOrganization: string;
  courseCode: string;
  completionDate: string;
  issueDate: string;
  expiryDate: string;
  grade: string;
  credentialNumber: string;
  skills: string;
}

export default function VerifyTrainingCertificationPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [proofId, setProofId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [certificationData, setCertificationData] = useState<VerifiedCertificationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[Training Verify] WebSocket status update:', wsStatus, connectionData);

    const isProofEvent = connectionData?.eventType === 'proof';

    if (isProofEvent) {
      if (wsStatus === "request-sent") {
        setConnectionStatus("requesting-proof");
        setConnectionMessage("Verification request sent! Please approve in your wallet...");
      }
    } else {
      if (wsStatus === "active" || wsStatus === "completed") {
        if (connectionStatus === "connecting") {
          setConnectionStatus("connected");
          setConnectionMessage(`Connection established! Connected to ${connectionData?.theirLabel || 'wallet'}`);

          if (connectionData?.connectionId) {
            setConnectionId(connectionData.connectionId);
            // Automatically send proof request for training certification
            sendProofRequest(sessionId, connectionData.connectionId);
          }
        }
      } else if (wsStatus === "response") {
        setConnectionMessage(`Connecting to ${connectionData?.theirLabel || 'wallet'}...`);
      } else if (wsStatus === "abandoned" || wsStatus === "error") {
        setConnectionMessage("Connection failed or expired. Please try again.");
        setConnectionStatus("error");
        setErrorMessage("Connection failed or expired. Please try again.");
      }
    }
  }, [wsStatus, connectionData, sessionId, connectionStatus]);

  // Handle proof status updates
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[Training Verify] Proof status update:', connectionData);

      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      if (connectionData.status === "presentation-received" && !isVerifying) {
        setConnectionStatus("proof-received");
        setConnectionMessage("Credentials received! Verifying...");

        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify) {
          setIsVerifying(true);
          verifyCertification(proofIdToVerify);
        }
      } else if (connectionData.status === "done") {
        // Proof verified on platform - if not already verifying, verify now
        if (!isVerifying) {
          const proofIdToVerify = connectionData.proofId || proofId;
          if (proofIdToVerify) {
            setIsVerifying(true);
            verifyCertification(proofIdToVerify);
          }
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Verification request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }
  }, [connectionData, proofId, isVerifying]);

  // Create connection session
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");
    setErrorMessage("");

    try {
      console.log('[Training Verify] Creating session...');
      const response = await fetch('/api/training/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'training-verification' }),
      });

      const data = await response.json();
      console.log('[Training Verify] Session response:', data);

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setInvitationUrl(data.data.invitationUrl);
        setConnectionStatus("connecting");
        setConnectionMessage("Waiting for wallet connection...");
      } else {
        const errorType = data.error?.error || data.error || 'unknown_error';
        const errorDescription = data.error?.error_description || data.message || 'Failed to create session';
        console.error('[Training Verify] Failed to create session:', { errorType, errorDescription, fullError: data.error });
        setConnectionMessage(`Failed to create connection: ${errorDescription}`);
        setErrorMessage(errorDescription);
        setConnectionStatus("error");
      }
    } catch (error: any) {
      console.error('[Training Verify] Error creating session:', error);
      setConnectionMessage("Connection error. Please try again.");
      setErrorMessage(error.message || "Network error. Please try again.");
      setConnectionStatus("error");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send proof request for training certification
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[Training Verify] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting training certification...");

    try {
      const response = await fetch('/api/training/request-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();
      console.log('[Training Verify] Proof request response:', data);

      if (data.success) {
        console.log('[Training Verify] Proof request sent successfully', data.data);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        setConnectionMessage("Verification request sent! Please share your Training Certification from your wallet...");
      } else {
        const errorType = data.error?.error || data.error || 'unknown_error';
        const errorDescription = data.error?.error_description || data.message || 'Failed to send proof request';
        console.error('[Training Verify] Failed to send proof request:', { errorType, errorDescription });
        setConnectionMessage(`Failed to request credential: ${errorDescription}`);
        setConnectionStatus("connected");
      }
    } catch (error: any) {
      console.error('[Training Verify] Error sending proof request:', error);
      setConnectionMessage("Error requesting credential. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Verify certification credential
  const verifyCertification = async (proofIdToVerify: string) => {
    console.log('[Training Verify] Verifying certification', { proofId: proofIdToVerify });
    setConnectionStatus("verifying");
    setConnectionMessage("Verifying credentials...");

    try {
      const verifyResponse = await fetch('/api/proofs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify }),
      });

      const verifyData = await verifyResponse.json();
      console.log('[Training Verify] Verify response:', verifyData);

      if (verifyData.success && verifyData.data?.isVerified === true && verifyData.data?.state === 'done') {
        console.log('[Training Verify] Proof verified successfully');

        // Extract presented attributes from the verification response
        const attrs = verifyData.data.presentedAttributes || {};

        setCertificationData({
          fullName: `${attrs.othernames || ""} ${attrs.surname || ""}`.trim(),
          surname: attrs.surname || "",
          othernames: attrs.othernames || "",
          nationalIdNumber: attrs.national_id_number || "",
          certificationTitle: attrs.certification_title || "",
          trainingOrganization: attrs.training_organization || "",
          courseCode: attrs.course_code || "",
          completionDate: attrs.completion_date || "",
          issueDate: attrs.issue_date || "",
          expiryDate: attrs.expiry_date || "",
          grade: attrs.grade || "",
          credentialNumber: attrs.credential_number || "",
          skills: attrs.skills || "",
        });

        setConnectionStatus("verified");
        setConnectionMessage("Credentials verified successfully!");
      } else {
        const errorMsg = verifyData.error?.error_description ||
          `Verification pending (state: ${verifyData.data?.state})`;
        console.error('[Training Verify] Verification failed:', errorMsg);
        setConnectionMessage(`Verification failed: ${errorMsg}`);
        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    } catch (error: any) {
      console.error('[Training Verify] Error verifying certification:', error);
      setConnectionMessage("Error verifying credentials. Please try again.");
      setConnectionStatus("connected");
      setIsVerifying(false);
    }
  };

  // Reset to initial state
  const resetVerification = () => {
    setConnectionStatus("disconnected");
    setSessionId("");
    setConnectionId("");
    setInvitationUrl("");
    setConnectionMessage("");
    setProofId("");
    setIsVerifying(false);
    setCertificationData(null);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Demos
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Employer Portal
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Training Certification
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Instantly verify candidate training certifications for employment decisions.
            Request proof of professional training credentials from job applicants.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Disconnected State - Start Verification */}
          {connectionStatus === "disconnected" && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Request Training Credential Verification
                </h2>
                <p className="text-gray-600">
                  Generate a QR code for the candidate to scan with their digital wallet
                </p>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How Verification Works
                </h3>
                <ol className="space-y-3 text-sm text-purple-800">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <span>Click "Start Verification" to generate a connection QR code</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <span>Candidate scans the QR code with their ConfirmD wallet app to connect</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    <span>After connection, a proof request is automatically sent to their wallet</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                    <span>Candidate approves sharing and credentials are cryptographically verified</span>
                  </li>
                </ol>
              </div>

              {/* Prerequisite Notice */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Candidate Prerequisites</h4>
                    <p className="text-sm text-amber-800">
                      The candidate must have a Training Certification credential in their ConfirmD wallet.
                      If they don't have one, they can obtain it from the{" "}
                      <Link href="/training/issue-certification" className="text-purple-600 underline font-medium hover:text-purple-800">
                        Training Organization Demo
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={initiateConnection}
                disabled={isLoadingInvitation}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoadingInvitation ? (
                    <>
                      <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Setting up...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Start Verification
                    </>
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Connecting State - Show QR Code */}
          {connectionStatus === "connecting" && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Scan QR Code to Connect
                </h2>
                <p className="text-gray-600">
                  Ask the candidate to scan this QR code with their ConfirmD wallet
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 mb-6 border-2 border-purple-200">
                <div className="bg-white p-6 rounded-xl shadow-lg mx-auto w-fit">
                  {invitationUrl ? (
                    <QRCodeSVG value={invitationUrl} size={280} level="H" />
                  ) : (
                    <div className="w-[280px] h-[280px] flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    {connectionMessage || "Waiting for wallet connection..."}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Instructions for Candidate
                </h3>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Open the ConfirmD wallet app on your phone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>Tap the scan button to scan this QR code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>Accept the connection request</span>
                  </li>
                </ol>
              </div>

              <button
                onClick={resetVerification}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Verification
              </button>
            </div>
          )}

          {/* Connected/Requesting/Received/Verifying States */}
          {(connectionStatus === "connected" || connectionStatus === "requesting-proof" || connectionStatus === "proof-received" || connectionStatus === "verifying") && (
            <div className="p-8 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-purple-100 via-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {connectionStatus === "verifying" ? (
                    <svg className="w-12 h-12 text-purple-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : connectionStatus === "proof-received" ? (
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {connectionStatus === "verifying" ? "Verifying Certification..." :
                 connectionStatus === "proof-received" ? "Credential Received!" :
                 connectionStatus === "requesting-proof" ? "Requesting Certification..." :
                 "Connected!"}
              </h3>
              <p className="text-lg text-gray-700 mb-6 font-medium max-w-lg mx-auto">
                {connectionMessage || "Please approve the verification request in your wallet app..."}
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {connectionStatus === "error" && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{errorMessage || connectionMessage || "An error occurred"}</p>
              <button
                onClick={resetVerification}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Verified State */}
          {connectionStatus === "verified" && certificationData && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Certification Verified!
                </h2>
                <p className="text-gray-600">
                  The candidate's training certification has been cryptographically verified
                </p>
              </div>

              {/* Verified Certification Details */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified Credential Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-bold text-gray-900">{certificationData.fullName}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">National ID Number</p>
                    <p className="font-bold text-gray-900">{certificationData.nationalIdNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Certification Title</p>
                    <p className="font-bold text-gray-900 text-lg">{certificationData.certificationTitle}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Training Organization</p>
                    <p className="font-bold text-gray-900">{certificationData.trainingOrganization}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Credential Number</p>
                    <p className="font-bold text-purple-600">{certificationData.credentialNumber}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Course Code</p>
                    <p className="font-bold text-gray-900">{certificationData.courseCode}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Grade</p>
                    <p className="font-bold text-green-600 text-lg">{certificationData.grade}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Completion Date</p>
                    <p className="font-bold text-gray-900">{certificationData.completionDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                    <p className="font-bold text-gray-900">{certificationData.issueDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                    <p className="font-bold text-gray-900">{certificationData.expiryDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100 md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Skills / Competencies</p>
                    <p className="font-bold text-gray-900">{certificationData.skills}</p>
                  </div>
                </div>
              </div>

              {/* Verification Badge */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Cryptographically Verified</h4>
                    <p className="text-sm text-blue-800">
                      This credential has been cryptographically verified against the issuing organization's
                      digital signature. The information shown is authentic and has not been tampered with.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={resetVerification}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  Verify Another Candidate
                </button>
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Back to Demos
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This demo showcases employer-side verification of training certifications using verifiable credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
