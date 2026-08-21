/**
 * Analyzes a locale and currency to determine the symbol and its preferred position.
 *
 * Example:
 * ('en-US', 'USD') -> { symbol: '$', position: 'start' }
 * ('fr-FR', 'EUR') -> { symbol: '€', position: 'end' }
 */
export const getCurrencyMetadata = (
  locale: string,
  currency: string,
  display: 'symbol' | 'code' | 'name' = 'symbol'
) => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: display,
    });

    const parts = formatter.formatToParts(1.1); // Use a dummy number
    const currencyPart = parts.find((p) => p.type === 'currency');
    const symbol = currencyPart?.value ?? currency;

    // Determine position: Is the currency part occurring before the integer part?
    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');

    const position: 'start' | 'end' =
      currencyIndex < integerIndex ? 'start' : 'end';

    return { symbol, position };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Fallback if invalid currency code
    return { symbol: currency, position: 'start' as const };
  }
};

/**
 * Formats a numeric value as a currency string.
 */
export const formatCurrency = (
  value: number,
  locale: string,
  currency: string,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
};
