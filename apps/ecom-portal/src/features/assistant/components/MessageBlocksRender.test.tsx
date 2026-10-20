// Created for Phase 1 — a GFM table streamed in a later round renders as a table.
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

import { useAssistantStore } from "../store/assistant.store";
import type { ChatMessage } from "../types/assistant.types";
import { MessageMarkdown } from "./MessageMarkdown";

const MSG_ID = "assistant_tbl";

function shell(): ChatMessage {
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

describe("streamed table rendering", () => {
  beforeEach(() => {
    useAssistantStore.getState().reset();
    useAssistantStore.getState().addMessage(shell());
  });

  it("renders a table that arrives after a tool round", () => {
    const s = useAssistantStore.getState();
    s.appendToken(MSG_ID, "Here are the rows:");
    s.setToolRun(MSG_ID, { callId: "c1", tool: "list_bookings", status: "running" });
    // Later round begins with a newline that previously glued onto the prose.
    s.appendToken(
      MSG_ID,
      "\n| ID | Status |\n| --- | --- |\n| BKON260016 | A |",
    );

    const text = useAssistantStore.getState().messages.find((m) => m.id === MSG_ID)!
      .text;
    const { container } = render(<MessageMarkdown text={text} />);
    expect(container.querySelector("table")).not.toBeNull();
    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
  });
});
