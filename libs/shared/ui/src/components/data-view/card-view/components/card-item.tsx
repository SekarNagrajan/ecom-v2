import { MoreOutlined, SyncOutlined } from '@ant-design/icons';
import { theme, Dropdown, Button, Flex, Typography, Checkbox } from 'antd';
import { useMemo } from 'react';

import type { DataViewItem } from '../../data-view-item';
import { useCardGestures } from '../hooks/use-card-gestures';
import type { CardItemProps } from '../types';
import { hasField, isRecord } from './card-item-utils';

const { Text, Title } = Typography;

/**
 * CardItem - Individual card logic and rendering.
 * Encapsulates gestures and selection state visuals.
 */
function CardItemComponent<TData extends DataViewItem>({
  item,
  id,
  columnDefs,
  isSelected,
  selectionMode,
  isSwiped,
  footerActions,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  onCardClick,
  renderCard,
}: CardItemProps<TData>) {
  const { token } = theme.useToken();
  const { gestureProps } = useCardGestures({
    id,
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onCardClick,
  });

  const getItemValue = (field: string): unknown =>
    isRecord(item) ? item[field] : undefined;

  const columnMap = useMemo(() => {
    const map = new Map<string, (typeof columnDefs)[number]>();
    columnDefs.forEach((col) => {
      if (hasField(col)) {
        map.set(col.field, col);
      }
    });
    return map;
  }, [columnDefs]);

  const renderCell = (field: string | undefined) => {
    if (!field) return '';
    const col = columnMap.get(field);
    const value = getItemValue(field);
    if (!col) return String(value ?? '');
    if (col.render) return col.render({ value, data: item });
    return String(value ?? '');
  };

  if (renderCard) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          touchAction: 'pan-y',
        }}
        {...gestureProps}
      >
        {renderCard(item, { isSelected, isSwiped, selectionMode })}
      </div>
    );
  }

  const primaryCol =
    columnDefs.find((c) => c.isPrimary && hasField(c)) ??
    columnDefs.find(hasField);
  const primaryField = primaryCol?.field;
  const secondaryField = columnDefs.find(
    (c) => c.isSecondary && hasField(c)
  )?.field;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: token.borderRadiusLG,
        touchAction: 'pan-y',
      }}
      {...gestureProps}
    >
      {/* Swipe Action Layer (Background) - Clickable when visible */}
      <div
        role="button"
        tabIndex={isSwiped ? 0 : -1}
        onClick={(e) => {
          if (!isSwiped) return;
          e.stopPropagation();
          // Find the secondary action (typically Delete) and execute it
          const deleteAction = footerActions.find((a) => a.isSecondary);
          if (deleteAction) {
            deleteAction.onClick(item);
          }
          // Reset swipe state after action
          onSwipeRight(id);
        }}
        onKeyDown={(e) => {
          if (!isSwiped) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const deleteAction = footerActions.find((a) => a.isSecondary);
            if (deleteAction) {
              deleteAction.onClick(item);
            }
            onSwipeRight(id);
          }
        }}
        style={{
          position: 'absolute',
          inset: 0,
          background: token.colorError,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingInline: token.paddingLG,
          color: 'white',
          opacity: isSwiped ? 1 : 0,
          transition: 'opacity 0.2s ease',
          cursor: isSwiped ? 'pointer' : 'default',
          pointerEvents: isSwiped ? 'auto' : 'none',
        }}
      >
        <Flex vertical align="center" gap={token.marginXXS}>
          <SyncOutlined style={{ fontSize: token.fontSizeHeading3 }} />
          <Text style={{ color: 'white', fontSize: token.fontSizeSM }}>
            Delete
          </Text>
        </Flex>
      </div>

      {/* Foreground Card Content */}
      <div
        className="app-modern-card"
        style={{
          background: isSelected
            ? token.colorFillAlter
            : token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          border: isSelected
            ? `2px solid ${token.colorPrimary}`
            : `1px solid ${token.colorBorderSecondary}`,
          boxShadow: isSelected
            ? '0 4px 12px rgba(0,0,0,0.08)'
            : '0 2px 8px rgba(0,0,0,0.04)',
          padding: token.padding,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 200,
          transform: isSwiped ? 'translateX(-80px)' : 'translateX(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          zIndex: 1,
          userSelect: 'none',
        }}
      >
        {/* Selection Checkbox */}
        {(selectionMode || isSelected) && (
          <div
            style={{
              position: 'absolute',
              top: token.paddingSM,
              right: token.paddingSM,
              zIndex: 2,
            }}
          >
            <Checkbox checked={isSelected} />
          </div>
        )}

        {/* Semantic Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: token.lineWidthBold,
            height: '40%',
            background: token.colorPrimary,
            borderRadius: `0 ${token.borderRadiusXS}px ${token.borderRadiusXS}px 0`,
            marginTop: token.padding,
          }}
        />

        <div style={{ marginBottom: token.marginMD }}>
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: token.fontSizeLG,
              lineHeight: 1.4,
              paddingRight: selectionMode ? token.paddingXL : 0,
            }}
          >
            {primaryField ? renderCell(primaryField) : 'No Title'}
          </Title>
          {secondaryField && (
            <Text type="secondary" style={{ fontSize: token.fontSize }}>
              {renderCell(secondaryField)}
            </Text>
          )}
        </div>

        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: `${token.marginSM}px ${token.marginXS}px`,
          }}
        >
          {columnDefs
            .filter(
              (c): c is typeof c & { field: string } =>
                hasField(c) &&
                !c.isPrimary &&
                !c.isSecondary &&
                c.field !== 'id'
            )
            .slice(0, 4)
            .map((col) => (
              <div key={col.field}>
                <div
                  style={{
                    fontSize: token.fontSizeSM,
                    color: token.colorTextDescription,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: token.marginXXS,
                  }}
                >
                  {col.headerName}
                </div>
                <div
                  style={{
                    fontSize: token.fontSize,
                    color: token.colorText,
                    fontWeight: 500,
                  }}
                >
                  {renderCell(col.field)}
                </div>
              </div>
            ))}
        </div>

        {/* Footer Actions - Always render to maintain height, hide when swiped/selection */}
        {footerActions.length > 0 && (
          <Flex
            gap="small"
            style={{
              marginTop: token.marginMD,
              paddingTop: token.paddingSM,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              // Hide content but maintain height when swiped or in selection mode
              visibility: isSwiped || selectionMode ? 'hidden' : 'visible',
              opacity: isSwiped || selectionMode ? 0 : 1,
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
            }}
          >
            {footerActions
              .filter((a) => !a.isSecondary)
              .slice(0, 2)
              .map((action) => (
                <Button
                  key={action.id}
                  size="small"
                  variant="filled"
                  color="default"
                  icon={action.icon}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                  style={{ flex: 1, borderRadius: token.borderRadiusSM }}
                >
                  {action.label}
                </Button>
              ))}
            {footerActions.some((a) => a.isSecondary) && (
              <Dropdown
                menu={{
                  items: footerActions
                    .filter((a) => a.isSecondary)
                    .map((a) => ({
                      key: a.id,
                      label: a.label,
                      icon: a.icon,
                      onClick: () => a.onClick(item),
                    })),
                }}
                trigger={['click']}
              >
                <Button
                  size="small"
                  type="text"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            )}
          </Flex>
        )}
      </div>
    </div>
  );
}

export const CardItem = CardItemComponent;
