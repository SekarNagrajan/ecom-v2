// Modified by Sekar Nagarajan (2026-09-11 16:08)
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import {
  resendLoginOtp,
  verifyLoginOtp,
  type OtpLoginStep1Response,
} from "../api/otp-login.api";
import { OTP_LOGIN_CONFIG } from "../config/otp-login-config";

export type OtpSessionSnapshot = Extract<
  OtpLoginStep1Response,
  { status: "OTP_REQUIRED" }
>;

interface UseOtpLoginControllerOptions {
  session: OtpSessionSnapshot | null;
  onVerifiedSuccess?: () => void;
  onLocked?: () => void;
  onResendLimit?: () => void;
  onCodeSent?: (message: string) => void;
}

function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function useOtpLoginController({
  session,
  onVerifiedSuccess,
  onLocked,
  onResendLimit,
  onCodeSent,
}: UseOtpLoginControllerOptions) {
  const { login } = useAuthStore();
  const { setTenant } = useTenantStore();

  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState(session?.devCode ?? "");
  const [secondsLeft, setSecondsLeft] = useState(session?.ttl ?? 0);
  const [resendCooldownLeft, setResendCooldownLeft] = useState(
    session?.resendCooldown ?? 0,
  );
  const [resendsLeft, setResendsLeft] = useState(session?.maxResends ?? 0);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timerEpoch, setTimerEpoch] = useState(0);
  const [cooldownEpoch, setCooldownEpoch] = useState(0);

  const sessionKey = session
    ? `${session.maskedEmail}:${session.devCode}:${session.ttl}`
    : null;
  const lastSessionKey = useRef<string | null>(null);

  useEffect(() => {
    if (sessionKey === lastSessionKey.current) return;
    lastSessionKey.current = sessionKey;

    if (!session) {
      setCode("");
      setDevCode("");
      setSecondsLeft(0);
      setResendCooldownLeft(0);
      setResendsLeft(0);
      setInlineError(null);
      setShake(false);
      setExpired(false);
      return;
    }

    setCode("");
    setDevCode(session.devCode);
    setSecondsLeft(session.ttl);
    setResendCooldownLeft(session.resendCooldown);
    setResendsLeft(session.maxResends);
    setInlineError(null);
    setShake(false);
    setExpired(false);
    setTimerEpoch((n) => n + 1);
    setCooldownEpoch((n) => n + 1);
  }, [session, sessionKey]);

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [session, timerEpoch]);

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      setResendCooldownLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [session, cooldownEpoch]);

  const verifyMutation = useMutation({
    mutationFn: (otp: string) => verifyLoginOtp(otp),
    onSuccess: (data) => {
      if (data.status === "VERIFIED") {
        setInlineError(null);
        login(data.token, data.user);
        if (data.user.tenantId) {
          setTenant(data.user.tenantId);
        }
        onVerifiedSuccess?.();
        return;
      }
      if (data.status === "INVALID") {
        setShake(true);
        setInlineError(
          `Incorrect code. ${data.attemptsLeft} attempts left.`,
        );
        setCode("");
        window.setTimeout(() => setShake(false), 450);
        return;
      }
      if (data.status === "EXPIRED") {
        setExpired(true);
        setInlineError("This code has expired. Request a new one.");
        return;
      }
      if (data.status === "LOCKED") {
        onLocked?.();
      }
    },
    onError: (err: Error) => {
      setInlineError(err.message || "Verification failed. Try again.");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendLoginOtp(),
    onSuccess: (data) => {
      if (data.status === "LIMIT") {
        onResendLimit?.();
        return;
      }
      setDevCode(data.devCode);
      setSecondsLeft(data.ttl);
      setResendsLeft(data.resendsLeft);
      setResendCooldownLeft(session?.resendCooldown ?? 30);
      setExpired(false);
      setInlineError(null);
      setCode("");
      setTimerEpoch((n) => n + 1);
      setCooldownEpoch((n) => n + 1);
      onCodeSent?.(
        `New code sent · ${data.resendsLeft} resends left.`,
      );
    },
    onError: (err: Error) => {
      setInlineError(err.message || "Could not resend code.");
    },
  });

  const codeLength =
    session?.codeLength ?? OTP_LOGIN_CONFIG.codeLength;

  const canVerify =
    code.replace(/\D/g, "").length === codeLength &&
    !expired &&
    !verifyMutation.isPending;

  const canResend =
    resendCooldownLeft <= 0 &&
    resendsLeft > 0 &&
    !resendMutation.isPending &&
    !verifyMutation.isPending;

  const handleVerify = () => {
    if (!canVerify) return;
    setInlineError(null);
    verifyMutation.mutate(code);
  };

  const handleResend = () => {
    if (!canResend) return;
    resendMutation.mutate();
  };

  const handleCodeChange = (value: string) => {
    setCode(value.replace(/\D/g, "").slice(0, codeLength));
    if (inlineError) setInlineError(null);
  };

  return {
    code,
    codeLength,
    handleCodeChange,
    handleVerify,
    handleResend,
    timerLabel: expired ? "expired" : formatTimer(secondsLeft),
    expired,
    resendCooldownLeft,
    resendsLeft,
    canVerify,
    canResend,
    isVerifying: verifyMutation.isPending,
    isResending: resendMutation.isPending,
    inlineError,
    shake,
    // TODO(remove for prod): devCode
    showDevCode: OTP_LOGIN_CONFIG.showDevCode,
    devCode: OTP_LOGIN_CONFIG.showDevCode ? devCode : "",
    maskedEmail: session?.maskedEmail ?? "",
  };
}
