import type { RadioGroupProps } from 'antd';
import type { CSSProperties } from 'react';

export type AppRadioGroupProps = Omit<RadioGroupProps, 'options'> & {
  options?:
    | RadioGroupProps['options']
    | ReadonlyArray<NonNullable<RadioGroupProps['options']>[number]>;
  /**
   * Space between radio options. When set, the group is laid out as a wrapping
   * flex row so the gap applies between every item (including across wrap
   * lines). Accepts any CSS `gap` value (number-as-px or string).
   */
  gap?: CSSProperties['gap'];
};
