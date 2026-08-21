import { Input, Space } from 'antd';

import type { TextOperator } from '../../stores/data-view-types';
import type { TextFilterControlProps } from './filter-control-types';
import { OperatorSelect } from './operator-select';

const OPERATOR_OPTIONS: Array<{ label: string; value: TextOperator }> = [
  { label: 'Contains', value: 'contains' },
  { label: 'Equals', value: 'equals' },
  { label: 'Begins with', value: 'startsWith' },
  { label: 'Ends with', value: 'endsWith' },
  { label: 'Does not equal', value: 'notEquals' },
  { label: 'Blank', value: 'blank' },
  { label: 'Not blank', value: 'notBlank' },
];

/**
 * Text filter control component
 * Supports operators: contains, equals, startsWith, endsWith, notEquals, blank, notBlank
 */
export function TextFilterControl({
  config,
  value,
  onChange,
  size,
  disabled,
}: TextFilterControlProps) {
  const currentValue = (value?.value as string) ?? '';
  const currentOperator =
    (value?.operator as TextOperator) ?? config.defaultOperator ?? 'contains';

  const isBlankOperator =
    currentOperator === 'blank' || currentOperator === 'notBlank';

  const availableOperators =
    config.operators ?? OPERATOR_OPTIONS.map((o) => o.value);
  const operatorOptions = OPERATOR_OPTIONS.filter((o) =>
    availableOperators.includes(o.value)
  );

  // Show operator select only if more than one operator available
  const showOperatorSelect = operatorOptions.length > 1;
  const blankLabel = currentOperator === 'blank' ? 'Blank' : 'Not blank';

  return (
    <Space.Compact block>
      {showOperatorSelect && (
        <Space.Addon style={{ padding: 0 }}>
          <OperatorSelect<TextOperator>
            value={currentOperator}
            onChange={(operator) => {
              const isNewBlank =
                operator === 'blank' || operator === 'notBlank';
              onChange({
                field: config.field,
                type: 'text',
                value: isNewBlank ? null : currentValue,
                operator,
              });
            }}
            options={operatorOptions}
            size={size}
            disabled={disabled}
          />
        </Space.Addon>
      )}
      <Input
        value={isBlankOperator ? blankLabel : currentValue}
        onChange={(e) => {
          if (isBlankOperator) return;
          onChange({
            field: config.field,
            type: 'text',
            value: e.target.value,
            operator: currentOperator,
          });
        }}
        placeholder={
          isBlankOperator
            ? undefined
            : config.placeholder ?? `Filter by ${config.label}`
        }
        size={size}
        disabled={disabled}
        allowClear={!isBlankOperator}
        readOnly={isBlankOperator}
        style={{
          width: '100%',
          fontStyle: isBlankOperator ? 'italic' : undefined,
        }}
      />
    </Space.Compact>
  );
}
