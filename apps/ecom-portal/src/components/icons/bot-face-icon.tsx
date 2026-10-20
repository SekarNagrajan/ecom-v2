// Modified by Sekar Nagarajan (2026-10-20 16:05)
/**
 * Outline robot-face icon (speech-bubble head with bottom tail, antenna,
 * side ears, round eyes, smile) matching the brand artwork supplied for the
 * AI Assistant. Stroke-based like every other Lucide glyph, so it inherits
 * `currentColor` and the standard strokeWidth — color it with tokens
 * (primary by default) exactly like built-in icons.
 */
import { createLucideIcon } from "lucide-react";

export const BotFace = createLucideIcon("BotFace", [
  // Antenna
  ["circle", { cx: "12", cy: "3", r: "1.6", key: "antenna-ball" }],
  ["path", { d: "M12 4.6V6.6", key: "antenna-stem" }],
  // Speech-bubble head with a bottom tail
  [
    "path",
    {
      d:
        "M7 6.6h10a3 3 0 0 1 3 3v5.6a3 3 0 0 1-3 3h-3.9l-2.2 3.2a1 1 0 0 1-1.7-.1l-1.7-3.1H7a3 3 0 0 1-3-3V9.6a3 3 0 0 1 3-3Z",
      key: "head",
    },
  ],
  // Side ears
  ["path", { d: "M2.2 11.4v3.4", key: "ear-left" }],
  ["path", { d: "M21.8 11.4v3.4", key: "ear-right" }],
  // Eyes
  ["circle", { cx: "9.1", cy: "11.6", r: "1.45", key: "eye-left" }],
  ["circle", { cx: "14.9", cy: "11.6", r: "1.45", key: "eye-right" }],
  // Smile
  ["path", { d: "M9.3 14.7c.55 1.05 1.55 1.65 2.7 1.65s2.15-.6 2.7-1.65", key: "smile" }],
]);
