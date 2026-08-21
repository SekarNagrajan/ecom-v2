import { useCallback } from 'react';

export function useMaxLimit({
  value,
  maxCount,
  onMaxReached,
}: {
  value: unknown;
  maxCount?: number;
  onMaxReached?: (current: number, max: number) => void;
}) {
  const count = Array.isArray(value) ? value.length : 0;

  const isMaxReached = typeof maxCount === 'number' && count >= maxCount;

  const enforce = useCallback(
    (nextIds: (string | number)[]) => {
      if (typeof maxCount !== 'number') return nextIds;

      if (nextIds.length > maxCount) {
        onMaxReached?.(count, maxCount);
        return nextIds.slice(0, maxCount);
      }

      return nextIds;
    },
    [maxCount, count, onMaxReached]
  );

  return { count, isMaxReached, enforce };
}
