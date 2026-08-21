import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { env } from './env';

export interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'ERROR';
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  metadata?: {
    page?: number;
    pageSize?: number;
    totalRecords?: number;
  };
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecom_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unified envelope and 401 refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Trigger logout or token refresh event
      window.dispatchEvent(new CustomEvent('ecom:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected network error occurred. Please try again.';
}
