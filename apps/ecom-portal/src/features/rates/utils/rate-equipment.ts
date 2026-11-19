// Modified by Sekar Nagarajan (2026-10-18 10:20)
/**
 * Equipment vocabulary of the Rates search filter.
 *
 * The landing page, deep links and the equipment master describe a box in different ways
 * ("20DC", "DV20", "STANDARD 20DC CONTAINER", "20' Dry Standard", "40HC", "REEFER 20 CONTAINER").
 * The Rates filter is a fixed Select, and the controller compares contract / tariff rows with the
 * selected value by equality, so every incoming spelling is normalised onto one option value here.
 */
export const RATE_EQUIPMENT_OPTIONS = [
  "20' Standard Dry",
  "40' Standard Dry",
  "40' High Cube Dry",
  "20' Reefer Container",
  "40' Reefer Container",
] as const;

export type RateEquipmentOption = (typeof RATE_EQUIPMENT_OPTIONS)[number];

type Family = "DV" | "HC" | "RF";

const FAMILY_CODES: Record<string, Family> = {
  HC: "HC", HQ: "HC", HH: "HC",
  RE: "RF", RF: "RF", RH: "RF", HR: "RF",
  DC: "DV", DV: "DV", GP: "DV", DY: "DV", DS: "DV", ST: "DV",
};
const FAMILY_WORDS: Record<string, Family> = { REEFER: "RF", DRY: "DV", STANDARD: "DV", GENERAL: "DV" };

/** Size and family read from tokens such as 20DC, DV20, "HIGH CUBE", REEFER, 40, 20'. */
function parse(text: string): { size: string | null; family: Family | null } {
  let size: string | null = null;
  let family: Family | null = null;
  const tokens = text.split(" ").filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const coded = /^(20|22|40|45)([A-Z]{2})$/.exec(tok) ?? /^([A-Z]{2})(20|22|40|45)$/.exec(tok);
    if (coded) {
      const [, a, b] = coded;
      const sizePart = /^\d/.test(a) ? a : b;
      const codePart = /^\d/.test(a) ? b : a;
      size ??= sizePart;
      family ??= FAMILY_CODES[codePart] ?? null;
      continue;
    }
    if (/^(20|22|40|45)$/.test(tok)) { size ??= tok; continue; }
    if (tok === "HIGH" && tokens[i + 1] === "CUBE") { family ??= "HC"; i++; continue; }
    if (FAMILY_CODES[tok] && tok.length === 2) { family ??= FAMILY_CODES[tok]; continue; }
    if (FAMILY_WORDS[tok]) family ??= FAMILY_WORDS[tok];
  }
  return { size, family };
}

/**
 * Normalises an equipment code, master description or portal label onto a filter option value.
 * Unknown inputs are returned unchanged so the raw value still reaches the API.
 */
export function normalizeRateEquipment(input: string | null | undefined): string {
  const raw = String(input ?? "").trim();
  if (!raw || raw.toUpperCase() === "ALL") return "ALL";
  if ((RATE_EQUIPMENT_OPTIONS as readonly string[]).includes(raw)) return raw;

  const text = raw.toUpperCase().replace(/'/g, " ").replace(/[()\-_/,.]/g, " ").replace(/\s+/g, " ").trim();
  const { size, family } = parse(text);
  if (!size || !family) return raw;

  const forty = size !== "20" && size !== "22";
  if (family === "HC") return "40' High Cube Dry";
  if (family === "RF") return forty ? "40' Reefer Container" : "20' Reefer Container";
  return forty ? "40' Standard Dry" : "20' Standard Dry";
}

/** Port code from a typeahead label such as "INNSA - NHAVA SHEVA,MUMBAI" (or a bare code). */
export function portCodeFromLabel(value: string | null | undefined, fallback = ""): string {
  const code = String(value ?? "").split(" - ")[0].trim().toUpperCase();
  return code || fallback;
}
