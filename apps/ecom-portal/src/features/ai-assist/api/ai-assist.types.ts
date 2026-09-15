// Modified by Sekar Nagarajan (2026-09-11 18:25)
/** Request/response shapes for ecom AI text-assist APIs (CRM parity). */

export interface AiGrammarRequest {
  grammartext: string;
}

export interface AiGrammarResponse {
  data: {
    correctedText: string;
  };
}

export interface AiTranscriptionResponse {
  data: {
    text: string;
  };
}

export type AiRewriteToneAction =
  | "engaging"
  | "persuasive"
  | "anticipatory"
  | "assertive"
  | "compassionate"
  | "confident"
  | "constructive"
  | "cooperative"
  | "diplomatic"
  | "empathetic"
  | "friendly"
  | "inspirational"
  | "exciting"
  | "casual";

export type AiRewriteRewriteAction =
  | "improve"
  | "more_descriptive"
  | "more_detailed"
  | "simplify"
  | "informative"
  | "paraphrase"
  | "fix_mistakes"
  | "fluent"
  | "objective"
  | "professional";

export type AiRewriteAction = AiRewriteToneAction | AiRewriteRewriteAction;

export interface AiRewriteRequest {
  content_html: string;
  action: AiRewriteAction;
}

export interface AiRewriteResponse {
  ok: boolean;
  rewritten_html?: string;
  message?: string;
}
