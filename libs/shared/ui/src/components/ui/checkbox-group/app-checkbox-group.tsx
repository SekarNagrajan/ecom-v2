import { Checkbox, type CheckboxChangeEvent, Flex, theme } from 'antd';
import { useCallback, useMemo } from 'react';

import { type AppCheckboxGroupProps, type CheckboxGroupProps } from './types';

const { Group } = Checkbox;

export function AppCheckboxGroup<T extends string>({
  options = [],
  value = [],
  defaultValue = [],
  onChange,
  disabled,
  showSelectAll = false,
  selectAllLabel = 'Select All',
  maxSelection,
  minSelection,
  direction = 'vertical',
  gap,
  valueLabelKey = 'value',
  onValidationError,
  ...rest
}: AppCheckboxGroupProps<T>) {
  const { token } = theme.useToken();

  // Use provided gap or default to token.marginSM
  const checkboxGap = gap ?? token.marginSM;

  // Calculate if select all should be indeterminate
  const allValues = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options.map((opt: any) =>
        typeof opt === 'string' || typeof opt === 'number'
          ? opt
          : opt[valueLabelKey]
      ),
    [options, valueLabelKey]
  );

  const isAllSelected = useMemo(() => {
    return (
      allValues.length > 0 && allValues.every((val) => value.includes(val))
    );
  }, [allValues, value]);

  const isIndeterminate = value.length > 0 && value.length < allValues.length;

  // Handle select all toggle
  const handleSelectAll = useCallback(
    (e: CheckboxChangeEvent) => {
      const checked = e.target.checked;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let newValue: any;

      if (checked && !isIndeterminate) {
        // When selecting all, respect maxSelection limit
        newValue = maxSelection ? allValues.slice(0, maxSelection) : allValues;
      } else {
        // When deselecting, clear all
        newValue = [];
      }

      onChange?.(newValue);
    },
    [allValues, isIndeterminate, maxSelection, onChange]
  );

  // Handle individual checkbox changes with validation
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (checkedValues: any[]) => {
      // Check max selection
      if (maxSelection && checkedValues.length > maxSelection) {
        onValidationError?.(`Maximum ${maxSelection} items can be selected`);
        return;
      }

      // Check min selection (only show error if trying to go below minimum)
      if (minSelection && checkedValues.length < minSelection) {
        onValidationError?.(`Minimum ${minSelection} items must be selected`);
      }

      onChange?.(checkedValues);
    },
    [maxSelection, minSelection, onChange, onValidationError]
  );

  return (
    <Flex vertical gap={token.marginSM}>
      <Flex>
        {showSelectAll && (
          <Checkbox
            indeterminate={isIndeterminate}
            checked={isAllSelected}
            onChange={handleSelectAll}
            disabled={disabled}
          >
            {selectAllLabel}
          </Checkbox>
        )}

        {maxSelection && (
          <span
            style={{
              fontSize: token.fontSizeSM,
              color: token.colorTextSecondary,
            }}
          >
            (Max {maxSelection})
          </span>
        )}
      </Flex>

      <Group
        {...rest}
        /**
         * Type safety is strictly handled in AppCheckboxGroupProps.
         * We cast to mutable here to satisfy Ant Design's internal types without breaking reference stability.
         */
        options={options as CheckboxGroupProps['options']}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{
          display: 'flex',
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          gap: checkboxGap,
          flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
        }}
      />
    </Flex>
  );
}
