import { RollbackOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Alert, Empty, Flex, Typography, theme } from 'antd';

import { useDateFormat } from '../../../hooks';
import { AppButton } from '../../ui/button';
import {
  useEmailCenterActions,
  useEmailCenterStore,
} from '../context/email-center-store-context';
import type { EmailMessage, EmailThreadMessageRenderProps } from '../types';
import { getForwardMessageId } from '../utils/email-thread-view-helpers';
import { EmailThreadMessageDefault } from './email-thread-message-default';
import type { EmailThreadViewProps } from './email-thread-view.types';

const EMPTY_MESSAGES: EmailMessage[] = [];
const EMPTY_MESSAGE_IDS: string[] = [];

export function EmailThreadView({
  isMobileDetail,
  onCloseMobileDetail,
  onReply,
  onForward,
  onAttachmentClick,
  renderThreadMessage,
}: EmailThreadViewProps) {
  const { token } = theme.useToken();
  const { formatDateTime } = useDateFormat();

  const selectedThreadId = useEmailCenterStore(
    (state) => state.selectedThreadId
  );
  const invalidDefaultThreadId = useEmailCenterStore(
    (state) => state.invalidDefaultThreadId
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

  const expandedMessageIds = useEmailCenterStore((state) => {
    if (!state.selectedThreadId) {
      return EMPTY_MESSAGE_IDS;
    }

    return (
      state.expandedMessageIdsByThreadId[state.selectedThreadId] ??
      EMPTY_MESSAGE_IDS
    );
  });

  const messageError = useEmailCenterStore((state) => {
    if (!state.selectedThreadId) {
      return undefined;
    }

    return state.messageErrorByThreadId[state.selectedThreadId];
  });

  const messageLoading = useEmailCenterStore((state) => {
    if (!state.selectedThreadId) {
      return false;
    }

    return state.messageLoadingByThreadId[state.selectedThreadId] ?? false;
  });

  const actions = useEmailCenterActions();

  const sortedMessages = [...selectedMessages].sort((left, right) => {
    return (
      new Date(right.sentAtUtc).getTime() - new Date(left.sentAtUtc).getTime()
    );
  });
  const forwardMessageId = getForwardMessageId(
    expandedMessageIds,
    sortedMessages
  );

  if (invalidDefaultThreadId) {
    return (
      <Flex
        vertical
        justify="center"
        align="center"
        style={{
          width: '100%',
          height: '100%',
          padding: token.paddingLG,
        }}
      >
        <Alert
          type="warning"
          title="Thread not found"
          description={`The default thread ID "${invalidDefaultThreadId}" is not valid.`}
        />
      </Flex>
    );
  }

  if (!selectedThreadId) {
    return (
      <Flex
        vertical
        justify="center"
        align="center"
        style={{
          width: '100%',
          height: '100%',
          padding: token.paddingLG,
        }}
      >
        <Empty description="Select an email to view details" />
      </Flex>
    );
  }

  return (
    <Flex vertical style={{ width: '100%', height: '100%', minHeight: 0 }}>
      {/* On mobile the drawer title already shows subject + participants */}
      {!isMobileDetail && (
        <Flex
          align="center"
          style={{
            padding: token.paddingSM,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgContainer,
          }}
        >
          <Flex vertical>
            <Typography.Title level={5}>
              {selectedThread?.subject ?? sortedMessages[0]?.subject ?? 'Email'}
            </Typography.Title>
            {selectedThread && (
              <Typography.Text type="secondary">
                {selectedThread.participants
                  .map((participant) => participant.name ?? participant.email)
                  .join(', ')}
              </Typography.Text>
            )}
          </Flex>
        </Flex>
      )}

      {messageError && (
        <Alert
          type="error"
          showIcon
          title="Unable to load thread"
          description={messageError}
        />
      )}

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: token.paddingSM,
          minHeight: 0,
        }}
      >
        <Flex vertical gap={token.marginSM}>
          {messageLoading && (
            <Typography.Text type="secondary">
              Loading messages...
            </Typography.Text>
          )}

          {!messageLoading && sortedMessages.length === 0 && (
            <Empty description="No messages found for this thread" />
          )}

          {sortedMessages.map((message, index) => {
            const isLatestMessage = index === 0;
            const isExpanded = isLatestMessage
              ? true
              : expandedMessageIds.includes(message.id);

            const renderProps: EmailThreadMessageRenderProps = {
              message,
              isExpanded,
              formattedDateTime: formatDateTime(message.sentAtUtc),
              onToggle: () => {
                if (!isLatestMessage) {
                  actions.toggleMessageExpanded(selectedThreadId, message.id);
                }
              },
            };

            return (
              <div key={message.id}>
                {renderThreadMessage ? (
                  renderThreadMessage(renderProps)
                ) : (
                  <EmailThreadMessageDefault
                    message={message}
                    isExpanded={isExpanded}
                    isCollapsible={!isLatestMessage}
                    formattedDateTime={renderProps.formattedDateTime}
                    onToggle={renderProps.onToggle}
                    onAttachmentClick={onAttachmentClick}
                  />
                )}
              </div>
            );
          })}
        </Flex>
      </div>

      <Flex
        justify="start"
        gap={token.marginXS}
        style={{
          padding: token.paddingSM,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          marginTop: 'auto',
        }}
      >
        <AppButton icon={<RollbackOutlined />} onClick={onReply}>
          Reply
        </AppButton>

        <AppButton
          icon={<ShareAltOutlined />}
          disabled={!forwardMessageId}
          onClick={() => {
            if (forwardMessageId) {
              onForward(forwardMessageId);
            }
          }}
        >
          Forward
        </AppButton>
      </Flex>
    </Flex>
  );
}
