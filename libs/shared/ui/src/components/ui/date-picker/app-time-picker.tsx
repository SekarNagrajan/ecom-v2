import { Space } from 'antd';
import type { ReactNode } from 'react';

import {
  AntdLuxonTimePicker,
  type AntdLuxonTimePickerProps,
} from '../../../base/antd-luxon-time-picker';
import { useAppConfig } from '../../../hooks/use-app-config';

export interface AppTimePickerProps extends AntdLuxonTimePickerProps {
  prefix?: ReactNode;
}

export function AppTimePicker({
  prefix,
  format,
  allowClear = true,
  style,
  ...rest
}: AppTimePickerProps) {
  const { timeFormat } = useAppConfig();

  return (
    <Space.Compact block>
      {prefix && <Space.Addon>{prefix}</Space.Addon>}
      <AntdLuxonTimePicker
        {...rest}
        format={format ?? timeFormat}
        allowClear={allowClear}
        style={{ width: '100%', ...style }}
      />
    </Space.Compact>
  );
}
