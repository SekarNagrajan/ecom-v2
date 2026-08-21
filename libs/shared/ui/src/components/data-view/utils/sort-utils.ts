import type { DataViewItem } from '../data-view-item';
import type { SortConfig } from '../stores/data-view-types';
import { getValue } from './data-utils';

/**
 * Compare two values for sorting
 * Handles strings, numbers, dates, and null/undefined
 */
function compareValues(a: unknown, b: unknown): number {
  // Handle null/undefined - push to end
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Try to parse as dates if they look like date strings
  if (typeof a === 'string' && typeof b === 'string') {
    const dateA = Date.parse(a);
    const dateB = Date.parse(b);

    if (!isNaN(dateA) && !isNaN(dateB)) {
      // Both are valid dates
      return dateA - dateB;
    }
  }

  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Handle strings (case-insensitive)
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();

  return strA.localeCompare(strB);
}

/**
 * Apply sorts to a data array
 * Supports multi-column sorting (first sort has highest priority)
 */
export function applySorts<T extends DataViewItem>(
  data: T[],
  sorts: SortConfig[]
): T[] {
  if (!sorts || sorts.length === 0) {
    return data;
  }

  // Create a shallow copy to avoid mutating the original array
  return [...data].sort((a, b) => {
    for (const sort of sorts) {
      const valueA = getValue(a, sort.field);
      const valueB = getValue(b, sort.field);

      let comparison = compareValues(valueA, valueB);

      // Reverse for descending
      if (sort.direction === 'desc') {
        comparison = -comparison;
      }

      // If not equal, return the comparison result
      if (comparison !== 0) {
        return comparison;
      }

      // If equal, continue to next sort field
    }

    // All sort fields are equal
    return 0;
  });
}

/**
 * Toggle sort direction for a field
 * If field not in sorts, adds as 'asc'
 * If 'asc', changes to 'desc'
 * If 'desc', changes back to 'asc'
 */
export function toggleSort(sorts: SortConfig[], field: string): SortConfig[] {
  const existingIndex = sorts.findIndex((s) => s.field === field);

  if (existingIndex === -1) {
    // Add new sort as 'asc'
    return [...sorts, { field, direction: 'asc' }];
  }

  const existing = sorts[existingIndex];

  if (existing && existing.direction === 'asc') {
    // Change to 'desc'
    const newSorts = [...sorts];
    newSorts[existingIndex] = { field, direction: 'desc' };
    return newSorts;
  }

  // Change back to 'asc' (currently 'desc')
  const newSorts = [...sorts];
  newSorts[existingIndex] = { field, direction: 'asc' };
  return newSorts;
}

/**
 * Get sort direction for a field
 * Returns undefined if field is not sorted
 */
export function getSortDirection(
  sorts: SortConfig[],
  field: string
): 'asc' | 'desc' | undefined {
  const sort = sorts.find((s) => s.field === field);
  return sort?.direction;
}

/**
 * Get sort index for a field (for displaying sort priority)
 * Returns -1 if field is not sorted
 */
export function getSortIndex(sorts: SortConfig[], field: string): number {
  return sorts.findIndex((s) => s.field === field);
}

/**
 * Move a sort field to a different position in the sort order
 */
export function reorderSort(
  sorts: SortConfig[],
  field: string,
  newIndex: number
): SortConfig[] {
  const currentIndex = sorts.findIndex((s) => s.field === field);

  if (currentIndex === -1 || currentIndex === newIndex) {
    return sorts;
  }

  const newSorts = [...sorts];
  const [removed] = newSorts.splice(currentIndex, 1);

  if (removed) {
    newSorts.splice(newIndex, 0, removed);
  }

  return newSorts;
}
