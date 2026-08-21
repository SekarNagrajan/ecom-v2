import {
  VerticalLeftOutlined,
  VerticalRightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Card, Typography, theme, Badge, Spin } from 'antd';
import { useRef, useState, useEffect, type CSSProperties } from 'react';

import { AppButton } from '../../../ui/button';
import type { DataViewItem } from '../../data-view-item';
import type { KanbanColumnProps } from '../types';
import { CardList } from './kanban-card-list';
import { KanbanDropZone } from './kanban-drop-zone';

const { Title, Text } = Typography;

/**
 * KanbanColumn
 *
 * Performance optimized column component.
 * Uses KanbanDropZone for isolated droppable handling - when isOver changes,
 * only the thin DropZone wrapper re-renders, not the entire column with 500+ cards.
 */
export function KanbanColumn<TData extends DataViewItem>({
  id,
  title,
  items,
  columnDefs,
  idField,
  color,
  limit,
  onLoadMore,
  hasMore,
  loadingMore,
  fetchMode = 'auto',
  collapsible,
  layoutConfig,
  renderCard,
  cardGap,
  estimatedCardHeight,
  columnWidth,
}: KanbanColumnProps<TData>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { token } = theme.useToken();
  const scrollParentRef = useRef<HTMLDivElement>(null);

  // Handle collapse/expand with transition state to prevent glitches
  const toggleCollapse = () => {
    setIsTransitioning(true);
    setIsCollapsed(!isCollapsed);
  };

  // Clear transitioning state after animation completes (300ms)
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isTransitioning]);

  const columnStyle: CSSProperties = {
    height: '100%',
    transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
    width: isCollapsed ? 48 : columnWidth ?? 300,
    flexShrink: 0,
  };

  const cardStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'var(--column-bg)',
    borderColor: 'var(--column-border)',
    transition: 'background-color 0.2s, border-color 0.2s',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  if (isCollapsed) {
    return (
      <KanbanDropZone id={id} disabled style={columnStyle}>
        <Card
          style={cardStyle}
          styles={{
            body: {
              padding: `${token.paddingSM}px 0`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            },
          }}
        >
          {/* Expand button at top */}
          <AppButton
            type="text"
            size="small"
            icon={<VerticalRightOutlined />}
            onClick={toggleCollapse}
            style={{ marginBottom: token.marginXS }}
          />

          {/* Vertical title in the middle */}
          <div
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: `${token.paddingXS}px 0`,
              overflow: 'hidden',
            }}
          >
            <Text
              strong
              style={{
                fontSize: token.fontSize,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Text>
          </div>

          {/* Count badge at bottom - horizontal for readability */}
          <Badge
            count={items.length}
            overflowCount={999}
            style={{
              backgroundColor:
                limit && items.length > limit
                  ? token.colorError
                  : token.colorFillContent,
              color:
                limit && items.length > limit
                  ? token.colorWhite
                  : token.colorTextSecondary,
              marginBottom: token.marginXS,
            }}
          />
        </Card>
      </KanbanDropZone>
    );
  }

  return (
    <KanbanDropZone id={id} style={columnStyle}>
      <Card
        style={cardStyle}
        styles={{
          body: {
            padding: token.paddingSM,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: token.marginSM,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: token.marginXS,
              minWidth: 0,
              flex: 1,
            }}
          >
            {color && (
              <div
                style={{
                  width: token.marginXS,
                  height: token.marginXS,
                  borderRadius: '50%',
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
            )}
            <Title
              level={5}
              style={{
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Title>
            <Badge
              count={items.length}
              overflowCount={999}
              style={{
                backgroundColor:
                  limit && items.length > limit
                    ? token.colorError
                    : token.colorFillContent,
                color:
                  limit && items.length > limit
                    ? token.colorWhite
                    : token.colorTextSecondary,
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {collapsible && (
              <AppButton
                type="text"
                size="small"
                icon={<VerticalLeftOutlined />}
                onClick={toggleCollapse}
              />
            )}
          </div>
        </div>

        {/* Scrollable Card List Container */}
        <div
          ref={scrollParentRef}
          className="kanban-column-scroll-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 100,
            paddingRight: token.paddingXXS,
            scrollbarWidth: 'thin',
            // Hide content during transition to prevent glitches
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 0.15s ease-in-out',
          }}
        >
          {!isTransitioning && (
            <>
              <CardList
                items={items}
                columnDefs={columnDefs}
                idField={idField}
                parentRef={scrollParentRef}
                onLoadMore={onLoadMore}
                laneId={id}
                hasMore={hasMore}
                loadingMore={loadingMore}
                fetchMode={fetchMode}
                layoutConfig={layoutConfig}
                renderCard={renderCard}
                cardGap={cardGap}
                estimatedCardHeight={estimatedCardHeight}
              />

              {hasMore && fetchMode === 'manual' && !loadingMore && (
                <div
                  style={{
                    padding: token.paddingXS,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <AppButton
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => onLoadMore?.(id)}
                  >
                    Load More
                  </AppButton>
                </div>
              )}

              {loadingMore && (
                <div
                  style={{
                    padding: token.paddingXS,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Spin size="small" />
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </KanbanDropZone>
  );
}
