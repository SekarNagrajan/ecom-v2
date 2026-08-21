import type { SelectProps } from 'antd';

export type AppSelectOption = NonNullable<SelectProps['options']>[number];

export type AppSelectOptions =
  | SelectProps['options']
  | ReadonlyArray<AppSelectOption>;

export interface AppSelectProps extends Omit<SelectProps, 'options'> {
  options?: AppSelectOptions;
  required?: boolean;

  /**
   * Enable "Select All" checkbox in the dropdown.
   * Only works when mode="multiple" or mode="tags".
   */
  allowSelectAll?: boolean;

  /**
   * Delay in milliseconds for the search callback.
   * Useful for remote data fetching.
   * @default 300
   */
  debounceTimeout?: number;

  /**
   * Function to trigger remote search.
   */
  customSearch?: (value: string) => void;

  /**
   * Marks the field as invalid for accessibility.
   */
  invalid?: boolean;
}
