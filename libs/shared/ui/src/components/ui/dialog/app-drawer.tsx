// Modified by Sekar Nagarajan (2026-08-25 15:05)
import { Drawer, theme } from 'antd';
import { useEffect } from 'react';

import { useAntdBreakpoint } from '../../../hooks';
import { DIALOG_SIZES, type DialogSize } from './constants';

const FULLSCREEN_DRAWER_VIEWPORT_RATIO = 0.9;

export interface AppDrawerProps
  extends Omit<
    React.ComponentProps<typeof Drawer>,
    'size' | 'height'
  > {
  dialogSize?: DialogSize;
  width?: string | number;
}

export function AppDrawer({
  dialogSize,
  width,
  children,
  closable,
  styles,
  ...props
}: AppDrawerProps) {
  const { isMobile } = useAntdBreakpoint();
  const { token } = theme.useToken();
  const isFullscreen = dialogSize === 'fullscreen';
  const placement = props.placement ?? (isMobile ? 'bottom' : 'right');
  const isVertical = placement === 'top' || placement === 'bottom';
  const usesCssDrivenSize = isFullscreen || (isMobile && isVertical);
  const resolvedClosable =
    closable === false
      ? false
      : {
        placement: 'end' as const,
        ...(typeof closable === 'object' ? closable : {}),
      };

  const baseSize =
    dialogSize === undefined
      ? isMobile
        ? DIALOG_SIZES.sm
        : undefined
      : typeof dialogSize === 'number'
        ? dialogSize
        : isFullscreen
          ? undefined
          : DIALOG_SIZES[dialogSize];

  const drawerWidth = width ?? (usesCssDrivenSize ? undefined : baseSize);

  useEffect(() => {
    if (!props.open || !isMobile || typeof navigator === 'undefined') {
      return;
    }

    const nav = navigator as Navigator & {
      virtualKeyboard?: {
        overlaysContent: boolean;
      };
    };

    const virtualKeyboard = nav.virtualKeyboard;

    if (!virtualKeyboard) {
      return;
    }

    const previousValue = virtualKeyboard.overlaysContent;
    virtualKeyboard.overlaysContent = true;

    return () => {
      virtualKeyboard.overlaysContent = previousValue;
    };
  }, [isMobile, props.open]);

  // Mobile uses a tighter body padding so feature content can claim
  // almost the full viewport width — matches the dashboard's mobile
  // spacing and keeps drawer-hosted forms (account / lead / opportunity
  // upsert, etc.) consistent across the app.
  const bodyPadding = isMobile ? token.paddingSM : token.padding;
  const mobileBodyPaddingBottom = isMobile
    ? `calc(${bodyPadding}px + env(safe-area-inset-bottom, 0px) + env(keyboard-inset-height, 0px))`
    : bodyPadding;
  const mobileFooterPaddingBottom = isMobile
    ? `calc(${token.padding}px + env(safe-area-inset-bottom, 0px) + env(keyboard-inset-height, 0px))`
    : undefined;
  const fullscreenVerticalSize = `${FULLSCREEN_DRAWER_VIEWPORT_RATIO * 100
    }svh`;
  const fullscreenHorizontalSize = `${FULLSCREEN_DRAWER_VIEWPORT_RATIO * 100
    }vw`;
  const wrapperStyles = usesCssDrivenSize
    ? isVertical
      ? {
        height: isFullscreen
          ? fullscreenVerticalSize
          : typeof baseSize !== 'number'
            ? '100svh'
            : `min(${baseSize}px, 100svh)`,
        maxHeight: isFullscreen
          ? fullscreenVerticalSize
          : typeof baseSize !== 'number'
            ? '100svh'
            : `min(${baseSize}px, 100svh)`,
      }
      : {
        width: isFullscreen
          ? fullscreenHorizontalSize
          : typeof baseSize !== 'number'
            ? '100vw'
            : `min(${baseSize}px, 100vw)`,
        maxWidth: isFullscreen
          ? fullscreenHorizontalSize
          : typeof baseSize !== 'number'
            ? '100vw'
            : `min(${baseSize}px, 100vw)`,
        height: '100svh',
        maxHeight: '100svh',
      }
    : undefined;

  const drawerStyles: AppDrawerProps['styles'] = {
    header: {
      ...(usesCssDrivenSize
        ? {
          flexShrink: 0,
        }
        : {}),
    },
    body: {
      padding: bodyPadding,
      paddingBottom: mobileBodyPaddingBottom,
      ...(usesCssDrivenSize
        ? {
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }
        : {}),
    },
    section: {
      ...(isMobile && isVertical
        ? placement === 'top'
          ? {
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }
          : {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }
        : {}),
      ...(usesCssDrivenSize
        ? {
          display: 'flex',
          flexDirection: 'column',
        }
        : {}),
    },
    footer: {
      ...(isMobile
        ? {
          paddingBottom: mobileFooterPaddingBottom,
        }
        : {}),
    },
    wrapper: {
      ...wrapperStyles,
    },
    ...styles,
  };

  return (
    <>
      <style>{`
        .ant-drawer-close {
          color: ${token.colorError} !important;
          transition: all 0.2s ease-in-out !important;
          border-radius: 50px !important;
          padding: 15px !important;
        }
        .ant-drawer-close:hover {
          color: ${token.colorErrorHover} !important;
          background-color: ${token.colorErrorBg} !important;
        }
      `}</style>
      <Drawer
        placement={placement}
        {...props}
        closable={resolvedClosable}
        size={drawerWidth}
        styles={drawerStyles}
      >
        {children}
      </Drawer>
    </>
  );
}
