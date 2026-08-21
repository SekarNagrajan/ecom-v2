import { Flex, Typography, theme } from 'antd';
import type { CSSProperties, ReactNode } from 'react';

const { Text } = Typography;

export interface FormSectionHeaderProps {
  /** Primary section heading. */
  title: ReactNode;
  /** Optional supporting description rendered under the title. */
  description?: ReactNode;
  /** Optional slot rendered on the right (typically an action button). */
  extra?: ReactNode;
  /** Override container style — kept narrow on purpose. */
  style?: CSSProperties;
  /** Pass-through className for layout-level overrides. */
  className?: string;
}

/**
 * Form section header with a primary-colored vertical accent bar, a title,
 * and an optional description and right-aligned `extra` slot.
 *
 * Designed to introduce a logical group of form controls inside drawers,
 * cards, or upsert flows — matches the section header pattern used across
 * the CRM portal redesign.
 *
 * Sizes (font, spacing, accent bar) come from the active AntD theme tokens
 * so the component scales with the user's selected density.
 */
export const FormSectionHeader = ({
  title,
  description,
  extra,
  style,
  className,
}: FormSectionHeaderProps) => {
  const { token } = theme.useToken();

  return (
    <Flex
      align="flex-start"
      gap={token.marginSM}
      className={className}
      style={{
        width: '100%',
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          flex: '0 0 auto',
          width: 3,
          alignSelf: 'stretch',
          minHeight: token.fontSizeLG * token.lineHeight,
          background: token.colorPrimary,
          borderRadius: token.borderRadiusXS,
        }}
      />

      <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
        <Text
          strong
          style={{
            fontSize: token.fontSizeLG,
            lineHeight: token.lineHeightHeading5,
            color: token.colorText,
          }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            type="secondary"
            style={{
              fontSize: token.fontSize,
              lineHeight: token.lineHeight,
            }}
          >
            {description}
          </Text>
        ) : null}
      </Flex>

      {extra ? (
        <div
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {extra}
        </div>
      ) : null}
    </Flex>
  );
};
