import { useCallback, useState } from 'react';

import type {
  NumberOperator,
  NumberFilterField,
  FilterValue,
} from '../../stores/data-view-types';
import { toNumberOrNull } from './number-filter-utils';
import { OPERATOR_OPTIONS } from './number-operator-options';

export interface UseNumberFilterOptions {
  config: NumberFilterField;
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
}

/**
 * Encapsulates all number filter state management:
 * operator selection, single-value input, and range (between) input.
 */
export function useNumberFilter({
  config,
  value,
  onChange,
}: UseNumberFilterOptions) {
  const [localOperator, setLocalOperator] = useState<NumberOperator>(
    (value?.operator as NumberOperator) ?? config.defaultOperator ?? 'equals'
  );

  const currentOperator = (value?.operator as NumberOperator) ?? localOperator;

  const isBetween = currentOperator === 'between';
  const currentValue = value?.value;
  const singleValue = !isBetween ? toNumberOrNull(currentValue) : null;

  const [rangeDraft, setRangeDraft] = useState<[number | null, number | null]>([
    toNumberOrNull(Array.isArray(currentValue) ? currentValue[0] : null),
    toNumberOrNull(Array.isArray(currentValue) ? currentValue[1] : null),
  ]);

  // Derive available operator options from config
  const availableOperators =
    config.operators ?? OPERATOR_OPTIONS.map((o) => o.value);
  const operatorOptions = OPERATOR_OPTIONS.filter((o) =>
    availableOperators.includes(o.value)
  );
  const showOperatorSelect = operatorOptions.length > 1;

  // ─── Emit helpers ────────────────────────────────────────────────────

  const emitFilterValue = useCallback(
    (
      nextValue: number | [number | undefined, number | undefined] | undefined,
      operator: NumberOperator
    ) => {
      onChange({
        field: config.field,
        type: 'number',
        value: nextValue,
        operator,
      });
    },
    [config.field, onChange]
  );

  // ─── Event handlers ──────────────────────────────────────────────────

  const handleOperatorChange = useCallback(
    (operator: NumberOperator) => {
      setLocalOperator(operator);

      if (operator === 'blank' || operator === 'notBlank') {
        emitFilterValue(undefined, operator);
        return;
      }

      if (operator === 'between') {
        setRangeDraft([singleValue ?? null, null]);
        emitFilterValue(undefined, operator);
        return;
      }

      const fallbackValue = (isBetween ? rangeDraft[0] : singleValue) ?? null;
      emitFilterValue(
        fallbackValue === null ? undefined : fallbackValue,
        operator
      );
    },
    [emitFilterValue, isBetween, rangeDraft, singleValue]
  );

  const handleSingleValueChange = useCallback(
    (newValue: number | null) => {
      emitFilterValue(
        newValue === null ? undefined : newValue,
        currentOperator
      );
    },
    [currentOperator, emitFilterValue]
  );

  const handleRangeChange = useCallback(
    (index: 0 | 1, val: number | null) => {
      const updated: [number | null, number | null] = [
        rangeDraft[0],
        rangeDraft[1],
      ];
      updated[index] = val;
      setRangeDraft(updated);

      if (updated[0] !== null || updated[1] !== null) {
        emitFilterValue(
          [updated[0] ?? undefined, updated[1] ?? undefined],
          'between'
        );
      } else {
        emitFilterValue(undefined, 'between');
      }
    },
    [emitFilterValue, rangeDraft]
  );

  return {
    currentOperator,
    isBetween,
    currentValue,
    singleValue,
    operatorOptions,
    showOperatorSelect,
    handleOperatorChange,
    handleSingleValueChange,
    handleRangeChange,
  };
}
