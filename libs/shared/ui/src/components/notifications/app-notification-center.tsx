// Modified by Sekar Nagarajan (2026-11-16 14:50) — reference number view-only
/**
 * AppNotificationCenter — notification list body for drawer or 380px bell popover.
 * Owns filter UI, row chrome, mark-read helpers. Hosts own data fetching.
 */
import { Alert, Segmented, Skeleton, theme, Typography } from 'antd';
import { useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react';

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
  emptyFiltered: 'No {category} notifications.',
  showAll: 'Show all',
  reference: 'Ref',
  retry: 'Retry',
};

function NotificationStyles() {
  const { token } = theme.useToken();
  const radiusPopover = token.borderRadiusLG + 4;
  const css = `
.sm-notif { display: flex; flex-direction: column; min-width: 0; min-height: 0; background: ${token.colorBgElevated}; }
.sm-notif--popover { width: 100%; height: 100%; max-height: inherit; overflow: hidden; }
.sm-notif__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 16px 12px; flex-shrink: 0; }
.sm-notif__title { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; color: ${token.colorText}; }
.sm-notif__mark-all { font-size: 13px; font-weight: 500; color: ${token.colorPrimaryText}; white-space: nowrap; padding: 0; height: auto; }
.sm-notif__mark-all:disabled { color: ${token.colorTextQuaternary}; }
.sm-notif__bar { display: flex; align-items: center; justify-content: space-between; gap: ${token.marginSM}px; flex-wrap: wrap; padding: 0 16px 12px; }
.sm-notif__chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; border-bottom: 1px solid ${token.colorSplit}; flex-shrink: 0; }
.sm-notif__chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 14px; font-size: 12px; font-weight: 500; line-height: 1; border: 1px solid ${token.colorBorderSecondary}; background: ${token.colorBgContainer}; color: ${token.colorTextSecondary}; cursor: pointer; }
.sm-notif__chip:hover { border-color: ${token.colorPrimaryBorder}; color: ${token.colorPrimaryText}; }
.sm-notif__chip--selected { background: ${token.colorPrimaryBg}; border-color: ${token.colorPrimaryBorder}; color: ${token.colorPrimaryText}; }
.sm-notif__chip-count { opacity: 0.7; font-variant-numeric: tabular-nums; }
.sm-notif__list { list-style: none; margin: 0; padding: 4px 0; overflow-y: auto; display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
.sm-notif--drawer .sm-notif__list { gap: ${token.marginSM}px; padding: 0 ${token.paddingSM}px; }
.sm-notif__item { display: grid; align-items: start; transition: background-color 0.15s ease; }
@media (prefers-reduced-motion: reduce) {
  .sm-notif__item { transition: none; }
}
.sm-notif--popover .sm-notif__item { grid-template-columns: 8px 28px minmax(0, 1fr); column-gap: 10px; padding: 12px 16px 12px 10px; background: transparent; border: 0; border-radius: 0; }
.sm-notif--popover .sm-notif__item:hover { background: ${token.colorFillQuaternary}; }
.sm-notif--drawer .sm-notif__item { grid-template-columns: 28px minmax(0, 1fr); column-gap: 10px; padding: 12px; background: ${token.colorBgContainer}; border: 0; border-radius: ${token.borderRadiusLG}px; }
.sm-notif--drawer .sm-notif__item:hover { background: ${token.colorFillQuaternary}; }
.sm-notif__item--clickable { cursor: pointer; }
.sm-notif__unread-dot { width: 6px; height: 6px; margin-top: 11px; border-radius: 3px; background: ${token.colorPrimary}; visibility: hidden; justify-self: center; }
.sm-notif__item--unread .sm-notif__unread-dot { visibility: visible; }
.sm-notif__lead { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; flex-shrink: 0; border-radius: 50%; background: var(--sm-notif-lead-bg, ${token.colorInfoBg}); color: var(--sm-notif-accent, ${token.colorInfo}); }
.sm-notif__lead > * { color: inherit; }
.sm-notif__dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.sm-notif__item--info { --sm-notif-accent: ${token.colorInfo}; --sm-notif-lead-bg: ${token.colorInfoBg}; }
.sm-notif__item--success { --sm-notif-accent: ${token.colorSuccess}; --sm-notif-lead-bg: ${token.colorSuccessBg}; }
.sm-notif__item--warning { --sm-notif-accent: ${token.colorWarningText}; --sm-notif-lead-bg: ${token.colorWarningBg}; }
.sm-notif__item--error { --sm-notif-accent: ${token.colorError}; --sm-notif-lead-bg: ${token.colorErrorBg}; }
.sm-notif__body { min-width: 0; display: flex; flex-direction: column; gap: 2px; width: 100%; }
.sm-notif__hit { min-width: 0; display: flex; flex-direction: column; gap: 2px; text-align: start; background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: inherit; width: 100%; }
.sm-notif__title-row { display: flex; align-items: baseline; gap: 8px; min-width: 0; width: 100%; }
.sm-notif__title { font-size: 14px; line-height: 20px; font-weight: 500; color: ${token.colorText}; min-width: 0; flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sm-notif__item--unread .sm-notif__title { font-weight: 600; }
.sm-notif__time { flex: none; font-size: 12px; line-height: 20px; color: ${token.colorTextTertiary}; white-space: nowrap; }
.sm-notif__message { color: ${token.colorTextSecondary}; font-size: 13px; line-height: 1.45; margin-top: 2px; }
.sm-notif__meta-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; min-width: 0; }
.sm-notif__meta { min-width: 0; flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: ${token.colorTextTertiary}; font-size: 12px; line-height: 1.4; font-variant-numeric: tabular-nums; }
.sm-notif__meta-ref { font-variant-numeric: tabular-nums; color: ${token.colorPrimaryText}; font-weight: 500; }
.sm-notif__cta { display: inline-flex; align-items: center; gap: 4px; flex: none; height: 24px; padding: 0 8px; border-radius: 6px; border: 1px solid ${token.colorBorder}; background: ${token.colorBgContainer}; font-size: 12px; font-weight: 500; line-height: 1; color: ${token.colorText}; white-space: nowrap; cursor: pointer; }
.sm-notif__cta:hover,
.sm-notif__cta:focus-visible { border-color: ${token.colorPrimary}; color: ${token.colorPrimaryText}; outline: none; box-shadow: 0 0 0 2px ${token.controlOutline}; }
.sm-notif__cta-arrow { width: 12px; height: 12px; flex: none; }
.sm-notif__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.sm-notif__empty { padding: 48px 16px 24px; text-align: center; color: ${token.colorTextTertiary}; font-size: 13px; }
.sm-notif__empty-action { margin-top: 8px; }
.sm-notif__error { padding: 12px 16px; }
.sm-notif__footer { display: flex; align-items: center; justify-content: center; padding: 10px 16px; border-top: 1px solid ${token.colorSplit}; flex-shrink: 0; }
.sm-notif__footer .ant-btn-link,
.sm-notif__footer .sm-app-button { font-size: 13px; font-weight: 500; color: ${token.colorPrimaryText}; }
.sm-notif__skeleton { display: grid; grid-template-columns: 8px 28px minmax(0, 1fr); column-gap: 10px; align-items: start; padding: 12px 16px 12px 10px; }
.sm-notif--drawer .sm-notif__skeleton { grid-template-columns: 28px minmax(0, 1fr); padding: 12px; }
.sm-notif--popover { border-radius: ${radiusPopover}px; box-shadow: none; }
html.app-header-notifications-open,
body.app-header-notifications-open { overflow: hidden !important; }
html.app-header-notifications-open .app-content-main { overflow: hidden !important; }
`;
  return (
    <style precedence="sm-notifications" href="sm-notifications">
      {css}
    </style>
  );
}

function CtaArrow() {
  return (
    <svg className="sm-notif__cta-arrow" viewBox="0 0 12 12" aria-hidden focusable="false">
      <path
        d="M2.5 6h7M6.5 3l3 3-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
  onAction,
  labels: labelsProp,
  maxHeight,
  skeletonCount = 4,
  ariaLabel = 'Notifications',
  className,
  variant = 'drawer',
  categoryFilter = false,
  categories,
  categoryKey: categoryKeyProp,
  onCategoryChange,
  footer,
  error = false,
  onRetry,
}: AppNotificationCenterProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const isPopover = variant === 'popover';
  const unreadCount = items.filter((i) => !i.read).length;

  const [internalFilter, setInternalFilter] = useState<AppNotificationFilter>(
    isPopover ? 'all' : unreadCount > 0 ? 'unread' : 'all'
  );
  const filter = filterProp ?? internalFilter;
  const setFilter = (next: AppNotificationFilter) => {
    if (filterProp === undefined) setInternalFilter(next);
    onFilterChange?.(next);
  };

  const [internalCategory, setInternalCategory] = useState('all');
  const categoryKey = categoryKeyProp ?? internalCategory;
  const setCategory = (next: string) => {
    if (categoryKeyProp === undefined) setInternalCategory(next);
    onCategoryChange?.(next);
  };

  const categoryOptions = useMemo(() => {
    if (!categoryFilter) return [];
    const defs =
      categories ??
      ([
        { key: 'BOOKING', label: 'Booking' },
        { key: 'SI', label: 'SI' },
        { key: 'BL', label: 'B/L' },
        { key: 'SCHEDULE', label: 'Schedule' },
        { key: 'PAYMENT', label: 'Payment' },
      ] as const);
    const counts = new Map<string, number>();
    for (const item of items) {
      if (!item.category) continue;
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    const chips = [{ key: 'all', label: labels.all, count: items.length }];
    for (const def of defs) {
      const count = counts.get(def.key) ?? 0;
      if (count === 0) continue;
      chips.push({ key: def.key, label: def.label, count });
    }
    return chips;
  }, [categoryFilter, categories, items, labels.all]);

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const ta = a.timestampIso ? Date.parse(a.timestampIso) : 0;
        const tb = b.timestampIso ? Date.parse(b.timestampIso) : 0;
        return tb - ta;
      }),
    [items]
  );

  const visible = useMemo(() => {
    let list = sorted;
    if (!isPopover && filter === 'unread') list = list.filter((i) => !i.read);
    if (isPopover && categoryFilter && categoryKey !== 'all') {
      list = list.filter((i) => i.category === categoryKey);
    }
    return list;
  }, [sorted, isPopover, filter, categoryFilter, categoryKey]);

  const selectedCategoryLabel = categoryOptions.find((c) => c.key === categoryKey)?.label;
  const emptyFilteredMessage =
    typeof labels.emptyFiltered === 'string'
      ? labels.emptyFiltered.replace(
          '{category}',
          typeof selectedCategoryLabel === 'string' ? selectedCategoryLabel : 'filtered'
        )
      : labels.emptyFiltered;

  const activateRow = (item: AppNotificationItem) => {
    if (!item.read) onMarkRead?.(item);
    onItemClick?.(item);
  };

  const activateAction = (item: AppNotificationItem, event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    item.action?.onClick?.();
    onAction?.(item);
  };

  const listStyle = maxHeight !== undefined ? { maxHeight } : isPopover ? undefined : undefined;

  return (
    <div
      className={cn('sm-notif', isPopover ? 'sm-notif--popover' : 'sm-notif--drawer', className)}
      role={isPopover ? 'dialog' : undefined}
      aria-label={ariaLabel}
    >
      <NotificationStyles />

      {isPopover ? (
        <div className="sm-notif__header">
          <h2 className="sm-notif__title">Notifications</h2>
          {onMarkAllRead ? (
            <AppButton
              type="link"
              size="small"
              className="sm-notif__mark-all"
              disabled={unreadCount === 0 || loading}
              onClick={onMarkAllRead}
            >
              {labels.markAllRead}
            </AppButton>
          ) : null}
        </div>
      ) : (
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
      )}

      {isPopover && categoryFilter ? (
        <div className="sm-notif__chips" role="group" aria-label="Filter by category">
          {categoryOptions.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className={cn(
                'sm-notif__chip',
                categoryKey === chip.key && 'sm-notif__chip--selected'
              )}
              aria-pressed={categoryKey === chip.key}
              onClick={() => setCategory(chip.key)}
            >
              <span>{chip.label}</span>
              <span className="sm-notif__chip-count">{chip.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="sm-notif__error">
          <Alert
            type="error"
            showIcon
            message="Couldn't load notifications"
            action={
              onRetry ? (
                <AppButton type="link" size="small" onClick={onRetry}>
                  {labels.retry}
                </AppButton>
              ) : undefined
            }
          />
        </div>
      ) : loading ? (
        <div className="sm-notif__list" aria-busy="true">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <div key={i} className="sm-notif__skeleton">
              {isPopover ? <span /> : null}
              <Skeleton.Avatar active size="small" shape="circle" />
              <Skeleton active title={{ width: '55%' }} paragraph={{ rows: 1, width: '85%' }} />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="sm-notif__empty" role="status">
          {!isPopover && filter === 'unread' && items.length > 0
            ? labels.emptyUnread
            : isPopover && categoryKey !== 'all' && items.length > 0
              ? emptyFilteredMessage
              : labels.empty}
          {isPopover && categoryKey !== 'all' && items.length > 0 ? (
            <div className="sm-notif__empty-action">
              <AppButton type="link" size="small" onClick={() => setCategory('all')}>
                {labels.showAll}
              </AppButton>
            </div>
          ) : null}
        </div>
      ) : (
        <ul className={cn('sm-notif__list', 'custom-scroll')} style={listStyle}>
          {visible.map((item) => {
            const clickable = Boolean(onItemClick) || (!item.read && Boolean(onMarkRead));
            const categoryLabel = item.categoryShortLabel ?? item.categoryLabel;
            const hasMeta = Boolean(categoryLabel || item.reference || item.action);
            const ctaLabel = typeof item.action?.label === 'string' ? item.action.label : 'Open';
            const ctaAria = `${ctaLabel} — ${typeof item.title === 'string' ? item.title : 'notification'}${
              item.reference ? `, ${item.reference}` : ''
            }`;
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
                {isPopover ? <span className="sm-notif__unread-dot" aria-hidden /> : null}
                <span className="sm-notif__lead" aria-hidden>
                  {item.icon ?? <span className="sm-notif__dot" />}
                </span>
                <div className="sm-notif__body">
                  {clickable ? (
                    <button
                      type="button"
                      className="sm-notif__hit"
                      onClick={() => activateRow(item)}
                      aria-label={
                        typeof item.title === 'string'
                          ? `${item.read ? '' : 'Unread '}${item.title}`
                          : undefined
                      }
                    >
                      <RowMain item={item} />
                    </button>
                  ) : (
                    <div className="sm-notif__hit">
                      <RowMain item={item} />
                    </div>
                  )}
                  {hasMeta ? (
                    <span className="sm-notif__meta-row">
                      <span className="sm-notif__meta">
                        {categoryLabel ? <>{categoryLabel}</> : null}
                        {categoryLabel && item.reference ? ' · ' : null}
                        {item.reference ? (
                          <span className="sm-notif__meta-ref">{item.reference}</span>
                        ) : null}
                      </span>
                      {item.action ? (
                        <button
                          type="button"
                          className="sm-notif__cta"
                          aria-label={ctaAria}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => activateAction(item, event)}
                        >
                          {item.action.label}
                          <CtaArrow />
                        </button>
                      ) : null}
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {footer ? <div className="sm-notif__footer">{footer}</div> : null}
    </div>
  );
}

function RowMain({ item }: { item: AppNotificationItem }) {
  return (
    <>
      <span className="sm-notif__title-row">
        {!item.read ? <span className="sm-notif__sr-only">Unread</span> : null}
        <Text className="sm-notif__title">{item.title}</Text>
        {item.timestamp ? (
          <time
            className="sm-notif__time"
            dateTime={item.timestampIso}
            title={typeof item.timestamp === 'string' ? item.timestamp : undefined}
          >
            {item.timestamp}
          </time>
        ) : null}
      </span>
      {item.message ? <span className="sm-notif__message">{item.message}</span> : null}
    </>
  );
}
