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
  validateNext: (nextCount: number) => boolean;
}

export function useSelectAll<T extends FieldValues>({
  field,
  internalOptions,
  valueKey,
  optionCache,
  setOptionCache,
  searchValue,
  minChars,
  validateNext,
}: UseSelectAllProps<T>) {
  const currentIds = useMemo(() => {
    return (Array.isArray(field.value) ? field.value : []) as (
      | string
      | number
    )[];
  }, [field.value]);

  const visibleIds = useMemo(() => {
    return internalOptions.map((opt) => opt[valueKey] ?? opt.value);
  }, [internalOptions, valueKey]);

  // We are in search mode if we have active results to display
  const isShowingResults = useMemo(
    () => internalOptions.length > 0,
    [internalOptions.length]
  );

  const allVisibleSelected = useMemo(() => {
    if (visibleIds.length === 0) return false;
    return visibleIds.every((id) =>
      currentIds.some((currentId) => String(currentId) === String(id))
    );
  }, [visibleIds, currentIds]);

  const isChecked = useMemo(() => {
    if (!isShowingResults) return currentIds.length > 0;
    return visibleIds.length > 0 && allVisibleSelected;
  }, [
    isShowingResults,
    allVisibleSelected,
    currentIds.length,
    visibleIds.length,
  ]);

  const isIndeterminate = useMemo(() => {
    if (!isShowingResults || visibleIds.length === 0) return false;
    const selectedVisibleCount = visibleIds.filter((id) =>
      currentIds.some((currentId) => String(currentId) === String(id))
    ).length;
    return selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
  }, [isShowingResults, visibleIds, currentIds]);

  const label = useMemo(() => {
    if (!isShowingResults) return 'Clear All Selected';
    const count = internalOptions.length;
    return isChecked
      ? `Deselect All Results${count > 0 ? ` (${count})` : ''}`
      : `Select All Results${count > 0 ? ` (${count})` : ''}`;
  }, [isShowingResults, isChecked, internalOptions.length]);

  const shouldShowSelectAll = useMemo(() => {
    return isShowingResults || currentIds.length > 0;
  }, [isShowingResults, currentIds.length]);

  const onToggle = useCallback(
    (shouldSelect: boolean) => {
      const newCache = { ...optionCache };
      let newIds: (string | number)[];

      if (isShowingResults) {
        if (shouldSelect) {
          const visibleIdsSet = new Set(currentIds);
          internalOptions.forEach((opt) => {
            const idVal = opt[valueKey] ?? opt.value;
            if (idVal !== undefined) {
              newCache[String(idVal)] = opt;
              visibleIdsSet.add(idVal);
            }
          });
          newIds = Array.from(visibleIdsSet);

          if (!validateNext(newIds.length)) return;
        } else {
          const visibleIdsSet = new Set(visibleIds.map(String));
          newIds = currentIds.filter((id) => !visibleIdsSet.has(String(id)));
        }
      } else {
        newIds = shouldSelect ? currentIds : [];
      }

      setOptionCache(newCache);
      field.onChange(newIds);
    },
    [
      isShowingResults,
      currentIds,
      visibleIds,
      internalOptions,
      optionCache,
      field,
      valueKey,
      setOptionCache,
      validateNext,
    ]
  );

  return {
    isChecked,
    isIndeterminate,
    onToggle,
    label,
    isShowingResults,
    isSearching: isShowingResults,
    shouldShowSelectAll,
  };
}
