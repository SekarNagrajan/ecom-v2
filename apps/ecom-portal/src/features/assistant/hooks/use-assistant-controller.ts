// Modified by Sekar Nagarajan (2026-10-20 22:15)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { streamChat } from "../api/assistant.api";
import type { AssistantMode } from "../modes/assistant-modes";
import { toolsForMode } from "../modes/assistant-modes";
import { useAssistantStore } from "../store/assistant.store";
import { availableTools } from "../tools/registry";
import type {
  AssistantCard,
  AssistantEvent,
  ChatMessage,
  ChatRequestBody,
  ToolCallEvent,
  ToolResultPayload,
  UiActionEvent,
} from "../types/assistant.types";
import { useAssistantContext } from "./use-assistant-context";
import { useToolRunner } from "./use-tool-runner";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function newAssistantMessage(id: string): ChatMessage {
  return {
    id,
    role: "assistant",
    text: "",
    createdAt: Date.now(),
    status: "streaming",
    citations: [],
    blocks: [],
    cards: [],
    tools: [],
  };
}

function uiActionToCard(action: UiActionEvent): AssistantCard {
  let kind: AssistantCard["kind"];
  switch (action.name) {
    case "prefill_booking":
      kind = "booking_prefill";
      break;
    case "propose_booking_submit":
      kind = "automation_confirm";
      break;
    case "show_sql_result":
      kind = "sql_result";
      break;
    case "navigate":
      kind = "navigate";
      break;
    default:
      kind = "action";
      break;
  }
  return {
    kind,
    callId: action.call_id,
    name: action.name,
    arguments: action.arguments ?? {},
    route:
      typeof action.arguments?.route === "string"
        ? action.arguments.route
        : undefined,
  };
}

function summarizeToolContent(
  name: string,
  content: Record<string, unknown> | null,
): string | undefined {
  if (!content) return undefined;
  if (name === "track_shipment") {
    const containers = content.containers;
    if (Array.isArray(containers) && containers[0]) {
      const first = containers[0] as { status?: string; containerNo?: string };
      return [first.containerNo, first.status].filter(Boolean).join(" · ");
    }
    if (content.found === false) return "Not found";
  }
  if (name === "search_schedules" && typeof content.count === "number") {
    return `${content.count} sailing(s)`;
  }
  if (name === "list_bookings" && Array.isArray(content.items)) {
    return `${content.items.length} booking(s)`;
  }
  return undefined;
}

export function useAssistantController() {
  const { t } = useTranslation("assistant");
  const toast = useToast();
  const clientContext = useAssistantContext();
  const { runTools, can, isAuthenticated } = useToolRunner();
  const abortRef = useRef<AbortController | null>(null);
  const store = useAssistantStore();

  function resolveTools(): string[] {
    const mode = useAssistantStore.getState().mode;
    return toolsForMode(mode, availableTools(can, isAuthenticated));
  }

  function buildBody(
    partial: Omit<ChatRequestBody, "mode" | "client_context" | "tools"> &
      Partial<Pick<ChatRequestBody, "tools">>,
  ): ChatRequestBody {
    return {
      ...partial,
      client_context: clientContext,
      tools: partial.tools ?? resolveTools(),
      mode: useAssistantStore.getState().mode,
    };
  }

  async function consumeStream(
    body: ChatRequestBody,
    assistantMessageId: string,
    collectedToolCalls: ToolCallEvent[],
  ): Promise<{ awaitingTools: boolean }> {
    let awaitingTools = false;

    for await (const event of streamChat(body, abortRef.current?.signal)) {
      reduceEvent(event, assistantMessageId, collectedToolCalls);
      if (event.type === "done") {
        awaitingTools = event.awaiting_tools;
      }
    }

    return { awaitingTools };
  }

  function reduceEvent(
    event: AssistantEvent,
    assistantMessageId: string,
    collectedToolCalls: ToolCallEvent[],
  ): void {
    const s = useAssistantStore.getState();
    switch (event.type) {
      case "meta":
        s.setConversationId(event.conversation_id);
        break;
      case "token":
        s.appendToken(assistantMessageId, event.delta);
        s.updateMessage(assistantMessageId, { status: "streaming" });
        break;
      case "citation":
        s.appendCitation(assistantMessageId, {
          route: event.route,
          title: event.title,
          marker: event.marker,
        });
        break;
      case "tool_call":
        collectedToolCalls.push(event);
        s.setToolRun(assistantMessageId, {
          callId: event.call_id,
          tool: event.name,
          status: "running",
        });
        break;
      case "ui_action":
        s.appendCard(assistantMessageId, uiActionToCard(event));
        break;
      case "error":
        if (event.code === "RATE_LIMITED") {
          toast.warning(t("errors.rateLimited", { defaultValue: t("errors.RATE_LIMITED") }));
        }
        s.setError({
          code: event.code,
          message: event.message,
          retryable: event.retryable,
        });
        s.patchMessage(assistantMessageId, (m) => ({
          ...m,
          status: "error",
          error: {
            code: event.code,
            message: event.message,
            retryable: event.retryable,
          },
          text: m.text || event.message,
        }));
        break;
      case "done":
        break;
      default: {
        const _exhaustive: never = event;
        void _exhaustive;
        break;
      }
    }
  }

  async function attachToolResultCards(
    assistantMessageId: string,
    calls: ToolCallEvent[],
    results: ToolResultPayload[],
  ) {
    const cards: AssistantCard[] = results.map((result, index) => {
      const call = calls[index];
      const name = call?.name ?? "unknown";
      return {
        kind: "tool_result" as const,
        callId: result.call_id,
        name,
        arguments: call?.arguments ?? {},
        data: result.content,
        ok: result.ok,
        error: result.ok ? undefined : (result.error ?? undefined),
        summary: result.ok
          ? summarizeToolContent(name, result.content)
          : undefined,
        route: undefined,
      };
    });

    for (const card of cards) {
      useAssistantStore.getState().appendCard(assistantMessageId, card);
    }

    for (const result of results) {
      useAssistantStore.getState().patchToolRun(
        assistantMessageId,
        result.call_id,
        result.ok ? "done" : "failed",
      );
    }
  }

  async function runTurn(body: ChatRequestBody, assistantMessageId: string) {
    const collectedToolCalls: ToolCallEvent[] = [];
    const { awaitingTools } = await consumeStream(
      body,
      assistantMessageId,
      collectedToolCalls,
    );

    if (awaitingTools && collectedToolCalls.length > 0) {
      const toolResults = await runTools(collectedToolCalls);
      await attachToolResultCards(
        assistantMessageId,
        collectedToolCalls,
        toolResults,
      );

      const conversationId =
        useAssistantStore.getState().conversationId ?? body.conversation_id;

      await runTurn(
        buildBody({
          conversation_id: conversationId,
          message: null,
          tool_results: toolResults,
        }),
        assistantMessageId,
      );
      return;
    }

    useAssistantStore.getState().updateMessage(assistantMessageId, {
      status: "complete",
    });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || useAssistantStore.getState().streaming) return;

    useAssistantStore.getState().setError(null);
    useAssistantStore.getState().setLastUserText(trimmed);
    useAssistantStore.getState().setDraft("");
    useAssistantStore.getState().setStreaming(true);

    const userMsg: ChatMessage = {
      id: newId("user"),
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
      status: "complete",
      citations: [],
      blocks: [{ type: "text", id: newId("blk"), text: trimmed }],
      cards: [],
      tools: [],
    };
    const assistantMsg = newAssistantMessage(newId("assistant"));
    useAssistantStore.getState().addMessage(userMsg);
    useAssistantStore.getState().addMessage(assistantMsg);

    abortRef.current = new AbortController();

    try {
      const conversationId = useAssistantStore.getState().conversationId;
      await runTurn(
        buildBody({
          conversation_id: conversationId,
          message: trimmed,
          tool_results: null,
        }),
        assistantMsg.id,
      );
    } catch (err: unknown) {
      if (
        (err instanceof Error && err.name === "AbortError") ||
        abortRef.current?.signal.aborted
      ) {
        useAssistantStore.getState().updateMessage(assistantMsg.id, {
          status: "stopped",
        });
      } else {
        const partial = useAssistantStore
          .getState()
          .messages.find((m) => m.id === assistantMsg.id);
        // Transport dropped after tokens — keep the answer, don't flash
        // "Connection lost" over usable text.
        if (partial?.text?.trim()) {
          useAssistantStore.getState().updateMessage(assistantMsg.id, {
            status: "complete",
          });
        } else {
          const message =
            err instanceof Error ? err.message : t("errors.INTERNAL");
          useAssistantStore.getState().setError({
            code: "NETWORK_ERROR",
            message,
            retryable: true,
          });
          useAssistantStore.getState().patchMessage(assistantMsg.id, (m) => ({
            ...m,
            status: "error",
            error: {
              code: "NETWORK_ERROR",
              message,
              retryable: true,
            },
            text: m.text || message,
          }));
        }
      }
    } finally {
      useAssistantStore.getState().setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    const messages = useAssistantStore.getState().messages;
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && last.status === "streaming") {
      useAssistantStore.getState().updateMessage(last.id, { status: "stopped" });
    }
    useAssistantStore.getState().setStreaming(false);
  }

  async function retry() {
    const last = useAssistantStore.getState().lastUserText;
    if (!last) return;
    await send(last);
  }

  function newChat() {
    abortRef.current?.abort();
    useAssistantStore.getState().newChat();
  }

  function setMode(mode: AssistantMode) {
    if (mode === useAssistantStore.getState().mode) return;
    abortRef.current?.abort();
    useAssistantStore.getState().setStreaming(false);
    useAssistantStore.getState().setMode(mode);
  }

  return {
    send,
    stop,
    retry,
    newChat,
    setMode,
    mode: store.mode,
    open: store.open,
    wide: store.wide,
    toggleWide: store.toggleWide,
    view: store.view,
    setView: store.setView,
    archive: store.archive,
    resumeArchived: store.resumeArchived,
    historyQuery: store.historyQuery,
    setHistoryQuery: store.setHistoryQuery,
    deleteArchived: store.deleteArchived,
    restoreArchived: store.restoreArchived,
    clearArchive: store.clearArchive,
    renameArchived: store.renameArchived,
    togglePinArchived: store.togglePinArchived,
    archiveCurrentThread: store.archiveCurrentThread,
    hasLiveThread: store.messages.length > 0,
    includePageContext: store.includePageContext,
    togglePageContext: store.togglePageContext,
    canRegenerate: Boolean(store.lastUserText) && !store.streaming,
    streaming: store.streaming,
    messages: store.messages,
    draft: store.draft,
    error: store.error,
    conversationId: store.conversationId,
    setOpen: store.setOpen,
    setDraft: store.setDraft,
    openDrawer: store.openDrawer,
    closeDrawer: store.closeDrawer,
  };
}
