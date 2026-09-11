// Modified by Sekar Nagarajan (2026-09-11 17:23)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ContractFilters,
  CreateQuoteInput,
  ShareRateMailInput,
  SurchargeFilters,
  TariffFilters,
} from "../types/rates.types";
import {
  createQuoteRequest,
  fetchContracts,
  fetchQuotes,
  fetchSurcharges,
  fetchTariffs,
  shareRateByMail,
} from "./rates.api";
import { rateKeys } from "./rates.keys";

type QueryEnabled = { enabled?: boolean };

export const useTariffsQuery = (
  filters?: TariffFilters,
  options?: QueryEnabled,
) => {
  return useQuery({
    queryKey: rateKeys.tariffs(filters),
    queryFn: () => fetchTariffs(filters),
    enabled: options?.enabled ?? true,
  });
};

export const useSurchargesQuery = (
  filters?: SurchargeFilters,
  options?: QueryEnabled,
) => {
  return useQuery({
    queryKey: rateKeys.surcharges(filters),
    queryFn: () => fetchSurcharges(filters),
    enabled: options?.enabled ?? true,
  });
};

export const useContractsQuery = (
  filters?: ContractFilters,
  options?: QueryEnabled,
) => {
  return useQuery({
    queryKey: rateKeys.contracts(filters),
    queryFn: () => fetchContracts(filters),
    enabled: options?.enabled ?? true,
  });
};

export const useQuotesQuery = (options?: QueryEnabled) => {
  return useQuery({
    queryKey: rateKeys.quotes(),
    queryFn: () => fetchQuotes(),
    enabled: options?.enabled ?? true,
  });
};

export const useCreateQuoteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateQuoteInput) => createQuoteRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rateKeys.quotes() });
    },
  });
};

export const useShareRateMailMutation = () => {
  return useMutation({
    mutationFn: (input: ShareRateMailInput) => shareRateByMail(input),
  });
};
