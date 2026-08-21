export const DIALOG_SIZES = {
  xs: 400,
  sm: 600,
  md: 800,
  lg: 1000,
  xl: 1200,
} as const;

export type DialogSize = keyof typeof DIALOG_SIZES | 'fullscreen' | number;

export const FULLSCREEN_STYLE = {
  top: 0,
  width: '100vw',
  maxWidth: '100vw',
  height: '100vh',
  margin: 0,
  padding: 0,
} as const;

export const FULLSCREEN_MODAL_RENDER_STYLE = {
  height: '100vh',
  width: '100vw',
  position: 'fixed' as const,
  top: 0,
  left: 0,
  margin: 0,
};
