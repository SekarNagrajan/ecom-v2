// Created by Sekar Nagarajan (2026-08-24 14:46)
import type { DOSummaryRow } from '../types/delivery-order.types';

// Let's define a simple API response shape locally if there isn't a global one exported.
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Fetch delivery orders summary for the authenticated user.
 * The server handles default date windows (e.g. today-60 to today) if parameters are omitted.
 */
export async function getDOSummary(fromDate?: string, toDate?: string): Promise<ApiResponse<DOSummaryRow[]>> {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const res = await fetch(`/api/ecom/imp/delivery-orders?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error || { code: 'ERROR', message: 'Failed to fetch DO summary' } };
    }
    const json = await res.json();
    return json;
  } catch (error: any) {
    return { error: { code: 'NETWORK_ERROR', message: error.message || 'Network error' } };
  }
}

/**
 * Download the DO document as a Blob.
 * The server handles updating the DO status to "printed" upon successful generation.
 */
export async function downloadDODocument(delOrdNo: string): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const res = await fetch(`/api/ecom/imp/delivery-orders/${delOrdNo}/document?format=pdf`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error || { code: 'ERROR', message: 'Failed to download DO document' } };
    }
    const blob = await res.blob();
    return { data: blob };
  } catch (error: any) {
    return { error: { message: error.message || 'Network error' } };
  }
}
