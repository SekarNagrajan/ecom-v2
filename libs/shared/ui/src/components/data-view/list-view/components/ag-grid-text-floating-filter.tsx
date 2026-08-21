import {
  type ICombinedSimpleModel,
  type TextFilterModel,
  isCombinedFilterModel,
} from 'ag-grid-community';
import type { CustomFloatingFilterDisplayProps } from 'ag-grid-react';
import { Input, type InputRef } from 'antd';
import { useEffect, useRef } from 'react';

import { FloatingFilterShell } from './floating-filter-shell';

function getAppliedValue(model: unknown) {
  if (!model) return '';

  const typedModel = model as
    | TextFilterModel
    | ICombinedSimpleModel<TextFilterModel>;

  if (isCombinedFilterModel(typedModel)) {
    return typedModel.conditions[0]?.filter ?? '';
  }

  return typedModel.filter ?? '';
}

function getAppliedType(
  model: unknown,
  filterParams: CustomFloatingFilterDisplayProps<
    unknown,
    unknown,
    TextFilterModel
  >['filterParams']
) {
  if (model) {
    const typedModel = model as
      | TextFilterModel
      | ICombinedSimpleModel<TextFilterModel>;

    if (!isCombinedFilterModel(typedModel)) {
      return (typedModel.type ?? 'contains') as TextFilterModel['type'];
    }
  }

  if (
    filterParams &&
    typeof filterParams === 'object' &&
    'defaultOption' in filterParams &&
    typeof filterParams.defaultOption === 'string'
  ) {
    return filterParams.defaultOption as TextFilterModel['type'];
  }

  return 'contains' as TextFilterModel['type'];
}

function getDebounceMs(
  filterParams: CustomFloatingFilterDisplayProps<
    unknown,
    unknown,
    TextFilterModel
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

export function AgGridTextFloatingFilter(
  props: CustomFloatingFilterDisplayProps<unknown, unknown, TextFilterModel>
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
            onModelChange(
              nextValue === ''
                ? null
                : {
                    filterType: 'text',
                    type: appliedType,
                    filter: nextValue,
                  }
            );
          }, debounceMs);
        }}
        allowClear
        placeholder=""
        size="small"
        style={{ width: '100%' }}
      />
    </FloatingFilterShell>
  );
}
