import type { DataViewItem } from '../data-view-item';
import { getValue, toLowerString } from './data-utils';

/**
 * Interface for columns that can be searched.
 * We only need the 'field' property to perform a search.
 */
export interface SearchableColumn {
  field?: string;
}

/**
 * Apply text search across all searchable columns
 * Returns items where any column contains the search text
 */
export function applySearch<T extends DataViewItem>(
  data: T[],
  searchText: string,
  columns: SearchableColumn[]
): T[] {
  const trimmed = searchText.trim().toLowerCase();

  if (!trimmed) {
    return data;
  }

  // Get searchable fields from columns
  const searchableFields = columns
    .filter((col) => col.field)
    .map((col) => col.field as string);

  return data.filter((item) =>
    searchableFields.some((field) => {
      const value = getValue(item, field);
      const strValue = toLowerString(value);
      return strValue.includes(trimmed);
    })
  );
}

/**
 * Highlight search text within a string value
 * Returns array of segments with isMatch flag
 */
export function highlightSearchText(
  text: string,
  searchText: string
): Array<{ text: string; isMatch: boolean }> {
  if (!searchText.trim()) {
    return [{ text, isMatch: false }];
  }

  const segments: Array<{ text: string; isMatch: boolean }> = [];
  const lowerText = text.toLowerCase();
  const lowerSearch = searchText.toLowerCase();

  let lastIndex = 0;
  let index = lowerText.indexOf(lowerSearch);

  while (index !== -1) {
    // Add non-matching segment before the match
    if (index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, index),
        isMatch: false,
      });
    }

    // Add matching segment
    segments.push({
      text: text.slice(index, index + searchText.length),
      isMatch: true,
    });

    lastIndex = index + searchText.length;
    index = lowerText.indexOf(lowerSearch, lastIndex);
  }

  // Add remaining non-matching segment
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isMatch: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, isMatch: false }];
}
