import { type DefaultOptionType } from 'antd/es/select';
import { useMemo } from 'react';

export function useHydratedValue({
  value,
  optionCache,
  labelKey,
  valueKey,
  isArrayMode,
}: {
  value: unknown;
  optionCache: Record<string, DefaultOptionType>;
  labelKey: string;
  valueKey: string;
  isArrayMode: boolean;
}) {
  return useMemo(() => {
    const hydrate = (id: string | number) => {
      const cached = optionCache[String(id)];
      return {
        value: id,
        label: cached?.[labelKey] ?? cached?.label ?? id,
      };
    };

    if (Array.isArray(value)) {
      return value.filter(Boolean).map(hydrate);
    }

    if (value !== null && value !== undefined && value !== '') {
      const hydrated = hydrate(value as string | number);
      return isArrayMode ? [hydrated] : hydrated;
    }

    return isArrayMode ? [] : undefined;
  }, [value, optionCache, labelKey, isArrayMode]);
}
