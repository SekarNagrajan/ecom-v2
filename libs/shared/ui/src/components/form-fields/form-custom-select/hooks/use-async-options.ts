import { type DefaultOptionType } from 'antd/es/select';
import { useState, useRef, useCallback } from 'react';

import { useDebouncedCallback } from '../../../../hooks';

export function useAsyncOptions({
  fetchOptions,
  minChars = 2,
  debounceTimeout = 300,
}: {
  fetchOptions: (q: string) => Promise<DefaultOptionType[]>;
  minChars?: number;
  debounceTimeout?: number;
}) {
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchIdRef = useRef(0);

  const load = useCallback(
    async (q: string) => {
      if (q.length < minChars) {
        setOptions([]);
        setLoading(false);
        return;
      }

      const id = ++fetchIdRef.current;
      setLoading(true);

      try {
        const result = await fetchOptions(q);
        if (id === fetchIdRef.current) {
          setOptions(result);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (id === fetchIdRef.current) {
          setOptions([]);
        }
      } finally {
        if (id === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchOptions, minChars]
  );

  const debouncedLoad = useDebouncedCallback(load, debounceTimeout);

  const onSearch = useCallback(
    (q: string) => {
      setSearchValue(q);
      debouncedLoad(q);
    },
    [debouncedLoad]
  );

  const reset = useCallback(() => {
    setSearchValue('');
    setOptions([]);
    setLoading(false);
  }, []);

  return {
    searchValue,
    setSearchValue,
    options,
    loading,
    onSearch,
    reset,
  };
}
