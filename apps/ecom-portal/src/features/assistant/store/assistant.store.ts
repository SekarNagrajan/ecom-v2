// Modified by Sekar Nagarajan (2026-10-20 16:40)
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AssistantMode } from "../modes/assistant-modes";
import type {
  AssistantCard,
  ChatMessage,
  CitationChip,
  MessageBlock,
  ToolRunState,
} from "../types/assistant.types";

let blockSeq = 0;
/** Monotonic id for a render block (stable React keys within a session). */
function blockId(): string {
  blockSeq += 1;
  return `blk_${Date.now().toString(36)}_${blockSeq.toString(36)}`;
}

/** Full message text, derived from text blocks joined by blank lines. */
export function joinText(blocks: MessageBlock[]): string {
  return blocks
    .filter((b): b is Extract<MessageBlock, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n\n")
    .trim();
}

/**
 * Render blocks for a message. Non-empty `blocks` win; otherwise the legacy
 * fields are rebuilt in their historical order (tools -> text -> cards) so
 * pre-blocks messages (older session history) render identically to before.
 */
export function ensureBlocks(m: ChatMessage): MessageBlock[] {
  if (Array.isArray(m.blocks) && m.blocks.length > 0) return m.blocks;
  const rebuilt: MessageBlock[] = [];
  for (const tool of m.tools ?? []) {
    rebuilt.push({ type: "tool", id: blockId(), callId: tool.callId });
  }
  if (m.text) rebuilt.push({ type: "text", id: blockId(), text: m.text });
  for (const card of m.cards ?? []) {
    rebuilt.push({ type: "card", id: blockId(), card });
  }
  if (rebuilt.length > 0) return rebuilt;
  return Array.isArray(m.blocks) ? m.blocks : [];
}

/** A finished chat kept in-memory for this session (Rovo-style history). */
export interface ArchivedConversation {
  id: string;
  conversationId: string | null;
  title: string;
  /** True once the user renamed it — auto-titles stop overwriting it. */
  titleIsCustom?: boolean;
  messages: ChatMessage[];
  updatedAt: number;
  mode: AssistantMode;
  /** Pinned chats sort first and survive "clear all". */
  pinned?: boolean;
}

/** Parked live thread when the user switches modes. */
export interface ParkedModeThread {
  conversationId: string | null;
  messages: ChatMessage[];
  draft: string;
  lastUserText: string | null;
  error: AssistantErrorState | null;
}

const ARCHIVE_LIMIT = 50;

/** Pinned first, then most-recently updated. */
function sortArchive(
  entries: ArchivedConversation[],
): ArchivedConversation[] {
  return [...entries].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

/** Trim to the cap without ever dropping a pinned chat. */
function capArchive(
  entries: ArchivedConversation[],
): ArchivedConversation[] {
  const sorted = sortArchive(entries);
  if (sorted.length <= ARCHIVE_LIMIT) return sorted;
  const pinned = sorted.filter((e) => e.pinned);
  const rest = sorted.filter((e) => !e.pinned);
  return sortArchive([
    ...pinned,
    ...rest.slice(0, Math.max(0, ARCHIVE_LIMIT - pinned.length)),
  ]);
}

export function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const text = (firstUser?.text ?? "").trim().replace(/\s+/g, " ");
  return text.slice(0, 80) || "…";
}

function archiveCurrent(state: {
  messages: ChatMessage[];
  conversationId: string | null;
  archive: ArchivedConversation[];
  mode: AssistantMode;
}): ArchivedConversation[] {
  if (!state.messages.length) return state.archive;
  const entry: ArchivedConversation = {
    id: `arch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    conversationId: state.conversationId,
    title: deriveTitle(state.messages),
    messages: state.messages,
    updatedAt: Date.now(),
    mode: state.mode,
  };
  return capArchive([entry, ...state.archive]);
}

export interface AssistantErrorState {
  code: string;
  message: string;
  retryable: boolean;
}

interface AssistantState {
  open: boolean;
  /** Wide desktop drawer (md) vs compact (xs). Persists across chats. */
  wide: boolean;
  /** Active drawer view: the chat itself or the session history list. */
  view: "chat" | "history";
  /** Active assistant mode (Phase 1 shell). */
  mode: AssistantMode;
  /** Parked threads keyed by mode — prevents cross-mode history leak. */
  parkedByMode: Partial<Record<AssistantMode, ParkedModeThread>>;
  /** Finished chats from this session only — never persisted to disk. */
  archive: ArchivedConversation[];
  /** History list filter text (view state for the history pane). */
  historyQuery: string;
  /** Whether the current screen (route) is shared as context. */
  includePageContext: boolean;
  conversationId: string | null;
  messages: ChatMessage[];
  streaming: boolean;
  draft: string;
  error: AssistantErrorState | null;
  lastUserText: string | null;

  setOpen: (open: boolean) => void;
  toggleWide: () => void;
  setView: (view: "chat" | "history") => void;
  setMode: (mode: AssistantMode) => void;
  togglePageContext: () => void;
  resumeArchived: (archiveId: string) => void;
  setHistoryQuery: (query: string) => void;
  /** Remove one chat; returns it (plus its index) so the caller can undo. */
  deleteArchived: (
    archiveId: string,
  ) => { entry: ArchivedConversation; index: number } | null;
  /** Re-insert a deleted chat at its original position (undo). */
  restoreArchived: (entry: ArchivedConversation, index: number) => void;
  /** Remove every unpinned chat; returns how many were removed. */
  clearArchive: () => number;
  renameArchived: (archiveId: string, title: string) => void;
  togglePinArchived: (archiveId: string) => void;
  /** Archive the live thread without starting a new one (idempotent). */
  archiveCurrentThread: () => void;
  setDraft: (draft: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  reset: () => void;
  newChat: () => void;
  setStreaming: (streaming: boolean) => void;
  setConversationId: (id: string | null) => void;
  setError: (error: AssistantErrorState | null) => void;
  setLastUserText: (text: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  patchMessage: (
    id: string,
    patch: (message: ChatMessage) => ChatMessage,
  ) => void;
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void;
  appendToken: (messageId: string, delta: string) => void;
  appendCard: (messageId: string, card: AssistantCard) => void;
  appendCitation: (messageId: string, citation: CitationChip) => void;
  setToolRun: (messageId: string, run: ToolRunState) => void;
  patchToolRun: (
    messageId: string,
    callId: string,
    status: ToolRunState["status"],
  ) => void;
}

const emptyState = {
  open: false,
  wide: false,
  view: "chat" as const,
  mode: "assistant" as AssistantMode,
  parkedByMode: {} as Partial<Record<AssistantMode, ParkedModeThread>>,
  archive: [] as ArchivedConversation[],
  historyQuery: "",
  includePageContext: true,
  conversationId: null as string | null,
  messages: [] as ChatMessage[],
  streaming: false,
  draft: "",
  error: null as AssistantErrorState | null,
  lastUserText: null as string | null,
};

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
  ...emptyState,

  setOpen: (open) => set({ open }),
  toggleWide: () => set((state) => ({ wide: !state.wide })),
  setView: (view) => set({ view }),
  setMode: (nextMode) =>
    set((state) => {
      if (nextMode === state.mode) return state;

      const parked: ParkedModeThread = {
        conversationId: state.conversationId,
        messages: state.messages,
        draft: state.draft,
        lastUserText: state.lastUserText,
        error: state.error,
      };
      const parkedByMode: Partial<Record<AssistantMode, ParkedModeThread>> = {
        ...state.parkedByMode,
        [state.mode]: parked,
      };
      const restored = parkedByMode[nextMode];

      return {
        mode: nextMode,
        parkedByMode,
        streaming: false,
        view: "chat" as const,
        conversationId: restored?.conversationId ?? null,
        messages: restored?.messages ?? [],
        draft: restored?.draft ?? "",
        lastUserText: restored?.lastUserText ?? null,
        error: restored?.error ?? null,
      };
    }),
  togglePageContext: () =>
    set((state) => ({ includePageContext: !state.includePageContext })),
  resumeArchived: (archiveId) =>
    set((state) => {
      const entry = state.archive.find((a) => a.id === archiveId);
      if (!entry) return { view: "chat" as const };

      // Park current thread under its mode, then restore archived under its mode.
      const parked: ParkedModeThread = {
        conversationId: state.conversationId,
        messages: state.messages,
        draft: state.draft,
        lastUserText: state.lastUserText,
        error: state.error,
      };
      const parkedByMode: Partial<Record<AssistantMode, ParkedModeThread>> = {
        ...state.parkedByMode,
        [state.mode]: parked,
      };

      return {
        archive: capArchive(
          archiveCurrent(state).filter((a) => a.id !== archiveId),
        ),
        mode: entry.mode ?? "assistant",
        parkedByMode,
        messages: entry.messages,
        conversationId: entry.conversationId,
        lastUserText:
          [...entry.messages].reverse().find((m) => m.role === "user")?.text ??
          null,
        draft: "",
        view: "chat" as const,
        streaming: false,
        error: null,
      };
    }),
  setHistoryQuery: (historyQuery) => set({ historyQuery }),
  deleteArchived: (archiveId) => {
    const index = get().archive.findIndex((a) => a.id === archiveId);
    if (index === -1) return null;
    const entry = get().archive[index];
    set((state) => ({
      archive: state.archive.filter((a) => a.id !== archiveId),
    }));
    return { entry, index };
  },
  restoreArchived: (entry, index) =>
    set((state) => {
      if (state.archive.some((a) => a.id === entry.id)) return state;
      const next = [...state.archive];
      next.splice(Math.min(Math.max(index, 0), next.length), 0, entry);
      return { archive: capArchive(next) };
    }),
  clearArchive: () => {
    const removed = get().archive.filter((a) => !a.pinned).length;
    set((state) => ({ archive: state.archive.filter((a) => a.pinned) }));
    return removed;
  },
  renameArchived: (archiveId, title) =>
    set((state) => {
      const clean = title.trim().slice(0, 80);
      if (!clean) return state;
      return {
        archive: state.archive.map((a) =>
          a.id === archiveId
            ? { ...a, title: clean, titleIsCustom: true }
            : a,
        ),
      };
    }),
  togglePinArchived: (archiveId) =>
    set((state) => ({
      archive: capArchive(
        state.archive.map((a) =>
          a.id === archiveId ? { ...a, pinned: !a.pinned } : a,
        ),
      ),
    })),
  archiveCurrentThread: () =>
    set((state) => {
      if (!state.messages.length) return state;
      const parkedByMode = { ...state.parkedByMode };
      delete parkedByMode[state.mode];
      return {
        archive: archiveCurrent(state),
        parkedByMode,
        conversationId: null,
        messages: [],
        streaming: false,
        draft: "",
        error: null,
        lastUserText: null,
      };
    }),
  setDraft: (draft) => set({ draft }),
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
  reset: () => set({ ...emptyState }),
  newChat: () =>
    set((state) => {
      const parkedByMode = { ...state.parkedByMode };
      delete parkedByMode[state.mode];
      return {
        archive: archiveCurrent(state),
        parkedByMode,
        conversationId: null,
        messages: [],
        streaming: false,
        draft: "",
        error: null,
        lastUserText: null,
        view: "chat" as const,
      };
    }),
  setStreaming: (streaming) => set({ streaming }),
  setConversationId: (conversationId) => set({ conversationId }),
  setError: (error) => set({ error }),
  setLastUserText: (lastUserText) => set({ lastUserText }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  patchMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? patch(m) : m)),
    })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    })),
  appendToken: (messageId, delta) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id !== messageId) return m;
        const blocks = [...m.blocks];
        const last = blocks[blocks.length - 1];
        if (last && last.type === "text") {
          blocks[blocks.length - 1] = { ...last, text: last.text + delta };
        } else {
          // First delta of a new text block: a tool round may have emitted a
          // leading newline/space that would otherwise glue onto the block.
          blocks.push({
            type: "text",
            id: blockId(),
            text: delta.replace(/^\s+/, ""),
          });
        }
        return { ...m, blocks, text: joinText(blocks) };
      }),
    })),
  appendCard: (messageId, card) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              cards: [...m.cards, card],
              blocks: [...m.blocks, { type: "card", id: blockId(), card }],
            }
          : m,
      ),
    })),
  appendCitation: (messageId, citation) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              citations: m.citations.some((c) => c.marker === citation.marker)
                ? m.citations
                : [...m.citations, citation],
            }
          : m,
      ),
    })),
  setToolRun: (messageId, run) =>
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id !== messageId) return m;
        if (m.tools.some((t) => t.callId === run.callId)) return m;
        return {
          ...m,
          tools: [...m.tools, run],
          blocks: [...m.blocks, { type: "tool", id: blockId(), callId: run.callId }],
        };
      }),
    })),
  patchToolRun: (messageId, callId, status) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              tools: m.tools.map((t) =>
                t.callId === callId ? { ...t, status } : t,
              ),
            }
          : m,
      ),
    })),
    }),
    {
      name: "ecom-assistant-history",
      // sessionStorage: history survives a refresh but dies with the tab,
      // and `reset()` clears it on logout. Never localStorage — transcripts
      // must not outlive the browser session.
      storage: createJSONStorage(() => sessionStorage),
      // Only the archive is persisted; the live thread, streaming flags and
      // open/view state always start clean.
      partialize: (state) => ({ archive: state.archive }),
      // v2 introduced ChatMessage.blocks. Older persisted messages have no
      // blocks, so rebuild them in the historical tools -> text -> cards order
      // on load; everything else is carried through untouched.
      version: 2,
      migrate: (persisted, _version) => {
        const state = persisted as { archive?: ArchivedConversation[] } | undefined;
        if (!state?.archive) return persisted as AssistantState;
        return {
          ...state,
          archive: state.archive.map((conv) => ({
            ...conv,
            messages: (conv.messages ?? []).map((m) =>
              Array.isArray(m.blocks) ? m : { ...m, blocks: ensureBlocks(m) },
            ),
          })),
        } as AssistantState;
      },
    },
  ),
);
