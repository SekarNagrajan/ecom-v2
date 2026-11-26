// Modified by Sekar Nagarajan (2026-09-29 12:30)
import type { ToneRewriteAction } from "@solverminds/shared-ui";
import type { TFunction } from "i18next";

import type {
  AiRewriteRewriteAction,
  AiRewriteToneAction,
} from "../api/ai-assist.types";

/** Stable tone action keys — display labels come from i18n. */
export const AI_TONE_ACTION_KEYS: AiRewriteToneAction[] = [
  "engaging",
  "persuasive",
  "anticipatory",
  "assertive",
  "compassionate",
  "confident",
  "constructive",
  "cooperative",
  "diplomatic",
  "empathetic",
  "friendly",
  "inspirational",
  "exciting",
  "casual",
];

/** Stable rewrite action keys — display labels come from i18n. */
export const AI_REWRITE_ACTION_KEYS: AiRewriteRewriteAction[] = [
  "improve",
  "more_descriptive",
  "more_detailed",
  "simplify",
  "informative",
  "paraphrase",
  "fix_mistakes",
  "fluent",
  "objective",
  "professional",
];

/**
 * Build tone/rewrite dropdown actions with localized labels.
 * Call from a hook with `t` so labels update when the language changes.
 */
export function getAiRewriteDropdownActions(
  t: TFunction<"ai-assist">,
): ToneRewriteAction[] {
  return [
    ...AI_TONE_ACTION_KEYS.map(
      (key): ToneRewriteAction => ({
        key,
        label: t(`tones.${key}`),
        group: "tone",
      }),
    ),
    ...AI_REWRITE_ACTION_KEYS.map(
      (key): ToneRewriteAction => ({
        key,
        label: t(`rewriteActions.${key}`),
        group: "rewrite",
      }),
    ),
  ];
}
