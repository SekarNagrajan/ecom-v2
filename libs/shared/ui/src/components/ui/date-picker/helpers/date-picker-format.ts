import type { AntdLuxonDatePickerProps } from '../../../../base/antd-luxon-date-picker';

export interface DatePickerFormatInput {
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year';
  format?: AntdLuxonDatePickerProps['format'];
  showTime?: AntdLuxonDatePickerProps['showTime'];
  dateFormat: string;
  timeFormat?: string;
}

export interface DatePickerFormatResult {
  displayFormat: AntdLuxonDatePickerProps['format'];
  showTimeConfig?: {
    format?: string;
    use12Hours?: boolean;
  } & AntdLuxonDatePickerProps['showTime'];
}

export function computeDatePickerFormat({
  picker = 'date',
  format,
  showTime,
  dateFormat,
  timeFormat,
}: DatePickerFormatInput): DatePickerFormatResult {
  let showTimeConfig: DatePickerFormatResult['showTimeConfig'];

  if (showTime) {
    const is12Hour = timeFormat ? /h|a/.test(timeFormat) : false;
    const base = typeof showTime === 'object' ? showTime : {};

    showTimeConfig = {
      ...base,
      format: timeFormat,
      use12Hours: is12Hour,
    };
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
