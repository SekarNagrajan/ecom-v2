import {
  type ICombinedSimpleModel,
  type NumberFilterModel,
  isCombinedFilterModel,
} from 'ag-grid-community';
import type { CustomFloatingFilterDisplayProps } from 'ag-grid-react';
import { Input, type InputRef } from 'antd';
import { useEffect, useRef } from 'react';

import { FloatingFilterShell } from './floating-filter-shell';

function getAppliedValue(model: unknown) {
  if (!model) return '';

  const typedModel = model as
    | NumberFilterModel
    | ICombinedSimpleModel<NumberFilterModel>;

  if (isCombinedFilterModel(typedModel)) {
    const value = typedModel.conditions[0]?.filter;
    return value === null || value === undefined ? '' : String(value);
  }

  return typedModel.filter === null || typedModel.filter === undefined
    ? ''
    : String(typedModel.filter);
}

function getAppliedType(
  model: unknown,
  filterParams: CustomFloatingFilterDisplayProps<
    unknown,
    unknown,
    NumberFilterModel
  >['filterParams']
) {
  if (model) {
    const typedModel = model as
      | NumberFilterModel
      | ICombinedSimpleModel<NumberFilterModel>;

    if (!isCombinedFilterModel(typedModel)) {
      return (typedModel.type ?? 'equals') as NumberFilterModel['type'];
    }
  }

  if (
    filterParams &&
    typeof filterParams === 'object' &&
    'defaultOption' in filterParams &&
    typeof filterParams.defaultOption === 'string'
  ) {
    return filterParams.defaultOption as NumberFilterModel['type'];
  }

  return 'equals' as NumberFilterModel['type'];
}

function getDebounceMs(
  filterParams: CustomFloatingFilterDisplayProps<
    unknown,
    unknown,
    NumberFilterModel
  >['filterParams']
) {
  if (
    filterParams &&
    typeof filterParams === 'object' &&
    'debounceMs' in filterParams &&
    typeof filterParams.debounceMs === 'number'
  ) {
    return filterParams.debounceMs;
  }

  return 500;
}

function parseNumberValue(value: string) {
  if (value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function AgGridNumberFloatingFilter(
  props: CustomFloatingFilterDisplayProps<unknown, unknown, NumberFilterModel>
) {
  const { model, onModelChange, filterParams } = props;
  const inputRef = useRef<InputRef>(null);
  const timeoutRef = useRef<number | undefined>(undefined);
  const appliedValue = getAppliedValue(model);
  const appliedType = getAppliedType(model, filterParams);
  const debounceMs = getDebounceMs(filterParams);

  useEffect(() => {
    const input = inputRef.current?.input;
    if (input && input.value !== appliedValue) {
      input.value = appliedValue;
    }

    if (timeoutRef.current !== undefined) {
      globalThis.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [appliedValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        globalThis.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <FloatingFilterShell>
      <Input
        ref={inputRef}
        defaultValue={appliedValue}
        onChange={(event) => {
          const nextValue = event.target.value;

          if (timeoutRef.current !== undefined) {
            globalThis.clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = globalThis.setTimeout(() => {
            const parsedValue = parseNumberValue(nextValue);

            onModelChange(
              parsedValue === null
                ? null
                : {
                    filterType: 'number',
                    type: appliedType,
                    filter: parsedValue,
                  }
            );
          }, debounceMs);
        }}
        type="number"
        placeholder=""
        size="small"
        style={{ width: '100%' }}
      />
    </FloatingFilterShell>
  );
}
