import {
  SwapOutlined,
  RightOutlined,
  LeftOutlined,
  StopOutlined,
  DashOutlined,
  ArrowRightOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Space, theme } from 'antd';
import { useMemo, type ReactNode } from 'react';

const OPERATOR_ICONS: Record<string, ReactNode> = {
  // Common
  equals: '=',
  notEquals: <StopOutlined />,
  blank: <DashOutlined />,
  notBlank: (
    <div style={{ position: 'relative', display: 'inline-flex', top: 2 }}>
      <DashOutlined />
      <StopOutlined
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: 'red',
          opacity: 0.5,
        }}
      />
    </div>
  ),

  // Text
  contains: <span style={{ marginTop: 5, display: 'block' }}>*</span>,
  notContains: (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <span>*</span>
      <StopOutlined
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: 'red',
          opacity: 0.5,
        }}
      />
    </div>
  ),
  startsWith: (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span>A</span>
      <ArrowRightOutlined style={{ fontSize: 10 }} />
    </div>
  ),
  endsWith: (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <ArrowRightOutlined
        style={{ fontSize: 10, transform: 'rotate(180deg)' }}
      />
      <span>A</span>
    </div>
  ),

  // Number / Date
  greaterThan: <RightOutlined />,
  greaterThanOrEqual: '≥',
  lessThan: <LeftOutlined />,
  lessThanOrEqual: '≤',
  between: <SwapOutlined />,
  before: <VerticalAlignTopOutlined />,
  after: <VerticalAlignBottomOutlined />,
  in: '∈',
  notIn: '∉',
};

export interface OperatorSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { label: string; value: T }[];
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
}

/**
 * Modern Operator Select component
 * Shows an icon-only trigger (Button), and full label in the Dropdown
 */
export function OperatorSelect<T extends string>({
  value,
  onChange,
  options,
  size,
  disabled,
}: OperatorSelectProps<T>) {
  const { token } = theme.useToken();

  const menuItems = useMemo(
    () =>
      options.map((opt) => ({
        key: opt.value,
        label: (
          <Space size={8}>
            <span
              style={{
                display: 'inline-flex',
                width: 20,
                justifyContent: 'center',
              }}
            >
              {OPERATOR_ICONS[opt.value] || '?'}
            </span>
            <span>{opt.label}</span>
          </Space>
        ),
        onClick: () => onChange(opt.value),
      })),
    [options, onChange]
  );

  return (
    <Dropdown
      menu={{ items: menuItems, selectable: true, selectedKeys: [value] }}
      disabled={disabled}
      trigger={['click']}
      placement="bottomLeft"
    >
      <Button
        type="text"
        size={size}
        icon={OPERATOR_ICONS[value] || '?'}
        style={{
          height:
            size === 'small'
              ? token.controlHeightSM
              : size === 'large'
              ? token.controlHeightLG
              : token.controlHeight,
          paddingInline: token.paddingXS,
          background: 'transparent',
          border: 'none',
        }}
      />
    </Dropdown>
  );
}
