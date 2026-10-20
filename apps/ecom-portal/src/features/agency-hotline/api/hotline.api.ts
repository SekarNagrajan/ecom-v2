// Created by Sekar Nagarajan (2026-09-28 15:22)
import type { HotlineContactsResponse } from "../types/hotline.types";

/**
 * Vite SPA fallback returns HTML for unhandled /api/* routes.
 * Never call res.json() blindly — that yields "Unexpected token '<'".
 */
async function readApiJson<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    throw new Error(
      `${fallbackMessage}: API returned non-JSON (check MSW handlers / mock worker).`,
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new Error(
      `${fallbackMessage}: response could not be parsed as JSON.`,
    );
  }
}

/**
 * Fetch agency hotline contacts grouped by country.
 * Legacy: servlet-context HotlineContacts from ecomhotlinecontacts.
 * New endpoint: GET /api/hotline-contacts
 */
export async function fetchHotlineContacts(): Promise<HotlineContactsResponse> {
  const res = await fetch("/api/hotline-contacts");
  if (!res.ok) {
    throw new Error("Failed to fetch agency hotline contacts");
  }
  return readApiJson<HotlineContactsResponse>(
    res,
    "Failed to fetch agency hotline contacts",
  );
}
