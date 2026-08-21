import { Radio, Spin, Flex, Typography, theme } from 'antd';

import type { AppRadioProps } from './types';

export function AppRadio({
  children,
  className,
  labelPosition = 'right',
  description,
  isLoading = false,
  disabled,
  required,
  labelSpacing,
  ...rest
}: AppRadioProps) {
  const { token } = theme.useToken();

  const radioElement = (
    <Radio
      {...rest}
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

  const radioWithLoading = (
    <Flex align="center">
      {radioElement}
      {loadingElement}
    </Flex>
  );

  // Handle different label positions
  switch (labelPosition) {
    case 'top':
      return (
        <Flex vertical gap={spacing}>
          {children && <span>{children}</span>}
          {radioWithLoading}
          {descriptionElement}
        </Flex>
      );

    case 'bottom':
      return (
        <Flex vertical gap={spacing}>
          {radioWithLoading}
          {children && <span>{children}</span>}
          {descriptionElement}
        </Flex>
      );

    case 'left':
      return (
        <Flex vertical>
          <Flex align="center">
            {children && (
              <span style={{ marginRight: spacing }}>{children}</span>
            )}
            {radioWithLoading}
          </Flex>
          {descriptionElement}
        </Flex>
      );

    case 'right':
    default:
      return (
        <Flex vertical>
          <Flex align="center">
            {radioWithLoading}
            {children && (
              <span style={{ marginLeft: spacing }}>{children}</span>
            )}
          </Flex>
          {descriptionElement}
        </Flex>
      );
  }
}
