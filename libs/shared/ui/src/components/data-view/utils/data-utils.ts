import type { DataViewItem } from '../data-view-item';

/**
 * Memoized path accessor to avoid repeated string splitting
 */
const pathCache = new Map<string, string[]>();

export function getPathParts(path: string): string[] {
  let parts = pathCache.get(path);
  if (!parts) {
    parts = path.split('.');
    pathCache.set(path, parts);
  }
  return parts;
}

/**
 * Get a nested value from an object using a pre-split path.
 * Centrally used by filter, sort, and search utilities.
 */
export function getValue<T extends DataViewItem>(
  obj: T,
  path: string
): unknown {
  const parts = getPathParts(path);
  let current: unknown = obj;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Convert value to lowercase string for case-insensitive comparison/search
 */
export function toLowerString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    return JSON.stringify(value).toLowerCase();
  }
  return String(value).toLowerCase();
}
