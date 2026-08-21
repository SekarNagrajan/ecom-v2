import type {
  FilterValue,
  SortConfig,
  FilterType,
} from '../stores/data-view-types';
import type { DataViewMode } from '../types';

// =============================================================================
// Filter Serialization
// =============================================================================

/**
 * Serialize filters to URL-safe string
 * Format: field1:value1|field2:value2,value3 (comma for multi-values)
 *
 * @example
 * [{ field: 'status', value: 'active' }, { field: 'roles', value: ['admin', 'user'] }]
 * => "status:active|roles:admin,user"
 */
export function serializeFilters(filters: FilterValue[]): string | undefined {
  if (!filters || filters.length === 0) {
    return undefined;
  }

  const parts = filters
    .filter((f) => {
      // Skip empty values
      if (f.value === undefined || f.value === null || f.value === '') {
        return false;
      }
      if (Array.isArray(f.value) && f.value.length === 0) {
        return false;
      }
      return true;
    })
    .map((f) => {
      const value = Array.isArray(f.value)
        ? f.value.map(encodeURIComponent).join(',')
        : encodeURIComponent(String(f.value));

      // Include operator if not default
      const operatorPart = f.operator ? `~${f.operator}` : '';

      return `${encodeURIComponent(f.field)}${operatorPart}:${value}`;
    });

  return parts.length > 0 ? parts.join('|') : undefined;
}

/**
 * Helper to build a FilterType map from DataView columns.
 * Useful for URL deserialization.
 */
export function getFilterTypeMapFromColumns(
  columns: Array<{ field?: string; filterType?: FilterType }>
): Record<string, FilterType> {
  const map: Record<string, FilterType> = {};
  columns.forEach((col) => {
    if (col.field) {
      map[col.field] = col.filterType || 'text';
    }
  });
  return map;
}

/**
 * Deserialize filters from URL string
 * If filterTypeMap is missing, defaults to text but tries to guess arrays if commas exist.
 */
export function deserializeFilters(
  str: string | undefined,
  filterTypeMap: Record<string, FilterType> = {}
): FilterValue[] {
  if (!str) {
    return [];
  }

  try {
    const results: FilterValue[] = [];

    for (const part of str.split('|')) {
      const colonIndex = part.indexOf(':');
      if (colonIndex === -1) continue;

      const fieldPart = part.slice(0, colonIndex);
      const valuePart = part.slice(colonIndex + 1);

      let field = fieldPart;
      let operator: FilterValue['operator'];

      const tildeIndex = fieldPart.indexOf('~');
      if (tildeIndex !== -1) {
        field = fieldPart.slice(0, tildeIndex);
        operator = fieldPart.slice(tildeIndex + 1) as FilterValue['operator'];
      }

      field = decodeURIComponent(field);
      const type =
        filterTypeMap[field] ||
        (valuePart.includes(',') ? 'multiselect' : 'text');

      let value: unknown;
      if (
        type === 'multiselect' ||
        type === 'daterange' ||
        valuePart.includes(',')
      ) {
        value = valuePart.split(',').map(decodeURIComponent);
      } else if (type === 'number') {
        const decoded = decodeURIComponent(valuePart);
        value = decoded === '' ? undefined : Number(decoded);
      } else if (type === 'boolean') {
        const decoded = decodeURIComponent(valuePart).toLowerCase();
        value = decoded === 'true';
      } else {
        value = decodeURIComponent(valuePart);
      }

      const filterValue: FilterValue = {
        field,
        type: type as FilterType,
        value,
      };

      if (operator) {
        filterValue.operator = operator;
      }

      results.push(filterValue);
    }

    return results;
  } catch {
    console.warn('Failed to deserialize filters:', str);
    return [];
  }
}

// =============================================================================
// Sort Serialization
// =============================================================================

/**
 * Serialize sorts to URL-safe string
 * Format: field1:asc,field2:desc
 *
 * @example
 * [{ field: 'name', direction: 'asc' }, { field: 'date', direction: 'desc' }]
 * => "name:asc,date:desc"
 */
export function serializeSorts(sorts: SortConfig[]): string | undefined {
  if (!sorts || sorts.length === 0) {
    return undefined;
  }

  const parts = sorts.map(
    (s) => `${encodeURIComponent(s.field)}:${s.direction}`
  );

  return parts.join(',');
}

/**
 * Deserialize sorts from URL string
 */
export function deserializeSorts(str: string | undefined): SortConfig[] {
  if (!str) {
    return [];
  }

  try {
    const results: SortConfig[] = [];

    for (const part of str.split(',')) {
      const colonIndex = part.indexOf(':');
      if (colonIndex === -1) {
        continue;
      }

      const field = decodeURIComponent(part.slice(0, colonIndex));
      const direction = part.slice(colonIndex + 1);

      results.push({
        field,
        direction: direction === 'desc' ? 'desc' : 'asc',
      });
    }

    return results;
  } catch {
    console.warn('Failed to deserialize sorts:', str);
    return [];
  }
}

// =============================================================================
// View Mode Serialization
// =============================================================================

const VALID_VIEW_MODES: DataViewMode[] = ['list', 'kanban', 'card'];

/**
 * Validate and return view mode, with fallback
 */
export function parseViewMode(
  value: string | undefined,
  defaultMode: DataViewMode = 'list'
): DataViewMode {
  if (value && VALID_VIEW_MODES.includes(value as DataViewMode)) {
    return value as DataViewMode;
  }
  return defaultMode;
}

// =============================================================================
// Combined URL State
// =============================================================================

export interface DataViewUrlState {
  view?: DataViewMode;
  q?: string;
  filters?: string;
  sort?: string;
}

export function parseDataViewUrlState(
  params: DataViewUrlState,
  filterTypeMap: Record<string, FilterType> = {},
  defaultViewMode: DataViewMode = 'list'
): {
  viewMode: DataViewMode;
  searchText: string;
  filters: FilterValue[];
  sorts: SortConfig[];
} {
  return {
    viewMode: parseViewMode(params.view, defaultViewMode),
    searchText: params.q ?? '',
    filters: deserializeFilters(params.filters, filterTypeMap),
    sorts: deserializeSorts(params.sort),
  };
}

/**
 * Serialize DataView state to URL params
 */
export function serializeDataViewUrlState(state: {
  viewMode?: DataViewMode;
  searchText?: string;
  filters?: FilterValue[];
  sorts?: SortConfig[];
}): DataViewUrlState {
  return {
    view: state.viewMode,
    q: state.searchText || undefined,
    filters: state.filters ? serializeFilters(state.filters) : undefined,
    sort: state.sorts ? serializeSorts(state.sorts) : undefined,
  };
}
