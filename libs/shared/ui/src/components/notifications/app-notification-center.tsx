// Created by Sekar Nagarajan (2026-11-13 03:20)
/**
 * AppNotificationCenter — the body of a notification drawer/popover: unread ↔ all filter,
 * "mark all as read", per-item mark-read, severity dot, category chip, timestamp and reference.
 * Host it in an AppDrawer (header bell) or a page section; it owns no data fetching.
 */
import { Segmented, Skeleton, theme, Typography } from 'antd';
import { useState } from 'react';

import { cn } from '../../utils/cn';
import { AppButton } from '../ui/button';
import type {
  AppNotificationCenterLabels,
  AppNotificationCenterProps,
  AppNotificationFilter,
  AppNotificationItem,
} from './types';

const { Text } = Typography;

const DEFAULT_LABELS: AppNotificationCenterLabels = {
  all: 'All',
  unread: 'Unread',
  markAllRead: 'Mark all as read',
  markRead: 'Mark as read',
  empty: 'No notifications yet.',
  emptyUnread: "You're all caught up.",
  reference: 'Ref',
};

function NotificationStyles() {
  const { token } = theme.useToken();
  const css = `
.sm-notif { display: flex; flex-direction: column; gap: ${token.marginSM}px; min-width: 0; }
.sm-notif__bar { display: flex; align-items: center; justify-content: space-between; gap: ${token.marginSM}px; flex-wrap: wrap; }
.sm-notif__list { list-style: none; margin: 0; padding: 0; overflow-y: auto; display: flex; flex-direction: column; }
.sm-notif__item { display: grid; grid-template-columns: ${token.controlHeightSM}px minmax(0, 1fr) auto; column-gap: ${token.marginSM}px; align-items: start; padding: ${token.paddingSM}px ${token.paddingXS}px; border-bottom: 1px solid ${token.colorBorderSecondary}; border-radius: ${token.borderRadius}px; }
.sm-notif__item:last-child { border-bottom: 0; }
.sm-notif__item--unread { background: ${token.colorPrimaryBg}; }
.sm-notif__item--clickable { cursor: pointer; }
.sm-notif__item--clickable:hover { background: ${token.colorFillAlter}; }
.sm-notif__item--unread.sm-notif__item--clickable:hover { background: ${token.colorPrimaryBgHover}; }
.sm-notif__lead { display: inline-flex; align-items: center; justify-content: center; width: ${token.controlHeightSM}px; height: ${token.controlHeightSM}px; border-radius: 50%; background: ${token.colorFillAlter}; color: var(--sm-notif-accent, ${token.colorTextSecondary}); }
.sm-notif__lead > * { color: inherit; }
.sm-notif__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sm-notif-accent, ${token.colorTextTertiary}); }
.sm-notif__item--info { --sm-notif-accent: ${token.colorInfo}; }
.sm-notif__item--success { --sm-notif-accent: ${token.colorSuccess}; }
.sm-notif__item--warning { --sm-notif-accent: ${token.colorWarning}; }
.sm-notif__item--error { --sm-notif-accent: ${token.colorError}; }
.sm-notif__body { min-width: 0; display: flex; flex-direction: column; gap: 2px; text-align: start; background: none; border: 0; padding: 0; font: inherit; color: inherit; }
.sm-notif__title-row { display: flex; align-items: center; gap: ${token.marginXS}px; min-width: 0; flex-wrap: wrap; }
.sm-notif__title { font-weight: ${token.fontWeightStrong}; color: ${token.colorText}; line-height: 1.35; min-width: 0; }
.sm-notif__chip { display: inline-flex; align-items: center; padding: 0 ${token.paddingXS}px; border-radius: ${token.borderRadiusSM}px; font-size: ${token.fontSizeSM - 1}px; font-weight: ${token.fontWeightStrong}; line-height: 1.6; background: ${token.colorFillSecondary}; color: ${token.colorTextSecondary}; white-space: nowrap; }
.sm-notif__message { color: ${token.colorText}; font-size: ${token.fontSizeSM}px; line-height: 1.45; }
.sm-notif__meta { color: ${token.colorTextTertiary}; font-size: ${token.fontSizeSM}px; line-height: 1.4; }
.sm-notif__actions { display: inline-flex; align-items: center; min-height: ${token.controlHeightSM}px; }
.sm-notif__empty { padding: ${token.paddingLG}px ${token.paddingSM}px; text-align: center; color: ${token.colorTextTertiary}; font-size: ${token.fontSizeSM}px; }
.sm-notif__skeleton { display: grid; grid-template-columns: ${token.controlHeightSM}px minmax(0, 1fr); column-gap: ${token.marginSM}px; padding: ${token.paddingSM}px ${token.paddingXS}px; }
`;
  return (
    <style precedence="sm-notifications" href="sm-notifications">
      {css}
    </style>
  );
}

export function AppNotificationCenter({
  items,
  loading = false,
  filter: filterProp,
  onFilterChange,
  onMarkRead,
  onMarkAllRead,
  onItemClick,
  labels: labelsProp,
  maxHeight,
  skeletonCount = 4,
  ariaLabel = 'Notifications',
  className,
}: AppNotificationCenterProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const unreadCount = items.filter((i) => !i.read).length;
  const [internalFilter, setInternalFilter] = useState<AppNotificationFilter>(
    unreadCount > 0 ? 'unread' : 'all'
  );
  const filter = filterProp ?? internalFilter;
  const setFilter = (next: AppNotificationFilter) => {
    if (filterProp === undefined) setInternalFilter(next);
    onFilterChange?.(next);
  };
  const visible = filter === 'unread' ? items.filter((i) => !i.read) : items;

  const activate = (item: AppNotificationItem) => {
    if (!item.read) onMarkRead?.(item);
    onItemClick?.(item);
  };

  return (
    <div className={cn('sm-notif', className)} aria-label={ariaLabel}>
      <NotificationStyles />
      <div className="sm-notif__bar">
        <Segmented
          size="small"
          value={filter}
          onChange={(value) => setFilter(value as AppNotificationFilter)}
          options={[
            {
              value: 'unread',
              label: (
                <>
                  {labels.unread}
                  {unreadCount > 0 ? ` (${unreadCount})` : ''}
                </>
              ),
            },
            { value: 'all', label: labels.all },
          ]}
          aria-label="Filter notifications"
        />
        {onMarkAllRead ? (
          <AppButton
            type="link"
            size="small"
            disabled={unreadCount === 0 || loading}
            onClick={onMarkAllRead}
          >
            {labels.markAllRead}
          </AppButton>
        ) : null}
      </div>

      {loading ? (
        <div className="sm-notif__list" aria-busy="true">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <div key={i} className="sm-notif__skeleton">
              <Skeleton.Avatar active size="small" />
              <Skeleton active title={{ width: '55%' }} paragraph={{ rows: 1, width: '85%' }} />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="sm-notif__empty" role="status">
          {filter === 'unread' && items.length > 0 ? labels.emptyUnread : labels.empty}
        </div>
      ) : (
        <ul
          className={cn('sm-notif__list', 'custom-scroll')}
          style={maxHeight !== undefined ? { maxHeight } : undefined}
        >
          {visible.map((item) => {
            const clickable = Boolean(onItemClick) || (!item.read && Boolean(onMarkRead));
            return (
              <li
                key={item.id}
                className={cn(
                  'sm-notif__item',
                  !item.read && 'sm-notif__item--unread',
                  item.severity && `sm-notif__item--${item.severity}`,
                  clickable && 'sm-notif__item--clickable'
                )}
              >
                <span className="sm-notif__lead" aria-hidden>
                  {item.icon ?? <span className="sm-notif__dot" />}
                </span>
                {clickable ? (
                  <button
                    type="button"
                    className="sm-notif__body"
                    onClick={() => activate(item)}
                    aria-label={
                      typeof item.title === 'string'
                        ? `${item.title}${item.read ? '' : ' (unread)'}`
                        : undefined
                    }
                  >
                    <NotificationBody item={item} labels={labels} />
                  </button>
                ) : (
                  <div className="sm-notif__body">
                    <NotificationBody item={item} labels={labels} />
                  </div>
                )}
                <span className="sm-notif__actions">
                  {!item.read && onMarkRead ? (
                    <AppButton
                      type="text"
                      size="small"
                      onClick={() => onMarkRead(item)}
                      aria-label={typeof labels.markRead === 'string' ? labels.markRead : undefined}
                    >
                      {labels.markRead}
                    </AppButton>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function NotificationBody({
  item,
  labels,
}: {
  item: AppNotificationItem;
  labels: AppNotificationCenterLabels;
}) {
  return (
    <>
      <span className="sm-notif__title-row">
        <Text className="sm-notif__title">{item.title}</Text>
        {item.categoryLabel ? <span className="sm-notif__chip">{item.categoryLabel}</span> : null}
      </span>
      {item.message ? <span className="sm-notif__message">{item.message}</span> : null}
      {item.timestamp || item.reference ? (
        <span className="sm-notif__meta">
          {item.timestamp}
          {item.timestamp && item.reference ? ' • ' : null}
          {item.reference ? (
            <>
              {labels.reference}: {item.reference}
            </>
          ) : null}
        </span>
      ) : null}
    </>
  );
}
