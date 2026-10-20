// Modified by Sekar Nagarajan (2026-10-20 16:40)
/** Phase 1 mode ids + client-side tool scopes (mirrors ai-service app/modes). */

export const ASSISTANT_MODES = [
  "assistant",
  "automation",
  "sql",
  "docs",
] as const;

export type AssistantMode = (typeof ASSISTANT_MODES)[number];

export function isAssistantMode(value: unknown): value is AssistantMode {
  return (
    typeof value === "string" &&
    (ASSISTANT_MODES as readonly string[]).includes(value)
  );
}

export function parseAssistantMode(value: unknown): AssistantMode {
  return isAssistantMode(value) ? value : "assistant";
}

/**
 * Client tool allowlist per mode. Null = all capability-eligible browser tools.
 * Must stay a subset of (or equal to) the server mode allowlist.
 */
const MODE_TOOL_ALLOWLIST: Record<AssistantMode, readonly string[] | null> = {
  assistant: null,
  automation: [
    "search_schedules",
    "track_shipment",
    "get_rates",
    "list_bookings",
    "get_booking",
  ],
  // Browser tools empty — SQL uses server tools only.
  sql: [],
  docs: [],
};

export function toolsForMode(
  mode: AssistantMode,
  capabilityEligible: string[],
): string[] {
  const allow = MODE_TOOL_ALLOWLIST[mode];
  if (allow === null) return capabilityEligible;
  if (allow.length === 0) return [];
  const set = new Set(allow);
  return capabilityEligible.filter((name) => set.has(name));
}
