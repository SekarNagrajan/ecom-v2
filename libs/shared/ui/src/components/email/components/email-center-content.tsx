import { Flex, Typography, theme } from 'antd';
import { useEffect, useRef } from 'react';

import {
  useAntdBreakpoint,
  useDateFormat,
  useDebouncedCallback,
} from '../../../hooks';
import { AppDrawer } from '../../ui/dialog';
import { DEFAULT_ATTACHMENT_CONSTRAINTS } from '../constants';
import {
  useEmailCenterActions,
  useEmailCenterStore,
  useEmailCenterStoreApi,
} from '../context/email-center-store-context';
import type {
  AppEmailCenterProps,
  EmailCenterClientProps,
  EmailCenterServerProps,
  EmailDraftContext,
  EmailDraftInput,
  EmailMessage,
} from '../types';
import { filterAndSortClientThreads } from '../utils/email-client-helpers';
import {
  buildForwardSubject,
  buildReplyQuoteHtml,
  buildReplySubject,
  getLatestMessage,
  resolveAttachmentConstraints,
} from '../utils/email-compose-helpers';
import { EmailComposerModal } from './email-composer-modal';
import { EmailSidebar } from './email-sidebar';
import { EmailThreadView } from './email-thread-view';

const EMPTY_MESSAGES: EmailMessage[] = [];

export function EmailCenterContent(props: AppEmailCenterProps) {
  const {
    mode,
    defaultThreadId,
    selectedThreadId: controlledSelectedThreadId,
    onSelectedThreadIdChange,
    invalidDefaultThreadBehavior = 'show-error',
    attachmentConstraints,
    recipientOptions = [],
    onSendNewEmail,
    onSendReply,
    onSendForward,
    onDraftChange,
    onDraftAutoSaveRequested,
    onEmailOpen,
    onSearch,
    onTabChange,
    onComposeOpen,
    onComposeClose,
    onThreadAttachmentClick,
    renderThreadListItem,
    renderThreadMessage,
    enableMobileBackClose = true,
    composerAudioDictation,
    composerDictationTooltip,
    ...modeProps
  } = props;

  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();
  const { formatDateTime } = useDateFormat();

  const activeTab = useEmailCenterStore((state) => state.activeTab);
  const searchInputValue = useEmailCenterStore(
    (state) => state.searchInputValue
  );
  const searchValue = useEmailCenterStore((state) => state.searchValue);
  const listLoadUi = useEmailCenterStore((state) => state.listLoadUi);
  const pageSize = useEmailCenterStore((state) => state.pageSize);
  const currentPage = useEmailCenterStore((state) => state.currentPage);
  const selectedThreadId = useEmailCenterStore(
    (state) => state.selectedThreadId
  );
  const mobileDetailOpen = useEmailCenterStore(
    (state) => state.mobileDetailOpen
  );
  const selectedThread = useEmailCenterStore((state) =>
    state.threads.find((thread) => thread.id === state.selectedThreadId)
  );

  const selectedMessages = useEmailCenterStore((state) => {
    if (!state.selectedThreadId) {
      return EMPTY_MESSAGES;
    }

    return state.messagesByThreadId[state.selectedThreadId] ?? EMPTY_MESSAGES;
  });

  const composer = useEmailCenterStore((state) => state.composer);

  const actions = useEmailCenterActions();
  const storeApi = useEmailCenterStoreApi();
  const resolvedAttachmentConstraints = resolveAttachmentConstraints(
    attachmentConstraints,
    DEFAULT_ATTACHMENT_CONSTRAINTS
  );

  const clientModeProps =
    mode === 'client'
      ? (modeProps as Pick<
          EmailCenterClientProps,
          'clientThreads' | 'clientMessagesByThreadId' | 'onFetchThreadMessages'
        >)
      : undefined;

  const serverModeProps =
    mode === 'server'
      ? (modeProps as Pick<
          EmailCenterServerProps,
          'onFetchThreads' | 'onFetchThreadMessages'
        >)
      : undefined;

  const listRequestIdRef = useRef(0);
  const messageRequestIdRef = useRef<Record<string, number>>({});
  const defaultThreadAppliedRef = useRef<string | undefined>(undefined);
  const mobileHistoryStatePushedRef = useRef(false);
  const previousComposerRef = useRef(composer);
  const previousTabRef = useRef(activeTab);

  useEffect(() => {
    actions.setSelectionControlled(controlledSelectedThreadId !== undefined);

    if (controlledSelectedThreadId !== undefined) {
      actions.setSelectedThreadId(controlledSelectedThreadId);
    }
  }, [actions, controlledSelectedThreadId]);

  const applySearchDebounced = useDebouncedCallback(
    (value: string) => {
      actions.applySearchValue(value);
      onSearch?.(value);
    },
    useEmailCenterStore((state) => state.searchDebounceMs)
  );

  useEffect(() => {
    applySearchDebounced(searchInputValue);
  }, [searchInputValue, applySearchDebounced]);

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  useEffect(() => {
    actions.setCurrentPage(1);
  }, [actions, mode, activeTab, searchValue, listLoadUi, pageSize]);

  useEffect(() => {
    if (previousTabRef.current === activeTab) {
      return;
    }

    if (controlledSelectedThreadId === undefined) {
      actions.setSelectedThreadId(undefined);
    }

    onSelectedThreadIdChange?.(undefined);
    previousTabRef.current = activeTab;
  }, [
    actions,
    activeTab,
    controlledSelectedThreadId,
    onSelectedThreadIdChange,
  ]);

  useEffect(() => {
    if (mode !== 'client' || !clientModeProps) {
      return;
    }

    const nextThreads = filterAndSortClientThreads(
      clientModeProps.clientThreads,
      activeTab,
      searchValue
    );

    actions.setThreadsPage({
      items: nextThreads,
      total: nextThreads.length,
      append: false,
    });
    actions.setThreadsError(undefined);
    actions.setThreadsLoading(false);
    actions.setThreadsLoadingMore(false);
  }, [actions, mode, clientModeProps, activeTab, searchValue]);

  useEffect(() => {
    if (mode !== 'server' || !serverModeProps) {
      return;
    }

    const requestId = listRequestIdRef.current + 1;
    listRequestIdRef.current = requestId;

    const append = currentPage > 1 && listLoadUi === 'progressive';

    if (append) {
      actions.setThreadsLoadingMore(true);
    } else {
      actions.setThreadsLoading(true);
    }

    actions.setThreadsError(undefined);

    void serverModeProps
      .onFetchThreads({
        tab: activeTab,
        search: searchValue,
        page: currentPage,
        pageSize,
      })
      .then((response) => {
        if (listRequestIdRef.current !== requestId) {
          return;
        }

        actions.setThreadsPage({
          items: response.items,
          total: response.total,
          append,
        });
      })
      .catch((error: unknown) => {
        if (listRequestIdRef.current !== requestId) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Unexpected error while loading emails.';
        actions.setThreadsError(message);
      })
      .finally(() => {
        if (listRequestIdRef.current !== requestId) {
          return;
        }

        actions.setThreadsLoading(false);
        actions.setThreadsLoadingMore(false);
      });
  }, [
    actions,
    mode,
    serverModeProps,
    activeTab,
    searchValue,
    currentPage,
    pageSize,
    listLoadUi,
  ]);

  useEffect(() => {
    if (!defaultThreadId) {
      return;
    }

    if (defaultThreadAppliedRef.current === defaultThreadId) {
      return;
    }

    if (mode === 'client') {
      const matchedThread = clientModeProps?.clientThreads.find(
        (thread) => thread.id === defaultThreadId
      );

      if (!matchedThread) {
        if (invalidDefaultThreadBehavior === 'show-error') {
          actions.setInvalidDefaultThreadId(defaultThreadId);
        }

        defaultThreadAppliedRef.current = defaultThreadId;
        return;
      }

      actions.setActiveTab(matchedThread.tab);
      actions.setInvalidDefaultThreadId(undefined);

      if (controlledSelectedThreadId === undefined) {
        actions.setSelectedThreadId(matchedThread.id);
      }

      if (isMobile) {
        actions.setMobileDetailOpen(true);
      }

      onSelectedThreadIdChange?.(matchedThread.id);
      defaultThreadAppliedRef.current = defaultThreadId;
      return;
    }

    actions.setInvalidDefaultThreadId(undefined);

    if (controlledSelectedThreadId === undefined) {
      actions.setSelectedThreadId(defaultThreadId);
    }

    if (isMobile) {
      actions.setMobileDetailOpen(true);
    }

    onSelectedThreadIdChange?.(defaultThreadId);
    defaultThreadAppliedRef.current = defaultThreadId;
  }, [
    actions,
    mode,
    clientModeProps,
    defaultThreadId,
    invalidDefaultThreadBehavior,
    controlledSelectedThreadId,
    isMobile,
    onSelectedThreadIdChange,
  ]);

  useEffect(() => {
    if (!selectedThreadId) {
      return;
    }

    onEmailOpen?.({ threadId: selectedThreadId, thread: selectedThread });
  }, [selectedThreadId, selectedThread, onEmailOpen]);

  useEffect(() => {
    if (!selectedThreadId) {
      return;
    }

    const hasCachedMessages = Boolean(
      storeApi.getState().messagesByThreadId[selectedThreadId]
    );

    if (hasCachedMessages) {
      return;
    }

    if (
      mode === 'client' &&
      clientModeProps?.clientMessagesByThreadId?.[selectedThreadId]
    ) {
      actions.setThreadMessages(
        selectedThreadId,
        clientModeProps.clientMessagesByThreadId[selectedThreadId]
      );
      return;
    }

    const messageFetcher =
      mode === 'server'
        ? serverModeProps?.onFetchThreadMessages
        : clientModeProps?.onFetchThreadMessages;

    if (!messageFetcher) {
      return;
    }

    const requestId = (messageRequestIdRef.current[selectedThreadId] ?? 0) + 1;
    messageRequestIdRef.current[selectedThreadId] = requestId;

    actions.setThreadMessageLoading(selectedThreadId, true);
    actions.setThreadMessageError(selectedThreadId, undefined);

    void messageFetcher(selectedThreadId)
      .then((messages) => {
        if (messageRequestIdRef.current[selectedThreadId] !== requestId) {
          return;
        }

        actions.setThreadMessages(selectedThreadId, messages);
      })
      .catch((error: unknown) => {
        if (messageRequestIdRef.current[selectedThreadId] !== requestId) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Unexpected error while loading the selected thread.';
        actions.setThreadMessageError(selectedThreadId, message);
      })
      .finally(() => {
        if (messageRequestIdRef.current[selectedThreadId] !== requestId) {
          return;
        }

        actions.setThreadMessageLoading(selectedThreadId, false);
      });
  }, [
    actions,
    mode,
    clientModeProps,
    serverModeProps,
    selectedThreadId,
    storeApi,
  ]);

  useEffect(() => {
    if (!isMobile || !enableMobileBackClose || !mobileDetailOpen) {
      return;
    }

    if (!mobileHistoryStatePushedRef.current) {
      window.history.pushState({ emailDetail: true }, '');
      mobileHistoryStatePushedRef.current = true;
    }

    const handlePopState = () => {
      mobileHistoryStatePushedRef.current = false;
      actions.setMobileDetailOpen(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [actions, isMobile, enableMobileBackClose, mobileDetailOpen]);

  useEffect(() => {
    const previousComposer = previousComposerRef.current;

    if (!previousComposer.open && composer.open) {
      onComposeOpen?.(composer.context);
    }

    if (previousComposer.open && !composer.open) {
      onComposeClose?.(previousComposer.context);
    }

    previousComposerRef.current = composer;
  }, [composer, onComposeOpen, onComposeClose]);

  const closeMobileDetail = () => {
    if (
      isMobile &&
      enableMobileBackClose &&
      mobileHistoryStatePushedRef.current
    ) {
      window.history.back();
      return;
    }

    mobileHistoryStatePushedRef.current = false;
    actions.setMobileDetailOpen(false);
  };

  const openReplyComposer = () => {
    if (!selectedThreadId) {
      return;
    }

    const latestMessage = getLatestMessage(selectedMessages);

    const formattedDate = latestMessage
      ? formatDateTime(latestMessage.sentAtUtc)
      : formatDateTime(new Date().toISOString());

    const replyQuote = latestMessage
      ? buildReplyQuoteHtml({
          formattedDateTime: formattedDate,
          senderNameOrEmail:
            latestMessage.from.name ?? latestMessage.from.email,
          originalBodyHtml: latestMessage.bodyHtml,
        })
      : '';

    const draft: EmailDraftInput = {
      threadId: selectedThreadId,
      to: latestMessage ? [latestMessage.from.email] : [],
      cc: [],
      bcc: [],
      subject: buildReplySubject(
        latestMessage?.subject ?? selectedThread?.subject ?? ''
      ),
      bodyHtml: replyQuote,
      attachments: [],
    };

    const context: EmailDraftContext = {
      mode: 'reply',
      threadId: selectedThreadId,
    };

    actions.openComposer(context, draft);
  };

  const openForwardComposer = (messageId: string) => {
    const sourceMessage = selectedMessages.find(
      (message) => message.id === messageId
    );

    if (!sourceMessage) {
      return;
    }

    const forwardedBody = buildReplyQuoteHtml({
      formattedDateTime: formatDateTime(sourceMessage.sentAtUtc),
      senderNameOrEmail: sourceMessage.from.name ?? sourceMessage.from.email,
      originalBodyHtml: sourceMessage.bodyHtml,
    });

    const draft: EmailDraftInput = {
      threadId: sourceMessage.threadId,
      to: [],
      cc: [],
      bcc: [],
      subject: buildForwardSubject(sourceMessage.subject),
      bodyHtml: forwardedBody,
      attachments: [],
    };

    const context: EmailDraftContext = {
      mode: 'forward',
      threadId: sourceMessage.threadId,
      messageId,
    };

    actions.openComposer(context, draft);
  };

  const handleSubmitComposer = async (draft: EmailDraftInput) => {
    actions.setComposerSubmitting(true);

    try {
      if (composer.context.mode === 'new' && onSendNewEmail) {
        await onSendNewEmail(draft);
      }

      if (
        composer.context.mode === 'reply' &&
        composer.context.threadId &&
        onSendReply
      ) {
        await onSendReply({
          threadId: composer.context.threadId,
          draft,
        });
      }

      if (
        composer.context.mode === 'forward' &&
        composer.context.messageId &&
        onSendForward
      ) {
        await onSendForward({
          messageId: composer.context.messageId,
          draft,
        });
      }

      actions.closeComposer();
    } finally {
      actions.setComposerSubmitting(false);
    }
  };

  return (
    <>
      <Flex
        style={{
          width: '100%',
          height: '100%',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
          background: token.colorBgContainer,
        }}
      >
        <div
          style={{
            width: isMobile ? '100%' : '30%',
            minWidth: isMobile ? undefined : token.controlHeightLG * 9,
            height: '100%',
          }}
        >
          <EmailSidebar
            onNewEmail={() => actions.openComposer({ mode: 'new' })}
            onThreadSelect={(threadId) => {
              onSelectedThreadIdChange?.(threadId);
            }}
            renderThreadListItem={renderThreadListItem}
          />
        </div>

        {!isMobile && (
          <div style={{ width: '70%', height: '100%' }}>
            <EmailThreadView
              isMobileDetail={false}
              onCloseMobileDetail={closeMobileDetail}
              onReply={openReplyComposer}
              onForward={openForwardComposer}
              onAttachmentClick={onThreadAttachmentClick}
              renderThreadMessage={renderThreadMessage}
            />
          </div>
        )}
      </Flex>

      {isMobile && (
        <AppDrawer
          open={mobileDetailOpen}
          onClose={closeMobileDetail}
          dialogSize="fullscreen"
          styles={{ body: { padding: token.paddingXS } }}
          title={
            selectedThread ? (
              <Flex vertical gap={0}>
                <Typography.Text strong>
                  {selectedThread.subject}
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM }}
                >
                  {selectedThread.participants
                    .map((p) => p.name ?? p.email)
                    .join(', ')}
                </Typography.Text>
              </Flex>
            ) : (
              'Email'
            )
          }
        >
          <EmailThreadView
            isMobileDetail
            onCloseMobileDetail={closeMobileDetail}
            onReply={openReplyComposer}
            onForward={openForwardComposer}
            onAttachmentClick={onThreadAttachmentClick}
            renderThreadMessage={renderThreadMessage}
          />
        </AppDrawer>
      )}

      <EmailComposerModal
        recipientOptions={recipientOptions}
        attachmentConstraints={resolvedAttachmentConstraints}
        onSubmit={handleSubmitComposer}
        onDraftChange={onDraftChange}
        onDraftAutoSaveRequested={onDraftAutoSaveRequested}
        audioDictation={composerAudioDictation}
        dictationTooltip={composerDictationTooltip}
      />
    </>
  );
}
