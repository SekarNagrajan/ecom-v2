import { createContext } from 'react';

import type { AppConfigContextValue } from './types';

export const AppConfigContext = createContext<AppConfigContextValue | null>(
  null
);
