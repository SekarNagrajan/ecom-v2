import { Input, theme } from 'antd';
import type { FieldValues } from 'react-hook-form';

import type { OtpFieldProps } from './types';

export function OtpField<T extends FieldValues>({
  field,
  id,
  error,
  ...rest
}: OtpFieldProps<T>) {
  const { token } = theme.useToken();

  return (
    <Input.OTP
      inputMode="numeric"
      formatter={(str) => str.replace(/\D/g, '')}
      {...rest}
      id={id}
      {...field}
      status={error ? 'error' : undefined}
      // Only numbers
      styles={{
        input: {
          padding: token.paddingSM,
          fontWeight: token.fontWeightStrong,
        },
        ...rest.styles,
      }}
    />
  );
}
