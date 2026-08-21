import { useVirtualizer } from '@tanstack/react-virtual';
import { theme, Empty, Button, Flex, Typography, Pagination, Spin } from 'antd';
import { useRef, useState, useEffect, type ReactElement } from 'react';

import { useAntdBreakpoint } from '../../../hooks';
import { TopLoadingBar } from '../../common/top-loading-bar';
import type { DataViewItem } from '../data-view-item';
import { CardItem } from './components/card-item';
import { GridSkeleton } from './components/card-skeleton';
import type { CardViewProps } from './types';

const { Text } = Typography;

function CardViewComponent<TData extends DataViewItem>({
  data = [] as TData[],
  idField = 'id' as keyof TData & string,
  columnDefs,
  loading,
  loadingMore = false,
  onLoadMore,
  hasMore,
  className,
  style,
  footerActions = [],
  selection: externalSelection,
  isSelectionMode: externalSelectionMode,
  overscan = 5,
  renderCard,
  paginationMode = 'infinite',
  page = 0,
  pageSize = 12,
  pageSizeOptions = [10, 20, 50, 100],
  totalCount = 0,
  emptyDescription = 'No records found',
  enableLongPressSelection = false,
  onPaginationChange,
  gutter,
  minCardWidth,
  maxColumns,
  surfaceBackground,
  surfacePadding,
  scrollAreaHeader,
}: CardViewProps<TData>) {
  'use no memo';

  const { token } = theme.useToken();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { screen, ready, isMobile } = useAntdBreakpoint();

  const isPaginationMode = paginationMode === 'pagination';

  const effectiveTotalCount =
    totalCount > 0 ? totalCount : isPaginationMode ? data.length : 0;

  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(
    []
  );
  const [activeSelectionMode, setActiveSelectionMode] = useState(
    externalSelectionMode || false
  );

  const selectedKeys = externalSelection?.selectedKeys ?? internalSelectedKeys;

  const handleSelectionChange = (newKeys: string[]) => {
    if (externalSelection?.onSelectionChange) {
      externalSelection.onSelectionChange(newKeys);
    } else {
      setInternalSelectedKeys(newKeys);
    }
  };

  const [swipedCardId, setSwipedCardId] = useState<string | null>(null);

  const [horizontalGutter, verticalGutter] = gutter ?? [
    token.margin,
    token.margin,
  ];
  const effectiveSurfacePadding = surfacePadding ?? token.paddingSM;

  const fallbackColumnsCount = !ready
    ? 1
    : screen.xxl
    ? 6
    : screen.xl
    ? 4
    : screen.lg
    ? 3
    : screen.md || screen.sm
    ? 2
    : 1;

  useEffect(() => {
    const container = containerElement;
    if (!container) return;

    const updateWidth = () => {
      const nextWidth = container.clientWidth;
      setContainerWidth((current) =>
        current === nextWidth ? current : nextWidth
      );
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerElement]);

  const setContainerNode = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    setContainerElement((current) => (current === node ? current : node));
  };

  let columnsCount = fallbackColumnsCount;

  if (minCardWidth && containerWidth > 0) {
    const safeMaxColumns =
      maxColumns && maxColumns > 0
        ? Math.max(1, Math.floor(maxColumns))
        : Number.POSITIVE_INFINITY;
    const estimatedColumns = Math.floor(
      (containerWidth + horizontalGutter) / (minCardWidth + horizontalGutter)
    );

    columnsCount = Math.max(1, Math.min(safeMaxColumns, estimatedColumns || 1));
  }

  const displayData =
    isPaginationMode && data.length > pageSize
      ? data.slice(page * pageSize, page * pageSize + pageSize)
      : data;

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(displayData.length / columnsCount),
    getScrollElement: () => containerRef.current,
    estimateSize: () => 240,
    overscan,
  });

  const rowCount = Math.ceil(displayData.length / columnsCount);
  const virtualItems = rowVirtualizer.getVirtualItems();

  const lastRowIndex = virtualItems.at(-1)?.index;
  useEffect(() => {
    if (isPaginationMode) return;
    if (
      !onLoadMore ||
      !hasMore ||
      lastRowIndex === undefined ||
      loading ||
      loadingMore
    )
      return;
    if (lastRowIndex >= rowCount - 2) {
      onLoadMore();
    }
  }, [
    hasMore,
    isPaginationMode,
    lastRowIndex,
    loading,
    loadingMore,
    onLoadMore,
    rowCount,
  ]);

  useEffect(() => {
    if (externalSelectionMode !== undefined) {
      setActiveSelectionMode(externalSelectionMode);
    }
  }, [externalSelectionMode]);

  const handleLongPress = (id: string) => {
    if (!enableLongPressSelection) return;

    setActiveSelectionMode(true);
    if (window.navigator.vibrate) window.navigator.vibrate(50);

    if (!selectedKeys.includes(id)) {
      handleSelectionChange([...selectedKeys, id]);
    }
  };

  const handleSwipeLeft = (id: string) => {
    setSwipedCardId(id);
  };

  const handleSwipeRight = (id: string) => {
    setSwipedCardId((prev) => (prev === id ? null : prev));
  };

  const handleCardClick = (id: string) => {
    if (activeSelectionMode) {
      const isCurrentlySelected = selectedKeys.includes(id);
      const nextKeys = isCurrentlySelected
        ? selectedKeys.filter((k) => k !== id)
        : [...selectedKeys, id];

      handleSelectionChange(nextKeys);

      if (nextKeys.length === 0 && externalSelectionMode === undefined) {
        setActiveSelectionMode(false);
      }
    }
  };

  // When the slot is unused (the common desktop / non-mobile path), keep
  // the original early-return behavior intact so empty / first-paint
  // skeleton states center themselves inside the CardView surface. Once a
  // header slot is provided (mobile activities path), we instead render
  // the skeleton / empty UI *inside* the scroll container so the filter
  // header stays reachable when results are zero or still loading.
  if (!scrollAreaHeader) {
    if (loading && data.length === 0) {
      return <GridSkeleton columns={columnsCount} />;
    }

    if (data.length === 0) {
      return (
        <Flex
          align="center"
          justify="center"
          style={{ flex: 1, padding: token.paddingXL }}
        >
          <Empty description={emptyDescription} />
        </Flex>
      );
    }
  }

  const isInitialSkeleton = loading && data.length === 0;
  const isEmpty = !isInitialSkeleton && data.length === 0;

  // Refetch-with-data state: keep all existing cards in place and surface a
  // thin top-edge progress indicator instead of a dim full-area overlay. The
  // first paint is owned by the `GridSkeleton` branch above, so any
  // `loading` flag we see here implies the user is looking at stale data
  // that's about to refresh.
  const isRefetching = Boolean(loading) && data.length > 0;

  return (
    <div
      className={className}
      style={{
        flex: 1,
        height: '100%',
        minHeight: 0,
        position: 'relative',
        ...style,
      }}
    >
      <TopLoadingBar active={isRefetching} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          ref={setContainerNode}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            background: surfaceBackground ?? token.colorBgLayout,
            position: 'relative',
            scrollbarWidth: 'thin',
          }}
        >
          {scrollAreaHeader}

          {isInitialSkeleton ? <GridSkeleton columns={columnsCount} /> : null}

          {isEmpty ? (
            <Flex
              align="center"
              justify="center"
              style={{ padding: token.paddingXL }}
            >
              <Empty description={emptyDescription} />
            </Flex>
          ) : null}

          {selectedKeys.length > 0 && (
            <Flex
              align="center"
              justify="space-between"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: token.colorBgContainer,
                padding: '12px 16px',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Text strong>{selectedKeys.length} Selected</Text>
              <Flex gap="small">
                <Button
                  size="small"
                  onClick={() => {
                    handleSelectionChange([]);
                    if (externalSelectionMode === undefined)
                      setActiveSelectionMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button size="small" type="primary" danger>
                  Bulk Action
                </Button>
              </Flex>
            </Flex>
          )}

          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualRow) => {
              const startIndex = virtualRow.index * columnsCount;
              const rowItems = displayData.slice(
                startIndex,
                startIndex + columnsCount
              );

              return (
                <div
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    // padding: `0 ${effectiveSurfacePadding}px`,
                    paddingBottom: verticalGutter,
                  }}
                >
                  <div
                    style={{
                      alignItems: 'stretch',
                      display: 'grid',
                      gap: horizontalGutter,
                      gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
                      marginTop:
                        virtualRow.index === 0 ? effectiveSurfacePadding : 0,
                    }}
                  >
                    {rowItems.map((item) => {
                      const resolvedIdField =
                        externalSelection?.idField ?? idField;
                      const id = String(
                        item[resolvedIdField as keyof TData] ?? ''
                      );
                      const isSelected = selectedKeys.includes(id);
                      const isSwiped = swipedCardId === id;

                      return (
                        <div
                          key={id}
                          style={{
                            height: '100%',
                            width: '100%',
                          }}
                        >
                          <CardItem
                            item={item}
                            id={id}
                            columnDefs={columnDefs}
                            isSelected={isSelected}
                            selectionMode={activeSelectionMode}
                            isSwiped={isSwiped}
                            footerActions={footerActions}
                            onLongPress={handleLongPress}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={handleSwipeRight}
                            onCardClick={handleCardClick}
                            renderCard={renderCard}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!isPaginationMode && loadingMore ? (
            <Flex
              align="center"
              justify="center"
              gap={token.marginXS}
              style={{
                padding: token.paddingSM,
                paddingBottom: token.padding,
              }}
            >
              <Spin size="small" />
              <Text type="secondary">Loading more...</Text>
            </Flex>
          ) : null}
        </div>

        {isPaginationMode && effectiveTotalCount > 0 && (
          <Flex
            justify={isMobile ? 'center' : 'end'}
            align="center"
            style={{
              padding: token.paddingXS,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
              flexShrink: 0,
            }}
          >
            <Pagination
              disabled={loading}
              size="small"
              pageSizeOptions={pageSizeOptions}
              current={page + 1}
              pageSize={pageSize}
              total={effectiveTotalCount}
              onChange={(newPage, newPageSize) => {
                onPaginationChange?.(newPage - 1, newPageSize);
                containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showSizeChanger
              showTotal={(total, range) =>
                isMobile ? undefined : `${range[0]}-${range[1]} of ${total}`
              }
            />
          </Flex>
        )}
      </div>
    </div>
  );
}

export const CardView = CardViewComponent as <TData extends DataViewItem>(
  props: CardViewProps<TData>
) => ReactElement;
