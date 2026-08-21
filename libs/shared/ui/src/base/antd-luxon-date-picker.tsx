import luxonGenerateConfig from '@rc-component/picker/generate/luxon';
import { type GetProps, DatePicker } from 'antd';
import type { DateTime } from 'luxon';

export const AntdLuxonDatePicker =
  DatePicker.generatePicker<DateTime>(luxonGenerateConfig);

export type AntdLuxonDatePickerProps = GetProps<typeof AntdLuxonDatePicker>;
