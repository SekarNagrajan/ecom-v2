// Modified by Sekar Nagarajan (2026-08-26 16:00)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AlertPreference,
  ChangePasswordPayload,
  CreateQuoteRequestPayload,
  CustomerProfile,
} from "../types/user-modules.types";
import { userModulesApi } from "./user-modules.api";
import { userModulesKeys } from "./user-modules.keys";

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: userModulesKeys.profile(),
    queryFn: () => userModulesApi.getProfile(),
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: Partial<CustomerProfile>) =>
      userModulesApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(userModulesKeys.profile(), data);
      toast.success("Customer Profile details updated successfully");
    },
    onError: () => {
      toast.error("Failed to save profile changes");
    },
  });
}

export function useChangePasswordMutation() {
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      userModulesApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Your account password has been updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
}

export function useAlertPreferencesQuery(enabled = true) {
  return useQuery({
    queryKey: userModulesKeys.alertsPrefs(),
    queryFn: () => userModulesApi.getAlertPreferences(),
    enabled,
  });
}

export function useAlertLogsQuery(enabled = true) {
  return useQuery({
    queryKey: userModulesKeys.alertsLogs(),
    queryFn: () => userModulesApi.getAlertLogs(),
    enabled,
  });
}

export function useUpdateAlertPreferencesMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: AlertPreference) =>
      userModulesApi.updateAlertPreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(userModulesKeys.alertsPrefs(), data);
      toast.success("Alert preferences saved successfully");
    },
    onError: () => {
      toast.error("Failed to update alert preferences");
    },
  });
}

export function useQuotesQuery() {
  return useQuery({
    queryKey: userModulesKeys.quotes(),
    queryFn: () => userModulesApi.getQuotes(),
  });
}

export function useCreateQuoteMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: CreateQuoteRequestPayload) =>
      userModulesApi.createQuoteRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userModulesKeys.quotes() });
      toast.success(`Quotation Request ${data.quoteNo} submitted successfully`);
    },
    onError: () => {
      toast.error("Failed to submit rate quotation request");
    },
  });
}

export function usePaymentHistoryQuery() {
  return useQuery({
    queryKey: userModulesKeys.payments(),
    queryFn: () => userModulesApi.getPaymentHistory(),
  });
}
