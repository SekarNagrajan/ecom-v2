import { createContext, useContext, type ReactNode } from 'react';
import { useThemePreferencesController } from '../hooks/use-theme-preferences-controller';

type ThemePreferencesValue = ReturnType<typeof useThemePreferencesController>;

const ThemePreferencesContext = createContext<ThemePreferencesValue | null>(null);

interface ThemePreferencesProviderProps {
  children: ReactNode;
}

export function ThemePreferencesProvider({ children }: ThemePreferencesProviderProps) {
  const controller = useThemePreferencesController();

  return (
    <ThemePreferencesContext.Provider value={controller}>
      {children}
    </ThemePreferencesContext.Provider>
  );
}

export function useThemePreferences(): ThemePreferencesValue {
  const value = useContext(ThemePreferencesContext);
  if (!value) {
    throw new Error('useThemePreferences must be used inside <ThemePreferencesProvider>.');
  }
  return value;
}
