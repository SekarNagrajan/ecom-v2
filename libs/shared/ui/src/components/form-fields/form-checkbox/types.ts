import type { FieldValues } from 'react-hook-form';

import type { AppCheckboxProps } from '../../ui/checkbox/types';
import type { BaseControlledFieldProps } from '../common/types';

export type FormCheckboxProps<T extends FieldValues> =
  BaseControlledFieldProps<T> &
    Omit<AppCheckboxProps, 'checked' | 'onChange' | 'value'>;
