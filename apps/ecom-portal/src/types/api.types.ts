export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  meta?: PageMeta;
  error?: ApiErrorResponse;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export function isApiError(response: any): response is { error: ApiErrorResponse } {
  return response && response.error !== undefined;
}
