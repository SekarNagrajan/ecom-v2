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
type BaseAutocompleteProps = Omit<
  SelectProps,
  | 'value'
  | 'onChange'
  | 'mode'
  | 'options'
  | 'loading'
  | 'labelInValue'
  | 'showSearch'
>;

type AutocompleteFeatureProps = {
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
   * If true, shows a "Select All" option when in multiple mode.
   * Selecting this will add all currently available options to the value.
   * @default false
   */
  allowSelectAll?: boolean;

  /**
   * Minimum characters to type before triggering fetchOptions.
   * @default 2
   */
  minChars?: number;

  /**
   * If true, highlights the search term inside the options.
   * @default true
   */
  highlightMatch?: boolean;

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
   * Callback fired when max tag count is reached and user tries to add more.
   * Useful for showing custom notifications or warnings.
   */
  onMaxReached?: (currentCount: number, maxCount: number) => void;

  /**
   * Initial options to populate the cache.
   * Useful when the form has initial values and we need to show labels immediately.
   */
  initialOptionLabels?: Record<string | number, DefaultOptionType>;
};

type AutocompleteInputConfig = BaseAutocompleteProps & AutocompleteFeatureProps;

export type FormAutocompleteProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & AutocompleteInputConfig;

export type AutocompleteFieldProps<T extends FieldValues> =
  AutocompleteInputConfig & {
    field: ControllerRenderProps<T, Path<T>>;
    id?: string;
    error?: FieldError;
    required?: boolean;
    autoComplete?: string;
  };
