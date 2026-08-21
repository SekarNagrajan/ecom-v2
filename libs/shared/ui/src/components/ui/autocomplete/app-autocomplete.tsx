import { AppCombobox } from '../combobox';
import type { AppAutoCompleteProps } from './types';

export function AppAutoComplete({
  options,
  fetchOptions,
  fetchOnOpen,
  allowFreeText = true,
  ...rest
}: AppAutoCompleteProps) {
  return (
    <AppCombobox
      options={options}
      fetchOptions={fetchOptions}
      fetchOnOpen={fetchOnOpen}
      allowFreeText={allowFreeText}
      {...rest}
    />
  );
}
