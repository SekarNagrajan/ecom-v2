// Modified by Sekar Nagarajan (2026-08-25 16:25)
import type { ContactUsFormData } from "../types/contact-us.schema";

export interface ContactUsResponse {
  success: boolean;
  message: string;
}

export interface CountryOption {
  code: string;
  name: string;
}

export interface StateOption {
  code: string;
  name: string;
}

/**
 * Submit the Contact Us form to the backend.
 * Legacy endpoint: Contactus.do (Struts action)
 * New endpoint: POST /api/contact-us
 */
export async function submitContactUs(
  data: ContactUsFormData
): Promise<ContactUsResponse> {
  const response = await fetch("/api/contact-us", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      message: "Unknown error",
    }))) as { message?: string };
    throw new Error(error.message || "Failed to send message");
  }

  return (await response.json()) as ContactUsResponse;
}

export async function fetchCountries(): Promise<{
  countries: CountryOption[];
}> {
  const res = await fetch("/api/countries");
  if (!res.ok) throw new Error("Failed to fetch countries");
  return (await res.json()) as { countries: CountryOption[] };
}

export async function fetchStates(
  countryCode: string
): Promise<{ states: StateOption[] }> {
  const res = await fetch(
    `/api/states?country=${encodeURIComponent(countryCode)}`
  );
  if (!res.ok) throw new Error("Failed to fetch states");
  return (await res.json()) as { states: StateOption[] };
}
