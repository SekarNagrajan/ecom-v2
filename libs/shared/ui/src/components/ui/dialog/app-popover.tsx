import { Popover, type PopoverProps } from 'antd';

export function AppPopover({ children, ...props }: PopoverProps) {
  return <Popover {...props}>{children}</Popover>;
}
