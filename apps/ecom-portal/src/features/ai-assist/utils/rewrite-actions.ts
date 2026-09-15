// Modified by Sekar Nagarajan (2026-09-11 18:25)
import type { ToneRewriteAction } from "@solverminds/shared-ui";

import type {
  AiRewriteRewriteAction,
  AiRewriteToneAction,
} from "../api/ai-assist.types";

export const AI_TONE_ACTION_LABELS: Record<AiRewriteToneAction, string> = {
  engaging: "Engaging",
  persuasive: "Persuasive",
  anticipatory: "Anticipatory",
  assertive: "Assertive",
  compassionate: "Compassionate",
  confident: "Confident",
  constructive: "Constructive",
  cooperative: "Cooperative",
  diplomatic: "Diplomatic",
  empathetic: "Empathetic",
  friendly: "Friendly",
  inspirational: "Inspirational",
  exciting: "Exciting",
  casual: "Casual",
};

export const AI_REWRITE_ACTION_LABELS: Record<AiRewriteRewriteAction, string> =
  {
    improve: "Improve writing",
    more_descriptive: "More descriptive",
    more_detailed: "More detailed",
    simplify: "Simplify",
    informative: "Informative",
    paraphrase: "Paraphrase",
    fix_mistakes: "Fix spelling & grammar",
    fluent: "Make it fluent",
    objective: "Make it objective",
    professional: "Professional",
  };

export const AI_REWRITE_DROPDOWN_ACTIONS: ToneRewriteAction[] = [
  ...(
    Object.entries(AI_TONE_ACTION_LABELS) as Array<[AiRewriteToneAction, string]>
  ).map(
    ([key, label]): ToneRewriteAction => ({
      key,
      label,
      group: "tone",
    }),
  ),
  ...(
    Object.entries(AI_REWRITE_ACTION_LABELS) as Array<
      [AiRewriteRewriteAction, string]
    >
  ).map(
    ([key, label]): ToneRewriteAction => ({
      key,
      label,
      group: "rewrite",
    }),
  ),
];
