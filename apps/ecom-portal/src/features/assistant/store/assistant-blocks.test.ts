// Created for Phase 1 — ordered message blocks.
import { beforeEach, describe, expect, it } from "vitest";

import type { AssistantCard, ChatMessage } from "../types/assistant.types";
import { ensureBlocks, joinText, useAssistantStore } from "./assistant.store";

const MSG_ID = "assistant_1";

function assistantShell(): ChatMessage {
  return {
    id: MSG_ID,
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

function current(): ChatMessage {
  return useAssistantStore.getState().messages.find((m) => m.id === MSG_ID)!;
}

function card(callId: string): AssistantCard {
  return { kind: "tool_result", callId, name: "list_bookings", arguments: {} };
}

describe("ordered message blocks", () => {
  beforeEach(() => {
    useAssistantStore.getState().reset();
    useAssistantStore.getState().addMessage(assistantShell());
  });

  it("splits two token rounds around a tool into [text, tool, text]", () => {
    const s = useAssistantStore.getState();
    s.appendToken(MSG_ID, "Let me check.");
    s.setToolRun(MSG_ID, { callId: "c1", tool: "list_bookings", status: "running" });
    s.appendToken(MSG_ID, "\nHere are your bookings.");

    const m = current();
    expect(m.blocks.map((b) => b.type)).toEqual(["text", "tool", "text"]);
    // Rounds are separated by a blank line so a later table/list renders fresh.
    expect(m.text).toBe("Let me check.\n\nHere are your bookings.");
    expect(m.text).toContain("\n\n");
  });

  it("derives full text via joinText for copy/history/regenerate", () => {
    const s = useAssistantStore.getState();
    s.appendToken(MSG_ID, "Alpha");
    s.setToolRun(MSG_ID, { callId: "c1", tool: "list_bookings", status: "running" });
    s.appendToken(MSG_ID, "Beta");
    expect(current().text).toBe(joinText(current().blocks));
    expect(current().text).toBe("Alpha\n\nBeta");
  });

  it("places a ui_action card between two text rounds", () => {
    const s = useAssistantStore.getState();
    s.appendToken(MSG_ID, "First.");
    s.appendCard(MSG_ID, card("c1"));
    s.appendToken(MSG_ID, "Second.");
    expect(current().blocks.map((b) => b.type)).toEqual(["text", "card", "text"]);
    // Deprecated array stays in sync for backward compatibility.
    expect(current().cards).toHaveLength(1);
  });

  it("only appends one tool block per callId", () => {
    const s = useAssistantStore.getState();
    s.setToolRun(MSG_ID, { callId: "c1", tool: "list_bookings", status: "running" });
    s.setToolRun(MSG_ID, { callId: "c1", tool: "list_bookings", status: "running" });
    expect(current().blocks.filter((b) => b.type === "tool")).toHaveLength(1);
  });

  it("rebuilds legacy messages (no blocks) in historical tool -> text -> card order", () => {
    const legacy = {
      id: "legacy",
      role: "assistant",
      text: "Hello",
      createdAt: Date.now(),
      status: "complete",
      citations: [],
      cards: [card("c9")],
      tools: [{ callId: "c9", tool: "list_bookings", status: "done" }],
    } as unknown as ChatMessage;

    const blocks = ensureBlocks(legacy);
    expect(blocks.map((b) => b.type)).toEqual(["tool", "text", "card"]);
  });
});
