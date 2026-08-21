import { useId } from 'react';

import { AppSwitch } from '../../../ui/switch/app-switch';
import type { BooleanFilterControlProps } from './filter-control-types';

/**
 * Boolean filter control component
 * Renders a toggle switch for boolean values
 */
export function BooleanFilterControl({
  config,
  value,
  onChange,
  disabled,
}: BooleanFilterControlProps) {
  const switchId = useId();
  const currentValue = !!value?.value;
  const toggleLabel = config.toggleLabel ?? config.label;

  const handleToggle = (checked: boolean) => {
    onChange({
      field: config.field,
      type: 'boolean',
      value: checked,
      operator: 'equals',
    });
  };

  return (
    <div style={{ padding: '4px 0' }}>
      <AppSwitch
        id={switchId}
        checked={currentValue}
        onChange={handleToggle}
        disabled={disabled}
      >
        {toggleLabel}
      </AppSwitch>
    </div>
  );
}
