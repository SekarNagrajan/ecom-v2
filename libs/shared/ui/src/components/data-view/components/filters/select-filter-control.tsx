import { AppSelect } from '../../../ui/select';
import type { SelectFilterControlProps } from './filter-control-types';

/**
 * Select filter control component
 * Single-select dropdown for filtering
 */
export function SelectFilterControl({
  config,
  value,
  onChange,
  options,
  loading,
  size,
  disabled,
}: SelectFilterControlProps) {
  const currentValue = value?.value as string | number | undefined;

  const handleChange = (newValue: string | number | undefined) => {
    if (newValue === undefined || newValue === null) {
      onChange(undefined);
      return;
    }

    onChange({
      field: config.field,
      type: 'select',
      value: newValue,
      operator: 'equals',
    });
  };

  return (
    <AppSelect
      value={currentValue}
      onChange={handleChange}
      options={options}
      placeholder={config.placeholder ?? `Select ${config.label}`}
      disabled={disabled}
      loading={loading}
      allowClear
      showSearch={{
        optionFilterProp: 'label',
      }}
      style={{ width: '100%' }}
    />
  );
}
