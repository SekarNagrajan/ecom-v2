import { Input, InputNumber, Space } from 'antd';

import type {
  NumberFilterField,
  NumberOperator,
} from '../../stores/data-view-types';
import type { NumberFilterControlProps } from './filter-control-types';
import { toNumberOrNull } from './number-filter-utils';
import { OperatorSelect } from './operator-select';
import { useNumberFilter } from './use-number-filter';

/**
 * Number filter control component
 * Supports operators: equals, notEquals, greaterThan, lessThan, between, blank, notBlank
 */
export function NumberFilterControl({
  config,
  value,
  onChange,
  size,
  disabled,
}: NumberFilterControlProps) {
  const numberConfig = config as NumberFilterField;
  const {
    currentOperator,
    isBetween,
    currentValue,
    singleValue,
    operatorOptions,
    showOperatorSelect,
    handleOperatorChange,
    handleSingleValueChange,
    handleRangeChange,
  } = useNumberFilter({ config: numberConfig, value, onChange });

  const isBlankOperator =
    currentOperator === 'blank' || currentOperator === 'notBlank';
  const blankLabel = currentOperator === 'blank' ? 'Blank' : 'Not blank';

  return (
    <Space.Compact block>
      {showOperatorSelect && (
        <Space.Addon style={{ padding: 0 }}>
          <OperatorSelect<NumberOperator>
            value={currentOperator}
            onChange={handleOperatorChange}
            options={operatorOptions}
            size={size}
            disabled={disabled}
          />
        </Space.Addon>
      )}

      {!isBlankOperator &&
        (isBetween ? (
          <>
            <InputNumber
              defaultValue={
                toNumberOrNull(
                  Array.isArray(currentValue) ? currentValue[0] : null
                ) ?? undefined
              }
              onChange={(v) => handleRangeChange(0, toNumberOrNull(v))}
              placeholder="Min"
              size={size}
              disabled={disabled}
              min={numberConfig.min}
              max={numberConfig.max}
              step={numberConfig.step}
              style={{ flex: 1, minWidth: 0 }}
              controls={false}
            />
            <InputNumber
              defaultValue={
                toNumberOrNull(
                  Array.isArray(currentValue) ? currentValue[1] : null
                ) ?? undefined
              }
              onChange={(v) => handleRangeChange(1, toNumberOrNull(v))}
              placeholder="Max"
              size={size}
              disabled={disabled}
              min={numberConfig.min}
              max={numberConfig.max}
              step={numberConfig.step}
              style={{ flex: 1, minWidth: 0 }}
              controls={false}
            />
          </>
        ) : (
          <InputNumber
            value={singleValue ?? undefined}
            onChange={(v) => handleSingleValueChange(toNumberOrNull(v))}
            placeholder={config.placeholder ?? `Enter value`}
            size={size}
            disabled={disabled}
            min={numberConfig.min}
            max={numberConfig.max}
            step={numberConfig.step}
            style={{ flex: 1, minWidth: 0 }}
            controls={false}
          />
        ))}

      {isBlankOperator && (
        <Input
          value={blankLabel}
          readOnly
          size={size}
          disabled={disabled}
          style={{
            fontStyle: 'italic',
            width: '100%',
          }}
        />
      )}
    </Space.Compact>
  );
}
