/**
 * Deep Link Utilities for ConfirmD Wallet
 *
 * Provides utilities for generating deep links to open invitation URLs
 * directly in the ConfirmD mobile wallet app.
 *
 * Based on DIDComm out-of-band (OOB) invitation protocol.
 * The backend provides properly formatted invitations with the correct
 * services array structure - we just need to extract and encode the OOB parameter.
 */

/**
 * Check if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Extract and decode OOB data from invitation URL for debugging
 *
 * @param invitationUrl - The invitation URL from ConfirmD Platform
 * @returns Decoded OOB invitation object or null
 */
export function extractOobData(invitationUrl: string): any | null {
  try {
    const url = new URL(invitationUrl);
    const oobParam = url.searchParams.get('oob');

    if (!oobParam) {
      console.warn('No OOB parameter found in invitation URL');
      return null;
    }

    // Decode base64
    const decoded = atob(oobParam);
    const oobData = JSON.parse(decoded);

    // Log for debugging
    console.log('[DeepLink] OOB Invitation Data:', oobData);

    return oobData;
  } catch (error) {
    console.error('[DeepLink] Failed to decode OOB data:', error);
    return null;
  }
}

/**
 * Validate deeplink format
 *
 * @param deeplink - The generated deeplink
 * @returns True if valid
 */
export function validateDeeplink(deeplink: string): boolean {
  const checks = {
    hasScheme: deeplink.startsWith('confirmdwallet://'),
    hasPath: deeplink.includes('connect'),
    hasOobParam: deeplink.includes('oob=') || deeplink.includes('c_i=') || deeplink.includes('url='),
    // Check that OOB param is properly URL encoded (no raw + or / characters after oob=)
    isProperlyEncoded: (() => {
      try {
        const match = deeplink.match(/(?:oob|c_i|url)=([^&]*)/);
        if (!match) return false;
        const param = match[1];
        // If it contains raw + or unencoded /, it's likely not properly encoded
        return !param.includes('+') || param.includes('%2B');
      } catch {
        return true; // If we can't check, assume it's okay
      }
    })(),
  };

  const isValid = Object.values(checks).every(Boolean);

  if (!isValid) {
    console.error('[DeepLink] Invalid deeplink format:', deeplink);
    console.error('[DeepLink] Validation checks:', checks);
  }

  return isValid;
}

/**
 * Generate a deep link for the ConfirmD Wallet app
 *
 * IMPORTANT: This function extracts the OOB parameter from the invitation URL
 * provided by the backend. The backend creates properly formatted DIDComm
 * invitations with the correct services array structure.
 *
 * Supported formats:
 * - confirmdwallet://connect?oob=<url_encoded_oob_param> (PREFERRED)
 * - confirmdwallet://connect?c_i=<url_encoded_invitation_param>
 * - confirmdwallet://connect?url=<url_encoded_invitation_url> (FALLBACK)
 *
 * @param invitationUrl - The invitation URL from ConfirmD Platform (e.g., https://platform.confamd.com?oob=eyJA...)
 * @param walletScheme - The wallet URL scheme (default: 'confirmdwallet')
 * @returns Deep link string or null if unable to generate
 */
export function generateDeepLink(
  invitationUrl: string,
  walletScheme: string = 'confirmdwallet'
): string | null {
  if (!invitationUrl) {
    console.warn('[DeepLink] No invitation URL provided');
    return null;
  }

  try {
    const url = new URL(invitationUrl);
    const oobParam = url.searchParams.get('oob');
    const ciParam = url.searchParams.get('c_i');

    let deeplink: string;

    // Priority 1: Use OOB parameter (out-of-band) - MOST COMMON
    if (oobParam) {
      // URL encode the OOB parameter for safety
      const encodedOob = encodeURIComponent(oobParam);
      deeplink = `${walletScheme}://connect?oob=${encodedOob}`;

      console.log('[DeepLink] Generated OOB deeplink:', deeplink.substring(0, 100) + '...');
    }
    // Priority 2: Use c_i parameter (connection invitation)
    else if (ciParam) {
      const encodedCi = encodeURIComponent(ciParam);
      deeplink = `${walletScheme}://connect?c_i=${encodedCi}`;

      console.log('[DeepLink] Generated c_i deeplink:', deeplink.substring(0, 100) + '...');
    }
    // Fallback: Encode entire URL
    else {
      console.warn('[DeepLink] No OOB or c_i parameter found, using URL fallback');
      deeplink = `${walletScheme}://connect?url=${encodeURIComponent(invitationUrl)}`;
    }

    // Validate the generated deeplink
    const isValid = validateDeeplink(deeplink);
    if (!isValid) {
      console.error('[DeepLink] Generated deeplink failed validation');
    }

    return deeplink;
  } catch (error) {
    console.error('[DeepLink] Error generating deep link:', error);
    return null;
  }
}

/**
 * Check if deep link should be shown
 *
 * @param invitationUrl - The invitation URL
 * @returns True if deep link should be displayed
 */
export function shouldShowDeepLink(invitationUrl: string | null | undefined): boolean {
  return isMobileDevice() && !!invitationUrl && !!generateDeepLink(invitationUrl || '');
}
