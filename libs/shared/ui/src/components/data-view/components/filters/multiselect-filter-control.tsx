import { AppSelect } from '../../../ui/select';
import type { MultiselectFilterField } from '../../stores/data-view-types';
import type { SelectFilterControlProps } from './filter-control-types';

/**
 * Multiselect filter control component
 * Multi-select dropdown with checkboxes for filtering
 */
export function MultiselectFilterControl({
  config,
  value,
  onChange,
  options,
  loading,
  size,
  disabled,
}: SelectFilterControlProps) {
  const multiselectConfig = config as MultiselectFilterField;
  const currentValue = (value?.value as (string | number)[]) ?? [];

  const handleChange = (newValue: (string | number)[]) => {
    if (!newValue || newValue.length === 0) {
      onChange(undefined);
      return;
    }

    onChange({
      field: config.field,
      type: 'multiselect',
      value: newValue,
      operator: 'in',
    });
  };

  return (
    <AppSelect
      value={currentValue}
      onChange={handleChange}
      mode="multiple"
      options={options}
      maxTagCount="responsive"
      placeholder={config.placeholder ?? `Select ${config.label}`}
      size={size}
      disabled={disabled}
      loading={loading}
      allowClear
      showSearch={{ optionFilterProp: 'label' }}
      allowSelectAll
      maxCount={multiselectConfig.maxSelections}
      style={{ width: '100%' }}
    />
  );
}
