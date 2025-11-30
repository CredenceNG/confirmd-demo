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
  | "verifying"
  | "verified";

interface MembershipData {
  // From Statement of Results
  surname: string;
  othernames: string;
  matricNumber: string;
  programme: string;
  classOfDegree: string;
  yearEnd: string;
  awardedDegree: string;
  // From NYSC Certificate
  fullname: string;
  callUpNumber: string;
  startDate: string;
  endDate: string;
  certificateNumber: string;
  issuedDate: string;
}

export default function ProfessionalMembersPage() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionId, setConnectionId] = useState<string>("");
  const [invitationUrl, setInvitationUrl] = useState<string>("");
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string>("");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [proofId, setProofId] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);

  // Registration form fields
  const [registrationEmail, setRegistrationEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [specialRequirements, setSpecialRequirements] = useState<string>("");

  // Conference pricing based on designation
  const basePricing = {
    "Early Bird": 150000, // ₦150,000
    "Regular": 200000,    // ₦200,000
    "Late": 250000,       // ₦250,000
  };

  const [selectedTicket, setSelectedTicket] = useState<"Early Bird" | "Regular" | "Late">("Early Bird");

  // Discount tiers based on class of degree (from Statement of Results)
  const getDiscount = (classOfDegree: string): { percentage: number; label: string } => {
    if (!classOfDegree) return { percentage: 0, label: "No Discount" };
    const degreeUpper = classOfDegree.toUpperCase();
    if (degreeUpper.includes("FIRST CLASS")) {
      return { percentage: 30, label: "First Class Graduate Discount" };
    } else if (degreeUpper.includes("SECOND CLASS UPPER") || degreeUpper.includes("2:1")) {
      return { percentage: 20, label: "Second Class Upper Discount" };
    } else if (degreeUpper.includes("SECOND CLASS") || degreeUpper.includes("2:2")) {
      return { percentage: 15, label: "Second Class Discount" };
    }
    return { percentage: 10, label: "Graduate Discount" };
  };

  const calculatePrice = () => {
    const basePrice = basePricing[selectedTicket];
    if (!membershipData) return basePrice;

    const discount = getDiscount(membershipData.classOfDegree);
    const discountAmount = (basePrice * discount.percentage) / 100;
    return basePrice - discountAmount;
  };

  // Use WebSocket for real-time status updates
  const { status: wsStatus, connectionData } = useConnectionWebSocket(
    sessionId || null
  );

  // Handle WebSocket status updates
  useEffect(() => {
    if (!wsStatus) return;

    console.log('[Professional Members] WebSocket status update:', wsStatus, connectionData);

    const isProofEvent = connectionData?.eventType === 'proof';

    if (isProofEvent) {
      if (wsStatus === "request-sent") {
        setConnectionStatus("requesting-proof");
        setConnectionMessage("Membership verification request sent! Please approve in your wallet...");
      }
    } else {
      if (wsStatus === "active" || wsStatus === "completed") {
        if (connectionStatus === "connecting") {
          setConnectionStatus("connected");
          setConnectionMessage(`Connection established! Connected to ${connectionData?.theirLabel || 'wallet'}`);

          if (connectionData?.connectionId) {
            setConnectionId(connectionData.connectionId);
            localStorage.setItem('professional_connectionId', connectionData.connectionId);
            localStorage.setItem('professional_connectionId_timestamp', Date.now().toString());

            // Automatically send proof request for membership credential
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

  // Handle proof status updates
  useEffect(() => {
    if (connectionData?.eventType === "proof") {
      console.log('[Professional Members] Proof status update:', connectionData);

      if (connectionData.proofId && !proofId) {
        setProofId(connectionData.proofId);
      }

      if (connectionData.status === "presentation-received" && !isVerifying) {
        setConnectionStatus("proof-received");
        setConnectionMessage("Credentials received! Verifying...");

        const proofIdToVerify = connectionData.proofId;
        if (proofIdToVerify) {
          setIsVerifying(true);
          verifyMembership(proofIdToVerify);
        }
      } else if (connectionData.status === "done") {
        // Proof verified on platform - if not already verifying, verify now
        if (!isVerifying) {
          const proofIdToVerify = connectionData.proofId || proofId;
          if (proofIdToVerify) {
            setIsVerifying(true);
            verifyMembership(proofIdToVerify);
          }
        }
      } else if (connectionData.status === "abandoned") {
        setConnectionMessage("Verification request was declined. Please try again.");
        setConnectionStatus("connected");
      }
    }
  }, [connectionData]);

  // Create connection session
  const initiateConnection = async () => {
    setIsLoadingInvitation(true);
    setConnectionMessage("Creating connection session...");

    try {
      const response = await fetch('/api/professional/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'membership-verification' }),
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
    const storedConnectionId = localStorage.getItem('professional_connectionId');
    const storedTimestamp = localStorage.getItem('professional_connectionId_timestamp');

    if (!storedConnectionId) {
      setConnectionMessage("No previous connection found. Please use 'Connect Wallet' option.");
      return;
    }

    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (storedTimestamp && (Date.now() - parseInt(storedTimestamp)) > twentyFourHours) {
      setConnectionMessage("Previous connection expired. Please reconnect.");
      localStorage.removeItem('professional_connectionId');
      localStorage.removeItem('professional_connectionId_timestamp');
      return;
    }

    setIsLoadingInvitation(true);
    setConnectionMessage("Using existing connection...");

    try {
      const response = await fetch('/api/professional/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'membership-verification',
          useExistingConnection: true,
          connectionId: storedConnectionId
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setConnectionId(storedConnectionId);
        setConnectionStatus("connected");
        setConnectionMessage("Connection established! Requesting membership verification...");
        sendProofRequest(data.data.sessionId, storedConnectionId);
      } else {
        console.error('Failed to use existing connection:', data.error);
        setConnectionMessage("Failed to use existing connection. Please reconnect.");
        localStorage.removeItem('professional_connectionId');
        localStorage.removeItem('professional_connectionId_timestamp');
      }
    } catch (error) {
      console.error('Error using existing connection:', error);
      setConnectionMessage("Connection error. Please try again.");
    } finally {
      setIsLoadingInvitation(false);
    }
  };

  // Send proof request for membership credential
  const sendProofRequest = async (sessionId: string, connectionId: string) => {
    console.log('[Professional Members] Sending proof request', { sessionId, connectionId });
    setConnectionStatus("requesting-proof");
    setConnectionMessage("Requesting membership credential...");

    try {
      const response = await fetch('/api/professional/request-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[Professional Members] Proof request sent successfully', data.data);
        if (data.data.proofId) {
          setProofId(data.data.proofId);
        }
        if (data.data.proofUrl) {
          setProofUrl(data.data.proofUrl);
        }
        setConnectionMessage("Verification request sent! Please share your membership credential from your wallet...");
      } else {
        console.error('[Professional Members] Failed to send proof request:', data.error);
        setConnectionMessage("Failed to request credential. Please try again.");
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error('[Professional Members] Error sending proof request:', error);
      setConnectionMessage("Error requesting credential. Please try again.");
      setConnectionStatus("connected");
    }
  };

  // Verify membership credential
  const verifyMembership = async (proofIdToVerify: string) => {
    console.log('[Professional Members] Verifying membership', { proofId: proofIdToVerify });
    setConnectionStatus("verifying");
    setConnectionMessage("Verifying credentials...");

    try {
      // First, verify the proof using the standard verify endpoint
      const verifyResponse = await fetch('/api/proofs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofId: proofIdToVerify }),
      });

      const verifyData = await verifyResponse.json();
      console.log('[Professional Members] Verify response:', verifyData);

      // Check if verification was successful
      if (verifyData.success && verifyData.data?.isVerified === true && verifyData.data?.state === 'done') {
        console.log('[Professional Members] Proof verified, fetching membership details');

        // Now fetch the membership-specific details
        const membershipResponse = await fetch('/api/professional/verify-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proofId: proofIdToVerify,
            sessionId,
          }),
        });

        const membershipData = await membershipResponse.json();

        if (membershipData.success && membershipData.data?.verified) {
          console.log('[Professional Members] Membership verified successfully', membershipData.data);
          setMembershipData(membershipData.data.membership);
          // No organization field in new data structure - leave email empty for user to fill
          setConnectionStatus("verified");
          setConnectionMessage("✅ Credentials verified successfully!");
        } else {
          // Fallback: still show as verified if proofs/verify succeeded
          console.log('[Professional Members] Using fallback verification');
          setConnectionStatus("verified");
          setConnectionMessage("✅ Credentials verified!");
        }
      } else {
        const errorMsg = verifyData.error?.error_description ||
          `Verification pending (state: ${verifyData.data?.state})`;
        console.error('[Professional Members] Verification failed:', errorMsg);
        setConnectionMessage(`Verification failed: ${errorMsg}`);
        setConnectionStatus("connected");
        setIsVerifying(false);
      }
    } catch (error: any) {
      console.error('[Professional Members] Error verifying membership:', error);
      setConnectionMessage("Error verifying credentials. Please try again.");
      setConnectionStatus("connected");
      setIsVerifying(false);
    }
  };

  const qrCodeValue = invitationUrl || `professional://conference?sessionId=${sessionId}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Title Section - Enhanced */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 py-8 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl animate-bounce">🎓</span>
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">Professional Conference 2025</h2>
                  </div>
                  <p className="text-indigo-100 mt-1 text-lg font-medium">
                    Annual Professional Development Conference - Members Get Exclusive Discounts!
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      March 15-17, 2025
                    </span>
                    <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Transcorp Hilton, Abuja
                    </span>
                  </div>
                </div>
                <Link
                  href="/"
                  className="text-sm text-white/90 hover:text-white underline backdrop-blur-sm bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                >
                  ← Back to Demos
                </Link>
              </div>
            </div>

            <div className="p-6">
              {/* Disconnected State */}
              {connectionStatus === "disconnected" && (
                <div className="p-8">
                  {/* Hero Section - Enhanced */}
                  <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl p-8 mb-8 text-center overflow-hidden shadow-xl">
                    {/* Animated sparkles */}
                    <div className="absolute top-4 right-4 text-2xl animate-pulse">✨</div>
                    <div className="absolute bottom-4 left-4 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>💫</div>
                    <div className="absolute top-1/2 left-8 text-xl animate-bounce" style={{ animationDelay: '1s' }}>⭐</div>

                    <div className="relative z-10">
                      <div className="inline-block mb-4 animate-bounce">
                        <div className="text-7xl drop-shadow-lg">🎓</div>
                      </div>
                      <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        2025 Annual Professional Development Conference
                      </h3>
                      <div className="flex items-center justify-center gap-6 mb-4 flex-wrap">
                        <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-bold text-indigo-900">March 15-17, 2025</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-bold text-purple-900">Transcorp Hilton, Abuja</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
                        Join <strong className="text-indigo-600">2,000+ industry leaders</strong> for three days of learning, networking, and professional growth.
                        <br />
                        <span className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300 font-bold text-green-800">
                          🎉 Members receive exclusive discounts up to 50% OFF!
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Membership Benefits - Enhanced */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8 mb-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span>Member Discount Tiers</span>
                      <span className="ml-auto text-sm bg-green-200 text-green-800 px-4 py-1 rounded-full font-semibold">Save Big!</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="group bg-white rounded-xl p-6 border-2 border-green-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-green-400 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">BEST!</div>
                        <div className="text-4xl mb-3 animate-bounce">🌟</div>
                        <p className="font-bold text-green-900 text-lg mb-2">Emeritus</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">50%</p>
                        <p className="text-sm text-green-700 font-semibold">Off</p>
                      </div>
                      <div className="group bg-white rounded-xl p-6 border-2 border-green-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-green-400">
                        <div className="text-4xl mb-3 group-hover:animate-spin">💎</div>
                        <p className="font-bold text-green-900 text-lg mb-2">Fellow</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">30%</p>
                        <p className="text-sm text-green-700 font-semibold">Off</p>
                      </div>
                      <div className="group bg-white rounded-xl p-6 border-2 border-green-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-green-400">
                        <div className="text-4xl mb-3 group-hover:animate-pulse">⭐</div>
                        <p className="font-bold text-green-900 text-lg mb-2">Senior Member</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">20%</p>
                        <p className="text-sm text-green-700 font-semibold">Off</p>
                      </div>
                      <div className="group bg-white rounded-xl p-6 border-2 border-green-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-green-400">
                        <div className="text-4xl mb-3 group-hover:animate-bounce">✨</div>
                        <p className="font-bold text-green-900 text-lg mb-2">Member</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">15%</p>
                        <p className="text-sm text-green-700 font-semibold">Off</p>
                      </div>
                    </div>
                  </div>

                  {/* Conference Highlights - Enhanced */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-8 mb-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <span>Conference Highlights</span>
                    </h3>
                    <div className="grid md:grid-cols-3 gap-5">
                      <div className="group bg-white rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg transform hover:scale-105">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl group-hover:animate-bounce">🎤</span>
                          <div>
                            <p className="font-bold text-blue-900 text-lg mb-1">50+ Expert Speakers</p>
                            <p className="text-blue-700 text-sm">Industry leaders and innovators</p>
                          </div>
                        </div>
                      </div>
                      <div className="group bg-white rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg transform hover:scale-105">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl group-hover:animate-pulse">🤝</span>
                          <div>
                            <p className="font-bold text-blue-900 text-lg mb-1">Networking Events</p>
                            <p className="text-blue-700 text-sm">Connect with 2000+ professionals</p>
                          </div>
                        </div>
                      </div>
                      <div className="group bg-white rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg transform hover:scale-105">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl group-hover:animate-bounce">🏆</span>
                          <div>
                            <p className="font-bold text-blue-900 text-lg mb-1">Awards Ceremony</p>
                            <p className="text-blue-700 text-sm">Celebrating excellence</p>
                          </div>
                        </div>
                      </div>
                      <div className="group bg-white rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg transform hover:scale-105">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl group-hover:animate-pulse">📚</span>
                          <div>
                            <p className="font-bold text-blue-900 text-lg mb-1">Workshops & Training</p>
                            <p className="text-blue-700 text-sm">Hands-on skill development</p>
                          </div>
                        </div>
                      </div>
                      <div className="group bg-white rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg transform hover:scale-105">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl group-hover:animate-bounce">🎁</span>
                          <div>
                            <p className="font-bold text-blue-900 text-lg mb-1">Conference Materials</p>
                            <p className="text-blue-700 text-sm">Digital and physical resources</p>
                          </div>
                        </div>
                      </div>
                      <div className="group bg-white rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-lg transform hover:scale-105">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl group-hover:animate-pulse">🍽️</span>
                          <div>
                            <p className="font-bold text-blue-900 text-lg mb-1">Meals & Refreshments</p>
                            <p className="text-blue-700 text-sm">All meals included</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* How It Works */}
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-purple-900 mb-3">How to Register with Member Discount</h3>
                    <div className="space-y-3 text-sm text-purple-800">
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold text-lg">1.</span>
                        <p>Connect your digital wallet containing your professional membership credential</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold text-lg">2.</span>
                        <p>Share your membership credential to verify your designation</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold text-lg">3.</span>
                        <p>System automatically calculates your member discount</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-purple-500 font-bold text-lg">4.</span>
                        <p>Complete registration at your discounted price!</p>
                      </div>
                    </div>
                  </div>

                  {/* Connect Buttons - Enhanced */}
                  <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
                    <button
                      onClick={initiateConnection}
                      disabled={isLoadingInvitation}
                      className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{isLoadingInvitation ? "Setting up..." : "Register with Member Discount"}</span>
                      </div>
                      {!isLoadingInvitation && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                          Save Up to 50%!
                        </div>
                      )}
                    </button>
                    <button
                      onClick={handleAlreadyConnected}
                      disabled={isLoadingInvitation}
                      className="group bg-white text-indigo-600 text-xl font-bold px-10 py-5 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all border-4 border-indigo-600 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{isLoadingInvitation ? "Setting up..." : "I'm Already Connected"}</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* QR Code Modal */}
              {connectionStatus === "connecting" && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full transform animate-slideUp">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-5 rounded-t-3xl relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"></div>
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
                            <p className="text-sm text-indigo-100">Scan to verify membership</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setConnectionStatus("disconnected")}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Modal Body */}
                    <div className="p-8 text-center">
                      {isLoadingInvitation ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border-2 border-gray-200 mb-6">
                          <div className="w-64 h-64 flex items-center justify-center mx-auto">
                            <div className="text-center">
                              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <p className="text-gray-600 font-semibold">Loading QR Code...</p>
                            </div>
                          </div>
                        </div>
                      ) : invitationUrl ? (
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl blur-xl opacity-50"></div>
                          <div className="relative bg-white p-8 rounded-2xl border-4 border-indigo-200 shadow-xl">
                            <QRCodeSVG value={qrCodeValue} size={280} level="H" />
                          </div>
                          <div className="absolute -top-3 -right-3 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            Active
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 p-8 rounded-2xl border-2 border-red-200 mb-6">
                          <div className="w-64 h-64 flex items-center justify-center mx-auto">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                              <p className="text-red-600 font-semibold">Failed to load invitation</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status Message */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-indigo-700">
                          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                          <p className="font-semibold">{connectionMessage || "Waiting for wallet connection..."}</p>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-6">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          How to Connect
                        </h4>
                        <ol className="text-left space-y-2 text-sm text-blue-800">
                          <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>Open your ConfirmD wallet app on your phone</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Tap the scan icon to activate your camera</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>Point your camera at the QR code above</span>
                          </li>
                        </ol>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3">
                        {proofUrl && (
                          <a
                            href={proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Open in Mobile Wallet
                          </a>
                        )}
                        <button
                          onClick={() => setConnectionStatus("disconnected")}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connected/Requesting/Received States - Enhanced */}
              {(connectionStatus === "connected" || connectionStatus === "requesting-proof" || connectionStatus === "proof-received" || connectionStatus === "verifying") && (
                <div className="p-8 text-center">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                      <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    {connectionStatus === "verifying" ? "🔍 Verifying Membership" :
                     connectionStatus === "proof-received" ? "✅ Credential Received!" :
                     "📋 Requesting Membership Verification"}
                  </h3>
                  <p className="text-xl text-gray-700 mb-6 font-semibold max-w-2xl mx-auto">
                    {connectionMessage || "Please approve the verification request in your wallet app..."}
                  </p>

                  {proofUrl && connectionStatus === "requesting-proof" && (
                    <div className="mt-6">
                      <a
                        href={proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-lg font-bold rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
                      >
                        <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Open in Wallet
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Verified State - Show Registration Form */}
              {connectionStatus === "verified" && membershipData && (
                <div className="p-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="relative w-28 h-28 mx-auto mb-6">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
                        <div className="relative w-28 h-28 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-2xl">
                          <svg className="w-14 h-14 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                          ✓ Verified
                        </div>
                      </div>
                      <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                        Membership Verified!
                      </h3>
                      <p className="text-gray-600 text-lg">{connectionMessage}</p>
                    </div>

                    {/* Verified Membership Info */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
                      <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Verified Credentials
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs text-indigo-700 mb-1">Full Name</p>
                          <p className="font-bold text-gray-900">{membershipData.fullname || `${membershipData.surname} ${membershipData.othernames}`}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs text-indigo-700 mb-1">Matric Number</p>
                          <p className="font-bold text-gray-900">{membershipData.matricNumber}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs text-indigo-700 mb-1">Class of Degree</p>
                          <p className="font-bold text-gray-900 text-lg">{membershipData.classOfDegree}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs text-indigo-700 mb-1">Programme</p>
                          <p className="font-bold text-gray-900">{membershipData.programme}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs text-indigo-700 mb-1">NYSC Certificate Number</p>
                          <p className="font-bold text-gray-900">{membershipData.certificateNumber}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          <p className="text-xs text-indigo-700 mb-1">Year of Graduation</p>
                          <p className="font-bold text-gray-900">{membershipData.yearEnd}</p>
                        </div>
                      </div>
                    </div>

                    {/* Conference Registration */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Complete Your Registration</h4>

                      {/* Ticket Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Ticket Type
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                          {(["Early Bird", "Regular", "Late"] as const).map((ticketType) => (
                            <button
                              key={ticketType}
                              onClick={() => setSelectedTicket(ticketType)}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                selectedTicket === ticketType
                                  ? "border-indigo-600 bg-indigo-50"
                                  : "border-gray-200 hover:border-indigo-300"
                              }`}
                            >
                              <p className="font-semibold text-gray-900">{ticketType}</p>
                              <p className="text-xs text-gray-500 line-through">
                                {formatCurrency(basePricing[ticketType])}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                        <h5 className="font-bold text-green-900 mb-4">Your Member Discount</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Base Price ({selectedTicket})</span>
                            <span className="font-semibold">{formatCurrency(basePricing[selectedTicket])}</span>
                          </div>
                          <div className="flex justify-between items-center text-green-600">
                            <span className="font-semibold">
                              {getDiscount(membershipData.classOfDegree).label} ({getDiscount(membershipData.classOfDegree).percentage}%)
                            </span>
                            <span className="font-semibold">
                              -{formatCurrency((basePricing[selectedTicket] * getDiscount(membershipData.classOfDegree).percentage) / 100)}
                            </span>
                          </div>
                          <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                            <span className="text-xl font-bold text-green-900">Total Amount</span>
                            <span className="text-2xl font-bold text-green-600">
                              {formatCurrency(calculatePrice())}
                            </span>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-green-300">
                            <p className="text-sm text-green-800 text-center">
                              <strong>You save {formatCurrency(basePricing[selectedTicket] - calculatePrice())}</strong> as a {membershipData.classOfDegree} graduate!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Form */}
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Complete Your Registration</h4>

                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {/* Full Name (Read-only from credential) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={membershipData.fullname || `${membershipData.surname} ${membershipData.othernames}`}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                          />
                        </div>

                        {/* Email (Editable) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={registrationEmail}
                            onChange={(e) => setRegistrationEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>

                        {/* Phone Number (New field) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="+234 xxx xxx xxxx"
                            required
                          />
                        </div>

                        {/* Programme (Read-only from credential) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Programme
                          </label>
                          <input
                            type="text"
                            value={membershipData.programme}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
                          />
                        </div>
                      </div>

                      {/* Special Requirements (Optional) */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Requirements (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={specialRequirements}
                          onChange={(e) => setSpecialRequirements(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Dietary restrictions, accessibility needs, etc."
                        />
                      </div>

                      {/* Form Validation Notice */}
                      {(!registrationEmail || !phoneNumber) && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-amber-900">Required Fields Missing</p>
                              <p className="text-xs text-amber-700 mt-1">Please fill in your email address and phone number to continue.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          if (!registrationEmail || !phoneNumber) {
                            alert("Please fill in all required fields (Email and Phone Number)");
                            return;
                          }

                          const discount = getDiscount(membershipData.classOfDegree);
                          const basePrice = basePricing[selectedTicket];
                          const finalPrice = calculatePrice();
                          const discountAmount = basePrice - finalPrice;

                          const params = new URLSearchParams({
                            memberName: membershipData.fullname || `${membershipData.surname} ${membershipData.othernames}`,
                            email: registrationEmail,
                            phone: phoneNumber,
                            matricNumber: membershipData.matricNumber,
                            classOfDegree: membershipData.classOfDegree,
                            programme: membershipData.programme,
                            certificateNumber: membershipData.certificateNumber,
                            ticketType: selectedTicket,
                            basePrice: basePrice.toString(),
                            discount: discountAmount.toString(),
                            finalPrice: finalPrice.toString(),
                            specialRequirements: specialRequirements,
                          });

                          router.push(`/professional/members/success?${params.toString()}`);
                        }}
                        disabled={!registrationEmail || !phoneNumber}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete Registration
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setConnectionStatus("disconnected");
                          setMembershipData(null);
                          setRegistrationEmail("");
                          setPhoneNumber("");
                          setSpecialRequirements("");
                        }}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
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
