// Modified by sekar nagarajan (2026-08-21 23:32)
import { ContractDTO, ContractFilters, CreateQuoteInput, QuoteDTO, SurchargeDTO, SurchargeFilters, TariffDTO, TariffFilters } from '../types/rates.types';

export const fetchTariffs = async (filters?: TariffFilters): Promise<TariffDTO[]> => {
  const params = new URLSearchParams();
  if (filters?.loadPort) params.append('loadPort', filters.loadPort);
  if (filters?.dischPort) params.append('dischPort', filters.dischPort);
  if (filters?.eqpType) params.append('eqpType', filters.eqpType);
  if (filters?.commodity) params.append('commodity', filters.commodity);

  const res = await fetch(`/api/v1/rates/tariffs?${params.toString()}`);
  const json = await res.json();
  return json.data;
};

export const fetchSurcharges = async (filters?: SurchargeFilters): Promise<SurchargeDTO[]> => {
  const params = new URLSearchParams();
  if (filters?.origin) params.append('origin', filters.origin);
  if (filters?.pol) params.append('pol', filters.pol);
  if (filters?.pod) params.append('pod', filters.pod);
  if (filters?.delivery) params.append('delivery', filters.delivery);
  if (filters?.eqpType) params.append('eqpType', filters.eqpType);

  const res = await fetch(`/api/v1/rates/surcharges?${params.toString()}`);
  const json = await res.json();
  return json.data;
};

export const fetchContracts = async (filters?: ContractFilters): Promise<ContractDTO[]> => {
  const params = new URLSearchParams();
  if (filters?.contractNo) params.append('contractNo', filters.contractNo);
  if (filters?.customerCode) params.append('customerCode', filters.customerCode);
  if (filters?.pol) params.append('pol', filters.pol);
  if (filters?.pod) params.append('pod', filters.pod);

  const res = await fetch(`/api/v1/rates/contracts?${params.toString()}`);
  const json = await res.json();
  return json.data;
};

export const fetchQuotes = async (): Promise<QuoteDTO[]> => {
  const res = await fetch('/api/v1/rates/quotes');
  const json = await res.json();
  return json.data;
};

export const createQuoteRequest = async (input: CreateQuoteInput): Promise<QuoteDTO> => {
  const res = await fetch('/api/v1/rates/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  return json.data;
};
