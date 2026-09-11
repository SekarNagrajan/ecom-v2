// Modified by Sekar Nagarajan (2026-09-11 16:08)
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { create } from "zustand";

import { loginUser } from "../api/auth.api";
import {
  loginStep1,
  resetOtpLoginMockSession,
} from "../api/otp-login.api";
import { OTP_LOGIN_CONFIG } from "../config/otp-login-config";
import { loginSchema, type LoginForm } from "../types/auth.types";
import type { OtpSessionSnapshot } from "./use-otp-login-controller";

// ---------------------------------------------------------------------------
// Failed-attempt counter — parity with JSP `InvalidpassattemptCount` session
// Persisted in module-level Zustand store (client UI state only).
// ---------------------------------------------------------------------------
interface LoginAttemptState {
  failedAttempts: number;
  increment: () => void;
  reset: () => void;
}

export const useLoginAttemptStore = create<LoginAttemptState>((set) => ({
  failedAttempts: 0,
  increment: () => set((s) => ({ failedAttempts: s.failedAttempts + 1 })),
  reset: () => set({ failedAttempts: 0 }),
}));

/** Threshold after which the CAPTCHA widget is rendered — parity with JSP `passattemptCount >= 3` */
export const LOGIN_CAPTCHA_THRESHOLD = 3;

export type LoginPhase = "credentials" | "otp";

// ---------------------------------------------------------------------------
type LoginMutationResult =
  | { mode: "otp"; data: Awaited<ReturnType<typeof loginStep1>> }
  | {
      mode: "direct";
      data: Awaited<ReturnType<typeof loginUser>>;
    };

// ---------------------------------------------------------------------------
interface UseLoginControllerOptions {
  onSuccess?: () => void;
  /** Fired when step-1 succeeds and OTP UI should open */
  onOtpRequired?: () => void;
}

export function useLoginController({
  onSuccess,
  onOtpRequired,
}: UseLoginControllerOptions = {}) {
  const { login } = useAuthStore();
  const { setTenant } = useTenantStore();
  const { failedAttempts, increment, reset } = useLoginAttemptStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [phase, setPhase] = useState<LoginPhase>("credentials");
  const [otpSession, setOtpSession] = useState<OtpSessionSnapshot | null>(
    null,
  );

  const otpEnabled = OTP_LOGIN_CONFIG.enableOtpLogin;

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginForm): Promise<LoginMutationResult> => {
      if (otpEnabled) {
        const data = await loginStep1(values.userName, values.password);
        return { mode: "otp", data };
      }
      const data = await loginUser(values);
      return { mode: "direct", data };
    },
    onSuccess: (result) => {
      if (result.mode === "direct") {
        reset();
        setServerError(null);
        login(result.data.token, result.data.user);
        if (result.data.user.tenantId) {
          setTenant(result.data.user.tenantId);
        }
        onSuccess?.();
        return;
      }

      if (result.data.status === "INVALID") {
        increment();
        setServerError("Incorrect email or password.");
        setPhase("credentials");
        setOtpSession(null);
        return;
      }

      reset();
      setServerError(null);
      setOtpSession(result.data);
      setPhase("otp");
      onOtpRequired?.();
    },
    onError: (err: Error) => {
      increment();
      setServerError(err.message ?? "Incorrect email or password.");
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    mutation.mutate(values);
  });

  const clearOtpPhase = () => {
    resetOtpLoginMockSession();
    setOtpSession(null);
    setPhase("credentials");
  };

  const completeOtpSuccess = () => {
    reset();
    setServerError(null);
    clearOtpPhase();
    form.reset();
    onSuccess?.();
  };

  const showCaptcha = failedAttempts >= LOGIN_CAPTCHA_THRESHOLD;

  return {
    form,
    handleSubmit,
    serverError,
    isSubmitting: mutation.isPending,
    showCaptcha,
    failedAttempts,
    phase,
    otpSession,
    otpEnabled,
    clearOtpPhase,
    completeOtpSuccess,
    setPhase,
  };
}
