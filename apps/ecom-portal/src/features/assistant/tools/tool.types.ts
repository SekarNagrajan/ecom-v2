// Modified by Sekar Nagarajan (2026-10-20 13:05)
import type { z } from "zod";

import type { ToolResultPayload } from "../types/assistant.types";

export type CapabilityCode =
  | "ARN"
  | "BKG"
  | "BL"
  | "CRO"
  | "DO"
  | "PAY"
  | "SI"
  | "VGM"
  | null;

export interface ToolContext {
  can: (code: string) => boolean;
  isAuthenticated: boolean;
}

export interface ToolDef<TArgs = unknown> {
  name: string;
  schema: z.ZodType<TArgs>;
  /** null = always eligible when authenticated (or public tools). */
  capability: CapabilityCode;
  maxRows: number;
  run: (args: TArgs, ctx: ToolContext) => Promise<Record<string, unknown>>;
}

export type ToolErrorCode =
  | "UNKNOWN_TOOL"
  | "INVALID_ARGS"
  | "CAPABILITY_DENIED"
  | "NOT_AUTHENTICATED"
  | "TIMEOUT"
  | "TOOL_FAILED";

export interface ToolRunFailure {
  ok: false;
  error: { code: ToolErrorCode; message: string };
}

export interface ToolRunSuccess {
  ok: true;
  content: Record<string, unknown>;
}

export type ToolRunOutcome = ToolRunSuccess | ToolRunFailure;

export function toToolResultPayload(
  callId: string,
  outcome: ToolRunOutcome,
): ToolResultPayload {
  if (outcome.ok === true) {
    return {
      call_id: callId,
      ok: true,
      content: outcome.content,
      error: null,
    };
  }
  const failure = outcome as ToolRunFailure;
  return {
    call_id: callId,
    ok: false,
    content: null,
    error: `${failure.error.code}: ${failure.error.message}`,
  };
}
