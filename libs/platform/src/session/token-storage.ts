// Created by Sekar Nagarajan (2026-11-26 16:35)
/**
 * Single owner of the persisted access-token key. Every reader/writer (auth store, axios client,
 * fetch client, rehydrate, impersonation) goes through here so the key and the try/catch around
 * storage access live in one place.
 */
export const AUTH_TOKEN_KEY = "ecom_auth_token";

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    /* storage unavailable (private mode / blocked) — token stays in memory only */
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
}
