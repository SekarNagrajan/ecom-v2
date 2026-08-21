import { Card, Flex, theme } from 'antd';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

import { DataViewGridSurface } from './components/data-view-grid-surface';
import { DataViewHeader } from './components/data-view-header';
import {
  useAllowedViewModes,
  useViewMode,
  useSearchText,
  useSearchField,
  useSearchableFields,
  useFilterConfig,
  useFilters,
  useSorts,
  useQueryVersion,
  DataViewProvider,
} from './context/data-view-context';
import type { DataViewItem } from './data-view-item';
import {
  createCardViewProps,
  createKanbanViewProps,
  resolveInitialSearchField,
  ViewLoadingFallback,
} from './data-view-render-helpers';
import { useDataProcessing } from './hooks/use-data-processing';
import type { DataViewProps } from './types';
import { inferFilterConfig } from './utils/infer-filters';
import {
  LazyCardView,
  LazyKanbanView,
  LazyListView,
  preloadViewMode,
} from './view-loaders';

const DATAVIEW_TO_GRID_DATE_OP: Record<string, string> = {
  before: 'lessThan',
  after: 'greaterThan',
  between: 'inRange',
  notEquals: 'notEqual',
};

const DATAVIEW_TO_GRID_TEXT_OP: Record<string, string> = {
  notEquals: 'notEqual',
};

const DATAVIEW_TO_GRID_NUMBER_OP: Record<string, string> = {
  between: 'inRange',
  notEquals: 'notEqual',
};
const EMPTY_SEARCHABLE_FIELDS: NonNullable<
  DataViewProps<DataViewItem>['searchableFields']
> = [];

export function DataView<TData extends DataViewItem>(
  props: DataViewProps<TData>
) {
  const {
    columnDefs,
    filterConfig,
    searchableFields,
    defaultViewMode,
    allowedViewModes,
    defaultFilters,
    defaultSorts,
    defaultSearchText,
    defaultSearchField,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const stableSearchableFields = searchableFields ?? EMPTY_SEARCHABLE_FIELDS;
  const safeColumnDefs = columnDefs || [];
  const columnMeta = safeColumnDefs.map((col) => ({
    field: typeof col.field === 'string' ? col.field : undefined,
    headerName: col.headerName,
    sortable: col.sortable,
    isPrimary: col.isPrimary,
    isSecondary: col.isSecondary,
  }));
  const effectiveFilterConfig = filterConfig ?? inferFilterConfig(safeColumnDefs);
  const callbacks = {
    onViewModeChange: props.onViewModeChange,
    onFiltersChange: props.onFiltersChange,
    onSortsChange: props.onSortsChange,
    onSearchChange: props.onSearchChange,
  };
  const [initialState] = useState(() => ({
    viewMode: defaultViewMode,
    allowedViewModes: allowedViewModes ?? ['list', 'kanban', 'card'],
    filters: defaultFilters ?? [],
    sorts: defaultSorts ?? [],
    searchText: defaultSearchText ?? '',
    searchField: resolveInitialSearchField(
      searchableFields,
      defaultSearchField
    ),
  }));

  return (
    <DataViewProvider
      initialState={{
        ...initialState,
        filterConfig: effectiveFilterConfig,
        columnDefs: columnMeta,
        searchableFields: stableSearchableFields,
      }}
      callbacks={callbacks}
    >
      <DataViewContent {...props} containerRef={containerRef} />
    </DataViewProvider>
  );
}

function DataViewContent<TData extends DataViewItem>({
  className,
  style,
  listOptions,
  kanbanOptions,
  cardOptions,
  headerActions,
  renderToolbar,
  columnDefs,
  loading: externalLoading,
  onTotalCountChange,
  dataMode,
  externalRefreshKey,
  containerRef,
  ...props
}: DataViewProps<TData> & {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const allowedViewModes = useAllowedViewModes();
  const viewMode = useViewMode();
  const searchText = useSearchText();
  const searchField = useSearchField();
  const searchableFields = useSearchableFields();
  const filterConfig = useFilterConfig();
  const filters = useFilters();
  const sorts = useSorts();
  const queryVersion = useQueryVersion();
  const resolvedViewMode = viewMode ?? 'list';

  const [listTotalCount, setListTotalCount] = useState<number>(0);

  useEffect(() => {
    const pending = allowedViewModes.filter((m) => m !== 'list');
    if (pending.length === 0) return;

    const preloadAll = () => {
      for (const mode of pending) {
        preloadViewMode(mode);
      }
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preloadAll, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const id = globalThis.setTimeout(preloadAll, 300);
    return () => globalThis.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preload once on mount
  }, []);

  const handleListTotalCountChange = (count: number) => {
    setListTotalCount(count);
    onTotalCountChange?.(count);
  };

  const rawData = dataMode === 'server' ? undefined : props.rowData;

  const processedData = useDataProcessing(rawData, dataMode ?? 'client');

  const cardTotalCount = cardOptions?.totalCount;
  const kanbanData = kanbanOptions?.data;
  const kanbanTotalCount = kanbanOptions?.totalCount;
  const processedDataLength = processedData.length;

  let totalCount = processedDataLength;
  if (resolvedViewMode === 'list' && dataMode === 'server') {
    totalCount = listTotalCount;
  } else if (resolvedViewMode === 'card' && cardTotalCount !== undefined) {
    totalCount = cardTotalCount;
  } else if (resolvedViewMode === 'kanban') {
    totalCount =
      kanbanTotalCount ??
      (kanbanData
        ? Array.isArray(kanbanData)
          ? kanbanData.length
          : Object.values(kanbanData).reduce((acc, arr) => acc + arr.length, 0)
        : 0);
  }

  const onFetchDataCallback =
    'onFetchData' in props ? props.onFetchData : undefined;

  const listViewColumnDefs = useMemo(
    () => (columnDefs || []).filter((col) => !col.render),
    [columnDefs]
  );
  const listViewDefaultColDef = useMemo(
    () =>
      filterConfig && filterConfig.length > 0
        ? {
            filter: false,
            ...(listOptions?.defaultColDef || {}),
          }
        : listOptions?.defaultColDef,
    [filterConfig, listOptions?.defaultColDef]
  );

  const hasServerSearch = searchableFields.length > 0;

  const listViewProps = {
    columnDefs: listViewColumnDefs,
    loading: externalLoading,
    quickFilterText: hasServerSearch ? undefined : searchText,
    onTotalCountChange: handleListTotalCountChange,
    ...(filterConfig && filterConfig.length > 0
      ? {
          defaultColDef: listViewDefaultColDef,
          // Default to the shared-ui sidebar (Columns + Filters, collapsed).
          // Consumers can still opt out per-feature via `listOptions.sideBar`.
          sideBar: true,
        }
      : {}),
    ...listOptions,
  };

  const fetchInterceptor = async (
    params: Parameters<NonNullable<typeof onFetchDataCallback>>[0]
  ) => {
    if (!onFetchDataCallback) return { data: [], totalCount: 0 };

    const mergedFilterModel: Record<string, unknown> = {
      ...((params.filterModel as Record<string, unknown>) || {}),
    };
    const mergedSortModel = [...(params.sortModel || [])];

    if (mergedSortModel.length === 0 && sorts && sorts.length > 0) {
      const primarySort = sorts[0];
      if (primarySort && primarySort.field && primarySort.direction) {
        mergedSortModel.push({
          colId: primarySort.field,
          sort: primarySort.direction,
        });
      }
    }

    filters?.forEach((ctxFilter) => {
      const isBlankOp =
        ctxFilter.operator === 'blank' || ctxFilter.operator === 'notBlank';

      if (
        !isBlankOp &&
        (ctxFilter.value === undefined ||
          ctxFilter.value === null ||
          ctxFilter.value === '')
      ) {
        return;
      }

      if (mergedFilterModel[ctxFilter.field]) return;

      const rawOp = ctxFilter.operator || 'equals';

      if (isBlankOp) {
        const filterType =
          ctxFilter.type === 'date' || ctxFilter.type === 'daterange'
            ? 'date'
            : ctxFilter.type === 'number'
            ? 'number'
            : 'text';
        mergedFilterModel[ctxFilter.field] = { filterType, type: rawOp };
      } else if (ctxFilter.type === 'date' || ctxFilter.type === 'daterange') {
        const isRange = Array.isArray(ctxFilter.value);
        const agOp = DATAVIEW_TO_GRID_DATE_OP[rawOp] ?? rawOp;
        mergedFilterModel[ctxFilter.field] = {
          filterType: 'date',
          type: isRange ? 'inRange' : agOp,
          dateFrom: isRange
            ? (ctxFilter.value as string[])[0]
            : ctxFilter.value,
          dateTo: isRange ? (ctxFilter.value as string[])[1] : undefined,
        };
      } else if (ctxFilter.type === 'number') {
        const agOp = DATAVIEW_TO_GRID_NUMBER_OP[rawOp] ?? rawOp;
        mergedFilterModel[ctxFilter.field] = {
          filterType: 'number',
          type: agOp,
          filter: ctxFilter.value,
        };
      } else if (ctxFilter.type === 'multiselect') {
        const values = Array.isArray(ctxFilter.value)
          ? ctxFilter.value
          : [ctxFilter.value];
        const normalizedValues = values.filter(
          (value) => value !== null && value !== undefined && value !== ''
        );
        if (normalizedValues.length === 0) {
          return;
        }
        mergedFilterModel[ctxFilter.field] = {
          filterType: 'set',
          values: normalizedValues,
        };
      } else if (ctxFilter.type === 'select') {
        mergedFilterModel[ctxFilter.field] = {
          filterType: 'set',
          values: [ctxFilter.value],
        };
      } else if (ctxFilter.type === 'boolean') {
        if (typeof ctxFilter.value !== 'boolean') {
          return;
        }
        mergedFilterModel[ctxFilter.field] = {
          filterType: 'set',
          values: [ctxFilter.value],
        };
      } else {
        const agOp = DATAVIEW_TO_GRID_TEXT_OP[rawOp] ?? rawOp;
        mergedFilterModel[ctxFilter.field] = {
          filterType: 'text',
          type: agOp,
          filter: ctxFilter.value,
        };
      }
    });

    if (hasServerSearch && searchText && searchField) {
      if (!mergedFilterModel[searchField]) {
        mergedFilterModel[searchField] = {
          filterType: 'text',
          type: 'contains',
          filter: searchText,
        };
      }
    }

    return onFetchDataCallback({
      ...params,
      filterModel: mergedFilterModel as Parameters<
        NonNullable<typeof onFetchDataCallback>
      >[0]['filterModel'],
      sortModel: mergedSortModel,
      quickFilterText: hasServerSearch ? undefined : params.quickFilterText,
      contextFilters: filters ?? [],
      contextSorts: sorts ?? [],
      contextSearchText: hasServerSearch ? searchText : undefined,
      contextSearchField: hasServerSearch ? searchField : undefined,
    });
  };

  const finalListViewProps =
    dataMode === 'server' && onFetchDataCallback
      ? {
          ...listViewProps,
          dataMode: 'server' as const,
          onFetchData: fetchInterceptor,
          refreshKey:
            externalRefreshKey === undefined
              ? queryVersion
              : `${queryVersion}:${externalRefreshKey}`,
        }
      : {
          ...listViewProps,
          dataMode: 'client' as const,
          rowData: processedData,
        };

  let content = null;
  if (resolvedViewMode === 'list') {
    content = (
      <DataViewGridSurface>
        <Suspense fallback={<ViewLoadingFallback />}>
          <LazyListView {...finalListViewProps} />
        </Suspense>
      </DataViewGridSurface>
    );
  } else if (resolvedViewMode === 'kanban') {
    const activeKanbanViewProps = createKanbanViewProps({
      columnDefs,
      externalLoading,
      kanbanOptions,
      processedData,
    });
    if (activeKanbanViewProps) {
      content = (
        <DataViewGridSurface>
          <Suspense fallback={<ViewLoadingFallback />}>
            <LazyKanbanView {...activeKanbanViewProps} />
          </Suspense>
        </DataViewGridSurface>
      );
    }
  } else if (resolvedViewMode === 'card') {
    const activeCardViewProps = createCardViewProps({
      cardOptions,
      columnDefs,
      externalLoading,
      processedData,
    });
    if (activeCardViewProps) {
      content = (
        <Suspense fallback={<ViewLoadingFallback />}>
          <LazyCardView {...activeCardViewProps} />
        </Suspense>
      );
    }
  }

  return (
    <DataViewSurfaces
      style={style}
      className={className}
      containerRef={containerRef}
      totalCount={totalCount}
      headerActions={headerActions}
      renderToolbar={renderToolbar}
    >
      {content}
    </DataViewSurfaces>
  );
}

function DataViewSurfaces({
  style,
  className,
  containerRef,
  totalCount,
  headerActions,
  renderToolbar,
  children,
}: {
  style: DataViewProps<DataViewItem>['style'];
  className: DataViewProps<DataViewItem>['className'];
  containerRef: RefObject<HTMLDivElement | null>;
  totalCount: number;
  headerActions: DataViewProps<DataViewItem>['headerActions'];
  renderToolbar: DataViewProps<DataViewItem>['renderToolbar'];
  children: React.ReactNode;
}) {
  const { token } = theme.useToken();
  // Tighter than AntD's default `borderRadiusLG` so the toolbar surface
  // reads as a utilitarian frame instead of a soft card.
  const surfaceBorderRadius = token.borderRadiusSM;

  return (
    <Flex
      vertical
      gap="small"
      style={{
        height: '100%',
        width: '100%',
        ...style,
      }}
      className={className}
      ref={containerRef}
    >
      {/* Toolbar lives in its own white card so the surrounding wash shows
          through the gap between toolbar and grid — matches the Figma layout
          where each section reads as an independent floating surface. The
          grid/kanban/card surface below is owned by the active view (or its
          `DataViewGridSurface` wrapper), so this orchestrator stays
          view-mode-agnostic. */}
      <Card
        variant="outlined"
        size="small"
        style={{ borderRadius: surfaceBorderRadius }}
      >
        <DataViewHeader
          totalCount={totalCount}
          headerActions={headerActions}
          renderToolbar={renderToolbar}
        />
      </Card>

      {children}
    </Flex>
  );
}
