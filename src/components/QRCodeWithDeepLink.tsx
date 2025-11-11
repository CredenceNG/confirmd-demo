/**
 * QR Code with Deep Link Component
 *
 * Displays a QR code for wallet connection with an optional deep link button
 * for mobile users to open the invitation directly in the ConfirmD Wallet app.
 */

"use client";

import { QRCodeSVG } from "qrcode.react";
import { generateDeepLink, shouldShowDeepLink } from "@/lib/utils/deeplink";

interface QRCodeWithDeepLinkProps {
  /** The invitation URL to encode in the QR code */
  invitationUrl: string;
  /** Optional custom QR code value (defaults to invitationUrl) */
  qrCodeValue?: string;
  /** Size of the QR code in pixels */
  size?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Optional custom loading message */
  loadingMessage?: string;
  /** Optional custom instruction text */
  instructionText?: string;
  /** Optional deep link button text */
  deepLinkButtonText?: string;
  /** Optional deep link helper text */
  deepLinkHelperText?: string;
  /** Show deep link even on desktop (for testing) */
  forceShowDeepLink?: boolean;
}

export default function QRCodeWithDeepLink({
  invitationUrl,
  qrCodeValue,
  size = 320,
  isLoading = false,
  loadingMessage = "Loading QR Code...",
  instructionText = "Open your ConfirmD App and scan the QR code",
  deepLinkButtonText = "Open in ConfirmD Wallet",
  deepLinkHelperText = "This will launch the ConfirmD app if it's installed",
  forceShowDeepLink = false,
}: QRCodeWithDeepLinkProps) {
  const deepLink = generateDeepLink(invitationUrl);
  const showDeepLink = forceShowDeepLink || shouldShowDeepLink(invitationUrl);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block mb-6">
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitationUrl) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-red-200 inline-block mb-6">
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
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
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* QR Code */}
      <div className="bg-white p-8 rounded-lg border-2 border-green-200 inline-block mb-6">
        <QRCodeSVG value={qrCodeValue || invitationUrl} size={size} level="H" />
      </div>

      {/* Instruction Text */}
      <p className="text-sm text-gray-500 mb-6 text-center">
        {instructionText}
      </p>

      {/* Mobile Deep Link Button */}
      {showDeepLink && deepLink && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-3 font-medium">
              📱 On mobile? Open directly in ConfirmD Wallet
            </p>
            <a
              href={deepLink}
              className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              {deepLinkButtonText}
            </a>
            <p className="text-xs text-blue-600 mt-2 text-center">
              {deepLinkHelperText}
            </p>
          </div>
          <div className="text-center text-sm text-gray-500 mb-4">
            <span className="inline-block">or scan the QR code above</span>
          </div>
        </div>
      )}
    </div>
  );
}
