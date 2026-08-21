import { Checkbox, Spin, Flex, Typography, theme } from 'antd';
import { useId } from 'react';

import type { AppCheckboxProps } from './types';

export function AppCheckbox({
  id: propId,
  children,
  className,
  labelPosition = 'right',
  description,
  isLoading = false,
  disabled,
  required,
  labelSpacing,
  ...rest
}: AppCheckboxProps) {
  const newId = useId();
  const { token } = theme.useToken();

  const id = propId ?? newId;

  const checkboxElement = (
    <Checkbox
      {...rest}
      id={id}
      className={className}
      disabled={disabled || isLoading}
      required={required}
    />
  );

  const spacing = labelSpacing ?? token.marginXS;

  const loadingElement = isLoading ? (
    <Spin size="small" style={{ marginLeft: token.marginXS }} />
  ) : null;

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

  const checkboxWithLoading = (
    <Flex align="center">
      {checkboxElement}
      {loadingElement}
    </Flex>
  );

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
          {checkboxWithLoading}
          {descriptionElement}
        </Flex>
      );

    case 'bottom':
      return (
        <Flex vertical gap={spacing}>
          {checkboxWithLoading}
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
            {checkboxWithLoading}
          </Flex>
          {descriptionElement}
        </Flex>
      );

    case 'right':
    default:
      return (
        <Flex vertical>
          <Flex align="center">
            {checkboxWithLoading}
            {labelElement && (
              <span style={{ marginLeft: spacing }}>{labelElement}</span>
            )}
          </Flex>
          {descriptionElement}
        </Flex>
      );
  }
}
