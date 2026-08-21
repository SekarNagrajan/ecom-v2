import { useEffect, useEffectEvent, useMemo, useState } from 'react';

import type {
  FilterFieldConfig,
  FilterOption,
} from '../../stores/data-view-types';

type SelectLikeFilterConfig = FilterFieldConfig & {
  type: 'select' | 'multiselect';
  options?: FilterOption[];
  fetchOptions?: () => Promise<FilterOption[]>;
};

interface UseFilterOptionsResult {
  options: FilterOption[];
  loading: boolean;
}

const EMPTY_STATIC_OPTIONS: FilterOption[] = [];

export function useFilterOptions(
  config: SelectLikeFilterConfig | null
): UseFilterOptionsResult {
  const staticOptions = config?.options ?? EMPTY_STATIC_OPTIONS;
  const shouldFetch = !!config?.fetchOptions && !config?.options;
  const requestKey = `${config?.type ?? ''}:${config?.field ?? ''}`;

  const [fetchedOptions, setFetchedOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(shouldFetch);

  const fetchOptions = useEffectEvent(async (signal: AbortSignal) => {
    if (!config?.fetchOptions) {
      return;
    }

    try {
      const results = await config.fetchOptions();
      if (signal.aborted) {
        return;
      }

      setFetchedOptions(results);
      setLoading(false);
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      console.error('Failed to fetch filter options:', error);
      setFetchedOptions([]);
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    const abortController = new AbortController();
    void fetchOptions(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [requestKey, shouldFetch]);

  return useMemo(
    () => ({
      options: staticOptions.length > 0 ? staticOptions : fetchedOptions,
      loading: shouldFetch ? loading : false,
    }),
    [fetchedOptions, loading, shouldFetch, staticOptions]
  );
}
