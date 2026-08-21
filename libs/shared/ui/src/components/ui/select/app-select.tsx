import { Checkbox, Divider, Select, Spin } from 'antd';
import type { ReactElement } from 'react';

import { useDebouncedCallback } from '../../../hooks/use-debounced-callback';
import { cn } from '../../../utils/cn';
import {
  resolveAppSelectAllState,
  resolveAppSelectOptions,
  resolveAppSelectSearchConfig,
  resolveAppSelectValue,
} from './helpers';
import type { AppSelectProps } from './types';

export function AppSelect({
  allowSelectAll,
  className,
  customSearch,
  debounceTimeout = 300,
  fieldNames,
  invalid,
  loading,
  mode,
  notFoundContent,
  options = [],
  popupRender: userPopupRender,
  prefix,
  required,
  showSearch,
  style,
  value,
  onChange,
  id,
  ...rest
}: AppSelectProps) {
  const debouncedSearch = useDebouncedCallback((searchValue: string) => {
    customSearch?.(searchValue);
  }, debounceTimeout);

  const searchConfig = resolveAppSelectSearchConfig(
    showSearch,
    customSearch,
    debouncedSearch
  );
  const isMultiple = mode === 'multiple' || mode === 'tags';
  const { isAllSelected, isIndeterminate, selectableValues, showSelectAll } =
    resolveAppSelectAllState(options, value, mode, allowSelectAll, fieldNames);
  const resolvedValue = resolveAppSelectValue(value, isMultiple);
  const resolvedOptions = resolveAppSelectOptions(options);

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange?.([], []);
      return;
    }

    onChange?.(selectableValues, resolvedOptions ?? []);
  };

  const selectAllHeader = showSelectAll ? (
    <>
      <div
        className="sticky top-0 px-3 py-2"
        onMouseDown={(event) => event.preventDefault()}
      >
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleSelectAll}
          className="w-full"
        >
          Select All
        </Checkbox>
      </div>
      <Divider style={{ margin: 0 }} />
    </>
  ) : null;

  const renderPopup = (originMenu: ReactElement) => {
    const menuContent = userPopupRender
      ? userPopupRender(originMenu)
      : originMenu;

    if (!showSelectAll) {
      return menuContent;
    }

    return (
      <>
        {selectAllHeader}
        {menuContent}
      </>
    );
  };

  return (
    <Select
      {...rest}
      id={id}
      value={resolvedValue}
      onChange={onChange}
      mode={mode}
      loading={loading}
      className={cn('w-full', className)}
      style={style}
      options={resolvedOptions}
      fieldNames={fieldNames}
      showSearch={searchConfig}
      popupRender={renderPopup}
      notFoundContent={loading ? <Spin size="small" /> : notFoundContent}
      aria-invalid={invalid || undefined}
      aria-required={required}
      aria-describedby={invalid && id ? `${id}-help` : undefined}
      // Native AntD Select prefix slot — renders the icon inline inside the
      // selector with no `Space.Addon` block / divider.
      prefix={prefix}
    />
  );
}
