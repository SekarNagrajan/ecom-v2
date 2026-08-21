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
  const res = await fetch('/api/config/menu-access');
  if (!res.ok) {
    // Default: all tabs public — safe fallback
    return { schedules: 'public', tracking: 'public', rates: 'public' };
  }

  const json = (await res.json()) as { data: TabConfig };
  return json.data;
}

/** Validate image captcha code — parity with JSP remote validation rule. */
export async function validateCaptcha(captchaCode: string, type = ''): Promise<boolean> {
  const params = new URLSearchParams({ code: captchaCode });
  if (type) params.set('type', type);

  const res = await fetch(`/api/captcha/validate?${params.toString()}`);
  return res.ok;
}
