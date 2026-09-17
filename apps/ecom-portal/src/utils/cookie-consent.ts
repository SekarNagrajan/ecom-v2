// Created by Sekar Nagarajan (2026-09-17 11:44)
/** localStorage key for cookie-policy acceptance (post-login banner). */
export const COOKIE_CONSENT_STORAGE_KEY = "ecom.cookie-consent.v1";

export function hasAcceptedCookieConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function acceptCookieConsent(): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
  } catch {
    // Ignore quota / private-mode write failures — banner can reappear.
  }
}
