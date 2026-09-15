// Modified by Sekar Nagarajan (2026-09-11 18:25)
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

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function checkAiGrammar(
  payload: AiGrammarRequest,
): Promise<AiGrammarResponse> {
  const response = await fetch(AI_GRAMMAR_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readJson<AiRewriteResponse>(response);
}

export function extractAiAssistError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Something went wrong. Please try again.";
}
