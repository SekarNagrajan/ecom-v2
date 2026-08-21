import { Card, theme, Typography, Space } from 'antd';
import type { ReactNode } from 'react';

import type { DataViewItem } from '../../data-view-item';
import type { CardContentProps } from './kanban-card-types';

const { Text } = Typography;

/**
 * CardContent - Visual representation of a kanban card
 *
 * Pure presentational component that renders card content based on layout config.
 * Memoized to prevent unnecessary re-renders.
 *
 * @example
 * ```tsx
 * <CardContent
 *   item={data}
 *   columnDefs={columns}
 *   layoutConfig={config}
 *   isDragging={false}
 * />
 * ```
 */
export function CardContent<TData extends DataViewItem>({
  item,
  columnDefs,
  layoutConfig,
  isOverlay = false,
  isDragging = false,
}: CardContentProps<TData>) {
  const { token } = theme.useToken();

  const renderCell = (field: string, value: unknown): ReactNode => {
    const col = columnDefs.find((c) => c.field === field);
    if (col?.render) {
      return col.render({ value, data: item });
    }
    return String(value ?? '');
  };

  const { primaryField, secondaryField, additionalFields } = layoutConfig;

  if (!primaryField) return null;

  return (
    <Card
      size="small"
      hoverable={!isDragging}
      style={{
        borderRadius: token.borderRadiusSM,
        border: isOverlay
          ? `2px solid ${token.colorPrimary}`
          : `1px solid ${token.colorBorderSecondary}`,
        boxShadow: isOverlay ? token.boxShadowSecondary : undefined,
        userSelect: isDragging ? 'none' : 'auto',
        opacity: isDragging && !isOverlay ? 0.5 : 1,
        // Remove any default margins from Card component
        margin: 0,
      }}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="small">
        <Text
          strong
          style={{
            display: 'block',
            fontSize: token.fontSize,
            lineHeight: token.lineHeight,
          }}
        >
          {renderCell(primaryField, item[primaryField as keyof TData])}
        </Text>

        {secondaryField && (
          <Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              lineHeight: token.lineHeightSM,
            }}
          >
            {renderCell(secondaryField, item[secondaryField as keyof TData])}
          </Text>
        )}

        {additionalFields.length > 0 && (
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: token.marginXXS }}
          >
            {additionalFields.map((field) => (
              <div
                key={field}
                style={{
                  fontSize: token.fontSizeSM,
                  color: token.colorTextDescription,
                  lineHeight: token.lineHeightSM,
                }}
              >
                {renderCell(field, item[field as keyof TData])}
              </div>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
}
