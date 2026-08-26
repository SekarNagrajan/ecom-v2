// Modified by Sekar Nagarajan (2026-08-24 19:14)
import { AppButton } from '@solverminds/shared-ui';
import { Card, Switch, Tag, Typography } from 'antd';
import React from 'react';

import { AppIcon, Icons } from '../../../components/icons';
import type { ServiceRestriction } from '../types/admin.types';
import { AdminPanelShell } from './AdminPanelShell';

const { Title } = Typography;

interface ServiceRestrictionsViewProps {
  restrictions: ServiceRestriction[];
  onSave: (items: ServiceRestriction[]) => void;
}

export function ServiceRestrictionsView({ restrictions, onSave }: ServiceRestrictionsViewProps) {
  const [data, setData] = React.useState<ServiceRestriction[]>(restrictions);

  React.useEffect(() => {
    setData(restrictions);
  }, [restrictions]);

  const handleToggle = (id: string, checked: boolean) => {
    setData(data.map((item) => (item.id === id ? { ...item, isRestricted: checked } : item)));
  };

  return (
    <AdminPanelShell
      icon={Icons.stopCircle}
      title="Service & Route Restrictions"
      subtitle="Enable or restrict specific origin/destination port pairs and maritime service loops."
      extra={
        <AppButton
          type="primary"
          size="large"
          icon={<AppIcon icon={Icons.save} size={16} />}
          onClick={() => onSave(data)}
        >
          Save Route Rules
        </AppButton>
      }
    >
      <div className="admin-route-list">
        {data.map((item) => (
          <Card key={item.id} className="admin-route-card" bordered={false}>
            <div className="admin-route-strip">
              <div className="admin-route-port admin-route-port--origin">
                <div className="admin-route-port__label">
                  <AppIcon icon={Icons.mapPin} size={14} tone="track" />
                  Origin
                </div>
                <Title level={4} className="admin-route-port__code admin-route-port__code--origin">
                  {item.polCode}
                </Title>
              </div>

              <div className="admin-route-connector">
                <span className="admin-route-connector__label">Port to Port</span>
                <div className="admin-route-connector__line">
                  <span className="admin-route-connector__dot admin-route-connector__dot--origin" />
                  <span className="admin-route-connector__track" />
                  <AppIcon icon={Icons.arrowRight} size={14} tone="navigate" />
                  <span className="admin-route-connector__track" />
                  <span className="admin-route-connector__dot admin-route-connector__dot--delivery" />
                </div>
                <AppIcon icon={Icons.truck} size={16} />
              </div>

              <div className="admin-route-port admin-route-port--delivery">
                <div className="admin-route-port__label">
                  <AppIcon icon={Icons.mapPin} size={14} tone="track" />
                  Delivery
                </div>
                <Title
                  level={4}
                  className="admin-route-port__code admin-route-port__code--delivery"
                >
                  {item.podCode}
                </Title>
              </div>
            </div>

            <div className="admin-route-meta">
              <div>
                <span className="admin-route-meta__label">Service Loop</span>
                <span className="admin-route-meta__value">{item.serviceLoop}</span>
              </div>
              <div>
                <span className="admin-route-meta__label">Tenant Code</span>
                <span className="admin-route-meta__value">
                  <Tag className="admin-code-tag" color="gold">
                    {item.tenantId}
                  </Tag>
                </span>
              </div>
              <div>
                <span className="admin-route-meta__label">Restriction Reason</span>
                <span className="admin-route-meta__value">{item.reason || 'N/A'}</span>
              </div>
              <div>
                <span className="admin-route-meta__label">Status</span>
                <span className="admin-route-meta__value">
                  <span className="admin-toggle-row">
                    <Switch
                      checked={item.isRestricted}
                      onChange={(checked) => handleToggle(item.id, checked)}
                    />
                    <Tag
                      className="admin-status-tag"
                      color={item.isRestricted ? 'error' : 'success'}
                    >
                      {item.isRestricted ? 'Restricted' : 'Active'}
                    </Tag>
                  </span>
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminPanelShell>
  );
}
