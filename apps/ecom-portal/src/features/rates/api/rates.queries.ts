// Modified by sekar nagarajan (2026-08-21 23:33)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ContractFilters, CreateQuoteInput, SurchargeFilters, TariffFilters } from '../types/rates.types';
import { createQuoteRequest, fetchContracts, fetchQuotes, fetchSurcharges, fetchTariffs } from './rates.api';
import { rateKeys } from './rates.keys';

export const useTariffsQuery = (filters?: TariffFilters) => {
  return useQuery({
    queryKey: rateKeys.tariffs(filters),
    queryFn: () => fetchTariffs(filters),
  });
};

export const useSurchargesQuery = (filters?: SurchargeFilters) => {
  return useQuery({
    queryKey: rateKeys.surcharges(filters),
    queryFn: () => fetchSurcharges(filters),
  });
};

export const useContractsQuery = (filters?: ContractFilters) => {
  return useQuery({
    queryKey: rateKeys.contracts(filters),
    queryFn: () => fetchContracts(filters),
  });
};

export const useQuotesQuery = () => {
  return useQuery({
    queryKey: rateKeys.quotes(),
    queryFn: () => fetchQuotes(),
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
