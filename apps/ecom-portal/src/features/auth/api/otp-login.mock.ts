// Modified by Sekar Nagarajan (2026-09-11 16:08)
/**
 * Mock OTP login layer — frontend-only.
 *
 * Swap note: to go live, replace each method body in `otp-login.api.ts` with
 * the matching REST call. This mock file can be deleted; UI/controllers that
 * import only from `otp-login.api.ts` stay unchanged.
 *
 * Policy numbers and demo credentials come from `OTP_LOGIN_CONFIG`
 * (client requirement). Do not hardcode them here.
 */
import { PRECONFIGURED_TENANTS } from "@solverminds/auth";

import { OTP_LOGIN_CONFIG } from "../config/otp-login-config";
import type { LoginSuccessResponse } from "../types/auth.types";

const MOCK = {
  user: OTP_LOGIN_CONFIG.mockCredentials.userName,
  pass: OTP_LOGIN_CONFIG.mockCredentials.password,
} as const;

/** Runtime policy derived from client config (not a second source of truth). */
const CFG = {
  ttl: OTP_LOGIN_CONFIG.ttlSeconds,
  resendCooldown: OTP_LOGIN_CONFIG.resendCooldownSeconds,
  maxResends: OTP_LOGIN_CONFIG.maxResends,
  maxAttempts: OTP_LOGIN_CONFIG.maxAttempts,
  codeLength: OTP_LOGIN_CONFIG.codeLength,
} as const;

const MOCK_VERIFIED_USER: LoginSuccessResponse = {
  token: "mock-jwt-otp-demo",
  user: {
    id: "usr_otp_demo",
    name: "Sekar Nagarajan",
    email: MOCK.user,
    company: PRECONFIGURED_TENANTS.TENANT_01.name,
    role: "CUSTOMER",
    capabilities: [
      "SCH",
      "TRK",
      "BKG",
      "SI",
      "BL",
      "DO",
      "CRO",
      "ARN",
      "STMT",
      "CO2",
      "VGM",
      "PAY",
    ],
    customerCode: PRECONFIGURED_TENANTS.TENANT_01.customerCode,
    tenantId: "TENANT_01",
    allowedModules: PRECONFIGURED_TENANTS.TENANT_01.features.allowedModules,
    loginType: "U",
  },
  redirectUrl: "/app/dashboard",
};

// ---------------------------------------------------------------------------
// Response shapes (future servlet JSON)
// ---------------------------------------------------------------------------
export type OtpLoginStep1Response =
  | {
      status: "OTP_REQUIRED";
      maskedEmail: string;
      ttl: number;
      resendCooldown: number;
      maxResends: number;
      codeLength: number;
      /** TODO(remove for prod): devCode — mock-only; real servlet must never return the code */
      devCode: string;
    }
  | { status: "INVALID" };

export type OtpVerifyResponse =
  | ({ status: "VERIFIED" } & LoginSuccessResponse)
  | { status: "INVALID"; attemptsLeft: number }
  | { status: "EXPIRED" }
  | { status: "LOCKED" };

export type OtpResendResponse =
  | {
      status: "SENT";
      ttl: number;
      resendsLeft: number;
      codeLength: number;
      /** TODO(remove for prod): devCode */
      devCode: string;
    }
  | { status: "LIMIT" };

// ---------------------------------------------------------------------------
// In-memory session
// ---------------------------------------------------------------------------
interface OtpSession {
  code: string;
  expiresAt: number;
  attempts: number;
  resendsUsed: number;
  email: string;
}

let session: OtpSession | null = null;

function delay(ms = 500 + Math.floor(Math.random() * 151)): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || !local) return "•••@•••";
  const head = local.charAt(0);
  return `${head}•••@${domain}`;
}

function randomCode(length = CFG.codeLength): string {
  const safeLength = Math.max(4, Math.min(8, length));
  const min = 10 ** (safeLength - 1);
  const max = 10 ** safeLength - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

function isExpired(s: OtpSession): boolean {
  return Date.now() >= s.expiresAt;
}

function normalizeUser(userName: string): string {
  return userName.trim().toLowerCase();
}

/** Clear mock OTP session (drawer close / lockout / success). */
export function resetOtpLoginMockSession(): void {
  session = null;
}

/**
 * maps to future: POST /api/auth/login-step1
 */
export async function loginStep1(
  email: string,
  password: string,
): Promise<OtpLoginStep1Response> {
  await delay();

  const userOk = normalizeUser(email) === normalizeUser(MOCK.user);
  const passOk = password.trim() === MOCK.pass;

  if (!userOk || !passOk) {
    session = null;
    return { status: "INVALID" };
  }

  const code = randomCode();
  session = {
    code,
    expiresAt: Date.now() + CFG.ttl * 1000,
    attempts: 0,
    resendsUsed: 0,
    email: MOCK.user,
  };

  return {
    status: "OTP_REQUIRED",
    maskedEmail: maskEmail(MOCK.user),
    ttl: CFG.ttl,
    resendCooldown: CFG.resendCooldown,
    maxResends: CFG.maxResends,
    codeLength: CFG.codeLength,
    // TODO(remove for prod): devCode
    devCode: OTP_LOGIN_CONFIG.showDevCode ? code : "",
  };
}

/**
 * maps to future: POST /api/auth/verify-login-otp
 * (server resolves user from session — code is the only client input)
 */
export async function verifyLoginOtp(code: string): Promise<OtpVerifyResponse> {
  await delay();

  if (!session) {
    return { status: "EXPIRED" };
  }

  if (isExpired(session)) {
    return { status: "EXPIRED" };
  }

  const trimmed = code.replace(/\D/g, "");
  if (trimmed !== session.code) {
    session.attempts += 1;
    if (session.attempts >= CFG.maxAttempts) {
      session = null;
      return { status: "LOCKED" };
    }
    return {
      status: "INVALID",
      attemptsLeft: CFG.maxAttempts - session.attempts,
    };
  }

  session = null;
  return { status: "VERIFIED", ...MOCK_VERIFIED_USER };
}

/**
 * maps to future: POST /api/auth/resend-login-otp
 */
export async function resendLoginOtp(): Promise<OtpResendResponse> {
  await delay();

  if (!session) {
    return { status: "LIMIT" };
  }

  if (session.resendsUsed >= CFG.maxResends) {
    return { status: "LIMIT" };
  }

  session.resendsUsed += 1;
  const code = randomCode();
  session.code = code;
  session.expiresAt = Date.now() + CFG.ttl * 1000;
  session.attempts = 0;

  const resendsLeft = CFG.maxResends - session.resendsUsed;

  return {
    status: "SENT",
    ttl: CFG.ttl,
    resendsLeft,
    codeLength: CFG.codeLength,
    // TODO(remove for prod): devCode
    devCode: OTP_LOGIN_CONFIG.showDevCode ? code : "",
  };
}

export const OTP_LOGIN_CFG = CFG;
