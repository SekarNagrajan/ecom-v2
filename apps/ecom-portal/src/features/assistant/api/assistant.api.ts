// Modified by Sekar Nagarajan (2026-10-20 13:05)
import type {
  AssistantEvent,
  ChatRequestBody,
  ConversationSummary,
  FeedbackBody,
} from "../types/assistant.types";
import { parseSse } from "./sse-parser";

const CHAT_PATH = "/api/assistant/v1/chat";
const UNAUTHORIZED_EVENT = "ecom:unauthorized";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("ecom_auth_token");
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function throwUnauthorized(): never {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  throw new Error("UNAUTHORIZED");
}

/**
 * Stream a chat turn. Yields AssistantEvent values.
 * Falls back to a single token when the proxy buffers JSON.
 */
export async function* streamChat(
  body: ChatRequestBody,
  signal?: AbortSignal,
): AsyncGenerator<AssistantEvent> {
  const response = await fetch(CHAT_PATH, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
    signal,
  });

  if (response.status === 401) {
    throwUnauthorized();
  }

  if (!response.ok) {
    let message = `Assistant request failed (${response.status})`;
    try {
      const json = (await response.json()) as {
        error?: { message?: string; code?: string };
        message?: string;
      };
      message = json.error?.message ?? json.message ?? message;
    } catch {
      /* ignore */
    }
    yield {
      type: "error",
      code: "BAD_REQUEST",
      message,
      retryable: response.status >= 500,
    };
    yield { type: "done", awaiting_tools: false, pending_call_ids: [] };
    return;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await response.json()) as {
      message?: string;
      text?: string;
      delta?: string;
      conversation_id?: string;
      request_id?: string;
    };
    if (json.conversation_id) {
      yield {
        type: "meta",
        conversation_id: json.conversation_id,
        request_id: json.request_id ?? "json-fallback",
      };
    }
    const text = json.message ?? json.text ?? json.delta ?? "";
    if (text) {
      yield { type: "token", delta: text };
    }
    yield { type: "done", awaiting_tools: false, pending_call_ids: [] };
    return;
  }

  if (!response.body) {
    yield {
      type: "error",
      code: "INTERNAL",
      message: "Empty response body",
      retryable: true,
    };
    yield { type: "done", awaiting_tools: false, pending_call_ids: [] };
    return;
  }

  yield* parseSse(response.body);
}

export async function getConversation(
  id: string,
): Promise<ConversationSummary> {
  const response = await fetch(`/api/assistant/v1/conversations/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (response.status === 401) {
    throwUnauthorized();
  }
  if (!response.ok) {
    throw new Error(`Conversation not found (${response.status})`);
  }
  return (await response.json()) as ConversationSummary;
}

export async function sendFeedback(body: FeedbackBody): Promise<void> {
  const response = await fetch("/api/assistant/v1/feedback", {
    method: "POST",
    headers: {
      ...authHeaders(),
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (response.status === 401) {
    throwUnauthorized();
  }
  if (!response.ok && response.status !== 204) {
    throw new Error(`Feedback failed (${response.status})`);
  }
}
