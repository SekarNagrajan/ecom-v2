import { EmailCenterContent } from './components/email-center-content';
import {
  DEFAULT_ATTACHMENT_CONSTRAINTS,
  DEFAULT_DRAFT_AUTOSAVE_DEBOUNCE_MS,
  DEFAULT_EMAIL_PAGE_SIZE,
  DEFAULT_EMAIL_SEARCH_DEBOUNCE_MS,
} from './constants';
import { EmailCenterStoreProvider } from './context/email-center-store-context';
import type { AppEmailCenterProps } from './types';
import { resolveAttachmentConstraints } from './utils/email-compose-helpers';

export function AppEmailCenter(props: AppEmailCenterProps) {
  const {
    defaultTab = 'inbox',
    listLoadUi = 'progressive',
    progressiveLoadTrigger = 'infinite-scroll',
    pageSize = DEFAULT_EMAIL_PAGE_SIZE,
    searchDebounceMs = DEFAULT_EMAIL_SEARCH_DEBOUNCE_MS,
    draftAutoSaveDebounceMs = DEFAULT_DRAFT_AUTOSAVE_DEBOUNCE_MS,
    selectedThreadId,
    attachmentConstraints,
    ...rest
  } = props;

  const resolvedAttachmentConstraints = resolveAttachmentConstraints(
    attachmentConstraints,
    DEFAULT_ATTACHMENT_CONSTRAINTS
  );

  const initialState = {
    activeTab: defaultTab,
    listLoadUi,
    progressiveLoadTrigger,
    pageSize,
    searchDebounceMs,
    draftAutoSaveDebounceMs,
    isSelectionControlled: selectedThreadId !== undefined,
  };

  return (
    <EmailCenterStoreProvider initialState={initialState}>
      <EmailCenterContent
        {...rest}
        defaultTab={defaultTab}
        listLoadUi={listLoadUi}
        progressiveLoadTrigger={progressiveLoadTrigger}
        pageSize={pageSize}
        searchDebounceMs={searchDebounceMs}
        draftAutoSaveDebounceMs={draftAutoSaveDebounceMs}
        selectedThreadId={selectedThreadId}
        attachmentConstraints={resolvedAttachmentConstraints}
      />
    </EmailCenterStoreProvider>
  );
}
