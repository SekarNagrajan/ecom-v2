import { useDroppable } from '@dnd-kit/core';
import { theme } from 'antd';
import type { ReactNode, CSSProperties } from 'react';

export interface KanbanDropZoneProps {
  /** Unique identifier for this drop zone (lane ID) */
  id: string;
  /** Whether the drop zone is disabled (e.g., when collapsed) */
  disabled?: boolean;
  /** Children to render inside the drop zone */
  children: ReactNode;
  /** Additional style for the container */
  style?: CSSProperties;
  /** Data lane ID attribute */
  dataLaneId?: string;
}

/**
 * KanbanDropZone - Isolated droppable wrapper component
 *
 * This component isolates the useDroppable hook to prevent cascading re-renders.
 * When isOver changes during drag, only this thin wrapper re-renders.
 * The children (CardList with 500+ cards) remain stable.
 *
 * Performance characteristics:
 * - Only re-renders when isOver state changes
 * - Children don't re-render (stable props via closure)
 * - Minimal DOM: single div wrapper with transition styles
 */
export function KanbanDropZone({
  id,
  disabled = false,
  children,
  style,
  dataLaneId,
}: KanbanDropZoneProps) {
  const { token } = theme.useToken();

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      laneId: id,
    },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      data-lane-id={dataLaneId ?? id}
      data-collapsed={disabled ? 'true' : undefined}
      style={{
        ...style,
        // Override CSS variables for drop highlight (only when not disabled)
        // @ts-expect-error CSS custom properties
        '--column-bg':
          isOver && !disabled ? token.colorFillAlter : token.colorBgContainer,
        '--column-border':
          isOver && !disabled ? token.colorPrimary : token.colorBorderSecondary,
      }}
    >
      {children}
    </div>
  );
}
