import type { FormItemProps } from 'antd';
import type { ReactNode } from 'react';
import {
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
} from 'react-hook-form';

// This is the Base Interface that ALL our form components will extend.
export interface BaseControlledFieldProps<T extends FieldValues> {
  // RHF Bindings
  name: Path<T>; // The dot-notation path (e.g., "user.email")
  control?: Control<T>; // Optional: falls back to useFormContext
  id?: string; // Unique ID for accessibility

  // Wrapper Visuals
  label?: ReactNode;
  labelIcon?: ReactNode; // Icon to be displayed next to the label
  tooltip?: FormItemProps['tooltip']; // Icon with info text next to label
  required?: boolean; // Adds the red asterisk (*)

  // Input Props
  placeholder?: string;
  autoFocus?: boolean;

  // A11y Props
  autoComplete?: string;
  ariaDescribedBy?: string;

  // Wrapper State Overrides
  hasFeedback?: boolean; // Controls Success/Loading icons

  // Wrapper Styling
  wrapperClassName?: string; // Class for the Form.Item container

  formItemProps?: Omit<
    FormItemProps,
    // These are handled by RHF
    | 'name'
    | 'initialValue'
    | 'rules'
    // Below all Handled by shortcut
    | 'children'
    | 'label'
    | 'tooltip'
    | 'required'
    | 'hasFeedback'
  >;
}

// Extends AntD FormItemProps so you can pass layout/colSpan/etc.
// We Omit 'name' because RHF handles the naming, not AntD Form
export interface FormFieldWrapperProps {
  id?: string;
  label?: React.ReactNode;
  labelIcon?: React.ReactNode;
  error?: FieldError;
  isValidating?: boolean;
  children: React.ReactNode;

  // Custom Overrides
  className?: string;
  tooltip?: FormItemProps['tooltip'];
  required?: boolean;
  hasFeedback: FormItemProps['hasFeedback'];

  itemProps?: FormItemProps;
}
