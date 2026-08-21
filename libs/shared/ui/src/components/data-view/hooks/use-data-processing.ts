import {
  useFilters,
  useSorts,
  useSearchText,
  useColumnDefs,
} from '../context/data-view-context';
import type { DataViewItem } from '../data-view-item';
import { dataViewUtils } from '../utils';

export function useDataProcessing<T extends DataViewItem>(
  data: T[] | undefined,
  dataMode: 'client' | 'server'
) {
  const filters = useFilters();
  const sorts = useSorts();
  const searchText = useSearchText();
  const columnDefs = useColumnDefs();

  if (dataMode === 'server') {
    return data ?? [];
  }

  let result = data ?? [];

  if (searchText && columnDefs?.length > 0) {
    result = dataViewUtils.applySearch(result, searchText, columnDefs);
  }

  if (filters?.length > 0) {
    result = dataViewUtils.applyFilters(result, filters);
  }

  if (sorts?.length > 0) {
    result = dataViewUtils.applySorts(result, sorts);
  }

  return result;
}
