import { useRef, useCallback, type TouchEvent, type MouseEvent } from 'react';

interface UseCardGesturesOptions {
  id: string;
  onLongPress: (id: string) => void;
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
  onCardClick: (id: string) => void;
}

/**
 * useCardGestures - Reusable and performant gesture handler for cards
 * Handles Long-press, Swipe, and standard Click with race-condition protection.
 */
export function useCardGestures({
  id,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  onCardClick,
}: UseCardGesturesOptions) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const isMouseDown = useRef(false);
  const ignoreNextClick = useRef(false);
  const lastLongPressTime = useRef<number>(0);

  const start = useCallback(
    (x: number, y: number) => {
      touchStartPos.current = { x, y, time: Date.now() };
      ignoreNextClick.current = false;

      longPressTimer.current = setTimeout(() => {
        onLongPress(id);
        lastLongPressTime.current = Date.now();
        ignoreNextClick.current = true;
      }, 600);
    },
    [id, onLongPress]
  );

  const move = useCallback(
    (x: number, y: number) => {
      if (!touchStartPos.current) return;
      const diffX = x - touchStartPos.current.x;
      const diffY = y - touchStartPos.current.y;

      // Movement threshold to cancel long press
      if (Math.abs(diffX) > 15 || Math.abs(diffY) > 15) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }

      // Horizontal swipe detection
      if (Math.abs(diffY) < 40) {
        if (diffX < -60) onSwipeLeft(id);
        if (diffX > 60) onSwipeRight(id);
      }
    },
    [id, onSwipeLeft, onSwipeRight]
  );

  const end = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
    isMouseDown.current = false;
  }, []);

  // Event Handlers memoized with useCallback
  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        start(touch.clientX, touch.clientY);
      }
    },
    [start]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        move(touch.clientX, touch.clientY);
      }
    },
    [move]
  );

  const onTouchEnd = end;

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      isMouseDown.current = true;
      start(e.clientX, e.clientY);
    },
    [start]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isMouseDown.current) move(e.clientX, e.clientY);
    },
    [move]
  );

  const onMouseUp = end;
  const onMouseLeave = end;

  const onClick = useCallback(
    (e: MouseEvent) => {
      // Prevent standard click if it immediately follows a long press
      if (
        ignoreNextClick.current ||
        Date.now() - lastLongPressTime.current < 300
      ) {
        ignoreNextClick.current = false;
        return;
      }
      onCardClick(id);
    },
    [id, onCardClick]
  );

  return {
    gestureProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onClick,
    },
  };
}
