import type { DataViewItem } from '../data-view-item';
import type {
  FilterFieldConfig,
  FilterType,
  FilterOption,
  MultiselectFilterField,
  SelectFilterField,
} from '../stores/data-view-types';
import type { DataViewColumn } from '../types';

/**
 * Maps AG Grid / shared filter types to our internal FilterType
 */
function mapFilterType(columnType?: string): FilterType {
  switch (columnType) {
    case 'number':
    case 'agNumberColumnFilter':
      return 'number';
    case 'date':
    case 'agDateColumnFilter':
      return 'date';
    case 'boolean':
      return 'boolean';
    case 'set':
    case 'agSetColumnFilter':
      return 'multiselect';
    case 'text':
    case 'agTextColumnFilter':
    default:
      return 'text';
  }
}

function inferOptionsFromColumn<TData extends DataViewItem>(
  col: DataViewColumn<TData>
): FilterOption[] | undefined {
  if (col.filterOptions && col.filterOptions.length > 0) {
    return col.filterOptions;
  }

  const filterParams = col.filterParams;
  if (!filterParams || typeof filterParams !== 'object') {
    return undefined;
  }

  const values = (filterParams as { values?: unknown }).values;
  if (!Array.isArray(values)) {
    return undefined;
  }

  const options = values
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map((value) => ({
      label: String(value),
      value: value as string | number,
    }));

  return options.length > 0 ? options : undefined;
}

/**
 * Infers filter configuration from DataView columns.
 * Can be used when `filterConfig` prop is not provided.
 */
export function inferFilterConfig<TData extends DataViewItem>(
  columns: DataViewColumn<TData>[]
): FilterFieldConfig[] {
  return columns
    .filter((col) => {
      // If explicitly disabled, exclude
      if (col.filter === false) return false;
      // Include if explicitly enabled OR if filterType is provided
      return (col.filter || col.filterType) && col.field;
    })
    .map((col) => {
      // Determine filter type based on column definition
      let type: FilterType = 'text';

      if (col.filterType) {
        // 1. Priority: Explicit filterType on column
        type = col.filterType;
      } else if (col.filterOptions || col.fetchFilterOptions) {
        // 2. Logic: If options are provided but no type, assume multiselect
        type = 'multiselect';
      } else if (typeof col.filter === 'string') {
        // 3. AG Grid compatibility mappings
        type = mapFilterType(col.filter);
      } else if (col.filter === true) {
        // 4. Default inference
        type = 'text';
      }

      // Map to specific filter field configurations based on type
      const base = {
        field: col.field as string,
        label: col.filterLabel ?? col.headerName ?? (col.field as string),
      };

      switch (type) {
        case 'select':
          return {
            ...base,
            type: 'select',
            options: inferOptionsFromColumn(col),
            fetchOptions: col.fetchFilterOptions,
          } satisfies SelectFilterField;

        case 'multiselect':
          return {
            ...base,
            type: 'multiselect',
            options: inferOptionsFromColumn(col),
            fetchOptions: col.fetchFilterOptions,
          } satisfies MultiselectFilterField;

        case 'number':
          return {
            ...base,
            type: 'number',
          };

        case 'date':
          return {
            ...base,
            type: 'date',
          };

        case 'daterange':
          return {
            ...base,
            type: 'daterange',
          };

        case 'boolean':
          return {
            ...base,
            type: 'boolean',
            toggleLabel: col.filterToggleLabel,
          };

        case 'text':
        default:
          return {
            ...base,
            type: 'text',
          };
      }
    });
}
