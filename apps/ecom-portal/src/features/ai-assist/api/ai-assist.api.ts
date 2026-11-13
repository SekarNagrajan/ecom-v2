// Modified by Sekar Nagarajan (2026-10-19)
/**
 * Browser always calls same-origin `/api/ai/*`.
 * - mock: MSW (`ai-assist.handlers.ts`)
 * - real / SW bypass: Vite `ecomAiN8nProxyPlugin` → n8n webhooks
 */
import i18n from "../../../i18n/config";
import type {
  AiGrammarRequest,
  AiGrammarResponse,
  AiRewriteRequest,
  AiRewriteResponse,
  AiTranscriptionResponse,
} from "./ai-assist.types";

const AI_GRAMMAR_PATH = "/api/ai/grammar";
const AI_TRANSCRIBE_PATH = "/api/ai/transcribe";
const AI_REWRITE_PATH = "/api/ai/rewrite";

function messageFromErrorBody(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
    const nested = record.error;
    if (typeof nested === "string" && nested.trim()) {
      return nested.trim();
    }
    if (nested && typeof nested === "object") {
      const err = nested as Record<string, unknown>;
      if (typeof err.message === "string" && err.message.trim()) {
        return err.message;
      }
      if (typeof err.code === "string" && err.code.trim()) {
        return err.code;
      }
    }
    if (typeof record.title === "string" && record.title.trim()) {
      return record.title;
    }
  }
  if (typeof body === "string" && body.trim()) {
    return body.trim().slice(0, 240);
  }
  return `Request failed (${status})`;
}

async function readJson<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let parsed: unknown = undefined;
  if (raw) {
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      parsed = raw;
    }
  }

  if (!response.ok) {
    throw new Error(messageFromErrorBody(parsed, response.status));
  }

  if (parsed === undefined || typeof parsed === "string") {
    throw new Error(
      typeof parsed === "string" && parsed.trim()
        ? "AI service returned a non-JSON response"
        : "AI service returned an empty response",
    );
  }

  return parsed as T;
}

export async function checkAiGrammar(
  payload: AiGrammarRequest,
): Promise<AiGrammarResponse> {
  const response = await fetch(AI_GRAMMAR_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson<AiGrammarResponse>(response);
}

export async function transcribeAiAudio(
  file: File,
  signal?: AbortSignal,
): Promise<AiTranscriptionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(AI_TRANSCRIBE_PATH, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
    signal,
  });
  return readJson<AiTranscriptionResponse>(response);
}

export async function rewriteAiContent(
  payload: AiRewriteRequest,
): Promise<AiRewriteResponse> {
  const response = await fetch(AI_REWRITE_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson<AiRewriteResponse>(response);
}

export function extractAiAssistError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return i18n.t("ai-assist:errors.generic");
}
