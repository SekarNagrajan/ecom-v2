import { Select, Spin } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { SelectProps, DefaultOptionType } from 'antd/es/select';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { FieldValues } from 'react-hook-form';

import { cn } from '../../../utils/cn';
import { getA11yProps } from '../common/helper';
import { highlightText } from './helpers/highlight-text';
import { useSelectAll } from './helpers/use-select-all';
import { useAsyncOptions } from './hooks/use-async-options';
import { useGroupedOptions } from './hooks/use-grouped-options';
import { useHydratedValue } from './hooks/use-hydrated-value';
import { useMaxLimit } from './hooks/use-max-limit';
import { SelectAllHeader } from './select-all-header';
import type { AutocompleteFieldProps } from './types';

export function AutocompleteField<T extends FieldValues>({
  field,
  className,

  // Feature flags
  mode = 'single',
  allowFreeText = false,
  allowSelectAll = false,

  // Async
  fetchOptions,
  minChars = 2,
  debounceTimeout = 300,

  // UX
  highlightMatch = true,
  optionRender,

  // Limits
  maxCount,
  maxTagCount,
  onMaxReached,

  // Misc
  fieldNames,
  id,
  error,
  required,
  autoComplete = 'off',

  initialOptionLabels = {},

  ...rest
}: AutocompleteFieldProps<T>) {
  const selectRef = useRef<React.ComponentRef<typeof Select>>(null);

  /**
   * ------------------------------------------------------------
   * Option Cache (Derived from props + local selections)
   * ------------------------------------------------------------
   * localOptionCache stores items the user has selected during the session.
   * effectiveOptionCache merges initial labels from props with the local cache.
   */
  const [localOptionCache, setLocalOptionCache] = useState<
    Record<string, DefaultOptionType>
  >({});

  const effectiveOptionCache = useMemo(
    () => ({
      ...(initialOptionLabels as Record<string, DefaultOptionType>),
      ...localOptionCache,
    }),
    [initialOptionLabels, localOptionCache]
  );

  const isMultiple = mode === 'multiple';
  const labelKey = fieldNames?.label ?? 'label';
  const valueKey = fieldNames?.value ?? 'value';

  /**
   * ------------------------------------------------------------
   * Mode normalization (AntD)
   * ------------------------------------------------------------
   */
  const antdMode = useMemo<SelectProps['mode']>(() => {
    if (allowFreeText) return 'tags';
    return isMultiple ? 'multiple' : undefined;
  }, [allowFreeText, isMultiple]);

  const isArrayMode = antdMode === 'multiple' || antdMode === 'tags';

  /**
   * ------------------------------------------------------------
   * Async options
   * ------------------------------------------------------------
   */
  const {
    searchValue,
    options: internalOptions,
    loading,
    onSearch,
    reset: resetSearch,
  } = useAsyncOptions({
    fetchOptions,
    minChars,
    debounceTimeout,
  });

  /**
   * ------------------------------------------------------------
   * Selected IDs (avoid never[])
   * ------------------------------------------------------------
   */
  const selectedIds = useMemo<(string | number)[]>(() => {
    if (!Array.isArray(field.value)) return [];
    return field.value as (string | number)[];
  }, [field.value]);

  /**
   * ------------------------------------------------------------
   * Max count (DATA constraint)
   * ------------------------------------------------------------
   */
  const { count, isMaxReached, enforce } = useMaxLimit({
    value: field.value,
    maxCount,
    onMaxReached,
  });

  /**
   * ------------------------------------------------------------
   * Select All (intentional RHF generic escape hatch)
   * ------------------------------------------------------------
   */
  const {
    isChecked,
    isIndeterminate,
    handleSelectAll,
    isSearching,
    shouldShowSelectAll,
  } = useSelectAll({
    field: field,
    internalOptions,
    valueKey,
    optionCache: effectiveOptionCache,
    setOptionCache: setLocalOptionCache,
    searchValue,
    minChars,
  });

  const handleSelectAllWrapper = useCallback(
    (e: CheckboxChangeEvent) => {
      e.stopPropagation();

      if (isMaxReached && typeof maxCount === 'number') {
        onMaxReached?.(count, maxCount);
        return;
      }

      handleSelectAll(e);
    },
    [count, handleSelectAll, isMaxReached, maxCount, onMaxReached]
  );

  /**
   * ------------------------------------------------------------
   * Grouped options
   * ------------------------------------------------------------
   */
  const groupedOptions = useGroupedOptions({
    internalOptions,
    selectedIds,
    optionCache: effectiveOptionCache,
    isMultiple,
    isMaxReached,
    labelKey,
    valueKey,
  });

  /**
   * ------------------------------------------------------------
   * Hydrated value (RHF ⇄ AntD)
   * ------------------------------------------------------------
   */
  const controlValue = useHydratedValue({
    value: field.value,
    optionCache: effectiveOptionCache,
    labelKey,
    valueKey,
    isArrayMode,
  });

  /**
   * ------------------------------------------------------------
   * Change handler
   * ------------------------------------------------------------
   */
  const handleChange = useCallback(
    (
      val: DefaultOptionType | DefaultOptionType[] | null,
      selected: DefaultOptionType | DefaultOptionType[] | undefined
    ) => {
      const items = Array.isArray(selected) ? selected : [selected];

      if (items.length) {
        setLocalOptionCache((prev) => {
          const next = { ...prev };
          items.forEach((item) => {
            if (!item) return;
            const key = item[valueKey] ?? item.value;
            if (key !== undefined) {
              next[String(key)] = item;
            }
          });
          return next;
        });
      }

      if (Array.isArray(val)) {
        const ids = val.reduce((acc, cur) => {
          if (cur.value) {
            acc.push(cur.value);
          }
          return acc;
        }, [] as (string | number)[]);

        if (ids) {
          if (isMultiple) {
            field.onChange(enforce(ids));
          } else {
            field.onChange(ids.at(-1) ?? null);
          }
        }
      } else {
        field.onChange(val?.value ?? null);
      }
    },
    [field, isMultiple, enforce, valueKey]
  );

  /**
   * ------------------------------------------------------------
   * Option renderer
   * ------------------------------------------------------------
   */
  const customOptionRender: NonNullable<SelectProps['optionRender']> =
    useCallback(
      (item, info) => {
        if (optionRender) return optionRender(item, info);

        const raw = item.data || item;
        const text = raw?.[labelKey];

        if (highlightMatch && searchValue && typeof text === 'string') {
          return highlightText(text, searchValue);
        }

        return item.label ?? raw?.[valueKey];
      },
      [optionRender, highlightMatch, searchValue, labelKey, valueKey]
    );

  /**
   * ------------------------------------------------------------
   * Popup render
   * ------------------------------------------------------------
   */
  const popupRender = useCallback(
    (menu: React.ReactElement) => (
      <>
        {isMultiple && allowSelectAll && shouldShowSelectAll && (
          <SelectAllHeader
            checked={isChecked}
            indeterminate={isIndeterminate}
            onSelectAll={handleSelectAllWrapper}
            isSearching={isSearching}
            resultCount={internalOptions.length}
          />
        )}

        {isMaxReached && (
          <div className="px-3 py-2 text-center text-sm text-gray-500">
            <div className="font-medium">
              Maximum limit reached
              {maxCount ? ` (${count}/${maxCount})` : ''}
            </div>
            <div className="mt-1">Remove items to add more</div>
          </div>
        )}

        {menu}
      </>
    ),
    [
      isMultiple,
      allowSelectAll,
      shouldShowSelectAll,
      isChecked,
      isIndeterminate,
      handleSelectAllWrapper,
      isSearching,
      internalOptions.length,
      isMaxReached,
      maxCount,
      count,
    ]
  );

  /**
   * ------------------------------------------------------------
   * Empty / loading content
   * ------------------------------------------------------------
   */
  const notFoundContent = useMemo(() => {
    if (loading) return <Spin size="small" />;

    // if (isMaxReached) {
    //   return (
    //     <div className="px-3 py-2 text-center text-sm text-gray-500">
    //       <div className="font-medium">
    //         Maximum limit reached
    //         {maxCount ? ` (${count}/${maxCount})` : ''}
    //       </div>
    //       <div className="mt-1">Remove items to add more</div>
    //     </div>
    //   );
    // }

    return rest.notFoundContent;
  }, [loading, rest.notFoundContent]);

  /**
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */
  return (
    <Select
      {...rest}
      {...field}
      {...getA11yProps({ id, error, required, autoComplete })}
      ref={(node) => {
        field.ref(node);
        selectRef.current = node;
      }}
      mode={antdMode}
      labelInValue
      loading={loading}
      options={groupedOptions}
      fieldNames={fieldNames}
      value={controlValue}
      onChange={handleChange}
      optionRender={customOptionRender}
      popupRender={popupRender}
      showSearch={{
        filterOption: false,
        onSearch,
        searchValue,
      }}
      maxTagCount={maxTagCount}
      className={cn('w-full', className)}
      notFoundContent={notFoundContent}
      onBlur={(e) => {
        field.onBlur();
        rest.onBlur?.(e);
        if (!allowFreeText) resetSearch();
      }}
      onPopupVisibleChange={(open) => {
        if (!open) resetSearch();
        rest.onPopupVisibleChange?.(open);
      }}
      aria-autocomplete="list"
    />
  );
}
