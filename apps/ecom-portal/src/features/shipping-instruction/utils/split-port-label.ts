// Modified by Sekar Nagarajan (2026-11-16 15:25) — split "CODE - PLACE" for route visualizer
/**
 * Splits list/detail port labels like "INNSA - NHAVA SHEVA,MUMBAI" into the
 * large code + secondary place lines used by the SI route visualizer.
 */
export function splitPortLabel(label: string | undefined | null): {
  code: string;
  place: string;
} {
  const raw = String(label ?? "").trim();
  if (!raw) return { code: "—", place: "" };

  const m = /^([A-Za-z0-9]{3,5})\s*[-–—]\s*(.+)$/.exec(raw);
  if (m) return { code: m[1].toUpperCase(), place: m[2].trim() };

  if (/^[A-Za-z0-9]{3,5}$/.test(raw)) {
    return { code: raw.toUpperCase(), place: "" };
  }

  return { code: raw, place: "" };
}
