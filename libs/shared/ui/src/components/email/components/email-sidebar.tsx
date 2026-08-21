import { SearchOutlined, SendOutlined } from '@ant-design/icons';
import { Alert, Empty, Flex, Input, Pagination, Spin, theme } from 'antd';
import type { UIEvent } from 'react';

import { useAntdBreakpoint, useDateFormat } from '../../../hooks';
import { AppButton } from '../../ui/button';
import { AppTabs } from '../../ui/tabs';
import {
  useEmailCenterActions,
  useEmailCenterStore,
} from '../context/email-center-store-context';
import type { EmailTab, EmailThreadListItemRenderProps } from '../types';
import type { EmailSidebarProps } from './email-sidebar.types';
import { EmailThreadListItemDefault } from './email-thread-list-item-default';

export function EmailSidebar({
  onNewEmail,
  onThreadSelect,
  renderThreadListItem,
}: EmailSidebarProps) {
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();
  const { formatDateTime } = useDateFormat();

  const activeTab = useEmailCenterStore((state) => state.activeTab);
  const searchInputValue = useEmailCenterStore(
    (state) => state.searchInputValue
  );
  const threads = useEmailCenterStore((state) => state.threads);
  const selectedThreadId = useEmailCenterStore(
    (state) => state.selectedThreadId
  );
  const currentPage = useEmailCenterStore((state) => state.currentPage);
  const pageSize = useEmailCenterStore((state) => state.pageSize);
  const totalThreads = useEmailCenterStore((state) => state.totalThreads);
  const isLoadingThreads = useEmailCenterStore(
    (state) => state.isLoadingThreads
  );
  const isLoadingMoreThreads = useEmailCenterStore(
    (state) => state.isLoadingMoreThreads
  );
  const threadsErrorMessage = useEmailCenterStore(
    (state) => state.threadsErrorMessage
  );
  const listLoadUi = useEmailCenterStore((state) => state.listLoadUi);
  const progressiveLoadTrigger = useEmailCenterStore(
    (state) => state.progressiveLoadTrigger
  );

  const actions = useEmailCenterActions();

  const canLoadMore =
    listLoadUi === 'progressive' &&
    !isLoadingThreads &&
    !isLoadingMoreThreads &&
    threads.length < totalThreads;

  const shouldShowPagination = listLoadUi === 'pagination';
  const shouldShowLoadMoreButton =
    listLoadUi === 'progressive' &&
    progressiveLoadTrigger === 'load-more-button';

  const handleThreadListScroll = (event: UIEvent<HTMLDivElement>) => {
    if (
      listLoadUi !== 'progressive' ||
      progressiveLoadTrigger !== 'infinite-scroll' ||
      !canLoadMore ||
      isLoadingMoreThreads
    ) {
      return;
    }

    const target = event.currentTarget;
    const scrollThreshold = token.controlHeight * 2;
    const hasReachedBottom =
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - scrollThreshold;

    if (hasReachedBottom) {
      actions.incrementPage();
    }
  };

  return (
    <Flex
      vertical
      gap={token.marginSM}
      style={{
        width: '100%',
        height: '100%',
        padding: token.paddingSM,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
      }}
    >
      <Flex vertical gap={token.marginXS}>
        <Flex gap="middle">
          <Input
            value={searchInputValue}
            onChange={(event) =>
              actions.setSearchInputValue(event.target.value)
            }
            placeholder="Search emails"
            prefix={<SearchOutlined />}
            suffix={isLoadingThreads ? <Spin size="small" /> : undefined}
          />

          <AppButton
            type="primary"
            icon={<SendOutlined />}
            onClick={onNewEmail}
          >
            {isMobile ? '' : 'New Email'}
          </AppButton>
        </Flex>

        <AppTabs
          activeKey={activeTab}
          onChange={(key: string) => actions.setActiveTab(key as EmailTab)}
          items={[
            { key: 'inbox', label: 'Inbox' },
            { key: 'draft', label: 'Draft' },
          ]}
          styles={{ header: { marginBottom: token.marginXS } }}
        />
      </Flex>

      {threadsErrorMessage && (
        <Alert
          type="error"
          showIcon
          title="Unable to load emails"
          description={threadsErrorMessage}
        />
      )}

      <div
        onScroll={handleThreadListScroll}
        style={{
          overflow: 'auto',
          minHeight: 0,
          flex: 1,
        }}
      >
        <Flex vertical gap={token.marginXS}>
          {threads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;

            const itemProps: EmailThreadListItemRenderProps = {
              thread,
              isSelected,
              formattedDate: formatDateTime(thread.lastMessageAtUtc, {
                relative: true,
              }),
              onSelect: () => {
                actions.selectThread(thread.id, isMobile);
                onThreadSelect(thread.id);
              },
            };

            return (
              <div key={thread.id}>
                {renderThreadListItem ? (
                  renderThreadListItem(itemProps)
                ) : (
                  <EmailThreadListItemDefault {...itemProps} />
                )}
              </div>
            );
          })}

          {!isLoadingThreads && threads.length === 0 && (
            <Empty
              description="No emails found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          {isLoadingThreads && (
            <Flex justify="center" style={{ padding: token.paddingSM }}>
              <Spin />
            </Flex>
          )}

          {listLoadUi === 'progressive' && isLoadingMoreThreads && (
            <Flex justify="center" style={{ padding: token.paddingXS }}>
              <Spin size="small" />
            </Flex>
          )}

          {shouldShowLoadMoreButton && canLoadMore && (
            <Flex justify="center" style={{ padding: token.paddingXS }}>
              <AppButton
                loading={isLoadingMoreThreads}
                onClick={() => actions.incrementPage()}
              >
                Load more
              </AppButton>
            </Flex>
          )}
        </Flex>
      </div>

      {shouldShowPagination && totalThreads > pageSize && (
        <Pagination
          size="small"
          align="center"
          current={currentPage}
          pageSize={pageSize}
          total={totalThreads}
          onChange={(page) => actions.setCurrentPage(page)}
          showSizeChanger={false}
        />
      )}
    </Flex>
  );
}
