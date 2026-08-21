import type { ReactNode } from 'react';

import type { DataViewItem } from '../../data-view-item';
import type { DataViewColumn } from '../../types';
import type { CardLayoutConfig, RenderCardParams } from '../types';

/**
 * Props for CardContent component
 *
 * Internal component that renders the visual representation of a card.
 */
export interface CardContentProps<TData extends DataViewItem> {
  item: TData;
  columnDefs: DataViewColumn<TData>[];
  layoutConfig: CardLayoutConfig;
  isOverlay?: boolean;
  isDragging?: boolean;
}

/**
 * Props for SortableCard component
 *
 * Internal component that wraps a card with drag-and-drop functionality.
 */
export interface SortableCardProps<TData extends DataViewItem> {
  id: string;
  item: TData;
  columnDefs: DataViewColumn<TData>[];
  layoutConfig: CardLayoutConfig;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
}
