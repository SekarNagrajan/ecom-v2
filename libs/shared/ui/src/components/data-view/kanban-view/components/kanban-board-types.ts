import type { ReactNode } from 'react';

import type { DataViewItem } from '../../data-view-item';
import type { DataViewColumn } from '../../types';
import type {
  CardLayoutConfig,
  RenderCardParams,
  KanbanLaneDef,
} from '../types';

/**
 * Props for KanbanColumnWrapper component
 *
 * This wrapper subscribes to a single lane's data from the Zustand store,
 * ensuring isolated re-renders when only that lane's data changes.
 */
export interface KanbanColumnWrapperProps<TData extends DataViewItem> {
  laneId: string;
  lane: KanbanLaneDef;
  columnDefs: DataViewColumn<TData>[];
  idField: keyof TData & string;
  onLoadMore?: (laneId: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  fetchMode?: 'auto' | 'manual';
  collapsible?: boolean;
  layoutConfig: CardLayoutConfig;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  cardGap?: number;
  estimatedCardHeight?: number;
  columnWidth?: number;
}
