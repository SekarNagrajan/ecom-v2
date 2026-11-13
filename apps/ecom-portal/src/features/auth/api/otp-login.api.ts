// Modified by Sekar Nagarajan (2026-09-11 16:08)
/**
 * OTP login API seam.
 *
 * Controllers import from this file only. Today it re-exports the mock layer.
 * To go live, replace each export with a real `apiClient` call — UI stays unchanged.
 *
 * Client policy (`enableOtpLogin`, TTL, etc.) lives in `../config/otp-login-config`.
 */
export {
  loginStep1,
  verifyLoginOtp,
  resendLoginOtp,
  resetOtpLoginMockSession,
  OTP_LOGIN_CFG,
  type OtpLoginStep1Response,
  type OtpVerifyResponse,
  type OtpResendResponse,
} from "./otp-login.mock";

export { OTP_LOGIN_CONFIG } from "../config/otp-login-config";
