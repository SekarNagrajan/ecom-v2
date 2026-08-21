import type { SetFilterModel } from 'ag-grid-community';
import type { CustomFloatingFilterDisplayProps } from 'ag-grid-react';
import { Select } from 'antd';

import { FloatingFilterShell } from './floating-filter-shell';

type SetFilterParamsLike = {
  values?: readonly unknown[];
  valueFormatter?: (params: { value: unknown }) => string;
  /**
   * Controls the width of the floating-filter dropdown popup.
   * - `false` (default): popup auto-sizes to its widest option so long
   *   labels are fully visible even in narrow columns.
   * - `true`: popup matches the column/select width (AntD default — long
   *   labels can be truncated).
   * - `number`: fixed pixel width.
   */
  floatingFilterPopupMatchSelectWidth?: boolean | number;
};

type SelectOption = {
  value: string;
  label: string;
};

function getAppliedValues(model: unknown): string[] {
  if (!model) return [];
  const typed = model as SetFilterModel;
  if (!Array.isArray(typed.values)) return [];

  return typed.values.filter((value): value is string => value !== null);
}

function buildOptions(filterParams: unknown): SelectOption[] {
  if (!filterParams || typeof filterParams !== 'object') return [];

  const params = filterParams as SetFilterParamsLike;
  const rawValues = Array.isArray(params.values) ? params.values : [];

  return rawValues
    .filter((value) => value !== null && value !== undefined && value !== '')
    .map((value) => {
      const stringValue = String(value);
      const formatted = params.valueFormatter
        ? params.valueFormatter({ value })
        : undefined;
      return {
        value: stringValue,
        label: formatted && formatted.length > 0 ? formatted : stringValue,
      } satisfies SelectOption;
    });
}

function getPopupMatchSelectWidth(filterParams: unknown): boolean | number {
  if (!filterParams || typeof filterParams !== 'object') return false;

  const value = (filterParams as SetFilterParamsLike)
    .floatingFilterPopupMatchSelectWidth;

  // Default to `false` so the dropdown auto-sizes to its widest option,
  // since floating-filter columns are often narrower than their values.
  if (value === undefined) return false;

  return value;
}

export function AgGridSetFloatingFilter(
  props: CustomFloatingFilterDisplayProps<unknown, unknown, SetFilterModel>
) {
  const { model, onModelChange, filterParams } = props;
  const values = getAppliedValues(model);
  const options = buildOptions(filterParams);
  const popupMatchSelectWidth = getPopupMatchSelectWidth(filterParams);

  return (
    <FloatingFilterShell>
      <Select
        mode="multiple"
        size="small"
        options={options}
        value={values}
        onChange={(nextValues: string[]) => {
          onModelChange(
            nextValues.length === 0
              ? null
              : { filterType: 'set', values: nextValues }
          );
        }}
        popupMatchSelectWidth={popupMatchSelectWidth}
        // Floating-filter cells are too narrow to render selected chips
        // reliably (AntD's responsive measurement loop overflows the input
        // height). Suppress all chips and surface a single count badge
        // instead — users can clear via the `x` or open the dropdown to
        // toggle selections.
        maxTagCount={0}
        maxTagPlaceholder={(omitted) => `${omitted.length}`}
        allowClear
        showSearch={{ optionFilterProp: 'label' }}
        placeholder=""
        style={{ width: '100%' }}
      />
    </FloatingFilterShell>
  );
}
