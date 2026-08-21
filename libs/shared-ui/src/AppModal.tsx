import React from 'react';
import { Modal, ModalProps, Drawer, DrawerProps } from 'antd';

export const AppModal: React.FC<ModalProps> = ({ children, ...props }) => {
  return <Modal {...props}>{children}</Modal>;
};

export const AppDrawer: React.FC<DrawerProps> = ({ children, ...props }) => {
  return <Drawer {...props}>{children}</Drawer>;
};
