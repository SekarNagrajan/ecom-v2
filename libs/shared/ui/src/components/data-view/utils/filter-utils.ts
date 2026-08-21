import { DateTime } from 'luxon';

import type { DataViewItem } from '../data-view-item';
import type { FilterValue, FilterOperator } from '../stores/data-view-types';
import { getValue, toLowerString } from './data-utils';

/**
 * Check if a value matches a text filter
 */
function matchesTextFilter(
  itemValue: unknown,
  filterValue: unknown,
  operator: FilterOperator = 'contains'
): boolean {
  const itemStr = toLowerString(itemValue);
  const filterStr = toLowerString(filterValue);

  switch (operator) {
    case 'equals':
      return itemStr === filterStr;
    case 'notEquals':
      return itemStr !== filterStr;
    case 'contains':
      return itemStr.includes(filterStr);
    case 'notContains':
      return !itemStr.includes(filterStr);
    case 'startsWith':
      return itemStr.startsWith(filterStr);
    case 'endsWith':
      return itemStr.endsWith(filterStr);
    default:
      return itemStr.includes(filterStr);
  }
}

/**
 * Check if a value matches a number filter
 */
function matchesNumberFilter(
  itemValue: unknown,
  filterValue: unknown,
  operator: FilterOperator = 'equals'
): boolean {
  const itemNum = Number(itemValue);

  if (isNaN(itemNum)) return false;

  // Handle 'between' operator with array value
  if (operator === 'between' && Array.isArray(filterValue)) {
    const minVal =
      filterValue[0] !== null &&
      filterValue[0] !== undefined &&
      filterValue[0] !== ''
        ? Number(filterValue[0])
        : NaN;
    const maxVal =
      filterValue[1] !== null &&
      filterValue[1] !== undefined &&
      filterValue[1] !== ''
        ? Number(filterValue[1])
        : NaN;

    const hasMin = !isNaN(minVal);
    const hasMax = !isNaN(maxVal);

    if (hasMin && hasMax) return itemNum >= minVal && itemNum <= maxVal;
    if (hasMin) return itemNum >= minVal;
    if (hasMax) return itemNum <= maxVal;
    return true; // No bounds set
  }

  const filterNum = Number(filterValue);
  if (isNaN(filterNum)) return false;

  switch (operator) {
    case 'equals':
      return itemNum === filterNum;
    case 'notEquals':
      return itemNum !== filterNum;
    case 'greaterThan':
      return itemNum > filterNum;
    case 'greaterThanOrEqual':
      return itemNum >= filterNum;
    case 'lessThan':
      return itemNum < filterNum;
    case 'lessThanOrEqual':
      return itemNum <= filterNum;
    default:
      return itemNum === filterNum;
  }
}

/**
 * Check if a value matches a date filter
 */
function matchesDateFilter(
  itemValue: unknown,
  filterValue: unknown,
  operator: FilterOperator = 'equals'
): boolean {
  const toDT = (val: unknown) =>
    val instanceof Date
      ? DateTime.fromJSDate(val)
      : DateTime.fromISO(String(val));

  const itemDate = toDT(itemValue);
  if (!itemDate.isValid) return false;

  // Handle 'between' operator with array value (daterange)
  if (operator === 'between' && Array.isArray(filterValue)) {
    const startStr = filterValue[0];
    const endStr = filterValue[1];

    const startDate = startStr && startStr !== '' ? toDT(startStr) : null;
    const endDate = endStr && endStr !== '' ? toDT(endStr) : null;

    const hasStart = !!(startDate && startDate.isValid);
    const hasEnd = !!(endDate && endDate.isValid);

    if (hasStart && hasEnd) {
      return (
        itemDate >= startDate.startOf('day') && itemDate <= endDate.endOf('day')
      );
    }
    if (hasStart) return itemDate >= startDate.startOf('day');
    if (hasEnd) return itemDate <= endDate.endOf('day');
    return true;
  }

  const filterDate = toDT(filterValue);
  if (!filterDate.isValid) return false;

  switch (operator) {
    case 'equals':
      return itemDate.hasSame(filterDate, 'day');
    case 'notEquals':
      return !itemDate.hasSame(filterDate, 'day');
    case 'before':
      return itemDate < filterDate.startOf('day');
    case 'after':
      return itemDate > filterDate.endOf('day');
    default:
      return itemDate.hasSame(filterDate, 'day');
  }
}

/**
 * Check if a value matches a select filter (single value)
 */
function matchesSelectFilter(
  itemValue: unknown,
  filterValue: unknown,
  operator: FilterOperator = 'equals'
): boolean {
  const itemStr = toLowerString(itemValue);
  const filterStr = toLowerString(filterValue);

  switch (operator) {
    case 'equals':
      return itemStr === filterStr;
    case 'notEquals':
      return itemStr !== filterStr;
    default:
      return itemStr === filterStr;
  }
}

/**
 * Check if a value matches a multiselect filter (array of values)
 */
function matchesMultiselectFilter(
  itemValue: unknown,
  filterValue: unknown,
  operator: FilterOperator = 'in'
): boolean {
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true; // No filter applied
  }

  const itemStr = toLowerString(itemValue);
  const filterValues = filterValue.map(toLowerString);

  switch (operator) {
    case 'in':
      return filterValues.includes(itemStr);
    case 'notIn':
      return !filterValues.includes(itemStr);
    default:
      return filterValues.includes(itemStr);
  }
}

/**
 * Check if a single item matches a filter
 */
function matchesFilter<T extends DataViewItem>(
  item: T,
  filter: FilterValue
): boolean {
  const itemValue = getValue(item, filter.field);
  const { value, type, operator } = filter;

  // Check for blank/notBlank operators which don't require value
  if (operator === 'blank') {
    return itemValue === null || itemValue === undefined || itemValue === '';
  }
  if (operator === 'notBlank') {
    return itemValue !== null && itemValue !== undefined && itemValue !== '';
  }

  // Skip empty filter values for other operators
  if (value === undefined || value === null || value === '') {
    return true;
  }

  // Skip empty arrays
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  switch (type) {
    case 'text':
      return matchesTextFilter(itemValue, value, operator);
    case 'number':
      return matchesNumberFilter(itemValue, value, operator);
    case 'date':
      return matchesDateFilter(itemValue, value, operator);
    case 'daterange':
      return matchesDateFilter(itemValue, value, 'between');
    case 'select':
      return matchesSelectFilter(itemValue, value, operator);
    case 'multiselect':
      return matchesMultiselectFilter(itemValue, value, operator);
    case 'boolean':
      return String(itemValue) === String(value);
    default:
      return matchesTextFilter(itemValue, value, operator);
  }
}

/**
 * Apply filters to a data array
 * Returns items that match ALL filters (AND logic)
 */
export function applyFilters<T extends DataViewItem>(
  data: T[],
  filters: FilterValue[]
): T[] {
  if (!filters || filters.length === 0) {
    return data;
  }

  return data.filter((item) =>
    filters.every((filter) => matchesFilter(item, filter))
  );
}

/**
 * Check if any filters are active (have non-empty values)
 */
export function hasActiveFilters(filters: FilterValue[]): boolean {
  return filters.some((filter) => {
    // Should count blank/notBlank as active
    if (filter.operator === 'blank' || filter.operator === 'notBlank') {
      return true;
    }
    if (
      filter.value === undefined ||
      filter.value === null ||
      filter.value === ''
    ) {
      return false;
    }
    if (Array.isArray(filter.value) && filter.value.length === 0) {
      return false;
    }
    return true;
  });
}

/**
 * Get count of active filters
 */
export function getActiveFilterCount(filters: FilterValue[]): number {
  return filters.filter((filter) => {
    if (filter.operator === 'blank' || filter.operator === 'notBlank') {
      return true;
    }
    if (
      filter.value === undefined ||
      filter.value === null ||
      filter.value === ''
    ) {
      return false;
    }
    if (Array.isArray(filter.value) && filter.value.length === 0) {
      return false;
    }
    return true;
  }).length;
}
