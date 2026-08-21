import type { AntdLuxonDateRangePickerProps } from '../../../../base/antd-luxon-date-range-picker';

export interface DateRangePickerFormatInput {
  picker?: AntdLuxonDateRangePickerProps['picker'];
  format?: AntdLuxonDateRangePickerProps['format'];
  showTime?: AntdLuxonDateRangePickerProps['showTime'];
  dateFormat: string;
  timeFormat?: string;
}

export interface DateRangePickerFormatResult {
  displayFormat: AntdLuxonDateRangePickerProps['format'];
  showTimeConfig?: AntdLuxonDateRangePickerProps['showTime'];
}

export function computeDateRangePickerFormat({
  picker = 'date',
  format,
  showTime,
  dateFormat,
  timeFormat,
}: DateRangePickerFormatInput): DateRangePickerFormatResult {
  let showTimeConfig: DateRangePickerFormatResult['showTimeConfig'];

  if (showTime) {
    const is12Hour = timeFormat ? /h|a/.test(timeFormat) : false;
    const base = typeof showTime === 'object' ? showTime : {};

    showTimeConfig = {
      ...base,
      format: timeFormat,
      use12Hours: is12Hour,
    } as AntdLuxonDateRangePickerProps['showTime'];
  }

  let displayFormat = format;

  if (!displayFormat) {
    switch (picker) {
      case 'week':
        displayFormat = "kkkk-'W'WW";
        break;
      case 'month':
        displayFormat = 'yyyy-MM';
        break;
      case 'quarter':
        displayFormat = "yyyy-'Q'q";
        break;
      case 'year':
        displayFormat = 'yyyy';
        break;
      default:
        displayFormat = showTimeConfig
          ? `${dateFormat} ${timeFormat}`
          : dateFormat;
    }
  }

  return { displayFormat, showTimeConfig };
}
