// Modified by Sekar Nagarajan (2026-08-25 13:00)
import type {
  ApiResponse,
  CarbonInput,
  CarbonLookupsDTO,
  CarbonResultDTO,
} from '../types/carbon.types';

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

export async function getCarbonLookups(): Promise<ApiResponse<CarbonLookupsDTO>> {
  try {
    const res = await fetch('/api/ecom/co2/lookups');
    return readApiJson<CarbonLookupsDTO>(res, 'Failed to fetch carbon lookups');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function computeCarbon(
  input: CarbonInput
): Promise<ApiResponse<CarbonResultDTO>> {
  try {
    const res = await fetch('/api/ecom/co2/compute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return readApiJson<CarbonResultDTO>(res, 'Failed to compute carbon footprint');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function downloadCarbonDocument(
  input: CarbonInput
): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const res = await fetch('/api/ecom/co2/document?format=pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const err = (await res.json()) as ApiResponse;
        return {
          error: {
            message: err.error?.message || 'Failed to download carbon estimate PDF',
          },
        };
      }
      return { error: { message: 'Failed to download carbon estimate PDF' } };
    }
    const blob = await res.blob();
    return { data: blob };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { message } };
  }
}
