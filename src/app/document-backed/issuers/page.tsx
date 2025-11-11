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
  | "document-upload"
  | "processing-document"
  | "issuing-credential"
  | "completed";

interface DocumentData {
  licenseNumber: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  issueDate: string;
  expiryDate: string;
  licenseClass: string;
  state: string;
}

export default function DocumentBackedIssuersPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");

  // Document data extracted or manually entered
  const [documentData, setDocumentData] = useState<DocumentData>({
    licenseNumber: "",
    fullName: "",
    dateOfBirth: "",
    address: "",
    issueDate: "",
    expiryDate: "",
    licenseClass: "C",
    state: "Lagos",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[Document-Backed] WebSocket status update:', wsStatus, connectionData);

    if (wsStatus === "active" || wsStatus === "completed") {
      if (connectionStatus === "connecting") {
        setConnectionStatus("connected");
        setConnectionMessage(`Connection established! Connected to ${connectionData?.theirLabel || 'wallet'}`);

        if (connectionData?.connectionId) {
          setConnectionId(connectionData.connectionId);
          // Store connectionId in localStorage for future use
          localStorage.setItem('document_backed_connectionId', connectionData.connectionId);
          localStorage.setItem('document_backed_connectionId_timestamp', Date.now().toString());
          console.log('[Document-Backed] Stored connectionId in localStorage:', connectionData.connectionId);

          // Move to document upload phase
          setTimeout(() => {
            setConnectionStatus("document-upload");
            setConnectionMessage("Upload your driver's license document to continue");
          }, 1500);
        }
      }
    } else if (wsStatus === "response") {
      setConnectionMessage(`Connecting to ${connectionData?.theirLabel || 'wallet'}...`);
    } else if (wsStatus === "abandoned" || wsStatus === "error") {
      setConnectionMessage("Connection failed or expired. Please try again.");
      setConnectionStatus("disconnected");
    }
  }, [wsStatus, connectionData, sessionId, connectionStatus]);

  // Handle credential status updates (Driver's License issuance)
  useEffect(() => {
    if (connectionData?.eventType === "credential") {
      console.log('[Document-Backed] Credential status update:', connectionData);

      if (connectionData.status === "offer-sent") {
        setConnectionMessage("🎉 Driver's License credential offer sent to your wallet! Please accept it in your app.");
      } else if (connectionData.status === "request-received") {
        setConnectionMessage("📱 Credential offer received by your wallet...");
      } else if (connectionData.status === "credential-issued") {
        setConnectionMessage("✅ Driver's License credential accepted and issued!");
        setTimeout(() => {
          router.push(`/document-backed/issuers/success?sessionId=${sessionId}`);
        }, 2500);
      } else if (connectionData.status === "done") {
        setConnectionMessage("✅ Driver's License successfully added to your wallet! Redirecting...");
        setTimeout(() => {
          router.push(`/document-backed/issuers/success?sessionId=${sessionId}`);
        }, 2000);
      } else if (connectionData.status === "abandoned" || connectionData.status === "declined") {
        setConnectionMessage("❌ Credential offer was declined. Please try again.");
        setConnectionStatus("document-upload");
      }
    }
  }, [connectionData, router, sessionId]);

  // Create connection session
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");

    try {
      const response = await fetch('/api/document-backed/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'document-backed-issuance' }),
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
    const storedConnectionId = localStorage.getItem('document_backed_connectionId');
    const storedTimestamp = localStorage.getItem('document_backed_connectionId_timestamp');

    if (!storedConnectionId) {
      setConnectionMessage("No previous connection found. Please use 'Connect Wallet' option.");
      return;
    }

    // Check if connection is still valid (24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (storedTimestamp && (Date.now() - parseInt(storedTimestamp)) > twentyFourHours) {
      setConnectionMessage("Previous connection expired. Please reconnect using 'Connect Wallet' option.");
      localStorage.removeItem('document_backed_connectionId');
      localStorage.removeItem('document_backed_connectionId_timestamp');
      return;
    }

    setIsLoadingInvitation(true);
    setConnectionMessage("Using existing connection...");

    try {
      const response = await fetch('/api/document-backed/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'document-backed-issuance',
          useExistingConnection: true,
          connectionId: storedConnectionId
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setConnectionId(storedConnectionId);
        setConnectionStatus("document-upload");
        setConnectionMessage("Connection established! Upload your document to continue.");
      } else {
        console.error('Failed to use existing connection:', data.error);
        setConnectionMessage("Failed to use existing connection. Please reconnect.");
        localStorage.removeItem('document_backed_connectionId');
        localStorage.removeItem('document_backed_connectionId_timestamp');
      }
    } catch (error) {
      console.error('Error using existing connection:', error);
      setConnectionMessage("Connection error. Please try again.");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setConnectionMessage(`Document selected: ${file.name}`);
    }
  };

  // Process document and extract data (simulated OCR)
  const processDocument = async () => {
    if (!uploadedFile) {
      setConnectionMessage("Please select a document first");
      return;
    }

    setIsProcessing(true);
    setConnectionStatus("processing-document");
    setConnectionMessage("Processing document and extracting information...");

    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated extracted data (in production, this would come from OCR service)
    setDocumentData({
      licenseNumber: `LAG-${Date.now().toString().slice(-8)}`,
      fullName: "John Doe",
      dateOfBirth: "1995-06-15",
      address: "123 Victoria Island, Lagos, Nigeria",
      issueDate: "2022-01-15",
      expiryDate: "2027-01-14",
      licenseClass: "C",
      state: "Lagos",
    });

    setIsProcessing(false);
    setConnectionMessage("Document processed! Please review and confirm the extracted information.");
  };

  // Issue driver's license credential
  const issueCredential = async () => {
    setConnectionStatus("issuing-credential");
    setConnectionMessage("Issuing Driver's License credential...");

    try {
      const response = await fetch('/api/document-backed/issue-credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          connectionId,
          licenseData: documentData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Document-Backed] Credential issued successfully', data.data);
        setConnectionMessage("Preparing credential offer...");
        // Wait for webhook events to confirm acceptance
      } else {
        const errorMsg = data.error?.error_description || data.error?.error || 'Failed to issue credential';
        console.error('[Document-Backed] Failed to issue credential:', errorMsg, data);
        setConnectionMessage(`Failed to issue credential: ${errorMsg}`);
        setConnectionStatus("document-upload");
      }
    } catch (error) {
      console.error('[Document-Backed] Error issuing credential:', error);
      setConnectionMessage("Error issuing credential. Please try again.");
      setConnectionStatus("document-upload");
    }
  };

  const qrCodeValue = invitationUrl || `document-backed://issuance?sessionId=${sessionId}`;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Document-Backed Credentials - Issuers</h2>
                  <p className="text-blue-100 mt-1">
                    Issue verifiable driver's license credentials after document verification
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
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🏢</div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                          For Government Agencies & Organizations
                        </h3>
                        <p className="text-blue-800 mb-3">
                          This demo shows how government agencies (like FRSC) can issue verifiable credentials
                          after verifying physical documents like driver's licenses.
                        </p>
                        <ul className="text-sm text-blue-700 space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> Upload government-issued document (driver's license)
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> Extract and verify information
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> Issue tamper-proof verifiable credential
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="font-semibold">✓</span> Credential stored securely in user's wallet
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* What Happens Next */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-green-900 mb-3">
                      Issuance Process
                    </h3>
                    <div className="space-y-3 text-sm text-green-800">
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">1.</span>
                        <p>Connect your organization's wallet to establish secure channel</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">2.</span>
                        <p>Upload the citizen's government-issued driver's license document</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">3.</span>
                        <p>System extracts information and verifies authenticity</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 font-bold">4.</span>
                        <p>Review extracted data and issue verifiable credential to citizen's wallet</p>
                      </div>
                    </div>
                  </div>

                  {/* Connect Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={initiateConnection}
                      disabled={isLoadingInvitation}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingInvitation ? "Setting up..." : "Connect Wallet"}
                    </button>
                    <button
                      onClick={handleAlreadyConnected}
                      disabled={isLoadingInvitation}
                      className="bg-white text-blue-600 text-lg font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-all border-2 border-blue-600 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {isLoadingInvitation ? (
                    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-6">
                      <div className="w-64 h-64 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-sm text-gray-600">Loading QR Code...</p>
                        </div>
                      </div>
                    </div>
                  ) : invitationUrl ? (
                    <div className="bg-white p-8 rounded-lg border-2 border-blue-200 inline-block mb-6">
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
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      {connectionMessage || "Waiting for wallet connection..."}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    Open your ConfirmD App and scan the QR code to connect
                  </p>

                  {proofUrl && (
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
                    </div>
                  )}

                  <button
                    onClick={() => setConnectionStatus("disconnected")}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Connected State */}
              {connectionStatus === "connected" && (
                <div className="p-8 text-center">
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

              {/* Document Upload State */}
              {connectionStatus === "document-upload" && (
                <div className="p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Driver's License</h3>
                      <p className="text-gray-600">Upload a photo or scan of the government-issued driver's license</p>
                    </div>

                    {/* File Upload */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="document-upload"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="document-upload"
                        className="cursor-pointer block"
                      >
                        <div className="text-4xl mb-4">📄</div>
                        {uploadedFile ? (
                          <>
                            <p className="text-green-600 font-semibold mb-2">
                              ✓ {uploadedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">Click to change file</p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-700 font-semibold mb-2">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500">PNG, JPG, or PDF (max 10MB)</p>
                          </>
                        )}
                      </label>
                    </div>

                    {uploadedFile && !documentData.licenseNumber && (
                      <div className="text-center">
                        <button
                          onClick={processDocument}
                          disabled={isProcessing}
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? "Processing..." : "Process Document"}
                        </button>
                      </div>
                    )}

                    {/* Extracted Data Form */}
                    {documentData.licenseNumber && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                          Extracted Information
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              License Number
                            </label>
                            <input
                              type="text"
                              value={documentData.licenseNumber}
                              onChange={(e) => setDocumentData({ ...documentData, licenseNumber: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={documentData.fullName}
                              onChange={(e) => setDocumentData({ ...documentData, fullName: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                value={documentData.dateOfBirth}
                                onChange={(e) => setDocumentData({ ...documentData, dateOfBirth: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                License Class
                              </label>
                              <select
                                value={documentData.licenseClass}
                                onChange={(e) => setDocumentData({ ...documentData, licenseClass: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="A">Class A - Motorcycle</option>
                                <option value="B">Class B - Personal Vehicle</option>
                                <option value="C">Class C - Commercial Vehicle</option>
                                <option value="D">Class D - Articulated Vehicle</option>
                                <option value="E">Class E - Special Vehicle</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <textarea
                              value={documentData.address}
                              onChange={(e) => setDocumentData({ ...documentData, address: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Issue Date
                              </label>
                              <input
                                type="date"
                                value={documentData.issueDate}
                                onChange={(e) => setDocumentData({ ...documentData, issueDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="date"
                                value={documentData.expiryDate}
                                onChange={(e) => setDocumentData({ ...documentData, expiryDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                value={documentData.state}
                                onChange={(e) => setDocumentData({ ...documentData, state: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex gap-4">
                          <button
                            onClick={issueCredential}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                          >
                            Issue Credential
                          </button>
                          <button
                            onClick={() => {
                              setDocumentData({
                                licenseNumber: "",
                                fullName: "",
                                dateOfBirth: "",
                                address: "",
                                issueDate: "",
                                expiryDate: "",
                                licenseClass: "C",
                                state: "Lagos",
                              });
                              setUploadedFile(null);
                            }}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Processing Document State */}
              {connectionStatus === "processing-document" && (
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    📄 Processing Document
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
                        Extracting information from document...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Issuing Credential State */}
              {connectionStatus === "issuing-credential" && (
                <div className="p-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    🎉 Issuing Credential
                  </h3>
                  <p className="text-xl text-gray-700 mb-6 font-semibold">
                    {connectionMessage}
                  </p>
                  <div className="mt-8">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 max-w-md mx-auto">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className="text-green-800 font-semibold">
                        Creating verifiable Driver's License credential...
                      </p>
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
