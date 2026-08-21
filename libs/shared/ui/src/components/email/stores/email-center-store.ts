import { createStore, type StoreApi } from 'zustand';

import {
  DEFAULT_DRAFT_AUTOSAVE_DEBOUNCE_MS,
  DEFAULT_EMAIL_PAGE_SIZE,
  DEFAULT_EMAIL_SEARCH_DEBOUNCE_MS,
} from '../constants';
import type {
  EmailDraftContext,
  EmailDraftInput,
  EmailListLoadUi,
  EmailMessage,
  EmailProgressiveLoadTrigger,
  EmailTab,
  EmailThreadListItem,
} from '../types';

interface EmailComposerState {
  open: boolean;
  context: EmailDraftContext;
  initialDraft?: EmailDraftInput;
}

export interface EmailCenterStoreState {
  activeTab: EmailTab;
  searchInputValue: string;
  searchValue: string;
  searchDebounceMs: number;

  listLoadUi: EmailListLoadUi;
  progressiveLoadTrigger: EmailProgressiveLoadTrigger;
  pageSize: number;
  draftAutoSaveDebounceMs: number;

  isSelectionControlled: boolean;
  selectedThreadId?: string;
  mobileDetailOpen: boolean;
  invalidDefaultThreadId?: string;

  threads: EmailThreadListItem[];
  totalThreads: number;
  currentPage: number;
  isLoadingThreads: boolean;
  isLoadingMoreThreads: boolean;
  threadsErrorMessage?: string;

  messagesByThreadId: Record<string, EmailMessage[]>;
  messageLoadingByThreadId: Record<string, boolean>;
  messageErrorByThreadId: Record<string, string | undefined>;
  expandedMessageIdsByThreadId: Record<string, string[]>;

  composer: EmailComposerState;
  isComposerSubmitting: boolean;

  setSelectionControlled: (value: boolean) => void;
  setActiveTab: (tab: EmailTab) => void;
  setSearchInputValue: (value: string) => void;
  applySearchValue: (value: string) => void;
  setListConfig: (config: {
    listLoadUi: EmailListLoadUi;
    progressiveLoadTrigger: EmailProgressiveLoadTrigger;
    pageSize: number;
    searchDebounceMs: number;
    draftAutoSaveDebounceMs: number;
  }) => void;

  setThreadsLoading: (loading: boolean) => void;
  setThreadsLoadingMore: (loading: boolean) => void;
  setThreadsError: (message: string | undefined) => void;
  setCurrentPage: (page: number) => void;
  incrementPage: () => void;
  clearThreads: () => void;
  setThreadsPage: (payload: {
    items: EmailThreadListItem[];
    total: number;
    append: boolean;
  }) => void;

  setSelectedThreadId: (threadId: string | undefined) => void;
  selectThread: (threadId: string, isMobile: boolean) => void;
  setMobileDetailOpen: (open: boolean) => void;
  setInvalidDefaultThreadId: (threadId: string | undefined) => void;

  setThreadMessages: (threadId: string, messages: EmailMessage[]) => void;
  setThreadMessageLoading: (threadId: string, loading: boolean) => void;
  setThreadMessageError: (
    threadId: string,
    message: string | undefined
  ) => void;
  toggleMessageExpanded: (threadId: string, messageId: string) => void;

  openComposer: (
    context: EmailDraftContext,
    initialDraft?: EmailDraftInput
  ) => void;
  closeComposer: () => void;
  setComposerSubmitting: (submitting: boolean) => void;
}

const INITIAL_STATE: Omit<
  EmailCenterStoreState,
  | 'setSelectionControlled'
  | 'setActiveTab'
  | 'setSearchInputValue'
  | 'applySearchValue'
  | 'setListConfig'
  | 'setThreadsLoading'
  | 'setThreadsLoadingMore'
  | 'setThreadsError'
  | 'setCurrentPage'
  | 'incrementPage'
  | 'clearThreads'
  | 'setThreadsPage'
  | 'setSelectedThreadId'
  | 'selectThread'
  | 'setMobileDetailOpen'
  | 'setInvalidDefaultThreadId'
  | 'setThreadMessages'
  | 'setThreadMessageLoading'
  | 'setThreadMessageError'
  | 'toggleMessageExpanded'
  | 'openComposer'
  | 'closeComposer'
  | 'setComposerSubmitting'
> = {
  activeTab: 'inbox',
  searchInputValue: '',
  searchValue: '',
  searchDebounceMs: DEFAULT_EMAIL_SEARCH_DEBOUNCE_MS,

  listLoadUi: 'progressive',
  progressiveLoadTrigger: 'infinite-scroll',
  pageSize: DEFAULT_EMAIL_PAGE_SIZE,
  draftAutoSaveDebounceMs: DEFAULT_DRAFT_AUTOSAVE_DEBOUNCE_MS,

  isSelectionControlled: false,
  selectedThreadId: undefined,
  mobileDetailOpen: false,
  invalidDefaultThreadId: undefined,

  threads: [],
  totalThreads: 0,
  currentPage: 1,
  isLoadingThreads: false,
  isLoadingMoreThreads: false,
  threadsErrorMessage: undefined,

  messagesByThreadId: {},
  messageLoadingByThreadId: {},
  messageErrorByThreadId: {},
  expandedMessageIdsByThreadId: {},

  composer: {
    open: false,
    context: { mode: 'new' },
  },
  isComposerSubmitting: false,
};

export function createEmailCenterStore(
  initialState: Partial<EmailCenterStoreState> = {}
): StoreApi<EmailCenterStoreState> {
  return createStore<EmailCenterStoreState>((set) => ({
    ...INITIAL_STATE,
    ...initialState,

    setSelectionControlled: (value) => {
      set({ isSelectionControlled: value });
    },

    setActiveTab: (tab) => {
      set((state) => ({
        activeTab: tab,
        currentPage: 1,
        selectedThreadId: state.isSelectionControlled
          ? state.selectedThreadId
          : undefined,
        mobileDetailOpen: false,
        invalidDefaultThreadId: undefined,
      }));
    },

    setSearchInputValue: (value) => {
      set({ searchInputValue: value });
    },

    applySearchValue: (value) => {
      set({ searchValue: value, currentPage: 1 });
    },

    setListConfig: (config) => {
      set({
        listLoadUi: config.listLoadUi,
        progressiveLoadTrigger: config.progressiveLoadTrigger,
        pageSize: config.pageSize,
        searchDebounceMs: config.searchDebounceMs,
        draftAutoSaveDebounceMs: config.draftAutoSaveDebounceMs,
      });
    },

    setThreadsLoading: (loading) => {
      set({ isLoadingThreads: loading });
    },

    setThreadsLoadingMore: (loading) => {
      set({ isLoadingMoreThreads: loading });
    },

    setThreadsError: (message) => {
      set({ threadsErrorMessage: message });
    },

    setCurrentPage: (page) => {
      set((state) => {
        if (state.currentPage === page) {
          return state;
        }

        return { currentPage: page };
      });
    },

    incrementPage: () => {
      set((state) => ({ currentPage: state.currentPage + 1 }));
    },

    clearThreads: () => {
      set({ threads: [], totalThreads: 0 });
    },

    setThreadsPage: ({ items, total, append }) => {
      if (!append) {
        set({ threads: items, totalThreads: total });
        return;
      }

      set((state) => {
        const nextThreads = [...state.threads];

        for (const item of items) {
          const exists = nextThreads.some((thread) => thread.id === item.id);
          if (!exists) {
            nextThreads.push(item);
          }
        }

        return {
          threads: nextThreads,
          totalThreads: total,
        };
      });
    },

    setSelectedThreadId: (threadId) => {
      set({ selectedThreadId: threadId });
    },

    selectThread: (threadId, isMobile) => {
      set((state) => {
        if (state.isSelectionControlled) {
          return {
            invalidDefaultThreadId: undefined,
            mobileDetailOpen: isMobile ? true : state.mobileDetailOpen,
          };
        }

        return {
          selectedThreadId: threadId,
          invalidDefaultThreadId: undefined,
          mobileDetailOpen: isMobile ? true : state.mobileDetailOpen,
        };
      });
    },

    setMobileDetailOpen: (open) => {
      set({ mobileDetailOpen: open });
    },

    setInvalidDefaultThreadId: (threadId) => {
      set({ invalidDefaultThreadId: threadId });
    },

    setThreadMessages: (threadId, messages) => {
      set((state) => {
        const nextExpanded = { ...state.expandedMessageIdsByThreadId };

        if (!nextExpanded[threadId] && messages.length > 0) {
          const latest = [...messages].sort((left, right) => {
            return (
              new Date(right.sentAtUtc).getTime() -
              new Date(left.sentAtUtc).getTime()
            );
          })[0];
          if (latest) {
            nextExpanded[threadId] = [latest.id];
          }
        }

        return {
          messagesByThreadId: {
            ...state.messagesByThreadId,
            [threadId]: messages,
          },
          expandedMessageIdsByThreadId: nextExpanded,
        };
      });
    },

    setThreadMessageLoading: (threadId, loading) => {
      set((state) => ({
        messageLoadingByThreadId: {
          ...state.messageLoadingByThreadId,
          [threadId]: loading,
        },
      }));
    },

    setThreadMessageError: (threadId, message) => {
      set((state) => ({
        messageErrorByThreadId: {
          ...state.messageErrorByThreadId,
          [threadId]: message,
        },
      }));
    },

    toggleMessageExpanded: (threadId, messageId) => {
      set((state) => {
        const existing = state.expandedMessageIdsByThreadId[threadId] ?? [];
        const isExpanded = existing.includes(messageId);

        return {
          expandedMessageIdsByThreadId: {
            ...state.expandedMessageIdsByThreadId,
            [threadId]: isExpanded
              ? existing.filter((value) => value !== messageId)
              : [...existing, messageId],
          },
        };
      });
    },

    openComposer: (context, initialDraft) => {
      set({
        composer: {
          open: true,
          context,
          initialDraft,
        },
      });
    },

    closeComposer: () => {
      set({
        composer: {
          open: false,
          context: { mode: 'new' },
        },
      });
    },

    setComposerSubmitting: (submitting) => {
      set({ isComposerSubmitting: submitting });
    },
  }));
}

export type EmailCenterStore = StoreApi<EmailCenterStoreState>;
