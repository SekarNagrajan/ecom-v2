/**
 * Extracts the specific characters used for Grouping (thousands) and Decimals
 * for a given locale string.
 *
 * Example:
 * 'en-US' -> { group: ',', decimal: '.' }
 * 'de-DE' -> { group: '.', decimal: ',' }
 */
export const getLocaleNumberSeparators = (locale: string) => {
  const parts = new Intl.NumberFormat(locale).formatToParts(1000.1);
  return {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  };
};

/**
 * Detects the numeric grouping style (Western vs Indian vs Chinese)
 * supported by the 'react-number-format' library.
 *
 * Logic:
 * We format the number 100,000 (One Hundred Thousand) and analyze the output parts.
 *
 * 1. Western ('thousand'): "100,000"
 *    - Last group has 3 digits.
 *    - Total grouping separators: 1.
 *
 * 2. Indian ('lakh'): "1,00,000"
 *    - Last group has 3 digits.
 *    - Total grouping separators: 2.
 *
 * 3. Chinese ('wan'): "10,0000"
 *    - Last group has 4 digits.
 *
 * @param locale - BCP 47 language tag (e.g., 'en-US', 'hi-IN', 'zh-CN')
 * @returns 'thousand' | 'lakh' | 'wan'
 */
export const detectNumericGroupingStyle = (
  locale: string
): 'thousand' | 'wan' | 'lakh' | 'none' | undefined => {
  try {
    // Format 100,000 to test the grouping logic
    const parts = new Intl.NumberFormat(locale).formatToParts(100000);

    // Get all integer segments (excluding separators)
    const integerParts = parts.filter((p) => p.type === 'integer');

    // Get all separator segments
    const separators = parts.filter((p) => p.type === 'group');

    // Safety check: Ensure we actually have integer parts
    if (integerParts.length === 0) return 'thousand';

    // Get the last group safely
    const lastGroup = integerParts[integerParts.length - 1];

    // TypeScript Guard: If for some reason undefined, fallback to standard
    if (!lastGroup) return 'thousand';

    const lastGroupLength = lastGroup.value.length;

    // CASE 1: Chinese 'Wan' style (Groups of 4)
    if (lastGroupLength === 4) {
      return 'wan';
    }

    // CASE 2: Indian 'Lakh' style (2,2,3)
    if (lastGroupLength === 3 && separators.length >= 2) {
      return 'lakh';
    }

    // CASE 3: Standard Western 'Thousand' style (Groups of 3)
    return 'thousand';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 'thousand';
  }
};

/**
 * Checks if a value is empty (null, undefined, or empty string).
 */
export const isEmptyValue = (value: unknown): value is null | undefined | '' =>
  value === null || value === undefined || value === '';

/**
 * Safely parses a value into a finite number or returns null.
 */
export const parseNumberValue = (value: unknown): number | null => {
  if (isEmptyValue(value)) return null;
  const numericValue =
    typeof value === 'string' ? Number(value) : (value as number);
  return typeof numericValue === 'number' && Number.isFinite(numericValue)
    ? numericValue
    : null;
};

/**
 * Formats a numeric value as a number string based on locale.
 */
export const formatNumber = (
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};
