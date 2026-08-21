import { useEffect, useState } from 'react';

type AppThemeModes = 'light' | 'dark';

// Helper to get system theme
export const useSystemTheme = (): AppThemeModes => {
  // 1. Initialize State (Lazy initializer handles the SSR check safely)
  const [theme, setTheme] = useState<AppThemeModes>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light'; // Fallback for SSR
  });

  // 2. Effect to listen for changes
  useEffect(() => {
    // Safety check inside the effect
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? 'dark' : 'light');

    // Modern browsers
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  return theme;
};
