// Created by Sekar Nagarajan (2026-10-20 20:30)
import { beforeEach, describe, expect, it } from "vitest";

import type { ChatMessage } from "../types/assistant.types";
import { deriveTitle, useAssistantStore } from "./assistant.store";

function msg(role: ChatMessage["role"], text: string): ChatMessage {
  return {
    id: `${role}_${text}`,
    role,
    text,
    createdAt: Date.now(),
    status: "complete",
    citations: [],
    blocks: text ? [{ type: "text", id: `${role}_${text}_b`, text }] : [],
    cards: [],
    tools: [],
  };
}

/** Seed a finished chat into the archive via the real newChat path. */
function seedChat(text: string) {
  const s = useAssistantStore.getState();
  s.addMessage(msg("user", text));
  s.addMessage(msg("assistant", `re: ${text}`));
  s.newChat();
}

describe("assistant history actions", () => {
  beforeEach(() => {
    useAssistantStore.getState().reset();
    useAssistantStore.setState({ archive: [] });
  });

  it("derives a title from the first user message", () => {
    expect(deriveTitle([msg("user", "  track   my box  ")])).toBe("track my box");
    expect(deriveTitle([])).toBe("…");
  });

  it("archives a finished chat on newChat", () => {
    seedChat("where is my container");
    const { archive } = useAssistantStore.getState();
    expect(archive).toHaveLength(1);
    expect(archive[0].title).toBe("where is my container");
    expect(archive[0].messages).toHaveLength(2);
  });

  it("deletes a chat and restores it at the same index", () => {
    seedChat("first");
    seedChat("second");
    seedChat("third");
    const target = useAssistantStore.getState().archive[1];

    const removed = useAssistantStore.getState().deleteArchived(target.id);
    expect(removed?.index).toBe(1);
    expect(useAssistantStore.getState().archive).toHaveLength(2);
    expect(
      useAssistantStore.getState().archive.some((a) => a.id === target.id),
    ).toBe(false);

    useAssistantStore.getState().restoreArchived(removed!.entry, removed!.index);
    const after = useAssistantStore.getState().archive;
    expect(after).toHaveLength(3);
    expect(after[1].id).toBe(target.id);
  });

  it("deleting an unknown id is a no-op", () => {
    seedChat("only");
    expect(useAssistantStore.getState().deleteArchived("nope")).toBeNull();
    expect(useAssistantStore.getState().archive).toHaveLength(1);
  });

  it("restore does not duplicate an entry that is already present", () => {
    seedChat("one");
    const entry = useAssistantStore.getState().archive[0];
    useAssistantStore.getState().restoreArchived(entry, 0);
    expect(useAssistantStore.getState().archive).toHaveLength(1);
  });

  it("renames a chat and marks the title custom", () => {
    seedChat("raw title");
    const id = useAssistantStore.getState().archive[0].id;
    useAssistantStore.getState().renameArchived(id, "  Rotterdam booking  ");
    const entry = useAssistantStore.getState().archive[0];
    expect(entry.title).toBe("Rotterdam booking");
    expect(entry.titleIsCustom).toBe(true);
  });

  it("ignores an empty rename", () => {
    seedChat("keep me");
    const id = useAssistantStore.getState().archive[0].id;
    useAssistantStore.getState().renameArchived(id, "   ");
    expect(useAssistantStore.getState().archive[0].title).toBe("keep me");
  });

  it("pins a chat and sorts pinned entries first", () => {
    seedChat("oldest");
    seedChat("newest");
    // Seeds land in the same millisecond — force distinct timestamps so the
    // assertion is about pin ordering, not an unstable tie-break.
    useAssistantStore.setState((s) => ({
      archive: s.archive.map((a) => ({
        ...a,
        updatedAt: a.title === "newest" ? 2_000 : 1_000,
      })),
    }));
    const oldest = useAssistantStore
      .getState()
      .archive.find((a) => a.title === "oldest")!;

    useAssistantStore.getState().togglePinArchived(oldest.id);
    expect(useAssistantStore.getState().archive[0].title).toBe("oldest");
    expect(useAssistantStore.getState().archive[0].pinned).toBe(true);

    useAssistantStore.getState().togglePinArchived(oldest.id);
    expect(useAssistantStore.getState().archive[0].title).toBe("newest");
  });

  it("clear all removes unpinned chats and keeps pinned ones", () => {
    seedChat("a");
    seedChat("b");
    seedChat("c");
    const keep = useAssistantStore.getState().archive[0];
    useAssistantStore.getState().togglePinArchived(keep.id);

    const removed = useAssistantStore.getState().clearArchive();
    expect(removed).toBe(2);
    const left = useAssistantStore.getState().archive;
    expect(left).toHaveLength(1);
    expect(left[0].id).toBe(keep.id);
  });

  it("archiveCurrentThread moves the live chat to history without a new chat", () => {
    const s = useAssistantStore.getState();
    s.addMessage(msg("user", "live one"));
    useAssistantStore.getState().archiveCurrentThread();
    expect(useAssistantStore.getState().messages).toHaveLength(0);
    expect(useAssistantStore.getState().archive[0].title).toBe("live one");
  });

  it("archiveCurrentThread is a no-op on an empty thread", () => {
    useAssistantStore.getState().archiveCurrentThread();
    expect(useAssistantStore.getState().archive).toHaveLength(0);
  });

  it("resuming a chat pulls it out of the archive into the live thread", () => {
    seedChat("resume me");
    const id = useAssistantStore.getState().archive[0].id;
    useAssistantStore.getState().resumeArchived(id);
    const state = useAssistantStore.getState();
    expect(state.messages).toHaveLength(2);
    expect(state.view).toBe("chat");
    expect(state.archive.some((a) => a.id === id)).toBe(false);
  });

  it("reset clears history (logout path)", () => {
    seedChat("sensitive");
    useAssistantStore.getState().reset();
    expect(useAssistantStore.getState().archive).toHaveLength(0);
  });

  it("history search query is stored as view state", () => {
    useAssistantStore.getState().setHistoryQuery("rotterdam");
    expect(useAssistantStore.getState().historyQuery).toBe("rotterdam");
  });
});
