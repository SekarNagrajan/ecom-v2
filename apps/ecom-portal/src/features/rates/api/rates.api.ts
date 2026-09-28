// Modified by Sekar Nagarajan (2026-09-18 12:55)
import {
  ContractDTO,
  ContractFilters,
  CreateQuoteInput,
  QuoteDTO,
  ShareRateMailInput,
  ShareRateMailResponse,
  SurchargeDTO,
  SurchargeFilters,
  TariffDTO,
  TariffFilters,
} from "../types/rates.types";

async function readJsonEnvelope<T>(res: Response, label: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`${label} failed (${res.status})`);
  }
  const json = (await res.json()) as { data?: T };
  if (json.data === undefined) {
    throw new Error(`${label}: missing data envelope (check MSW / Vite mock fallback)`);
  }
  return json.data;
}

export const fetchTariffs = async (
  filters?: TariffFilters,
): Promise<TariffDTO[]> => {
  const params = new URLSearchParams();
  if (filters?.loadPort) params.append("loadPort", filters.loadPort);
  if (filters?.dischPort) params.append("dischPort", filters.dischPort);
  if (filters?.eqpType) params.append("eqpType", filters.eqpType);
  if (filters?.commodity) params.append("commodity", filters.commodity);

  const res = await fetch(`/api/v1/rates/tariffs?${params.toString()}`);
  return readJsonEnvelope(res, "Fetch tariffs");
};

export const fetchSurcharges = async (
  filters?: SurchargeFilters,
): Promise<SurchargeDTO[]> => {
  const params = new URLSearchParams();
  if (filters?.origin) params.append("origin", filters.origin);
  if (filters?.pol) params.append("pol", filters.pol);
  if (filters?.pod) params.append("pod", filters.pod);
  if (filters?.delivery) params.append("delivery", filters.delivery);
  if (filters?.eqpType) params.append("eqpType", filters.eqpType);

  const res = await fetch(`/api/v1/rates/surcharges?${params.toString()}`);
  return readJsonEnvelope(res, "Fetch surcharges");
};

export const fetchContracts = async (
  filters?: ContractFilters,
): Promise<ContractDTO[]> => {
  const params = new URLSearchParams();
  if (filters?.contractNo) params.append("contractNo", filters.contractNo);
  if (filters?.customerCode) params.append("customerCode", filters.customerCode);
  if (filters?.pol) params.append("pol", filters.pol);
  if (filters?.pod) params.append("pod", filters.pod);

  const res = await fetch(`/api/v1/rates/contracts?${params.toString()}`);
  return readJsonEnvelope(res, "Fetch contracts");
};

export const fetchQuotes = async (): Promise<QuoteDTO[]> => {
  const res = await fetch("/api/v1/rates/quotes");
  return readJsonEnvelope(res, "Fetch quotes");
};

export const createQuoteRequest = async (
  input: CreateQuoteInput,
): Promise<QuoteDTO> => {
  const res = await fetch("/api/v1/rates/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonEnvelope(res, "Create quote");
};

/** POST /api/v1/rates/share-mail — share rate quote(s) by email */
export const shareRateByMail = async (
  input: ShareRateMailInput,
): Promise<ShareRateMailResponse> => {
  const res = await fetch("/api/v1/rates/share-mail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonEnvelope(res, "Share rate by mail");
};
