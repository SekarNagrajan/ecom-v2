import type { FieldValues } from 'react-hook-form';

import type { AppCheckboxGroupProps } from '../../ui/checkbox-group/types';
import type { BaseControlledFieldProps } from '../common/types';

export type FormCheckboxGroupProps<
  T extends FieldValues,
  V extends string = string
> = BaseControlledFieldProps<T> & Omit<AppCheckboxGroupProps<V>, 'onChange'>;
