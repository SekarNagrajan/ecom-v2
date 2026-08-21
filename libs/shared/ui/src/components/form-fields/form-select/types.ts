import type { FieldValues } from 'react-hook-form';

import type { AppSelectProps } from '../../ui/select/types';
import type { BaseControlledFieldProps } from '../common/types';

export type FormSelectProps<T extends FieldValues> =
  BaseControlledFieldProps<T> &
    Omit<AppSelectProps, 'invalid' | 'onChange' | 'value'>;
