// Modified by Sekar Nagarajan (2026-08-27 14:20)
import { Card, Typography } from 'antd';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppIcon } from '../../../components/icons';

const { Title, Text } = Typography;

export interface AdminPanelShellProps {
  children: ReactNode;
  extra?: ReactNode;
  icon: LucideIcon;
  subtitle?: string;
  title: string;
}

export function AdminPanelShell({
  children,
  extra,
  icon,
  subtitle,
  title,
}: AdminPanelShellProps) {
  return (
    <Card className="admin-panel" bordered={false}>
      <div className="admin-panel__header">
        <div className="admin-panel__header-main">
          <div className="admin-panel__title-row">
            <AppIcon icon={icon} size={20} />
            <Title level={4} className="admin-panel__title">
              {title}
            </Title>
          </div>
          {subtitle ? (
            <Text type="secondary" className="admin-panel__subtitle">
              {subtitle}
            </Text>
          ) : null}
        </div>
        {extra ? <div className="admin-panel-actions">{extra}</div> : null}
      </div>
      <div className="admin-panel__body">{children}</div>
    </Card>
  );
}
