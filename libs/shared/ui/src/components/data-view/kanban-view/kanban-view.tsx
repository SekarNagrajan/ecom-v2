import { Spin, Flex, theme } from 'antd';

import { TopLoadingBar } from '../../common/top-loading-bar';
import type { DataViewItem } from '../data-view-item';
import { KanbanBoard } from './components/kanban-board';
import { KanbanDragProvider } from './components/kanban-drag-provider';
import { KanbanStoreProvider } from './components/kanban-store-context';
import type { KanbanViewProps } from './types';

function groupKanbanData<TData extends DataViewItem>(
  data: Record<string, TData[]> | TData[] | undefined,
  lanes: KanbanViewProps<TData>['lanes'],
  groupByField: keyof TData & string
): Record<string, TData[]> {
  if (data && !Array.isArray(data)) {
    const grouped: Record<string, TData[]> = {};

    for (const laneId of Object.keys(data)) {
      grouped[laneId] = data[laneId] ?? [];
    }

    for (const lane of lanes) {
      if (!grouped[lane.id]) {
        grouped[lane.id] = [];
      }
    }
    return grouped;
  }

  const resolvedData = Array.isArray(data) ? data : [];
  const grouped: Record<string, TData[]> = {};

  for (const lane of lanes) {
    grouped[lane.id] = [];
  }

  for (const item of resolvedData) {
    const laneId = String(item[groupByField]);
    if (grouped[laneId]) {
      grouped[laneId].push(item);
    }
  }

  return grouped;
}

function buildLayoutConfig<TData extends DataViewItem>(
  columnDefs: KanbanViewProps<TData>['columnDefs']
) {
  const fields = columnDefs.filter(
    (col): col is typeof col & { field: string } =>
      typeof col.field === 'string'
  );

  const primary = fields.find((c) => c.isPrimary) ?? fields[0];
  const secondary = fields.find((c) => c.isSecondary);
  const additional = fields
    .filter((c) => !c.isPrimary && !c.isSecondary && c.field !== 'id')
    .map((c) => c.field)
    .slice(0, 3);

  return {
    primaryField: primary?.field,
    secondaryField: secondary?.field,
    additionalFields: additional,
  };
}

/**
 * KanbanView - Performance-optimized Kanban board component
 *
 * Architecture:
 * - Accepts raw data array and groups internally (stable memoization)
 * - KanbanDragProvider: Isolates DndContext and all drag state
 * - KanbanBoard: Pure layout component
 * - KanbanColumn: Memoized, uses useDroppable internally
 * - KanbanCard: Memoized, uses useDraggable internally
 *
 * Performance optimizations:
 * - Internal grouping prevents reference instability from parent
 * - Only affected columns re-render on data changes
 * - Drag state isolated to prevent cascading re-renders
 */
function KanbanViewComponent<TData extends DataViewItem>({
  data,
  columnDefs,
  groupByField,
  lanes: boardLanes,
  onItemUpdate,
  idField,
  loading,
  className,
  style,
  renderCard,
  onLoadMore,
  hasMore,
  loadingMore,
  fetchMode = 'auto',
  collapsible: globalCollapsible = false,
  cardGap = -10, // Default to -10 for overlapping effect
  estimatedCardHeight = 90, // Default card height estimate for virtualization
  columnWidth,
  dragActivation = 'longPress', // Default to long press for better mobile support
}: KanbanViewProps<TData>) {
  const { token } = theme.useToken();

  const groupedData = groupKanbanData(data, boardLanes, groupByField);
  const layoutConfig = buildLayoutConfig(columnDefs);

  // Split the existing `loading` signal into initial-load vs refetch. With no
  // cards across any lane we keep the dim full-board overlay so the empty
  // canvas still communicates "fetching"; once any lane has cards we swap
  // to a non-blocking top progress bar so drag interactions and existing
  // content stay fully visible during the refresh.
  const isLoading = Boolean(loading);
  const hasAnyCards = Object.values(groupedData).some(
    (laneItems) => laneItems.length > 0
  );
  const showInitialOverlay = isLoading && !hasAnyCards;
  const showRefetchIndicator = isLoading && hasAnyCards;

  return (
    <KanbanStoreProvider>
      <div
        className={className}
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          ...style,
        }}
      >
        <TopLoadingBar active={showRefetchIndicator} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {showInitialOverlay && (
            <Flex
              align="center"
              justify="center"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                background: token.colorBgBlur,
                backdropFilter: 'blur(2px)',
              }}
            >
              <Spin size="large" />
            </Flex>
          )}

          <KanbanDragProvider
            groupedData={groupedData}
            idField={idField}
            groupByField={groupByField}
            lanes={boardLanes}
            columnDefs={columnDefs}
            onItemUpdate={onItemUpdate}
            renderCard={renderCard}
            dragActivation={dragActivation}
            columnWidth={columnWidth}
          >
            <KanbanBoard
              lanes={boardLanes}
              columnDefs={columnDefs}
              idField={idField}
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              loadingMore={loadingMore}
              fetchMode={fetchMode}
              collapsible={globalCollapsible}
              layoutConfig={layoutConfig}
              renderCard={renderCard}
              cardGap={cardGap}
              estimatedCardHeight={estimatedCardHeight}
              columnWidth={columnWidth}
            />
          </KanbanDragProvider>
        </div>
      </div>
    </KanbanStoreProvider>
  );
}

export const KanbanView = KanbanViewComponent;
