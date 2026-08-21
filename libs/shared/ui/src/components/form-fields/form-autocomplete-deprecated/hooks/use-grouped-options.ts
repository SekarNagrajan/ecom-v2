import { type DefaultOptionType } from 'antd/es/select';
import { useMemo } from 'react';

export function useGroupedOptions({
  internalOptions,
  selectedIds,
  optionCache,
  isMultiple,
  isMaxReached,
  labelKey,
  valueKey,
}: {
  internalOptions: DefaultOptionType[];
  selectedIds: (string | number)[];
  optionCache: Record<string, DefaultOptionType>;
  isMultiple: boolean;
  isMaxReached: boolean;
  labelKey: string;
  valueKey: string;
}) {
  return useMemo(() => {
    if (!isMultiple) return internalOptions;

    const selectedSet = new Set(selectedIds);
    const searchIds = new Set(
      internalOptions.map((o) => o[valueKey] ?? o.value)
    );

    const groups: DefaultOptionType[] = [];

    const visibleResults = isMaxReached
      ? internalOptions.filter((o) => selectedSet.has(o[valueKey] ?? o.value))
      : internalOptions;

    if (visibleResults.length) {
      groups.push({
        label: `Search Results (${visibleResults.length})`,
        options: visibleResults,
      });
    }

    const selectedNotInResults = selectedIds
      .filter((id) => !searchIds.has(id))
      .map((id) => ({
        value: id,
        label:
          optionCache[String(id)]?.[labelKey] ??
          optionCache[String(id)]?.label ??
          id,
      }));

    if (selectedNotInResults.length) {
      groups.push({
        label: `Currently Selected (${selectedNotInResults.length})`,
        options: selectedNotInResults,
      });
    }

    return groups;
  }, [
    internalOptions,
    selectedIds,
    optionCache,
    isMultiple,
    isMaxReached,
    labelKey,
    valueKey,
  ]);
}
