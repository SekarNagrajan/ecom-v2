// Modified by Sekar Nagarajan (2026-11-13 03:20)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AlertHistoryLog,
  AlertPreference,
  ChangePasswordPayload,
  CreateQuoteRequestPayload,
  CustomerProfile,
  PaymentHistoryQuery,
} from "../types/user-modules.types";
import { userModulesApi } from "./user-modules.api";
import { userModulesKeys } from "./user-modules.keys";

/** One minute keeps the bell fresh without hammering the API; roadmap F2 slice 2 replaces it with SSE. */
const ALERT_POLL_INTERVAL_MS = 60_000;

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
    mutationFn: (payload: Partial<CustomerProfile>) => userModulesApi.updateProfile(payload),
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
    mutationFn: (payload: ChangePasswordPayload) => userModulesApi.changePassword(payload),
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

/** Alert feed for the header bell: polled while the tab is visible and refreshed on focus. */
export function useAlertLogsQuery(enabled = true) {
  return useQuery({
    queryKey: userModulesKeys.alertsLogs(),
    queryFn: () => userModulesApi.getAlertLogs(),
    enabled,
    refetchInterval: ALERT_POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

const markRead = (logs: AlertHistoryLog[] | undefined, id?: string) =>
  (logs ?? []).map((log) => (id === undefined || log.id === id ? { ...log, isRead: true } : log));

export function useMarkAlertReadMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => userModulesApi.markAlertRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: userModulesKeys.alertsLogs() });
      const previous = queryClient.getQueryData<AlertHistoryLog[]>(userModulesKeys.alertsLogs());
      queryClient.setQueryData(userModulesKeys.alertsLogs(), markRead(previous, id));
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous)
        queryClient.setQueryData(userModulesKeys.alertsLogs(), context.previous);
      toast.error("Couldn't mark the alert as read");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userModulesKeys.alertsLogs() }),
  });
}

export function useMarkAllAlertsReadMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: () => userModulesApi.markAllAlertsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userModulesKeys.alertsLogs() });
      const previous = queryClient.getQueryData<AlertHistoryLog[]>(userModulesKeys.alertsLogs());
      queryClient.setQueryData(userModulesKeys.alertsLogs(), markRead(previous));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(userModulesKeys.alertsLogs(), context.previous);
      toast.error("Couldn't mark alerts as read");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userModulesKeys.alertsLogs() }),
  });
}

export function useUpdateAlertPreferencesMutation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: AlertPreference) => userModulesApi.updateAlertPreferences(payload),
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
    mutationFn: (payload: CreateQuoteRequestPayload) => userModulesApi.createQuoteRequest(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userModulesKeys.quotes() });
      toast.success(`Quotation Request ${data.quoteNo} submitted successfully`);
    },
    onError: () => {
      toast.error("Failed to submit rate quotation request");
    },
  });
}

export function usePaymentHistoryQuery(query: PaymentHistoryQuery = {}) {
  return useQuery({
    queryKey: userModulesKeys.payments(query.fromDate, query.toDate),
    queryFn: () => userModulesApi.getPaymentHistory(query),
  });
}
