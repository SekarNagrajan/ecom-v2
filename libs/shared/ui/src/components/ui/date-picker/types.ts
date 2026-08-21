import type { DateTime } from 'luxon';

import type { AntdLuxonDatePickerProps } from '../../../base/antd-luxon-date-picker';

export type AppDatePickerProps = Omit<
  AntdLuxonDatePickerProps,
  'onChange' | 'onOk'
> & {
  /**
   * Callback function, executed when selected time is changing
   */
  onChange?: (
    date: DateTime | DateTime[] | null,
    dateString: string | string[]
  ) => void;

  /**
   * Callback function, which is executed when the confirm button is clicked
   */
  onOk?: (date: DateTime | DateTime[] | null) => void;

  /**
   * Disable dates before today.
   */
  disablePast?: boolean;

  /**
   * Disable dates after today.
   */
  disableFuture?: boolean;
};
