import { message } from 'antd';
import { useCallback } from 'react';

export function useMaxLimit({
  value,
  maxCount,
}: {
  value: unknown;
  maxCount?: number;
}) {
  const count = Array.isArray(value) ? value.length : 0;
  const isMaxReached = typeof maxCount === 'number' && count >= maxCount;

  const validateNext = useCallback(
    (nextCount: number) => {
      if (typeof maxCount === 'number' && nextCount > maxCount) {
        message.warning(`Maximum ${maxCount} items can be selected.`);
        return false;
      }
      return true;
    },
    [maxCount]
  );

  return { count, isMaxReached, validateNext };
}
