// Modified by Sekar Nagarajan (2026-09-16 11:20)
import { Badge, Card, Typography } from 'antd';
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
  recordCount?: number;
}

export function AdminPanelShell({
  children,
  extra,
  icon,
  subtitle,
  title,
  recordCount,
}: AdminPanelShellProps) {
  const showRecordCount =
    typeof recordCount === 'number' && Number.isFinite(recordCount);

  return (
    <Card className="admin-panel" bordered={false}>
      <div className="admin-panel__header">
        <div className="admin-panel__header-main">
          <div className="admin-panel__title-row">
            <AppIcon icon={icon} size={20} />
            <Title level={4} className="admin-panel__title">
              {title}
            </Title>
            {showRecordCount ? (
              <Badge
                count={recordCount}
                overflowCount={9999}
                showZero
                className="module-screen-header__record-count"
                title={`${recordCount} record${recordCount === 1 ? '' : 's'}`}
              />
            ) : null}
          </div>
          {subtitle ? (
            <Text type="secondary" className="admin-panel__subtitle">
              {subtitle}
            </Text>
          ) : null}
        </div>
        {extra ? <div className="admin-panel__extra">{extra}</div> : null}
      </div>
      {children}
    </Card>
  );
}
