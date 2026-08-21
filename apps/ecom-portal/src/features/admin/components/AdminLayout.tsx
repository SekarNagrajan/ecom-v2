// Modified by Sekar Nagarajan (2026-08-21 15:16)
import React from 'react';
import { Layout, Typography, Badge, Space, theme } from 'antd';
import {
  SettingOutlined,
  UnorderedListOutlined,
  KeyOutlined,
  MailOutlined,
  LockOutlined,
  FormOutlined,
  StopOutlined,
  PictureOutlined,
  NotificationOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTenantStore } from '@solverminds/auth';
import { useToast } from '@solverminds/shared-ui/hooks';
import { useAdminController } from '../hooks/use-admin-controller';
import { MenuManagementView } from './MenuManagementView';
import { SpecialPrivilegesView } from './SpecialPrivilegesView';
import { EmailTemplateEditorView } from './EmailTemplateEditorView';
import { AdminPasswordResetView } from './AdminPasswordResetView';
import { GlobalConfigAdminView } from './GlobalConfigAdminView';
import { FieldConfigView } from './FieldConfigView';
import { ServiceRestrictionsView } from './ServiceRestrictionsView';
import { BannerManagerView } from './BannerManagerView';
import { CustomerAdvisoryView } from './CustomerAdvisoryView';
import { CutoffConfigView } from './CutoffConfigView';
import type {
  MenuConfig,
  SpecialPrivilege,
  EmailTemplate,
  GlobalConfig,
  FieldConfig,
  ServiceRestriction,
  CutoffConfig,
} from '../types/admin.types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

import { AppTabs } from '@solverminds/shared-ui';

export function AdminLayout() {
  const { token } = theme.useToken();
  const activeTenant = useTenantStore((state) => state.activeTenant);
  const toast = useToast();
  const controller = useAdminController();

  const handleSaveMenu = async (menus: MenuConfig[]) => {
    await controller.updateMenuConfigs(menus);
    toast.success('Global Menu Configuration Updated Successfully');
  };

  const handleSavePrivileges = async (privs: SpecialPrivilege[]) => {
    await controller.updateSpecialPrivileges(privs);
    toast.success('Special Privileges Matrix Saved');
  };

  const handleSaveEmailTemplate = async (id: string, data: Partial<EmailTemplate>) => {
    await controller.updateEmailTemplate({ id, data });
    toast.success('Email Template Updated');
  };

  const handleSaveGlobalConfig = async (config: GlobalConfig) => {
    await controller.updateGlobalConfig(config);
    toast.success('Global System Configuration Saved');
  };

  const handleSaveFieldConfig = async (fields: FieldConfig[]) => {
    await controller.updateFieldConfigs(fields);
    toast.success('Form Field Configuration Saved');
  };

  const handleSaveServiceRestrictions = async (items: ServiceRestriction[]) => {
    await controller.updateServiceRestrictions(items);
    toast.success('Service Restrictions Updated');
  };

  const handleSaveCutoffConfig = async (items: CutoffConfig[]) => {
    await controller.updateCutoffConfigs(items);
    toast.success('Cut-off Threshold Matrix Saved');
  };

  const tabItems = [
    {
      key: 'global-config',
      label: (
        <Space size={8} align="center">
          <SettingOutlined style={{ color: '#1677ff', fontSize: 16 }} />
          <span>Global Config</span>
        </Space>
      ),
      children: <GlobalConfigAdminView config={controller.globalConfig} onSave={handleSaveGlobalConfig} />,
    },
    {
      key: 'menu-management',
      label: (
        <Space size={8} align="center">
          <UnorderedListOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          <span>Menu Management</span>
        </Space>
      ),
      children: <MenuManagementView menus={controller.menuConfigs} onSave={handleSaveMenu} />,
    },
    {
      key: 'special-privileges',
      label: (
        <Space size={8} align="center">
          <KeyOutlined style={{ color: '#722ed1', fontSize: 16 }} />
          <span>Special Privileges</span>
        </Space>
      ),
      children: <SpecialPrivilegesView privileges={controller.specialPrivileges} onSave={handleSavePrivileges} />,
    },
    {
      key: 'email-templates',
      label: (
        <Space size={8} align="center">
          <MailOutlined style={{ color: '#13c2c2', fontSize: 16 }} />
          <span>Email Templates</span>
        </Space>
      ),
      children: <EmailTemplateEditorView templates={controller.emailTemplates} onSave={handleSaveEmailTemplate} />,
    },
    {
      key: 'password-reset',
      label: (
        <Space size={8} align="center">
          <LockOutlined style={{ color: '#f5222d', fontSize: 16 }} />
          <span>Password Reset</span>
        </Space>
      ),
      children: <AdminPasswordResetView onResetPassword={controller.resetPassword} />,
    },
    {
      key: 'field-config',
      label: (
        <Space size={8} align="center">
          <FormOutlined style={{ color: '#fa8c16', fontSize: 16 }} />
          <span>Field Config</span>
        </Space>
      ),
      children: <FieldConfigView fields={controller.fieldConfigs} onSave={handleSaveFieldConfig} />,
    },
    {
      key: 'service-restrictions',
      label: (
        <Space size={8} align="center">
          <StopOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
          <span>Route Restrictions</span>
        </Space>
      ),
      children: <ServiceRestrictionsView restrictions={controller.serviceRestrictions} onSave={handleSaveServiceRestrictions} />,
    },
    {
      key: 'banner-manager',
      label: (
        <Space size={8} align="center">
          <PictureOutlined style={{ color: '#eb2f96', fontSize: 16 }} />
          <span>Banners & Assets</span>
        </Space>
      ),
      children: <BannerManagerView banners={controller.banners} onCreate={controller.createBanner} />,
    },
    {
      key: 'customer-advisories',
      label: (
        <Space size={8} align="center">
          <NotificationOutlined style={{ color: '#fa541c', fontSize: 16 }} />
          <span>Advisories</span>
        </Space>
      ),
      children: <CustomerAdvisoryView advisories={controller.customerAdvisories} onCreate={controller.createAdvisory} />,
    },
    {
      key: 'cutoff-config',
      label: (
        <Space size={8} align="center">
          <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />
          <span>Cut-off Thresholds</span>
        </Space>
      ),
      children: <CutoffConfigView cutoffConfigs={controller.cutoffConfigs} onSave={handleSaveCutoffConfig} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`
        .admin-redesigned-tabs .ant-tabs-nav {
          background: #ffffff;
          padding: 4px 6px;
          border-radius: 12px;
          border: 1px solid ${token.colorBorderSecondary};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          margin-bottom: 12px !important;
        }
        .admin-redesigned-tabs .ant-tabs-tab {
          border-radius: 8px !important;
          padding: 6px 12px !important;
          margin-right: 4px !important;
          border: none !important;
          background: transparent !important;
          transition: all 0.2s ease !important;
          font-weight: 500;
        }
        .admin-redesigned-tabs .ant-tabs-tab:hover {
          background: ${token.colorFillAlter} !important;
          color: ${token.colorPrimary} !important;
        }
        .admin-redesigned-tabs .ant-tabs-tab-active {
          background: ${token.colorPrimaryBg} !important;
          border: 1px solid ${token.colorPrimaryBorder} !important;
          box-shadow: 0 2px 6px rgba(22, 119, 255, 0.1) !important;
        }
        .admin-redesigned-tabs .ant-tabs-tab-active span {
          font-weight: 600 !important;
          color: ${token.colorPrimary} !important;
        }
        .admin-redesigned-tabs .ant-tabs-ink-bar {
          display: none !important;
        }
      `}</style>

      {/* Admin Top Header */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: '12px 16px',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Space size="middle">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '6px 8px', borderRadius: 8, background: token.colorPrimaryBg }}>
              <SafetyCertificateOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                System Admin Control Panel
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tenant Scope: <strong style={{ color: token.colorText }}>{activeTenant.name}</strong> ({activeTenant.customerCode})
              </Text>
            </div>
          </div>
        </Space>

        <Space size="middle">
          <Badge status="processing" text={<span style={{ fontWeight: 600, color: token.colorSuccess }}>Admin Mode Active</span>} />
        </Space>
      </div>

      {/* Redesigned Admin Tabs using AppTabs */}
      <AppTabs
        items={tabItems}
        size="middle"
        className="admin-redesigned-tabs"
        style={{ background: 'transparent' }}
      />
    </div>
  );
}

