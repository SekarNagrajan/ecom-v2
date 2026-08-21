import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import { Modal, theme, Flex, type ModalProps } from 'antd';
import { type ModalStylesType } from 'antd/es/modal/interface';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

import { AppButton } from '../button';
import {
  DIALOG_SIZES,
  FULLSCREEN_MODAL_RENDER_STYLE,
  FULLSCREEN_STYLE,
  type DialogSize,
} from './constants';

interface AppModalProps extends Omit<ModalProps, 'width'> {
  dialogSize?: DialogSize;
  showFullscreenIcon?: boolean;
}

export function AppModal({
  dialogSize,
  showFullscreenIcon = false,
  children,
  onCancel,
  title,
  ...props
}: AppModalProps) {
  const { token } = theme.useToken();
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCSSFullscreen = dialogSize === 'fullscreen';

  // Sync state if user exits fullscreen via ESC key or other methods
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleBrowserFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (!containerRef.current) return;

      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          );
        });
      } else {
        document.exitFullscreen();
      }
    },
    [containerRef]
  );

  const width = useMemo(() => {
    if (isCSSFullscreen || isBrowserFullscreen) return '100vw';

    if (typeof dialogSize === 'number') {
      return dialogSize;
    }

    return dialogSize ? DIALOG_SIZES[dialogSize] : undefined;
  }, [isCSSFullscreen, isBrowserFullscreen, dialogSize]);

  const modalStyle = useMemo(() => {
    return isCSSFullscreen || isBrowserFullscreen
      ? FULLSCREEN_STYLE
      : props.style;
  }, [isCSSFullscreen, isBrowserFullscreen, props.style]);

  const modalStyles: ModalStylesType | undefined = useMemo(() => {
    if (!isCSSFullscreen && !isBrowserFullscreen) return props.styles;

    const baseStyles =
      typeof props.styles === 'function'
        ? props.styles({ props })
        : props.styles || {};

    return {
      ...baseStyles,
      // Target the body to fill all available vertical space
      container: {
        height: '100%',
        ...baseStyles.container,
      },

      body: {
        flex: 1,
        overflow: 'auto',
        ...(baseStyles.body || {}),
      },
      footer: {
        marginTop: 'auto',
        ...(baseStyles.footer || {}),
      },
    };
  }, [isCSSFullscreen, isBrowserFullscreen, props]);

  const mergedTitle = useMemo(() => {
    if (!showFullscreenIcon) return title;

    return (
      <Flex
        align="center"
        justify="space-between"
        style={{ width: '100%', paddingRight: token.paddingLG }}
      >
        <div style={{ flex: 1 }}>{title}</div>
        <AppButton
          size="small"
          type="text"
          icon={
            isBrowserFullscreen ? (
              <FullscreenExitOutlined style={{ fontSize: 16 }} />
            ) : (
              <FullscreenOutlined style={{ fontSize: 16 }} />
            )
          }
          onClick={toggleBrowserFullscreen}
        />
      </Flex>
    );
  }, [
    showFullscreenIcon,
    title,
    token.paddingLG,
    isBrowserFullscreen,
    toggleBrowserFullscreen,
  ]);

  const modalRender = useCallback(
    (modal: React.ReactNode) => {
      const content =
        isCSSFullscreen || isBrowserFullscreen ? (
          <div style={FULLSCREEN_MODAL_RENDER_STYLE}>{modal}</div>
        ) : (
          modal
        );

      return (
        <div
          ref={containerRef}
          style={{
            height: isBrowserFullscreen ? '100dvh' : 'auto',
            background: isBrowserFullscreen
              ? token.colorBgContainer
              : 'transparent',
            overflow: isBrowserFullscreen ? 'auto' : 'visible',
          }}
        >
          {content}
        </div>
      );
    },
    [isCSSFullscreen, isBrowserFullscreen, token.colorBgContainer]
  );

  const cancelButtonProps: AppModalProps['cancelButtonProps'] = {
    danger: true,
    ...props.cancelButtonProps,
  };

  return (
    <Modal
      {...props}
      title={mergedTitle}
      onCancel={onCancel}
      centered={!(isCSSFullscreen || isBrowserFullscreen)}
      width={width}
      style={modalStyle}
      cancelButtonProps={cancelButtonProps}
      styles={modalStyles}
      modalRender={modalRender}
    >
      {children}
    </Modal>
  );
}
