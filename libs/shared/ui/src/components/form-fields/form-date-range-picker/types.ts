import type { DateTime } from 'luxon';
import type { FieldValues } from 'react-hook-form';

import type { AppDateRangePickerProps } from '../../ui/date-range-picker/types';
import type { BaseControlledFieldProps } from '../common/types';

export type DateRangePickerValueType = [DateTime | null, DateTime | null];

export type FormDateRangePickerProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & AppDateRangePickerProps;
