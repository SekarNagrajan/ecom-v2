// Modified by Sekar Nagarajan (2026-11-26 17:10)
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { env } from "./env";
import { resolveApiBaseUrl } from "./http/paths";
import {
  isAuthRecoveryExempt,
  notifySessionExpired,
  refreshAccessToken,
} from "./session/auth-recovery";
import { getStoredToken } from "./session/token-storage";

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
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Response interceptor — on 401, silently refresh the access token once (single-flight across
// all concurrent requests) and replay; if that fails the session is expired (debounced event).
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const config = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && config && !isAuthRecoveryExempt(config.url)) {
      if (config._retry) {
        // Replayed with a fresh token and still rejected — the session really is gone.
        notifySessionExpired();
      } else {
        const token = await refreshAccessToken();
        if (token) {
          config._retry = true;
          config.headers.Authorization = `Bearer ${token}`;
          return apiClient(config);
        }
        notifySessionExpired();
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
