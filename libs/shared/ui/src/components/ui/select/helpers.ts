import type { SelectProps } from 'antd';

import type {
  AppSelectOption,
  AppSelectOptions,
  AppSelectProps,
} from './types';

type SelectableValue = string | number;

interface AppSelectAllState {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectableValues: SelectableValue[];
  showSelectAll: boolean;
}

function isOptionGroup(
  option: AppSelectOption
): option is AppSelectOption & { options: AppSelectOption[] } {
  return (
    !!option &&
    typeof option === 'object' &&
    'options' in option &&
    Array.isArray(option.options)
  );
}

function isSelectableValue(value: unknown): value is SelectableValue {
  return typeof value === 'string' || typeof value === 'number';
}

export function resolveAppSelectSearchConfig(
  showSearch: AppSelectProps['showSearch'],
  customSearch: AppSelectProps['customSearch'],
  onSearch: (searchValue: string) => void
): AppSelectProps['showSearch'] {
  if (showSearch === false) {
    return false;
  }

  if (!customSearch) {
    return showSearch;
  }

  return {
    ...(typeof showSearch === 'object' ? showSearch : {}),
    onSearch,
  };
}

export function resolveAppSelectValue(
  value: AppSelectProps['value'],
  isMultiple: boolean
): AppSelectProps['value'] {
  if (!isMultiple && value === '') {
    return undefined;
  }

  if (value !== undefined && value !== null) {
    return value;
  }

  // Multiple mode renders an empty array so AntD treats the Select as
  // controlled-with-no-tags.
  if (isMultiple) {
    return [];
  }

  // Single mode: preserve the caller's intent.
  // - Explicit `null` → forward as `null`. rc-select honours this as
  //   "controlled, no selection", so picking an option does NOT stick in
  //   the input until the parent updates `value`. This is what transient
  //   pickers (e.g. add-watcher search) rely on to clear after each pick.
  // - `undefined` (caller omitted the prop) → leave AntD in uncontrolled
  //   mode so it manages its own value internally.
  return value === null ? null : undefined;
}

export function resolveAppSelectAllState(
  options: AppSelectOptions | undefined,
  value: AppSelectProps['value'],
  mode: AppSelectProps['mode'],
  allowSelectAll: AppSelectProps['allowSelectAll'],
  fieldNames: AppSelectProps['fieldNames']
): AppSelectAllState {
  const isMultiple = mode === 'multiple' || mode === 'tags';

  if (!allowSelectAll || !isMultiple || !options || options.length === 0) {
    return {
      isAllSelected: false,
      isIndeterminate: false,
      selectableValues: [],
      showSelectAll: false,
    };
  }

  const selectableValues: SelectableValue[] = [];
  const valueKey = fieldNames?.value ?? 'value';
  const optionStack = [...options] as AppSelectOption[];

  while (optionStack.length > 0) {
    const option = optionStack.pop();

    if (!option || typeof option !== 'object') {
      continue;
    }

    if (isOptionGroup(option)) {
      optionStack.push(...option.options);
      continue;
    }

    const optionValue = option[valueKey];
    if (isSelectableValue(optionValue)) {
      selectableValues.push(optionValue);
    }
  }

  if (selectableValues.length === 0) {
    return {
      isAllSelected: false,
      isIndeterminate: false,
      selectableValues,
      showSelectAll: false,
    };
  }

  const currentValues = Array.isArray(value) ? value : [];
  const selectedValues = new Set<SelectableValue>();

  for (const currentValue of currentValues) {
    if (isSelectableValue(currentValue)) {
      selectedValues.add(currentValue);
    }
  }

  let selectedCount = 0;
  for (const selectableValue of selectableValues) {
    if (selectedValues.has(selectableValue)) {
      selectedCount += 1;
    }
  }

  return {
    isAllSelected: selectedCount === selectableValues.length,
    isIndeterminate:
      selectedCount > 0 && selectedCount < selectableValues.length,
    selectableValues,
    showSelectAll: true,
  };
}

export function resolveAppSelectOptions(
  options: AppSelectOptions | undefined
): SelectProps['options'] {
  return options as SelectProps['options'];
}
