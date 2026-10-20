// Modified by Sekar Nagarajan (2026-09-28 16:17)
import { App, type NotificationArgsProps } from 'antd';
import { useCallback, useContext, useMemo, type ReactNode } from 'react';

import { resolveToastDuration } from '../providers/accessibility-utils';
import { AppConfigContext } from '../providers/app-config-context';
import type { ToastNotificationType } from '../providers/types';
import { useAntdBreakpoint } from './use-antd-breakpoint';

type ToastType = ToastNotificationType;

interface ToastOptions
  extends Omit<NotificationArgsProps, 'title' | 'message' | 'type'> {
  title?: ReactNode;
}

export const useToast = () => {
  const { notification } = App.useApp();
  const { isMobile } = useAntdBreakpoint();
  const appConfig = useContext(AppConfigContext);

  const showToast = useCallback(
    (type: ToastType, message: ReactNode, options?: ToastOptions) => {
      const { title, ...rest } = options || {};
      const duration =
        rest.duration !== undefined
          ? rest.duration
          : resolveToastDuration(type, appConfig?.notifications);

      notification[type]({
        title: title || type.charAt(0).toUpperCase() + type.slice(1),
        description: message,
        placement: isMobile ? 'top' : 'topRight',
        closable: true,
        ...rest,
        duration,
      });
    },
    [notification, isMobile, appConfig?.notifications]
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
