// Created by Sekar Nagarajan (2026-08-22 09:00)
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { requestPasswordReset } from '../api/auth.api';
import { forgotPasswordSchema, type ForgotPasswordForm } from '../types/auth.types';

export function useForgotPasswordController() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { userName: '', captcha: '' },
  });

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setServerError(null);
      setIsSuccess(true);
    },
    onError: (err: Error) => {
      setServerError(err.message ?? 'Failed to request password reset');
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    mutation.mutate(values);
  });

  const resetForm = () => {
    form.reset();
    setIsSuccess(false);
    setServerError(null);
  };

  return {
    form,
    handleSubmit,
    serverError,
    isSubmitting: mutation.isPending,
    isSuccess,
    resetForm,
  };
}
