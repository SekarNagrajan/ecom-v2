// Modified by Sekar Nagarajan (2026-11-13 00:40)
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { env } from "./env";
import { resolveApiBaseUrl } from "./http/paths";

export interface ApiResponse<T = any> {
  status: "SUCCESS" | "ERROR";
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
  // Same origin in mock mode (MSW); the backend host in real mode. Paths carry `/api/…` themselves.
  baseURL: resolveApiBaseUrl(env),
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
      const isAuthProbe = /\/auth\/(me|login|admin-login)(\?|$)/.test(url);
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
    const data = error.response?.data as ApiResponse | { message?: string } | undefined;
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
