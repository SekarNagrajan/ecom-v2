// Modified by Sekar Nagarajan (2026-08-25 12:10)
import type { ApiResponse, CRODTO, CROEligibility, CROListDTO } from '../types/cro.types';

/**
 * Vite SPA fallback returns HTML for unhandled /api/* routes.
 * Never call res.json() blindly — that yields "Unexpected token '<'".
 */
async function readApiJson<T>(
  res: Response,
  fallbackMessage: string
): Promise<ApiResponse<T>> {
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    return {
      error: {
        code: 'INVALID_RESPONSE',
        message: `${fallbackMessage}: API returned non-JSON (check MSW handlers / mock worker).`,
      },
    };
  }

  try {
    const json = (await res.json()) as ApiResponse<T> & {
      error?: { code: string; message: string };
    };
    if (!res.ok) {
      return {
        error: json.error ?? { code: 'ERROR', message: fallbackMessage },
      };
    }
    return json;
  } catch {
    return {
      error: {
        code: 'INVALID_RESPONSE',
        message: `${fallbackMessage}: response could not be parsed as JSON.`,
      },
    };
  }
}

export async function getCROSummary(
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<CROListDTO[]>> {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const res = await fetch(
      `/api/ecom/imp/container-release-orders?${params.toString()}`
    );
    return readApiJson<CROListDTO[]>(res, 'Failed to fetch CRO summary');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function getCRODetail(croNo: string): Promise<ApiResponse<CRODTO>> {
  try {
    const res = await fetch(`/api/ecom/imp/container-release-orders/${croNo}`);
    return readApiJson<CRODTO>(res, 'Failed to fetch CRO detail');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function getCROEligibility(
  bookingNo: string
): Promise<ApiResponse<CROEligibility>> {
  try {
    const params = new URLSearchParams({ bookingNo });
    const res = await fetch(
      `/api/ecom/imp/container-release-orders/eligibility?${params.toString()}`
    );
    return readApiJson<CROEligibility>(res, 'Failed to fetch CRO eligibility');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function downloadCRODocument(
  croNo: string
): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const res = await fetch(
      `/api/ecom/imp/container-release-orders/${croNo}/document?format=pdf`
    );
    if (!res.ok) {
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const err = (await res.json()) as ApiResponse;
        return {
          error: { message: err.error?.message || 'Failed to download CRO document' },
        };
      }
      return { error: { message: 'Failed to download CRO document' } };
    }
    const blob = await res.blob();
    return { data: blob };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { message } };
  }
}
