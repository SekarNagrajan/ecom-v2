import { useMemo } from 'react';

import { useAntdBreakpoint } from '../../../hooks/use-antd-breakpoint';
import { useAppConfig } from '../../../hooks/use-app-config';
import { DesktopDateRangePicker } from './desktop-date-range-picker';
import { computeDateRangePickerFormat } from './helpers/date-range-picker-format';
import { MobileDateRangePicker } from './mobile-date-range-picker';
import type { AppDateRangePickerProps } from './types';
import { buildDateRangeRestrictions } from './utils';

export function AppDateRangePicker(props: AppDateRangePickerProps) {
  const { isMobile } = useAntdBreakpoint();
  const { timezone, dateFormat, timeFormat } = useAppConfig();

  const {
    disablePast,
    disableFuture,
    minimumGap,
    disabledDate,
    disabledTime,
    picker,
    format,
    showTime,

    ...rest
  } = props;

  /**
   * Formatting logic
   */
  const { displayFormat, showTimeConfig } = useMemo(() => {
    return computeDateRangePickerFormat({
      picker,
      format,
      showTime,
      dateFormat,
      timeFormat,
    });
  }, [dateFormat, format, picker, showTime, timeFormat]);

  const { disabledDate: mergedDisabledDate, disabledTime: mergedDisabledTime } =
    useMemo(() => {
      return buildDateRangeRestrictions({
        timezone,
        disablePast,
        disableFuture,
        disabledDate,
        disabledTime,
        minimumGap,
      });
    }, [
      timezone,
      disablePast,
      disableFuture,
      disabledDate,
      disabledTime,
      minimumGap,
    ]);

  const commonProps = {
    ...rest,
    disabledDate: mergedDisabledDate,
    disabledTime: mergedDisabledTime,
    format: displayFormat,
    showTime: showTimeConfig,
    picker,
  };

  if (isMobile) {
    return <MobileDateRangePicker {...commonProps} />;
  }

  return <DesktopDateRangePicker {...commonProps} />;
}
