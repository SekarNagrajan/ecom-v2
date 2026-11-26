// Modified by Sekar Nagarajan (2026-10-20)
import type { EquipmentType, PortOption, TabConfig } from '../types/landing.types';

// ---------------------------------------------------------------------------
// MSW-backed API functions — replace URLs with real REST endpoints when ready.
// All responses use the standard envelope: { data: T }
// ---------------------------------------------------------------------------

/** Port typeahead search — parity with JSP `portJson` + Bloodhound. */
export async function searchPorts(query: string): Promise<PortOption[]> {
  if (!query || query.trim().length < 2) return [];

  const res = await fetch(`/api/ports/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Port search failed');

  const json = (await res.json()) as { data: PortOption[] };
  return json.data;
}

/** One port resolved by its UN/LOCODE (the typeahead search also returns name matches). */
export async function fetchPortByCode(code: string): Promise<PortOption | null> {
  const wanted = code.trim().toUpperCase();
  if (wanted.length < 2) return null;
  const ports = await searchPorts(wanted);
  return ports.find((p) => p.portCode.trim().toUpperCase() === wanted) ?? null;
}

/** Equipment type list — parity with JSP `SESSION_HASH_EQUIPMENT_TYPE`. */
export async function fetchEquipmentTypes(): Promise<EquipmentType[]> {
  const res = await fetch('/api/equipment-types');
  if (!res.ok) throw new Error('Failed to load equipment types');

  const json = (await res.json()) as { data: EquipmentType[] };
  return json.data;
}

/**
 * Public menu / tab visibility config — parity with JSP reading
 * `schdMenuCategory`, `trackingMenuCategory`, `ratesMenuCategory` from session.
 * Returns which tabs are publicly accessible vs. require login.
 */
export async function fetchTabConfig(): Promise<TabConfig> {
  const fallback: TabConfig = {
    schedules: 'public',
    tracking: 'public',
    rates: 'public',
  };
  try {
    const res = await fetch('/api/config/menu-access');
    if (!res.ok) return fallback;
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return fallback;
    const json = (await res.json()) as { data: TabConfig };
    return json.data ?? fallback;
  } catch {
    return fallback;
  }
}

/** Validate image captcha code — parity with JSP remote validation rule. */
export async function validateCaptcha(
  captchaCode: string,
  type = "",
): Promise<boolean> {
  const trimmed = captchaCode.trim();
  if (!trimmed) {
    return false;
  }

  const params = new URLSearchParams({ code: trimmed });
  if (type) params.set("type", type);

  try {
    const res = await fetch(`/api/captcha/validate?${params.toString()}`);
    if (!res.ok) {
      return false;
    }
    const json = (await res.json()) as { valid?: boolean; data?: boolean };
    if (typeof json.valid === "boolean") {
      return json.valid;
    }
    if (typeof json.data === "boolean") {
      return json.data;
    }
    return true;
  } catch {
    return false;
  }
}
