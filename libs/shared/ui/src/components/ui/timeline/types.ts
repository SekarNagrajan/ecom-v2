// Created by Sekar Nagarajan (2026-11-13 02:00)
import type { ReactNode } from 'react';

/** Visual state of one step. `neutral` is for historical feeds where every entry simply happened. */
export type AppTimelineStatus = 'done' | 'current' | 'upcoming' | 'error' | 'neutral';

export interface AppTimelineItem {
  id: string;
  /** Primary line (milestone name, event, action). */
  title: ReactNode;
  /** Secondary line (location, actor, vessel). */
  subtitle?: ReactNode;
  /** Pre-formatted date/time shown under the copy. */
  timestamp?: ReactNode;
  status?: AppTimelineStatus;
  /** Node content; the consumer passes its own icon component. Defaults to a status glyph. */
  icon?: ReactNode;
  /** Override for the status chip text (e.g. an i18n label). */
  badge?: ReactNode;
  /** Free content under the timestamp (notes, charges, vessel line). */
  meta?: ReactNode;
  /** Tooltip for truncated titles; defaults to `title` when it is a string. */
  tooltip?: string;
}

export interface AppTimelineProps {
  items: AppTimelineItem[];
  /** `vertical` rail (feeds, drawers) or `horizontal` strip (journey overview). */
  orientation?: 'vertical' | 'horizontal';
  /** `sm` tightens the node and type scale for drawers and cards. */
  size?: 'sm' | 'md';
  /** Show the status chip under each title (hidden for `neutral` items). */
  showStatusBadge?: boolean;
  /** Replace the default chip labels (Completed / In progress / Upcoming / Attention). */
  statusLabels?: Partial<Record<AppTimelineStatus, ReactNode>>;
  /** Render skeleton rows instead of items. */
  loading?: boolean;
  skeletonCount?: number;
  /** Shown when `items` is empty and not loading. */
  emptyText?: ReactNode;
  /** Accessible name of the list. */
  ariaLabel?: string;
  /** Cap the vertical list height and scroll inside it. */
  maxHeight?: number | string;
  className?: string;
}
