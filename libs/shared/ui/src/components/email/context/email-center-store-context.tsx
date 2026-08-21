import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';

import {
  createEmailCenterStore,
  type EmailCenterStore,
  type EmailCenterStoreState,
} from '../stores/email-center-store';

const EmailCenterStoreContext = createContext<EmailCenterStore | null>(null);

interface EmailCenterStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<EmailCenterStoreState>;
}

export function EmailCenterStoreProvider({
  children,
  initialState,
}: EmailCenterStoreProviderProps) {
  const [store] = useState(() => createEmailCenterStore(initialState));

  return (
    <EmailCenterStoreContext value={store}>{children}</EmailCenterStoreContext>
  );
}

function useEmailCenterStoreContext(): EmailCenterStore {
  const store = useContext(EmailCenterStoreContext);

  if (!store) {
    throw new Error(
      'Email center store hooks must be used within EmailCenterStoreProvider.'
    );
  }

  return store;
}

export function useEmailCenterStore<T>(
  selector: (state: EmailCenterStoreState) => T
): T {
  return useStore(useEmailCenterStoreContext(), selector);
}

export function useEmailCenterStoreApi(): EmailCenterStore {
  return useEmailCenterStoreContext();
}

type EmailCenterStoreActions = Pick<
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
>;

export function useEmailCenterActions(): EmailCenterStoreActions {
  const store = useEmailCenterStoreContext();
  const [actions] = useState<EmailCenterStoreActions>(() => {
    const state = store.getState();

    return {
      setSelectionControlled: state.setSelectionControlled,
      setActiveTab: state.setActiveTab,
      setSearchInputValue: state.setSearchInputValue,
      applySearchValue: state.applySearchValue,
      setListConfig: state.setListConfig,
      setThreadsLoading: state.setThreadsLoading,
      setThreadsLoadingMore: state.setThreadsLoadingMore,
      setThreadsError: state.setThreadsError,
      setCurrentPage: state.setCurrentPage,
      incrementPage: state.incrementPage,
      clearThreads: state.clearThreads,
      setThreadsPage: state.setThreadsPage,
      setSelectedThreadId: state.setSelectedThreadId,
      selectThread: state.selectThread,
      setMobileDetailOpen: state.setMobileDetailOpen,
      setInvalidDefaultThreadId: state.setInvalidDefaultThreadId,
      setThreadMessages: state.setThreadMessages,
      setThreadMessageLoading: state.setThreadMessageLoading,
      setThreadMessageError: state.setThreadMessageError,
      toggleMessageExpanded: state.toggleMessageExpanded,
      openComposer: state.openComposer,
      closeComposer: state.closeComposer,
      setComposerSubmitting: state.setComposerSubmitting,
    };
  });

  return actions;
}
