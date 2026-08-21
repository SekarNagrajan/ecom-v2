import { type Checkbox, type GetProps } from 'antd';

export type CheckboxGroupProps = GetProps<typeof Checkbox.Group>;

export type AppCheckboxGroupDirection = 'horizontal' | 'vertical';

export interface AppCheckboxGroupProps<T extends string>
  extends Omit<CheckboxGroupProps, 'children' | 'onChange' | 'options'> {
  showSelectAll?: boolean;
  selectAllLabel?: string;
  maxSelection?: number;
  minSelection?: number;
  direction?: AppCheckboxGroupDirection;
  gap?: number | string;
  valueLabelKey?: string;
  onValidationError?: (error: string) => void;
  onChange: (checkedValues: T[]) => void;
  options?:
    | CheckboxGroupProps['options']
    | ReadonlyArray<NonNullable<CheckboxGroupProps['options']>[number]>;
}
