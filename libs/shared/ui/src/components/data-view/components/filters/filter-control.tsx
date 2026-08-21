import type {
  FilterFieldConfig,
  FilterValue,
} from '../../stores/data-view-types';
import { BooleanFilterControl } from './boolean-filter-control';
import { DateFilterControl } from './date-filter-control';
import { DateRangeFilterControl } from './daterange-filter-control';
import { MultiselectFilterControl } from './multiselect-filter-control';
import { NumberFilterControl } from './number-filter-control';
import { SelectFilterControl } from './select-filter-control';
import { TextFilterControl } from './text-filter-control';
import { useFilterOptions } from './use-filter-options';

export interface FilterControlProps {
  /** Field configuration */
  config: FilterFieldConfig;
  /** Current filter value */
  value: FilterValue | undefined;
  /** Callback when filter value changes */
  onChange: (value: FilterValue | undefined) => void;
  /** Optional size */
  size?: 'small' | 'middle' | 'large';
  /** Whether the control is disabled */
  disabled?: boolean;
}

/**
 * Unified filter control component
 * Renders the appropriate control based on filter type
 */
export function FilterControl({
  config,
  value,
  onChange,
  size,
  disabled,
}: FilterControlProps) {
  const selectConfig =
    config.type === 'select' || config.type === 'multiselect'
      ? (config as FilterFieldConfig & {
          type: 'select' | 'multiselect';
        })
      : null;
  const { options, loading } = useFilterOptions(selectConfig);

  const commonProps = { config, value, onChange, size, disabled };

  switch (config.type) {
    case 'text':
      return <TextFilterControl {...commonProps} config={config} />;

    case 'select':
      return (
        <SelectFilterControl
          {...commonProps}
          config={config}
          options={options}
          loading={loading}
        />
      );

    case 'multiselect':
      return (
        <MultiselectFilterControl
          {...commonProps}
          config={config}
          options={options}
          loading={loading}
        />
      );

    case 'number':
      return <NumberFilterControl {...commonProps} config={config} />;

    case 'date':
      return <DateFilterControl {...commonProps} config={config} />;

    case 'daterange':
      return <DateRangeFilterControl {...commonProps} config={config} />;

    case 'boolean':
      return <BooleanFilterControl {...commonProps} config={config} />;

    default:
      return null;
  }
}
