// Created by Sekar Nagarajan (2026-11-26 16:35)
/**
 * Minimal JWT `exp` reader. Does NOT verify the signature — it is only used to schedule client
 * side refresh/warning timers; the server remains the authority on token validity.
 * Returns epoch milliseconds, or null for opaque (non-JWT) tokens such as the mock-mode ones.
 */
export function decodeJwtExpiryMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload: unknown = JSON.parse(atob(padded));
    if (payload && typeof payload === "object" && "exp" in payload) {
      const exp = (payload as { exp: unknown }).exp;
      if (typeof exp === "number" && Number.isFinite(exp)) return exp * 1000;
    }
  } catch {
    /* malformed token */
  }
  return null;
}

/** Server-supplied expiry (ISO string or epoch ms) wins; fall back to the JWT `exp` claim. */
export function resolveExpiryMs(
  token: string,
  serverExpiresAt?: string | number | null,
): number | null {
  if (serverExpiresAt != null) {
    const ms = typeof serverExpiresAt === "number" ? serverExpiresAt : Date.parse(serverExpiresAt);
    if (Number.isFinite(ms)) return ms;
  }
  return decodeJwtExpiryMs(token);
}
