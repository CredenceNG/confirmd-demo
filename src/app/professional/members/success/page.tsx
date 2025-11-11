"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Calendar, MapPin, User, CreditCard, ArrowLeft, Download } from "lucide-react";

interface RegistrationDetails {
  memberName: string;
  email: string;
  registrationNumber: string;
  designation: string;
  ticketType: string;
  basePrice: number;
  discount: number;
  finalPrice: number;
  confirmationId: string;
}

function ConferenceSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetails | null>(null);

  useEffect(() => {
    // Parse registration details from URL parameters
    const memberName = searchParams.get("memberName");
    const email = searchParams.get("email");
    const registrationNumber = searchParams.get("registrationNumber");
    const designation = searchParams.get("designation");
    const ticketType = searchParams.get("ticketType");
    const basePrice = searchParams.get("basePrice");
    const discount = searchParams.get("discount");
    const finalPrice = searchParams.get("finalPrice");

    if (memberName && ticketType && basePrice && finalPrice) {
      setRegistrationDetails({
        memberName,
        email: email || "N/A",
        registrationNumber: registrationNumber || "N/A",
        designation: designation || "Member",
        ticketType,
        basePrice: parseFloat(basePrice),
        discount: parseFloat(discount || "0"),
        finalPrice: parseFloat(finalPrice),
        confirmationId: `CONF-${Date.now().toString().slice(-8)}`,
      });
    } else {
      // Redirect back if no valid data
      router.push("/professional/members");
    }
  }, [searchParams, router]);

  const handleDownloadTicket = () => {
    // In a real application, this would generate a PDF ticket
    alert("Ticket download functionality would be implemented here");
  };

  if (!registrationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
            <p className="text-gray-600">
              Thank you for registering for the 2025 Annual Professional Development Conference
            </p>
          </div>

          {/* Confirmation ID */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
            <p className="text-2xl font-bold text-purple-900">{registrationDetails.confirmationId}</p>
          </div>

          {/* Event Details */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">March 15-17, 2025</p>
                  <p className="text-sm text-gray-600">3-day conference</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Transcorp Hilton Abuja</p>
                  <p className="text-sm text-gray-600">1 Aguiyi Ironsi St, Maitama, Abuja</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendee Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{registrationDetails.memberName}</p>
                  <p className="text-sm text-gray-600">{registrationDetails.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <CreditCard className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {registrationDetails.designation} - {registrationDetails.registrationNumber}
                  </p>
                  <p className="text-sm text-gray-600">Professional Membership</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>{registrationDetails.ticketType} Ticket</span>
                <span>₦{registrationDetails.basePrice.toLocaleString()}</span>
              </div>
              {registrationDetails.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{registrationDetails.designation} Discount ({((registrationDetails.discount / registrationDetails.basePrice) * 100).toFixed(0)}%)</span>
                  <span>-₦{registrationDetails.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>₦{registrationDetails.finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>A confirmation email has been sent to {registrationDetails.email}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Your e-ticket will arrive within 24 hours</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Present your confirmation number or e-ticket at registration</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Check your email for the conference schedule and venue information</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadTicket}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Ticket
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your registration or the conference, please contact us:
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Email: conference@professional.org</p>
            <p>Phone: +234 800 123 4567</p>
            <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM WAT</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConferenceSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>}>
      <ConferenceSuccessContent />
    </Suspense>
  );
}
