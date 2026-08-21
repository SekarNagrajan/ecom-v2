import type { CSSProperties, ReactNode } from 'react';

import type {
  AppSegmentedAntdOptions,
  AppSegmentedLabeledOption,
  AppSegmentedOption,
  AppSegmentedValue,
} from './types';

function isAppSegmentedLabeledOption<ValueType extends AppSegmentedValue>(
  option: AppSegmentedOption<ValueType>
): option is AppSegmentedLabeledOption<ValueType> {
  return typeof option === 'object' && option !== null && 'value' in option;
}

function renderSegmentedContent(
  label: ReactNode,
  icon: ReactNode,
  optionMinWidth?: CSSProperties['minWidth']
) {
  if (!optionMinWidth) {
    return label;
  }

  return (
    <span
      style={{
        minWidth: optionMinWidth,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: label && icon ? '0.5em' : undefined,
      }}
    >
      {icon ? (
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      ) : null}
      {label !== undefined ? (
        <span style={{ minWidth: 0 }}>{label}</span>
      ) : null}
    </span>
  );
}

export function toSegmentedOptions<ValueType extends AppSegmentedValue>(
  options: ReadonlyArray<AppSegmentedOption<ValueType>>,
  optionMinWidth?: CSSProperties['minWidth']
): AppSegmentedAntdOptions<ValueType> {
  return options.map((option) => {
    if (!isAppSegmentedLabeledOption<ValueType>(option)) {
      if (!optionMinWidth) {
        return option;
      }

      return {
        value: option,
        label: renderSegmentedContent(String(option), null, optionMinWidth),
      };
    }

    const { mobileIcon, mobileLabel, icon, ...segmentedOption } = option;
    void mobileIcon;
    void mobileLabel;

    return {
      ...segmentedOption,
      icon: optionMinWidth ? undefined : icon,
      label: renderSegmentedContent(
        segmentedOption.label,
        icon,
        optionMinWidth
      ),
    };
  }) as AppSegmentedAntdOptions<ValueType>;
}
