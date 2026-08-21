/**
 * Converts a value to a finite number or null.
 * Handles null, undefined, empty string, and non-finite values.
 */
export const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};
