import {
  useVirtualizer,
  defaultRangeExtractor,
  type Range,
} from '@tanstack/react-virtual';
import { theme, Empty } from 'antd';
import {
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
  type RefCallback,
} from 'react';

import type { DataViewItem } from '../../data-view-item';
import type { DataViewColumn } from '../../types';
import type { CardLayoutConfig, RenderCardParams } from '../types';
import { KanbanCard } from './kanban-card';

export interface CardListProps<TData extends DataViewItem> {
  items: TData[];
  columnDefs: DataViewColumn<TData>[];
  idField: keyof TData;
  parentRef: RefObject<HTMLDivElement | null>;
  onLoadMore?: (laneId: string) => void;
  laneId: string;
  hasMore?: boolean;
  loadingMore?: boolean;
  fetchMode?: 'auto' | 'manual';
  layoutConfig: CardLayoutConfig;
  renderCard?: (params: RenderCardParams<TData>) => ReactNode;
  cardGap?: number;
  /** Estimated card height for virtualization. Defaults to 90. Adjust for custom card renderers. */
  estimatedCardHeight?: number;
}

export function CardList<TData extends DataViewItem>({
  items,
  columnDefs,
  idField,
  parentRef,
  onLoadMore,
  laneId,
  hasMore,
  loadingMore,
  fetchMode = 'auto',
  layoutConfig,
  renderCard,
  cardGap = 20,
  estimatedCardHeight = 90,
}: CardListProps<TData>): ReactElement {
  'use no memo';

  const { token } = theme.useToken();

  // Estimate should be close to actual measured size (card height + gap)
  const estimatedItemHeight = estimatedCardHeight + cardGap;

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan: 10,
    getItemKey: (index) => {
      const item = items[index];
      return item ? String(item[idField]) : String(index);
    },
    rangeExtractor: (range: Range) => {
      const activeRange = defaultRangeExtractor(range);
      return activeRange;
    },
  });

  // Force remeasure on initial mount to ensure correct spacing from the start
  // This runs once after the first render when items are in the DOM
  useEffect(() => {
    // Double RAF ensures DOM is fully painted before measuring
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rowVirtualizer.measure();
      });
    });
    return () => cancelAnimationFrame(rafId);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * FIX: Avoid infinite re-render loop by using a ResizeObserver
   * that doesn't trigger measurement on every tiny change.
   */
  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    let rafId: number;
    const observer = new ResizeObserver(() => {
      // Use requestAnimationFrame to debounce and prevent synchronous loops
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rowVirtualizer.measure();
      });
    });

    observer.observe(scrollElement);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [parentRef, rowVirtualizer]);

  // Force remeasure when items count changes (fixes spacing after operations)
  const itemsLength = items.length;
  useEffect(() => {
    if (itemsLength === 0) return; // Skip if no items
    // Use RAF to ensure DOM has updated before measuring
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rowVirtualizer.measure();
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [itemsLength, rowVirtualizer]);

  // 4. Infinite Scroll (Auto Fetch) via IntersectionObserver on sentinel element.
  //    Uses a ref for the callback so the observer doesn't recreate on every
  //    `onLoadMore` reference change. A guard ref prevents duplicate requests
  //    within the same load cycle -- reset only when `loadingMore` goes false.
  //    `itemsLength` is in the deps so the observer re-creates after new data
  //    arrives (sentinel position changes), giving a fresh intersection check.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchGuardRef = useRef(false);
  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!loadingMore) {
      fetchGuardRef.current = false;
    }
  }, [loadingMore]);

  useEffect(() => {
    if (fetchMode !== 'auto' || !hasMore || loadingMore) return;

    const sentinel = sentinelRef.current;
    const scrollRoot = parentRef.current;
    if (!sentinel || !scrollRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (fetchGuardRef.current) return;
        fetchGuardRef.current = true;
        loadMoreRef.current?.(laneId);
      },
      { root: scrollRoot, rootMargin: '0px 0px 200px 0px', threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMode, hasMore, itemsLength, laneId, loadingMore, parentRef]);

  if (items.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          minHeight: 150,
          padding: token.padding,
          position: 'relative',
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No items in this lane"
          style={{ margin: 0 }}
        />
      </div>
    );
  }

  return (
    <div
      className="kanban-card-list-container"
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
        const item = items[virtualItem.index];
        if (!item) return null;

        const itemId = String(item[idField]);
        const isLastItem = virtualItem.index === items.length - 1;

        const measureRef: RefCallback<HTMLDivElement> = (node) => {
          rowVirtualizer.measureElement(node);
        };

        return (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <div
              ref={measureRef}
              data-index={virtualItem.index}
              style={{
                paddingBottom: isLastItem ? 0 : cardGap,
              }}
            >
              <KanbanCard
                id={itemId}
                item={item}
                columnDefs={columnDefs}
                layoutConfig={layoutConfig}
                renderCard={renderCard}
              />
            </div>
          </div>
        );
      })}
      {/* Sentinel for IntersectionObserver-based infinite scroll */}
      {fetchMode === 'auto' && hasMore && (
        <div
          ref={sentinelRef}
          style={{
            position: 'absolute',
            bottom: 0,
            height: 1,
            width: '100%',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
