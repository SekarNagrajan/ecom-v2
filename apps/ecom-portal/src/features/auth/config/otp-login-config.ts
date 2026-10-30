// Modified by Sekar Nagarajan (2026-09-11 16:08)
/**
 * Client OTP login config — flip flags per client requirement (mock until
 * REST / GlobalConfig / tenant features expose the same shape).
 *
 * Controllers and UI read this object; do not hardcode OTP policy in components.
 */

export interface OtpLoginConfig {
  /** When false, login uses direct `loginUser` and skips the OTP step. */
  enableOtpLogin: boolean;
  /** OTP digit count shown in the UI and validated by the mock. */
  codeLength: number;
  /** Seconds until the current code expires. */
  ttlSeconds: number;
  /** Seconds before Resend becomes available again. */
  resendCooldownSeconds: number;
  /** Max successful resend calls per login attempt. */
  maxResends: number;
  /** Max wrong verify attempts before lockout. */
  maxAttempts: number;
  /**
   * Show the DEMO — simulated email panel with `devCode`.
   * TODO(remove for prod): must be false when real email OTP ships.
   */
  showDevCode: boolean;
  /** Mock-only credentials used when OTP is enabled (dev). */
  mockCredentials: {
    userName: string;
    password: string;
  };
}

/**
 * Default client config. Change `enableOtpLogin` (and related numbers) here
 * to match the client requirement without touching UI/controller code.
 */
export const OTP_LOGIN_CONFIG: OtpLoginConfig = {
  enableOtpLogin: false,
  codeLength: 6,
  ttlSeconds: 120,
  resendCooldownSeconds: 30,
  maxResends: 3,
  maxAttempts: 5,
  showDevCode: true,
  mockCredentials: {
    userName: "demo@solverminds.com",
    password: "Demo@1234",
  },
};
