import type { FieldValues } from 'react-hook-form';

import type { AppRadioProps } from '../../ui/radio/types';
import type { BaseControlledFieldProps } from '../common/types';

export type FormRadioProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & Omit<AppRadioProps, 'checked' | 'onChange'>;
