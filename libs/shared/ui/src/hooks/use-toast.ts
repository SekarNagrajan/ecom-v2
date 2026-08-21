import { App, type NotificationArgsProps } from 'antd';
import { useCallback, useMemo, type ReactNode } from 'react';

import { useAntdBreakpoint } from './use-antd-breakpoint';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions
  extends Omit<NotificationArgsProps, 'title' | 'message' | 'type'> {
  title?: ReactNode;
}

export const useToast = () => {
  const { notification } = App.useApp();
  const { isMobile } = useAntdBreakpoint();

  const showToast = useCallback(
    (type: ToastType, message: ReactNode, options?: ToastOptions) => {
      const { title, ...rest } = options || {};

      notification[type]({
        title: title || type.charAt(0).toUpperCase() + type.slice(1),
        description: message,
        placement: isMobile ? 'top' : 'topRight',
        duration: 3,
        closable: true,
        ...rest,
      });
    },
    [notification, isMobile]
  );

  return useMemo(
    () => ({
      success: (message: ReactNode, options?: ToastOptions) =>
        showToast('success', message, options),
      error: (message: ReactNode, options?: ToastOptions) =>
        showToast('error', message, options),
      info: (message: ReactNode, options?: ToastOptions) =>
        showToast('info', message, options),
      warning: (message: ReactNode, options?: ToastOptions) =>
        showToast('warning', message, options),
    }),
    [showToast]
  );
};
