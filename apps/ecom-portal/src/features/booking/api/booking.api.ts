// Modified by Sekar Nagarajan (2026-08-26 18:31)

import type { BookingRoutingSearchParams } from '../mocks/booking-routing.mock';
import type {
  BookingPayload,
  BookingTemplate,
  SelectedRoute,
  SubmitBookingResponse,
} from '../types/booking.types';

export type { BookingRoutingSearchParams } from '../mocks/booking-routing.mock';

export const bookingApi = {
  submitBooking: async (payload: BookingPayload): Promise<SubmitBookingResponse> => {
    const res = await fetch('/api/booking/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to submit booking');
    }

    return await res.json();
  },
  amendBooking: async (payload: BookingPayload): Promise<SubmitBookingResponse> => {
    const res = await fetch('/api/booking/amend', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to amend booking');
    }

    return await res.json();
  },
  getTemplates: async (): Promise<BookingTemplate[]> => {
    const res = await fetch('/api/booking/templates');
    if (!res.ok) throw new Error('Failed to fetch templates');
    const json = await res.json();
    return json.data;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    const res = await fetch(`/api/booking/templates/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete template');
  },
  /** ebookRoutingDetails parity — sailings for Select Vessel/Route popup. */
  searchRouting: async (
    params: BookingRoutingSearchParams,
  ): Promise<SelectedRoute[]> => {
    const qs = new URLSearchParams({
      origin: params.origin,
      delivery: params.delivery,
      cargoReadyDate: params.cargoReadyDate,
    });
    const res = await fetch(`/api/booking/routing?${qs.toString()}`);
    if (!res.ok) throw new Error('Failed to load vessel routes');
    const json = await res.json();
    return json.data as SelectedRoute[];
  },
};
