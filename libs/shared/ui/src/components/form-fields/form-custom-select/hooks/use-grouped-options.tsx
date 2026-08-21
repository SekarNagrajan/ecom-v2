import { type DefaultOptionType } from 'antd/es/select';
import { useMemo } from 'react';

interface GroupedOptionsProps {
  internalOptions: DefaultOptionType[];
  selectedIds: (string | number)[];
  optionCache: Record<string, DefaultOptionType>;
  searchValue: string;
  minChars: number;
  allowFreeText: boolean;
  labelKey: string;
  valueKey: string;
}

export function useGroupedOptions({
  internalOptions,
  selectedIds,
  optionCache,
  searchValue,
  minChars,
  allowFreeText,
  labelKey,
  valueKey,
}: GroupedOptionsProps) {
  return useMemo(() => {
    const isSearching = searchValue.length >= minChars;
    const hasResults = internalOptions.length > 0;

    // We are in "search mode" if user is typing OR if we have results to display
    const inSearchMode = isSearching || hasResults;

    const groups: DefaultOptionType[] = [];

    // Requirement 3: Custom Value (at the top)
    if (allowFreeText && isSearching) {
      // Check if current search value is already in results or selected
      const inResults = internalOptions.some(
        (o) =>
          String(o[labelKey] ?? o.label).toLowerCase() ===
          searchValue.toLowerCase()
      );

      const inSelected = selectedIds.some((id) => {
        const cached = optionCache[String(id)];
        const label = cached?.[labelKey] ?? cached?.label ?? id;
        return String(label).toLowerCase() === searchValue.toLowerCase();
      });

      if (!inResults && !inSelected) {
        groups.push({
          label: 'Create New',
          options: [
            {
              [labelKey]: searchValue,
              [valueKey]: searchValue,
              label: searchValue,
              value: searchValue,
            },
          ],
        });
      }
    }

    // Requirement: Search Results
    if (inSearchMode && hasResults) {
      groups.push({
        label: `Search Results (${internalOptions.length})`,
        options: internalOptions,
      });
    }

    // Requirement: Currently Selected
    // Only show if NOT in search mode (no active typing and no results displayed)
    if (!inSearchMode) {
      const selectedItems = selectedIds.map((id) => {
        const cached = optionCache[String(id)];
        return {
          [valueKey]: id,
          [labelKey]: cached?.[labelKey] ?? cached?.label ?? id,
          value: id,
          label: cached?.[labelKey] ?? cached?.label ?? id,
        };
      });

      if (selectedItems.length > 0) {
        groups.push({
          label: `Currently Selected (${selectedItems.length})`,
          options: selectedItems,
        });
      }
    }

    return groups;
  }, [
    internalOptions,
    selectedIds,
    optionCache,
    searchValue,
    minChars,
    allowFreeText,
    labelKey,
    valueKey,
  ]);
}
