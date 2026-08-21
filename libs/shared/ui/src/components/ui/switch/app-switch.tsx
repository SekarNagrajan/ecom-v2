import { Switch, Flex, Typography, theme } from 'antd';

import type { AppSwitchProps } from './types';

export function AppSwitch({
  id,
  children,
  className,
  labelPosition = 'right',
  description,
  isLoading = false,
  disabled,
  required,
  labelSpacing,
  ...rest
}: AppSwitchProps) {
  const { token } = theme.useToken();

  const switchElement = (
    <Switch
      {...rest}
      id={id}
      className={className}
      disabled={disabled}
      loading={isLoading}
    />
  );

  const spacing = labelSpacing ?? token.marginXS;

  const descriptionElement = description ? (
    <div style={{ marginTop: token.marginXXS }}>
      <Typography.Text
        style={{
          fontSize: token.fontSizeSM,
          color: token.colorTextDescription,
        }}
      >
        {description}
      </Typography.Text>
    </div>
  ) : null;

  const labelElement = children ? (
    <label
      htmlFor={id}
      style={{
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        userSelect: 'none',
      }}
    >
      {children}
    </label>
  ) : null;

  // Handle different label positions
  switch (labelPosition) {
    case 'top':
      return (
        <Flex vertical gap={spacing}>
          {labelElement && <span>{labelElement}</span>}
          {switchElement}
          {descriptionElement}
        </Flex>
      );

    case 'bottom':
      return (
        <Flex vertical gap={spacing}>
          {switchElement}
          {labelElement && <span>{labelElement}</span>}
          {descriptionElement}
        </Flex>
      );

    case 'left':
      return (
        <Flex vertical>
          <Flex align="center">
            {labelElement && (
              <span style={{ marginRight: spacing }}>{labelElement}</span>
            )}
            {switchElement}
          </Flex>
          {descriptionElement}
        </Flex>
      );

    case 'right':
    default:
      return (
        <Flex vertical>
          <Flex align="center">
            {switchElement}
            {labelElement && (
              <span style={{ marginLeft: spacing }}>{labelElement}</span>
            )}
          </Flex>
          {descriptionElement}
        </Flex>
      );
  }
}
