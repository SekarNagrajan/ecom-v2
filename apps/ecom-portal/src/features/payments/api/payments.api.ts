// Modified by Sekar Nagarajan (2026-11-25 14:40)
import type { ApiResponse } from "../../../types/api.types";
import type { CheckoutSessionDTO, CreateCheckoutRequest } from "../types/payments.types";

async function readApiJson<T>(res: Response, fallbackMessage: string): Promise<ApiResponse<T>> {
  try {
    const json = (await res.json()) as ApiResponse<T> & {
      success?: boolean;
      message?: string;
    };
    if (!res.ok) {
      return {
        error: {
          code: json.error?.code ?? `HTTP_${res.status}`,
          message: json.error?.message ?? json.message ?? fallbackMessage,
        },
      };
    }
    if (json.data !== undefined) return { data: json.data };
    return { data: json as unknown as T };
  } catch {
    return {
      error: { code: "PARSE_ERROR", message: fallbackMessage },
    };
  }
}

export async function createCheckout(
  body: CreateCheckoutRequest,
): Promise<ApiResponse<CheckoutSessionDTO>> {
  try {
    const res = await fetch("/api/v1/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return readApiJson<CheckoutSessionDTO>(res, "Failed to create checkout session");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function completeCheckoutSession(
  requestId: string,
): Promise<ApiResponse<CheckoutSessionDTO>> {
  try {
    const res = await fetch(`/api/v1/payments/checkout/${encodeURIComponent(requestId)}/complete`, {
      method: "POST",
    });
    return readApiJson<CheckoutSessionDTO>(res, "Failed to complete payment");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}

export async function cancelCheckoutSession(
  requestId: string,
): Promise<ApiResponse<CheckoutSessionDTO>> {
  try {
    const res = await fetch(`/api/v1/payments/checkout/${encodeURIComponent(requestId)}/cancel`, {
      method: "POST",
    });
    return readApiJson<CheckoutSessionDTO>(res, "Failed to cancel payment");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    return { error: { code: "NETWORK_ERROR", message } };
  }
}
