import React, { createContext, useContext } from 'react';
import { App as AntdApp, message, Modal } from 'antd';

interface AppConfigContextType {
  appName: string;
}

const AppConfigContext = createContext<AppConfigContextType>({ appName: 'E-Com Portal' });

export const AppConfigProvider: React.FC<{ children: React.ReactNode; appName?: string }> = ({
  children,
  appName = 'Solverminds E-Commerce Portal',
}) => {
  return (
    <AppConfigContext.Provider value={{ appName }}>
      <AntdApp>{children}</AntdApp>
    </AppConfigContext.Provider>
  );
};

export function useToast() {
  const { message: msgApi } = AntdApp.useApp();
  return {
    success: (msg: string) => msgApi.success(msg),
    error: (msg: string) => msgApi.error(msg),
    warning: (msg: string) => msgApi.warning(msg),
    info: (msg: string) => msgApi.info(msg),
  };
}

export function useConfirm() {
  const { modal: modalApi } = AntdApp.useApp();
  return {
    confirm: (options: { title: string; content?: React.ReactNode; onOk: () => void | Promise<void> }) => {
      modalApi.confirm({
        title: options.title,
        content: options.content,
        onOk: options.onOk,
        okText: 'Confirm',
        cancelText: 'Cancel',
      });
    },
  };
}
