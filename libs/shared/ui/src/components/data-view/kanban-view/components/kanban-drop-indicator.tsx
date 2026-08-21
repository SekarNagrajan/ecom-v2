import { useDndMonitor, type DragMoveEvent } from '@dnd-kit/core';
import { theme } from 'antd';
import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

import { usePopupContainer } from '../../../../hooks';

/**
 * Drop position information
 */
export interface DropPosition {
  /** Target lane ID */
  laneId: string;
  /** Index where the card will be inserted */
  index: number;
  /** Y position relative to viewport (for indicator) */
  y: number;
  /** X position relative to viewport */
  x: number;
  /** Width of the indicator line */
  width: number;
}

// Global ref to share drop position with drag provider
// This avoids prop drilling and context re-renders
let globalDropPosition: DropPosition | null = null;

/**
 * Get the current drop position (used by drag provider on drop)
 */
export function getDropPosition(): DropPosition | null {
  return globalDropPosition;
}

/**
 * Calculate drop position based on cursor Y within a column
 * Finds the card closest to the cursor and determines if dropping above or below it
 */
function calculateDropPosition(
  laneId: string,
  cursorY: number,
  columnElement: Element
): DropPosition | null {
  const rect = columnElement.getBoundingClientRect();

  // Find the scroll container within the column
  const scrollContainer = columnElement.querySelector(
    '.kanban-column-scroll-container'
  );
  if (!scrollContainer) {
    // Empty column - drop at top
    return {
      laneId,
      index: 0,
      y: rect.top + 60, // Account for header
      x: rect.left + 12,
      width: rect.width - 24,
    };
  }

  // Find all card elements in the column
  const cardElements = scrollContainer.querySelectorAll('[data-index]');

  if (cardElements.length === 0) {
    // Empty lane - drop at beginning
    const scrollRect = scrollContainer.getBoundingClientRect();
    return {
      laneId,
      index: 0,
      y: scrollRect.top + 8,
      x: rect.left + 12,
      width: rect.width - 24,
    };
  }

  // Find the card closest to cursor
  let closestIndex = 0;
  let closestDistance = Infinity;
  let insertY = rect.top + 60;

  cardElements.forEach((cardEl) => {
    const cardRect = cardEl.getBoundingClientRect();
    const cardMiddle = cardRect.top + cardRect.height / 2;
    const distance = Math.abs(cursorY - cardMiddle);

    const index = parseInt(cardEl.getAttribute('data-index') || '0', 10);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;

      // Determine if inserting above or below this card
      if (cursorY < cardMiddle) {
        // Insert above this card
        insertY = cardRect.top;
      } else {
        // Insert below this card
        insertY = cardRect.bottom;
        closestIndex = index + 1;
      }
    }
  });

  return {
    laneId,
    index: closestIndex,
    y: insertY,
    x: rect.left + 12,
    width: rect.width - 24,
  };
}

/**
 * KanbanDropIndicator - Visual indicator for drop position
 *
 * Uses dnd-kit's built-in collision detection to determine the active drop target.
 * This is more reliable than manual cursor position calculation.
 *
 * Performance:
 * - Only this component re-renders during drag
 * - Uses RAF to throttle position calculations
 * - Shares position via global ref (no context re-renders)
 */
export function KanbanDropIndicator() {
  const getPopupContainer = usePopupContainer();
  const { token } = theme.useToken();
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isDraggingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastLaneIdRef = useRef<string | null>(null);

  const updatePosition = useCallback((cursorY: number, laneId: string) => {
    // Find the column element
    const columnElement = document.querySelector(`[data-lane-id="${laneId}"]`);
    if (!columnElement) {
      globalDropPosition = null;
      setDropPosition(null);
      return;
    }

    const position = calculateDropPosition(laneId, cursorY, columnElement);
    globalDropPosition = position;
    setDropPosition(position);
  }, []);

  useDndMonitor({
    onDragStart: () => {
      isDraggingRef.current = true;
      setIsVisible(true);
      lastLaneIdRef.current = null;
    },
    onDragMove: (event: DragMoveEvent) => {
      if (!isDraggingRef.current) return;

      // Throttle with RAF
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        // Use dnd-kit's built-in collision detection via event.over
        // This is more reliable than manual cursor position calculation
        const { over, activatorEvent } = event;

        if (!over || !activatorEvent || !('clientY' in activatorEvent)) {
          // No valid drop target - clear indicator
          globalDropPosition = null;
          setDropPosition(null);
          return;
        }

        // Get the lane ID from the drop target (over.id should be the lane/column ID)
        const targetLaneId = String(over.id);
        const cursorY = (activatorEvent as MouseEvent).clientY;

        // Skip if same lane (no need to update indicator for same-column moves)
        if (targetLaneId === lastLaneIdRef.current) {
          return;
        }

        lastLaneIdRef.current = targetLaneId;
        updatePosition(cursorY, targetLaneId);
      });
    },
    onDragEnd: () => {
      isDraggingRef.current = false;
      setIsVisible(false);
      cancelAnimationFrame(rafRef.current);
      lastLaneIdRef.current = null;
      // Keep globalDropPosition for the drop handler to read
      setTimeout(() => {
        globalDropPosition = null;
        setDropPosition(null);
      }, 0);
    },
    onDragCancel: () => {
      isDraggingRef.current = false;
      setIsVisible(false);
      globalDropPosition = null;
      setDropPosition(null);
      cancelAnimationFrame(rafRef.current);
      lastLaneIdRef.current = null;
    },
  });

  if (!isVisible || !dropPosition) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: dropPosition.y,
        left: dropPosition.x,
        width: dropPosition.width,
        height: 3,
        backgroundColor: token.colorPrimary,
        borderRadius: 2,
        pointerEvents: 'none',
        zIndex: 9999,
        boxShadow: `0 0 8px ${token.colorPrimary}`,
      }}
    />,
    getPopupContainer()
  );
}
