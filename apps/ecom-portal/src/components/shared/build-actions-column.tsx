import type { DataViewColumn, DataViewItem } from '@solverminds/shared-ui/data-view';

interface BuildActionsColumnInput<TData extends DataViewItem> {
  field: DataViewColumn<TData>['field'];
  width: number;
  cellRenderer: DataViewColumn<TData>['cellRenderer'];
  hide?: boolean;
}

export function buildActionsColumn<TData extends DataViewItem>({
  field,
  width,
  cellRenderer,
  hide,
}: BuildActionsColumnInput<TData>): DataViewColumn<TData> {
  return {
    field,
    headerName: 'Actions',
    flex: null,
    width,
    suppressSizeToFit: true,
    pinned: 'left',
    sortable: false,
    filter: false,
    excludeFromExport: true,
    cellRenderer,
    ...(hide ? { hide: true } : {}),
  };
}
