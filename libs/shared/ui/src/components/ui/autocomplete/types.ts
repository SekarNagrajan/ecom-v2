import type { DefaultOptionType } from 'antd/es/select';
import type { ReactNode } from 'react';

import type { ComboboxOption, ComboboxValue } from '../combobox/types';

// Re-export for backward compatibility
export type AutoCompleteOption = ComboboxOption;
export type AutoCompleteValue = ComboboxValue;

export interface AppAutoCompleteProps {
  value?: AutoCompleteValue;
  onChange?: (value: AutoCompleteValue, option?: AutoCompleteOption) => void;

  /** Static local options shown before async results are fetched. */
  options?: DefaultOptionType[];

  /** Async function to fetch options based on search text. Required. */
  fetchOptions: (searchText: string) => Promise<DefaultOptionType[]>;

  /** Whether to fetch async options with an empty search when the dropdown opens. */
  fetchOnOpen?: boolean;

  /** Minimum characters before triggering fetchOptions. @default 3 */
  minChars?: number;

  /** Debounce delay in ms for fetchOptions. @default 300 */
  debounceTimeout?: number;

  /** Show an "Add new" option when no exact match is found. @default true */
  allowFreeText?: boolean;

  /** Field names for option mapping. */
  fieldNames?: { label?: string; value?: string };

  /** Callback fired when options are fetched. */
  onOptionsFetched?: (options: DefaultOptionType[]) => void;

  /** Label to display before the user makes a selection (e.g. when the form value is an ID). */
  initialDisplayLabel?: string;

  placeholder?: string;
  disabled?: boolean;
  width?: string | number;

  /** Content rendered before the trigger via Space.Addon */
  prefix?: ReactNode;
  /** Content rendered after the trigger via Space.Addon */
  suffix?: ReactNode;
}
