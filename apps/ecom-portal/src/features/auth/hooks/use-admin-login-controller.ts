// Modified by Sekar Nagarajan (2026-08-27 12:19)
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { SubCustomerAccount } from '@solverminds/auth';
import { useAuthStore, useTenantStore } from '@solverminds/auth';
import { loginAdmin } from '../api/auth.api';
import {
  adminLoginSchema,
  type AdminLoginForm,
  type LoginEntryType,
} from '../types/auth.types';

interface UseAdminLoginControllerOptions {
  entryType: LoginEntryType;
  onSuccess?: (customerList?: SubCustomerAccount[]) => void;
}

export function useAdminLoginController({
  entryType,
  onSuccess,
}: UseAdminLoginControllerOptions) {
  const { login, setActiveSubCustomer } = useAuthStore();
  const { setTenant } = useTenantStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { userId: '', password: '' },
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
      setServerError(err.message ?? 'Invalid credentials');
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
