// Created by Sekar Nagarajan (2026-08-27 12:10)
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { SubCustomerAccount } from '@solverminds/auth';
import { useAuthStore } from '@solverminds/auth';
import {
  exitImpersonation,
  fetchCustomerList,
  impersonateCustomer,
} from '../api/auth.api';

export function useImpersonationController() {
  const { user, setImpersonatedCustomer, clearImpersonation, login } =
    useAuthStore();
  const [showPicker, setShowPicker] = useState(false);

  const customerListQuery = useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: fetchCustomerList,
    enabled: Boolean(user?.role === 'ADMIN' || user?.adminUserType === 'C'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const impersonateMutation = useMutation({
    mutationFn: impersonateCustomer,
    onSuccess: (updatedUser) => {
      const token = localStorage.getItem('ecom_auth_token');
      if (token) {
        login(token, updatedUser);
      }
    },
  });

  const exitMutation = useMutation({
    mutationFn: exitImpersonation,
    onSuccess: (adminUser) => {
      clearImpersonation();
      const token = localStorage.getItem('ecom_auth_token');
      if (token) {
        login(token, adminUser);
      }
    },
  });

  const handleSelectCustomer = (customer: SubCustomerAccount) => {
    setImpersonatedCustomer(customer);
    impersonateMutation.mutate(customer.custCode);
    setShowPicker(false);
  };

  const handleExitImpersonation = () => {
    exitMutation.mutate();
  };

  return {
    isImpersonating: Boolean(user?.isImpersonating),
    impersonatedCustomer: user?.impersonatedCustomer,
    customerList: customerListQuery.data ?? [],
    isLoadingCustomers: customerListQuery.isLoading,
    showPicker,
    setShowPicker,
    handleSelectCustomer,
    handleExitImpersonation,
    isExiting: exitMutation.isPending,
  };
}
