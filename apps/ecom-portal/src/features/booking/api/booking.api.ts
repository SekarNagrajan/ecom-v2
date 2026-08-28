// Modified by Sekar Nagarajan (2026-08-28 00:35)

import type {
  BookingLookupKind,
  BookingLookupOption,
} from '../mocks/booking-lookups.mock';
import type { BookingCustomerOption } from '../mocks/booking-customers.mock';
import type { BookingRateOption } from '../mocks/booking-rates.mock';
import type { BookingRoutingSearchParams } from '../mocks/booking-routing.mock';
import type {
  BookingHsCodeOption,
  BookingUnNumberOption,
} from '../mocks/booking-hs-un.mock';
import type {
  BookingActivityEvent,
  BookingDocument,
  BookingPayload,
  BookingTemplate,
  ContractValidationResult,
  EoriValidationResult,
  SelectedRoute,
  SubmitBookingResponse,
} from '../types/booking.types';

export type { BookingRoutingSearchParams } from '../mocks/booking-routing.mock';
export type { BookingLookupKind, BookingLookupOption } from '../mocks/booking-lookups.mock';
export type { BookingCustomerOption } from '../mocks/booking-customers.mock';
export type { BookingRateOption } from '../mocks/booking-rates.mock';

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export const bookingApi = {
  submitBooking: async (payload: BookingPayload): Promise<SubmitBookingResponse> => {
    const res = await fetch('/api/booking/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return readJson<SubmitBookingResponse>(res);
  },

  amendBooking: async (payload: BookingPayload): Promise<SubmitBookingResponse> => {
    const res = await fetch('/api/booking/amend', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return readJson<SubmitBookingResponse>(res);
  },

  getTemplates: async (): Promise<BookingTemplate[]> => {
    const res = await fetch('/api/booking/templates');
    const json = await readJson<{ data: BookingTemplate[] } | BookingTemplate[]>(
      res,
    );
    const list = Array.isArray(json) ? json : json.data;
    return Array.isArray(list) ? list : [];
  },

  deleteTemplate: async (id: string): Promise<void> => {
    const res = await fetch(`/api/booking/templates/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete template');
  },

  searchRouting: async (
    params: BookingRoutingSearchParams,
  ): Promise<SelectedRoute[]> => {
    const qs = new URLSearchParams({
      origin: params.origin,
      delivery: params.delivery,
      cargoReadyDate: params.cargoReadyDate,
    });
    const res = await fetch(`/api/booking/routing?${qs.toString()}`);
    const json = await readJson<{ data: SelectedRoute[] }>(res);
    return json.data;
  },

  searchRates: async (params: {
    origin: string;
    delivery: string;
  }): Promise<BookingRateOption[]> => {
    const qs = new URLSearchParams({
      origin: params.origin,
      delivery: params.delivery,
    });
    const res = await fetch(`/api/booking/rates?${qs.toString()}`);
    const json = await readJson<{ data: BookingRateOption[] }>(res);
    return json.data;
  },

  searchCustomers: async (query: string): Promise<BookingCustomerOption[]> => {
    const qs = new URLSearchParams({ q: query });
    const res = await fetch(`/api/booking/customers?${qs.toString()}`);
    const json = await readJson<{ data: BookingCustomerOption[] }>(res);
    return json.data;
  },

  searchHsCodes: async (query: string): Promise<BookingHsCodeOption[]> => {
    const qs = new URLSearchParams({ q: query });
    const res = await fetch(`/api/booking/hs-codes?${qs.toString()}`);
    const json = await readJson<{ data: BookingHsCodeOption[] }>(res);
    return json.data;
  },

  searchUnNumbers: async (query: string): Promise<BookingUnNumberOption[]> => {
    const qs = new URLSearchParams({ q: query });
    const res = await fetch(`/api/booking/un-numbers?${qs.toString()}`);
    const json = await readJson<{ data: BookingUnNumberOption[] }>(res);
    return json.data;
  },

  getLookups: async (kind: BookingLookupKind): Promise<BookingLookupOption[]> => {
    const res = await fetch(`/api/booking/lookups/${kind}`);
    const json = await readJson<{ data: BookingLookupOption[] }>(res);
    return json.data;
  },

  validateContract: async (ref: string): Promise<ContractValidationResult> => {
    const res = await fetch('/api/booking/contracts/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref }),
    });
    const json = await readJson<{ data: ContractValidationResult }>(res);
    return json.data;
  },

  validateEori: async (eori: string): Promise<EoriValidationResult> => {
    const res = await fetch('/api/booking/eori/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eori }),
    });
    const json = await readJson<{ data: EoriValidationResult }>(res);
    return json.data;
  },

  uploadDocument: async (formData: FormData): Promise<BookingDocument> => {
    const res = await fetch('/api/booking/upload', {
      method: 'POST',
      body: formData,
    });
    const json = await readJson<{ data: BookingDocument }>(res);
    return json.data;
  },

  cancelBooking: async (id: string): Promise<void> => {
    const res = await fetch(`/api/booking/${id}/cancel`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to cancel booking');
  },

  getBookingById: async (id: string): Promise<BookingPayload> => {
    const res = await fetch(`/api/booking/${id}`);
    const json = await readJson<{ data: BookingPayload }>(res);
    return json.data;
  },

  getBookingActivity: async (id: string): Promise<BookingActivityEvent[]> => {
    const res = await fetch(`/api/booking/${id}/activity`);
    const json = await readJson<{ data: BookingActivityEvent[] }>(res);
    return json.data;
  },

  saveDraft: async (
    payload: BookingPayload,
  ): Promise<{ draftId: string }> => {
    const res = await fetch('/api/booking/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await readJson<{ data: { draftId: string } }>(res);
    return json.data;
  },

  downloadBookingPdf: async (id: string): Promise<Blob> => {
    const res = await fetch(`/api/booking/${id}/pdf`);
    if (!res.ok) throw new Error('Failed to download PDF');
    return res.blob();
  },
};
