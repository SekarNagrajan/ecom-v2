// Created by Antigravity (2026-08-22 09:25)

import type { BookingPayload, SubmitBookingResponse } from '../types/booking.types';

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
};
