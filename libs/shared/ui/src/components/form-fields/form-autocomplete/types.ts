import type { FieldValues } from 'react-hook-form';

import type { AppAutoCompleteProps } from '../../ui/autocomplete/types';
import type { BaseControlledFieldProps } from '../common/types';

/**
 * Props for FormAutocomplete component
 */
export type FormAutocompleteProps<T extends FieldValues> =
  BaseControlledFieldProps<T> & AppAutoCompleteProps;
