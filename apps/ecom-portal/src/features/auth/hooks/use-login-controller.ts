// Modified by Antigravity (2026-08-21)
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { create } from 'zustand';

import { useAuthStore, useTenantStore } from '@solverminds/auth';
import { loginUser } from '../api/auth.api';
import { loginSchema, type LoginForm } from '../types/auth.types';

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

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
interface UseLoginControllerOptions {
  onSuccess?: () => void;
}

export function useLoginController({ onSuccess }: UseLoginControllerOptions = {}) {
  const { login } = useAuthStore();
  const { setTenant } = useTenantStore();
  const { failedAttempts, increment, reset } = useLoginAttemptStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      reset();
      setServerError(null);
      // Populate the global auth store & tenant store — same effect as JSP session creation
      login(data.token, data.user);
      if (data.user.tenantId) {
        setTenant(data.user.tenantId);
      }
      onSuccess?.();
    },
    onError: (err: Error) => {
      increment();
      setServerError(err.message ?? 'Invalid Username / Password');
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    mutation.mutate(values);
  });

  const showCaptcha = failedAttempts >= LOGIN_CAPTCHA_THRESHOLD;

  return {
    form,
    handleSubmit,
    serverError,
    isSubmitting: mutation.isPending,
    showCaptcha,
    failedAttempts,
  };
}
