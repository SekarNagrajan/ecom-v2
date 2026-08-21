import type { NumberOperator } from '../../stores/data-view-types';

// ─── Operator Options ────────────────────────────────────────────────────────

export interface OperatorOption {
  label: string;
  value: NumberOperator;
}

// ─── Operator Options ────────────────────────────────────────────────────────

export const OPERATOR_OPTIONS: OperatorOption[] = [
  { label: 'Equals', value: 'equals' },
  { label: 'Does not equal', value: 'notEquals' },
  { label: 'Greater than', value: 'greaterThan' },
  { label: 'Less than', value: 'lessThan' },
  { label: 'Between', value: 'between' },
  { label: 'Blank', value: 'blank' },
  { label: 'Not blank', value: 'notBlank' },
];
