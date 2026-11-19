// Modified by Sekar Nagarajan (2026-11-16 14:30) — 2b bell popover item/action fields
import type { ReactNode } from 'react';

export type AppNotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppNotificationItemAction {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface AppNotificationItem {
  id: string;
  title: ReactNode;
  message?: ReactNode;
  /** Pre-formatted relative/display time. */
  timestamp?: ReactNode;
  /** ISO string for <time dateTime>; `timestamp` stays the display text. */
  timestampIso?: string;
  read: boolean;
  /** Machine key used for the category filter. */
  category?: string;
  /** Human label shown as a chip / meta (full). */
  categoryLabel?: ReactNode;
  /** Short label for the meta line (e.g. "B/L", "SI"). */
  categoryShortLabel?: ReactNode;
  severity?: AppNotificationSeverity;
  /** Business reference (booking no, B/L no …). */
  reference?: ReactNode;
  /** Optional leading icon; defaults to a severity dot. */
  icon?: ReactNode;
  /** Inline primary CTA on the meta line (popover variant). */
  action?: AppNotificationItemAction;
}

export type AppNotificationFilter = 'all' | 'unread';

export type AppNotificationVariant = 'drawer' | 'popover';

export interface AppNotificationCategoryOption {
  key: string;
  label: ReactNode;
}

export interface AppNotificationCenterLabels {
  all: ReactNode;
  unread: ReactNode;
  markAllRead: ReactNode;
  markRead: ReactNode;
  empty: ReactNode;
  emptyUnread: ReactNode;
  emptyFiltered: ReactNode;
  showAll: ReactNode;
  reference: ReactNode;
  retry: ReactNode;
}

export interface AppNotificationCenterProps {
  items: AppNotificationItem[];
  loading?: boolean;
  /** Controlled unread/all filter; uncontrolled when omitted. */
  filter?: AppNotificationFilter;
  onFilterChange?: (filter: AppNotificationFilter) => void;
  onMarkRead?: (item: AppNotificationItem) => void;
  onMarkAllRead?: () => void;
  /** Called when the row body is activated; the centre also marks the item read. */
  onItemClick?: (item: AppNotificationItem) => void;
  /** Called when the inline CTA is activated (popover). */
  onAction?: (item: AppNotificationItem) => void;
  labels?: Partial<AppNotificationCenterLabels>;
  /** Cap the list height and scroll inside it. */
  maxHeight?: number | string;
  skeletonCount?: number;
  ariaLabel?: string;
  className?: string;
  /** Visual/layout variant. Default `drawer` for back-compat. */
  variant?: AppNotificationVariant;
  /** Show category chip row (popover). */
  categoryFilter?: boolean;
  categories?: AppNotificationCategoryOption[];
  /** Controlled category key; uncontrolled when omitted (starts on `all`). */
  categoryKey?: string;
  onCategoryChange?: (key: string) => void;
  footer?: ReactNode;
  /** Show an inline error alert with Retry. */
  error?: boolean;
  onRetry?: () => void;
}
