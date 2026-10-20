// Modified by Sekar Nagarajan (2026-10-20 13:05)
import { useAuthStore, usePermission } from "@solverminds/auth";

import type { ToolCallEvent, ToolResultPayload } from "../types/assistant.types";
import { executeTool } from "../tools/registry";
import { toToolResultPayload } from "../tools/tool.types";

/**
 * Runs pending tool_call events via the registry (capability + zod + timeout + redact).
 * Every call_id gets exactly one ToolResultPayload.
 */
export function useToolRunner() {
  const { can } = usePermission();
  const isAuthenticated = useAuthStore((s) => Boolean(s.token && s.user));

  async function runTools(
    calls: ToolCallEvent[],
  ): Promise<ToolResultPayload[]> {
    const settled = await Promise.allSettled(
      calls.map(async (call) => {
        const outcome = await executeTool(call.name, call.arguments ?? {}, {
          can,
          isAuthenticated,
        });
        return toToolResultPayload(call.call_id, outcome);
      }),
    );

    return settled.map((result, index) => {
      const callId = calls[index]?.call_id ?? `missing_${index}`;
      if (result.status === "fulfilled") return result.value;
      return {
        call_id: callId,
        ok: false,
        content: null,
        error: `TOOL_FAILED: ${
          result.reason instanceof Error
            ? result.reason.message
            : "Unknown failure"
        }`,
      };
    });
  }

  return { runTools, can, isAuthenticated };
}
