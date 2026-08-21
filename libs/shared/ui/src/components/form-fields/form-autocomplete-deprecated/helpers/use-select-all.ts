import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { DefaultOptionType } from 'antd/es/select';
import { useCallback, useMemo } from 'react';
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';

interface UseSelectAllProps<T extends FieldValues> {
  field: ControllerRenderProps<T, Path<T>>;
  internalOptions: DefaultOptionType[];
  valueKey: string;
  optionCache: Record<string, DefaultOptionType>;
  setOptionCache: (cache: Record<string, DefaultOptionType>) => void;
  searchValue: string;
  minChars: number;
}

interface UseSelectAllReturn {
  isChecked: boolean;
  isIndeterminate: boolean;
  handleSelectAll: (e: CheckboxChangeEvent) => void;
  isSearching: boolean;
  shouldShowSelectAll: boolean;
}

export function useSelectAll<T extends FieldValues>({
  field,
  internalOptions,
  valueKey,
  optionCache,
  setOptionCache,
  searchValue,
  minChars,
}: UseSelectAllProps<T>): UseSelectAllReturn {
  // Normalize current selected IDs
  const currentIds = useMemo(() => {
    return (Array.isArray(field.value) ? field.value : []) as (
      | string
      | number
    )[];
  }, [field.value]);

  // Extract visible option IDs from search results
  const visibleIds = useMemo(() => {
    return internalOptions.map((opt) => opt[valueKey] ?? opt.value);
  }, [internalOptions, valueKey]);

  // Determine if we're in active search mode
  const isSearching = useMemo(
    () => searchValue.length >= minChars && internalOptions.length > 0,
    [searchValue.length, minChars, internalOptions.length]
  );

  // Check if all visible items are selected
  const allVisibleSelected = useMemo(() => {
    if (visibleIds.length === 0) return false;
    return visibleIds.every((id) => currentIds.includes(id));
  }, [visibleIds, currentIds]);

  // Calculate checkbox checked state
  const isChecked = useMemo(() => {
    if (!isSearching) {
      // Not searching: checked if ANY items selected (Clear All mode)
      return currentIds.length > 0;
    }
    // Searching: checked if ALL visible items are selected
    // This means if user searches and all results are already selected, show as checked
    return visibleIds.length > 0 && allVisibleSelected;
  }, [isSearching, allVisibleSelected, currentIds.length, visibleIds.length]);

  // Calculate indeterminate state (only relevant when searching)
  const isIndeterminate = useMemo(() => {
    if (!isSearching || visibleIds.length === 0) return false;

    const selectedVisibleCount = visibleIds.filter((id) =>
      currentIds.includes(id)
    ).length;

    return selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
  }, [isSearching, visibleIds, currentIds]);

  // Determine if Select All should be visible
  const shouldShowSelectAll = useMemo(() => {
    return isSearching || currentIds.length > 0;
  }, [isSearching, currentIds.length]);

  // Handle Select All toggle
  const handleSelectAll = useCallback(
    (e: CheckboxChangeEvent) => {
      const shouldSelect = e.target.checked;
      const newCache = { ...optionCache };
      let newIds: (string | number)[];

      if (isSearching) {
        // Context A: Search Mode - Toggle visible options
        if (shouldSelect) {
          // Add all visible options
          const visibleIdsSet = new Set(currentIds);
          internalOptions.forEach((opt) => {
            const idVal = opt[valueKey] ?? opt.value;
            if (idVal !== undefined) {
              newCache[String(idVal)] = opt;
              visibleIdsSet.add(idVal);
            }
          });
          newIds = Array.from(visibleIdsSet);
        } else {
          // Remove all visible options
          const visibleIdsSet = new Set(visibleIds);
          newIds = currentIds.filter((id) => !visibleIdsSet.has(id));
        }
      } else {
        // Context B: No Search - "Clear All" mode
        newIds = shouldSelect ? currentIds : [];
        // Note: In non-search mode, checking does nothing (can't select "all" of nothing)
        // Only unchecking (Clear All) has an effect
      }

      setOptionCache(newCache);
      field.onChange(newIds);
    },
    [
      isSearching,
      currentIds,
      visibleIds,
      internalOptions,
      optionCache,
      field,
      valueKey,
      setOptionCache,
    ]
  );

  return {
    isChecked,
    isIndeterminate,
    handleSelectAll,
    isSearching,
    shouldShowSelectAll,
  };
}
