import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

interface UseViewportSizeOptions {
  /** Debounce delay in milliseconds (default: 150ms) */
  delay?: number;
  /** Whether to track viewport size (default: true) */
  enabled?: boolean;
  /** Which browser viewport to track. Use `layout` for stable drawer sizing. */
  mode?: 'layout' | 'visual';
}

const getViewportSize = (
  mode: UseViewportSizeOptions['mode'] = 'layout'
): ViewportSize => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  const visualViewport = window.visualViewport;

  if (mode === 'visual' && visualViewport) {
    return {
      width: Math.round(visualViewport.width),
      height: Math.round(visualViewport.height),
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Hook to track viewport dimensions with debouncing
 * @param options - Configuration options
 * @param options.delay - Debounce delay in milliseconds (default: 150ms)
 * @param options.enabled - Whether to track viewport size (default: true)
 */
export function useViewportSize(
  options: UseViewportSizeOptions = {}
): ViewportSize {
  const { delay = 100, enabled = true, mode = 'layout' } = options;

  const [viewportSize, setViewportSize] = useState<ViewportSize>(() =>
    getViewportSize(mode)
  );

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const visualViewport = window.visualViewport;

    const handleResize = () => {
      // Clear previous timeout
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      // Set new timeout to debounce updates
      timeoutId = setTimeout(() => {
        setViewportSize(getViewportSize(mode));
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    visualViewport?.addEventListener('resize', handleResize);
    visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
      visualViewport?.removeEventListener('resize', handleResize);
      visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, [delay, enabled, mode]);

  return viewportSize;
}
