// Modified by Sekar Nagarajan (2026-09-29 12:40)
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubCustomerAccount } from "@solverminds/auth";
import { useAuthStore, useTenantStore } from "@solverminds/auth";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { loginAdmin } from "../api/auth.api";
import {
  createAdminLoginSchema,
  type AdminLoginForm,
  type LoginEntryType,
} from "../types/auth.types";

interface UseAdminLoginControllerOptions {
  entryType: LoginEntryType;
  onSuccess?: (customerList?: SubCustomerAccount[]) => void;
}

export function useAdminLoginController({
  entryType,
  onSuccess,
}: UseAdminLoginControllerOptions) {
  const { t } = useTranslation("auth");
  const { login, setActiveSubCustomer } = useAuthStore();
  const { setTenant } = useTenantStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = useMemo(() => createAdminLoginSchema(t), [t]);

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { userId: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: AdminLoginForm) => loginAdmin(values, entryType),
    onSuccess: (data) => {
      setServerError(null);
      login(data.token, data.user);
      if (data.user.tenantId) {
        setTenant(data.user.tenantId);
      }

      // Apply default customer account after admin / cpanel login
      const defaultCustCode =
        data.user.activeSubCustomer ??
        data.user.subCustomerAccounts?.[0]?.custCode ??
        data.user.customerCode;
      if (defaultCustCode) {
        setActiveSubCustomer(defaultCustCode);
      }

      onSuccess?.(data.customerList);
    },
    onError: (err: Error) => {
      setServerError(err.message ?? t("errors.invalidCredentials"));
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    mutation.mutate(values);
  });

  return {
    form,
    handleSubmit,
    serverError,
    isSubmitting: mutation.isPending,
  };
}
