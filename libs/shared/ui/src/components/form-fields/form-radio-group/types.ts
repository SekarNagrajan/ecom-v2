import type { FieldValues } from 'react-hook-form';

import type { AppRadioGroupProps } from '../../ui/radio-group/types';
import type { BaseControlledFieldProps } from '../common/types';
export type FormRadioGroupProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & Omit<AppRadioGroupProps, 'onChange'>;
