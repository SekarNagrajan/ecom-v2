import { type DefaultOptionType } from 'antd/es/select';
import { useMemo } from 'react';

interface UseHydratedValueProps {
  value: unknown;
  optionCache: Record<string, DefaultOptionType>;
  labelKey: string;
  valueKey: string;
  mode: 'single' | 'multiple';
}

export function useHydratedValue({
  value,
  optionCache,
  labelKey,
  mode,
}: UseHydratedValueProps) {
  return useMemo(() => {
    const isMultiple = mode === 'multiple';

    const hydrate = (id: string | number) => {
      const cached = optionCache[String(id)];
      return {
        value: id,
        label: cached?.[labelKey] ?? cached?.label ?? id,
      };
    };

    if (Array.isArray(value)) {
      const hydrated = value
        .filter((v) => v !== null && v !== undefined && v !== '')
        .map(hydrate);
      return hydrated;
    }

    if (value !== null && value !== undefined && value !== '') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hydrated = hydrate(value as any);
      return isMultiple ? [hydrated] : hydrated;
    }

    return isMultiple ? [] : undefined;
  }, [value, optionCache, labelKey, mode]);
}
