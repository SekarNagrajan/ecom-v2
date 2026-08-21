import type { SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import type {
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
} from 'react-hook-form';

import type { BaseControlledFieldProps } from '../common/types';

/**
 * Base Props
 * We omit props that we manage internally or do not support in this strict mode.
 */
type BaseSelectProps = Omit<
  SelectProps,
  | 'value'
  | 'onChange'
  | 'mode'
  | 'options'
  | 'loading'
  | 'labelInValue'
  | 'showSearch'
>;

export type CustomSelectFeatureProps = {
  /**
   * Selection Mode
   * - 'single': Stores a single value in the form.
   * - 'multiple': Stores an array of values in the form.
   * @default 'single'
   */
  mode?: 'single' | 'multiple';

  /**
   * If true, allows user to type values not in the options list.
   * If false, user must select from available options.
   * @default false
   */
  allowFreeText?: boolean;

  /**
   * Minimum characters to type before triggering fetchOptions.
   * @default 2
   */
  minChars?: number;

  /**
   * Async function to fetch options.
   * The component handles loading state and option management internally.
   */
  fetchOptions: (searchText: string) => Promise<DefaultOptionType[]>;

  /**
   * Delay in milliseconds for the fetchOptions debounce.
   * @default 300
   */
  debounceTimeout?: number;

  /**
   * If true, highlights the search term inside the options.
   * @default true
   */
  highlightMatch?: boolean;

  /**
   * If true, shows a "Select All" option when in multiple mode.
   * Selecting this will add all currently available options to the value.
   * @default false
   */
  allowSelectAll?: boolean;

  /**
   * Initial options to populate the cache.
   * Useful when the form has initial values and we need to show labels immediately.
   */
  initialOptionLabels?: Record<string | number, DefaultOptionType>;
};

export type CustomSelectInputConfig = BaseSelectProps &
  CustomSelectFeatureProps;

export type FormCustomSelectProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & CustomSelectInputConfig;

export type CustomSelectFieldProps<T extends FieldValues> =
  CustomSelectInputConfig & {
    field: ControllerRenderProps<T, Path<T>>;
    id?: string;
    error?: FieldError;
    required?: boolean;
    autoComplete?: string;
  };
