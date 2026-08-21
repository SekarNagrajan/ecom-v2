import { Select, Spin, theme } from 'antd';
import type { SelectProps, DefaultOptionType } from 'antd/es/select';
import { useCallback, useMemo, useState } from 'react';
import type { FieldValues } from 'react-hook-form';

import { cn } from '../../../utils/cn';
import { getA11yProps } from '../common/helper';
import { SelectAllHeader } from './components/select-all-header';
import { useAsyncOptions } from './hooks/use-async-options';
import { useGroupedOptions } from './hooks/use-grouped-options';
import { useHydratedValue } from './hooks/use-hydrated-value';
import { useMaxLimit } from './hooks/use-max-limit';
import { useSelectAll } from './hooks/use-select-all';
import type { CustomSelectFieldProps } from './types';

export function CustomSelectField<T extends FieldValues>({
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

  // Misc
  fieldNames,
  id,
  error,
  required,
  autoComplete = 'off',

  initialOptionLabels = {},

  ...rest
}: CustomSelectFieldProps<T>) {
  const { token } = theme.useToken();

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
   * We avoid 'tags' mode because it automatically adds every intermediate
   * typed string as an option. We handle free text manually via
   * the 'Custom Value' group in groupedOptions.
   */
  const antdMode = useMemo<SelectProps['mode']>(() => {
    return isMultiple ? 'multiple' : undefined;
  }, [isMultiple]);

  /**
   * ------------------------------------------------------------
   * Async options
   * ------------------------------------------------------------
   */
  const {
    searchValue,
    setSearchValue,
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
   * Max count & Selection enforcement
   * ------------------------------------------------------------
   */
  const { validateNext } = useMaxLimit({
    value: field.value,
    maxCount,
  });

  /**
   * ------------------------------------------------------------
   * Select All
   * ------------------------------------------------------------
   */
  const {
    isChecked,
    isIndeterminate,
    onToggle,
    label,
    isSearching,
    shouldShowSelectAll,
  } = useSelectAll({
    field,
    internalOptions,
    valueKey,
    optionCache: effectiveOptionCache,
    setOptionCache: setLocalOptionCache,
    searchValue,
    minChars,
    validateNext,
  });

  /**
   * ------------------------------------------------------------
   * Grouped options
   * ------------------------------------------------------------
   */
  const selectedIds = useMemo<(string | number)[]>(() => {
    if (!Array.isArray(field.value)) {
      return field.value !== null &&
        field.value !== undefined &&
        field.value !== ''
        ? [field.value as string | number]
        : [];
    }
    return field.value as (string | number)[];
  }, [field.value]);

  const groupedOptions = useGroupedOptions({
    internalOptions,
    selectedIds,
    optionCache: effectiveOptionCache,
    searchValue,
    minChars,
    allowFreeText,
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
    mode,
  });

  /**
   * ------------------------------------------------------------
   * Change handler
   * ------------------------------------------------------------
   */
  const handleChange = useCallback(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      val: any,
      selected: DefaultOptionType | DefaultOptionType[] | undefined
    ) => {
      const items = Array.isArray(selected)
        ? selected
        : selected
        ? [selected]
        : [];

      // Update cache with new items
      if (items.length > 0) {
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
        const ids = val.map((v) => v.value);

        if (isMultiple) {
          // Check max limit before applying
          if (validateNext(ids.length)) {
            field.onChange(ids);
          }
        } else {
          // If mode is single but Antd is in 'tags', we only take the last selected
          field.onChange(ids.at(-1) ?? null);
        }
      } else {
        field.onChange(val?.value ?? null);
      }

      setSearchValue('');
    },
    [field, isMultiple, setSearchValue, validateNext, valueKey]
  );

  /**
   * ------------------------------------------------------------
   * Popup render
   * ------------------------------------------------------------
   */
  const popupRender = useCallback(
    (menu: React.ReactElement) => (
      <div className="custom-select-popup">
        {isMultiple && allowSelectAll && shouldShowSelectAll && (
          <SelectAllHeader
            checked={isChecked}
            indeterminate={isIndeterminate}
            onToggle={onToggle}
            label={label}
          />
        )}
        {menu}
      </div>
    ),
    [
      isMultiple,
      allowSelectAll,
      shouldShowSelectAll,
      isChecked,
      isIndeterminate,
      onToggle,
      label,
    ]
  );

  /**
   * ------------------------------------------------------------
   * Option Highlight
   * ------------------------------------------------------------
   */
  const defaultOptionRender: NonNullable<SelectProps['optionRender']> =
    useCallback(
      (item) => {
        const label = String(item.label || '');
        if (highlightMatch && searchValue && isSearching) {
          const index = label.toLowerCase().indexOf(searchValue.toLowerCase());
          if (index > -1) {
            const before = label.substring(0, index);
            const match = label.substring(index, index + searchValue.length);
            const after = label.substring(index + searchValue.length);
            return (
              <span>
                {before}
                <span style={{ color: token.colorPrimary, fontWeight: 'bold' }}>
                  {match}
                </span>
                {after}
              </span>
            );
          }
        }
        return item.label;
      },
      [highlightMatch, searchValue, isSearching, token.colorPrimary]
    );

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
      maxCount={maxCount}
      mode={antdMode}
      labelInValue
      loading={loading}
      options={groupedOptions}
      fieldNames={fieldNames}
      value={controlValue}
      onChange={handleChange}
      optionRender={optionRender || defaultOptionRender}
      popupRender={popupRender}
      showSearch={{
        filterOption: false,
        onSearch,
        searchValue,
      }}
      maxTagCount={maxTagCount}
      className={cn('w-full', className)}
      notFoundContent={
        loading ? (
          <div className="p-4 text-center">
            <Spin size="small" />
          </div>
        ) : (
          rest.notFoundContent
        )
      }
      onPopupVisibleChange={(open) => {
        if (!open) resetSearch();
        rest.onPopupVisibleChange?.(open);
      }}
    />
  );
}
