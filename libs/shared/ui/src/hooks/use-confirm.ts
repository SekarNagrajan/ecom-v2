import { App, type ModalFuncProps } from 'antd';
import { useCallback, useMemo } from 'react';

export type ConfirmVariant =
  | 'confirm'
  | 'success'
  | 'error'
  | 'info'
  | 'warning';

export interface ConfirmOptions extends ModalFuncProps {
  title: React.ReactNode;
  content?: React.ReactNode;
}

export const useConfirm = () => {
  const { modal } = App.useApp();

  const showConfirm = useCallback(
    (variant: ConfirmVariant, options: ConfirmOptions) => {
      const {
        centered = true,
        okText = 'OK',
        cancelText = 'Cancel',
        ...rest
      } = options;

      // AntD Modal methods match these variant names
      return modal[variant]({
        centered,
        okText,
        cancelText,
        ...rest,
      });
    },
    [modal]
  );

  return useMemo(
    () => ({
      show: (options: ConfirmOptions) => showConfirm('confirm', options),
      success: (options: ConfirmOptions) => showConfirm('success', options),
      error: (options: ConfirmOptions) => showConfirm('error', options),
      info: (options: ConfirmOptions) => showConfirm('info', options),
      warning: (options: ConfirmOptions) => showConfirm('warning', options),
      // Helper for destructive actions
      danger: (options: ConfirmOptions) =>
        showConfirm('confirm', {
          okButtonProps: { danger: true, ...options.okButtonProps },
          ...options,
        }),
    }),
    [showConfirm]
  );
};
