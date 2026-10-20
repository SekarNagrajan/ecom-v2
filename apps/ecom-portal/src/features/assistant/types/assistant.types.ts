// Modified by Sekar Nagarajan (2026-10-20 16:40)
/** Wire types mirroring apps/ai-service/CONTRACT.md (snake_case on the wire). */

import type { AssistantMode } from "../modes/assistant-modes";

export type { AssistantMode } from "../modes/assistant-modes";
export { ASSISTANT_MODES, parseAssistantMode } from "../modes/assistant-modes";

export type AssistantLocale = "en" | "zh" | "ms" | "es";

export interface ClientContext {
  route: string;
  locale: AssistantLocale | string;
  tenant_code: string | null;
  capabilities: string[];
}

export interface ToolResultPayload {
  call_id: string;
  ok: boolean;
  content: Record<string, unknown> | null;
  error: string | null;
}

export interface ChatRequestBody {
  conversation_id: string | null;
  message: string | null;
  tool_results: ToolResultPayload[] | null;
  client_context: ClientContext;
  tools: string[] | null;
  mode: AssistantMode;
}

export interface MetaEvent {
  type: "meta";
  conversation_id: string;
  request_id: string;
}

export interface TokenEvent {
  type: "token";
  delta: string;
}

export interface CitationEvent {
  type: "citation";
  route: string;
  title: string;
  marker: string;
}

export interface ToolCallEvent {
  type: "tool_call";
  call_id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface UiActionEvent {
  type: "ui_action";
  call_id: string;
  kind: "ui_action";
  name: string;
  arguments: Record<string, unknown>;
}

export interface ErrorEvent {
  type: "error";
  code: string;
  message: string;
  retryable: boolean;
}

export interface DoneEvent {
  type: "done";
  awaiting_tools: boolean;
  pending_call_ids: string[];
}

export type AssistantEvent =
  | MetaEvent
  | TokenEvent
  | CitationEvent
  | ToolCallEvent
  | UiActionEvent
  | ErrorEvent
  | DoneEvent;

export type AssistantErrorCode =
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "LLM_UNAVAILABLE"
  | "TOOL_LIMIT"
  | "BAD_REQUEST"
  | "INTERNAL"
  | "ASSISTANT_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "TOOL_FAILED";

export type MessageRole = "user" | "assistant";

export type MessageStatus =
  | "streaming"
  | "complete"
  | "error"
  | "stopped";

export interface CitationChip {
  route: string;
  title: string;
  marker: string;
}

export type AssistantCardKind =
  | "tool_result"
  | "booking_prefill"
  | "automation_confirm"
  | "sql_result"
  | "navigate"
  | "action";

export interface AssistantCard {
  kind: AssistantCardKind;
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
  summary?: string;
  route?: string;
  data?: unknown;
}

export type ToolRunState = {
  callId: string;
  tool: string;
  status: "running" | "done" | "failed";
};

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  /** Epoch ms when the message was created client-side (bubble timestamp). */
  createdAt: number;
  status: MessageStatus;
  citations: CitationChip[];
  cards: AssistantCard[];
  tools: ToolRunState[];
  error?: { code: string; message: string; retryable: boolean };
  feedback?: "up" | "down";
}

export interface ConversationSummary {
  conversation_id: string;
  turn_count: number;
  pending_tool_calls: string[];
  updated_at: string;
}

export interface FeedbackBody {
  conversation_id: string;
  rating: "up" | "down";
  comment?: string;
}
