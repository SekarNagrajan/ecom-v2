import type { AntdLuxonDateRangePickerProps } from '../../../base/antd-luxon-date-range-picker';

export type AppDateRangePickerProps = AntdLuxonDateRangePickerProps & {
  /**
   * Where to render the presets.
   * - 'left': Standard AntD sidebar.
   * - 'bottom': Custom footer buttons.
   * @default 'left'
   */
  presetsPlacement?: 'left' | 'bottom';

  /**
   * Disable dates before today.
   */
  disablePast?: boolean;

  /**
   * Disable dates after today.
   */
  disableFuture?: boolean;

  /**
   * Minimum gap between start and end in MINUTES.
   */
  minimumGap?: number;
};
