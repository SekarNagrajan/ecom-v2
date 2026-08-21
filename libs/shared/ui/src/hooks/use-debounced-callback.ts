import { useEffect, useRef, useCallback } from 'react';

/**
 * Creates a debounced function that delays invoking `callback` until after `delay` milliseconds.
 * Returns a stable function reference that doesn't change between renders.
 *
 * @param callback The function to debounce
 * @param delay The delay in milliseconds (default: 300)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay = 300
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const callbackRef = useRef(callback);
  const delayRef = useRef(delay);

  // Keep the callback ref up to date so we don't need it in the dependency array
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Keep the delay ref up to date
  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return a stable function that doesn't trigger ref access during render
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delayRef.current);
  }, []);
}
