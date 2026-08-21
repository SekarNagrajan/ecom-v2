import type { TreeSelectProps } from 'antd';
import type { FieldValues } from 'react-hook-form';

import type { BaseControlledFieldProps } from '../common/types';

export type FormTreeSelectProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & Omit<TreeSelectProps, 'value' | 'onChange'>;
