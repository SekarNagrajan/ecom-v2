import type { CSSProperties, ReactNode } from 'react';

export type AppEmptyStateVariant = 'filtered' | 'blank' | 'error';

export type AppEmptyStateArtSize = 'sm' | 'md';

export type AppEmptyStateAction = {
  key: string;
  label: ReactNode;
  onClick: () => void;
  type?: 'primary' | 'default';
  icon?: ReactNode;
};

export type AppEmptyStateProps = {
  /** Visual / semantic tone. Defaults to `filtered`. */
  variant?: AppEmptyStateVariant;
  title: ReactNode;
  message?: ReactNode;
  actions?: AppEmptyStateAction[];
  /** `md` ~220px (listings), `sm` ~150px (panels / drawers). */
  artSize?: AppEmptyStateArtSize;
  /** Hide the ship illustration (tight slots under ~120px). */
  hideArt?: boolean;
  className?: string;
  style?: CSSProperties;
};
