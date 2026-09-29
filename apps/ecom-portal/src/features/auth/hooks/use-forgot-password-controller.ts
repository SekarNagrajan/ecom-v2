// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { requestPasswordReset } from "../api/auth.api";
import {
  createForgotPasswordSchema,
  type ForgotPasswordForm,
} from "../types/auth.types";

export function useForgotPasswordController() {
  const { t } = useTranslation("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const schema = useMemo(() => createForgotPasswordSchema(t), [t]);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { userName: "", captcha: "" },
  });

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setServerError(null);
      setIsSuccess(true);
    },
    onError: (err: Error) => {
      setServerError(err.message ?? t("errors.passwordReset"));
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
