// Created by Sekar Nagarajan (2026-11-13 03:20)
import type { ReactNode } from 'react';

export type AppNotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppNotificationItem {
  id: string;
  title: ReactNode;
  message?: ReactNode;
  /** Pre-formatted date/time. */
  timestamp?: ReactNode;
  read: boolean;
  /** Machine key used for the category filter. */
  category?: string;
  /** Human label shown as a chip. */
  categoryLabel?: ReactNode;
  severity?: AppNotificationSeverity;
  /** Business reference (booking no, B/L no …). */
  reference?: ReactNode;
  /** Optional leading icon; defaults to a severity dot. */
  icon?: ReactNode;
}

export type AppNotificationFilter = 'all' | 'unread';

export interface AppNotificationCenterLabels {
  all: ReactNode;
  unread: ReactNode;
  markAllRead: ReactNode;
  markRead: ReactNode;
  empty: ReactNode;
  emptyUnread: ReactNode;
  reference: ReactNode;
}

export interface AppNotificationCenterProps {
  items: AppNotificationItem[];
  loading?: boolean;
  /** Controlled filter; uncontrolled when omitted (starts on `unread` when any exist). */
  filter?: AppNotificationFilter;
  onFilterChange?: (filter: AppNotificationFilter) => void;
  onMarkRead?: (item: AppNotificationItem) => void;
  onMarkAllRead?: () => void;
  /** Called when the row body is activated; the centre also marks the item read. */
  onItemClick?: (item: AppNotificationItem) => void;
  labels?: Partial<AppNotificationCenterLabels>;
  /** Cap the list height and scroll inside it. */
  maxHeight?: number | string;
  skeletonCount?: number;
  ariaLabel?: string;
  className?: string;
}
