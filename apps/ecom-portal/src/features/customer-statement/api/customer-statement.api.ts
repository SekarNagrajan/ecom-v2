// Modified by Sekar Nagarajan (2026-08-25 12:45)
import type {
  AccountOption,
  ApiResponse,
  StatementCriteria,
  StatementDTO,
  StatementExportFormat,
} from '../types/customer-statement.types';

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

function criteriaParams(criteria: StatementCriteria): URLSearchParams {
  const params = new URLSearchParams();
  params.set('accountId', criteria.accountId);
  params.set('currency', criteria.currency);
  params.set('fromDate', criteria.fromDate);
  params.set('toDate', criteria.toDate);
  return params;
}

export async function getStatementAccounts(): Promise<ApiResponse<AccountOption[]>> {
  try {
    const res = await fetch('/api/ecom/fin/statement/accounts');
    return readApiJson<AccountOption[]>(res, 'Failed to fetch statement accounts');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function getStatement(
  criteria: StatementCriteria
): Promise<ApiResponse<StatementDTO>> {
  try {
    const params = criteriaParams(criteria);
    const res = await fetch(`/api/ecom/fin/statement?${params.toString()}`);
    return readApiJson<StatementDTO>(res, 'Failed to fetch customer statement');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { code: 'NETWORK_ERROR', message } };
  }
}

export async function downloadStatementDocument(
  criteria: StatementCriteria,
  format: StatementExportFormat
): Promise<{ data?: Blob; error?: { message: string } }> {
  try {
    const params = criteriaParams(criteria);
    params.set('format', format);
    const path =
      format === 'pdf'
        ? '/api/ecom/fin/statement/document'
        : '/api/ecom/fin/statement/export';
    const res = await fetch(`${path}?${params.toString()}`);
    if (!res.ok) {
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const err = (await res.json()) as ApiResponse;
        return {
          error: {
            message: err.error?.message || 'Failed to download statement export',
          },
        };
      }
      return { error: { message: 'Failed to download statement export' } };
    }
    const blob = await res.blob();
    return { data: blob };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { error: { message } };
  }
}
