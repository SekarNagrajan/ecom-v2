import type { FieldValues } from 'react-hook-form';

import type { AppSwitchProps } from '../../ui/switch/types';
import type { BaseControlledFieldProps } from '../common/types';

export type FormSwitchProps<T extends FieldValues> =
  BaseControlledFieldProps<T> &
    Omit<AppSwitchProps, 'checked' | 'onChange' | 'value'>;
