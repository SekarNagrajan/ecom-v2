import type { PopoverProps, SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import type { ReactNode } from 'react';

/**
 * Option type with explicit value and label
 */
export interface ComboboxOption {
  value: string | number;
  label: ReactNode;
  [key: string]: unknown;
}

export type ComboboxValue = string | number | null;

/**
 * Props passed to the custom trigger renderer
 */
export interface ComboboxTriggerProps {
  /** Currently displayed label (or raw value if no label) */
  displayText: string | null;
  /** Current value */
  value: ComboboxValue;
  /** Whether the popover is open */
  open: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Ref to attach to the trigger element (used for popover width measurement) */
  ref: React.Ref<HTMLButtonElement>;
}

export interface AppComboboxProps {
  // ── Value ──
  value?: ComboboxValue;
  onChange?: (value: ComboboxValue, option?: ComboboxOption) => void;

  // ── Options source (provide one or the other) ──
  /** Static local options — uses client-side filtering */
  options?: DefaultOptionType[];
  /** Async option loader — uses server-side filtering */
  fetchOptions?: (searchText: string) => Promise<DefaultOptionType[]>;
  /** Whether to fetch async options with an empty search when the dropdown opens. */
  fetchOnOpen?: boolean;

  // ── Search config ──
  /** Minimum chars before triggering fetchOptions (only for async mode). @default 3 */
  minChars?: number;
  /** Debounce delay in ms for fetchOptions. @default 300 */
  debounceTimeout?: number;

  // ── Free text ──
  /** Show an "Add new" option when no exact match is found. @default false */
  allowFreeText?: boolean;

  // ── Field mapping ──
  fieldNames?: { label?: string; value?: string };

  // ── Callbacks ──
  onOptionsFetched?: (options: DefaultOptionType[]) => void;
  onOpenChange?: (open: boolean) => void;

  // ── Appearance ──
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  width?: string | number;

  /** Inline adornment rendered inside the trigger before the display text. */
  prefix?: ReactNode;
  /** Inline adornment rendered inside the trigger after the display text. */
  suffix?: ReactNode;

  /** Custom trigger renderer. If omitted, renders a default Button. */
  renderTrigger?: (props: ComboboxTriggerProps) => ReactNode;

  /** Pass-through props for the Popover container */
  popoverProps?: PopoverProps;

  /** Label to display before the user makes a selection (e.g. when the form value is an ID). */
  initialDisplayLabel?: string;

  /** Pass-through props for the inner Select */
  selectProps?: SelectProps;
}
