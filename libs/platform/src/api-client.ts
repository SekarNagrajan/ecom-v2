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
  // Mock/MSW uses relative `/api/*` paths; real mode uses the configured API host.
  baseURL: env.VITE_API_MODE === "mock" ? "" : env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecom_auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — 401 clears session and opens login with session-expired reason
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      // Session probe / login failures are handled by callers — don't hard-redirect.
      const isAuthProbe =
        url.includes("/api/auth/me") ||
        url.includes("/api/auth/login") ||
        url.includes("/api/auth/admin-login");
      if (!isAuthProbe) {
        window.dispatchEvent(
          new CustomEvent("ecom:unauthorized", {
            detail: { reason: "session-expired" },
          }),
        );
      }
    }
    return Promise.reject(error);
  },
);

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | ApiResponse
      | { message?: string }
      | undefined;
    if (data && typeof data === "object") {
      if ("error" in data && data.error?.message) {
        return data.error.message;
      }
      if ("message" in data && typeof data.message === "string" && data.message) {
        return data.message;
      }
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected network error occurred. Please try again.";
}
