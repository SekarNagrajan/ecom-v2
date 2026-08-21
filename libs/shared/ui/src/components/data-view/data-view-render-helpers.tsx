import { Flex, Spin, theme } from 'antd';

import type { CardViewProps } from './card-view/types';
import type { DataViewItem } from './data-view-item';
import type { KanbanViewProps } from './kanban-view/types';
import type { DataViewProps } from './types';

const EMPTY_SEARCHABLE_FIELDS: NonNullable<
  DataViewProps<DataViewItem>['searchableFields']
> = [];

export function resolveInitialSearchField<TData extends DataViewItem>(
  searchableFields: DataViewProps<TData>['searchableFields'],
  defaultSearchField: string | undefined
): string {
  const fields = searchableFields ?? EMPTY_SEARCHABLE_FIELDS;

  if (defaultSearchField) {
    const matchingField = fields.find(
      (field) => field.field === defaultSearchField
    );

    if (matchingField) {
      return matchingField.field;
    }
  }

  return fields[0]?.field ?? '';
}

export function createKanbanViewProps<TData extends DataViewItem>({
  columnDefs,
  externalLoading,
  kanbanOptions,
  processedData,
}: {
  columnDefs: KanbanViewProps<TData>['columnDefs'];
  externalLoading: boolean | undefined;
  kanbanOptions: DataViewProps<TData>['kanbanOptions'];
  processedData: TData[];
}): KanbanViewProps<TData> | null {
  if (!kanbanOptions) {
    return null;
  }

  return {
    data: kanbanOptions.data ?? processedData,
    columnDefs,
    groupByField: kanbanOptions.groupByField,
    lanes: kanbanOptions.lanes,
    onItemUpdate: kanbanOptions.onItemUpdate,
    idField: kanbanOptions.idField,
    renderCard: kanbanOptions.renderCard,
    className: kanbanOptions.className,
    style: kanbanOptions.style,
    loading: kanbanOptions.loading ?? externalLoading,
    onLoadMore: kanbanOptions.onLoadMore,
    hasMore: kanbanOptions.hasMore,
    loadingMore: kanbanOptions.loadingMore,
    fetchMode: kanbanOptions.fetchMode,
    collapsible: kanbanOptions.collapsible,
    cardGap: kanbanOptions.cardGap,
    estimatedCardHeight: kanbanOptions.estimatedCardHeight,
    columnWidth: kanbanOptions.columnWidth,
    dragActivation: kanbanOptions.dragActivation,
  };
}

export function createCardViewProps<TData extends DataViewItem>({
  cardOptions,
  columnDefs,
  externalLoading,
  processedData,
}: {
  cardOptions: DataViewProps<TData>['cardOptions'];
  columnDefs: CardViewProps<TData>['columnDefs'];
  externalLoading: boolean | undefined;
  processedData: TData[];
}): CardViewProps<TData> | null {
  if (!cardOptions) {
    return null;
  }

  const { data, loading, ...restCardOptions } = cardOptions;

  return {
    ...restCardOptions,
    data: data ?? processedData,
    columnDefs,
    loading: loading ?? externalLoading,
  };
}

export function ViewLoadingFallback() {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={token.marginXS}
      style={{
        flex: 1,
        minHeight: 280,
        color: token.colorTextDescription,
      }}
    >
      <Spin size="small" />
      <span>Loading view...</span>
    </Flex>
  );
}
