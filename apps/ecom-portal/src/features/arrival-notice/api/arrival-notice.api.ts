// Modified by Sekar Nagarajan (2026-08-25 12:20)
import type {
  ApiResponse,
  ArrivalNoticeDTO,
  ArrivalNoticeListDTO,
} from '../types/arrival-notice.types';

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

export async function getArrivalNoticeList(
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<ArrivalNoticeListDTO[]>> {
  try {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const res = await fetch(
      `/api/ecom/imp/arrival-notices?${params.toString()}`
    );
    return readApiJson<ArrivalNoticeListDTO[]>(res, 'Failed to fetch arrival notices');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function getArrivalNoticeDetail(
  anNo: string
): Promise<ApiResponse<ArrivalNoticeDTO>> {
  try {
    const res = await fetch(`/api/ecom/imp/arrival-notices/${anNo}`);
    return readApiJson<ArrivalNoticeDTO>(res, 'Failed to fetch arrival notice detail');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function downloadArrivalNoticeDocument(
  anNo: string
): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const res = await fetch(
      `/api/ecom/imp/arrival-notices/${anNo}/document?format=pdf`
    );
    if (!res.ok) {
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const err = (await res.json()) as ApiResponse;
        return {
          error: {
            message: err.error?.message || 'Failed to download arrival notice document',
          },
        };
      }
      return { error: { message: 'Failed to download arrival notice document' } };
    }
    const blob = await res.blob();
    return { data: blob };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { message } };
  }
}
