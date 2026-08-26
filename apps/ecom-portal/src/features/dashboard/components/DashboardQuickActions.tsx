// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { useNavigate } from '@tanstack/react-router';
import { Card, Col, Row, Typography, theme } from 'antd';
import type { LucideIcon } from 'lucide-react';

import { AppIcon, Icons } from '../../../components/icons';
import type { DashboardQuickAction } from '../mocks/dashboard.mock';

const { Text, Title } = Typography;

const ACTION_ICONS: Record<string, LucideIcon> = {
  newBooking: Icons.plus,
  trackShipment: Icons.compass,
  requestRate: Icons.dollarSign,
  submitSi: Icons.clipboardList,
};

interface DashboardQuickActionsProps {
  actions: DashboardQuickAction[];
}

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .dashboard-quick-action-card:hover {
          border-color: ${token.colorPrimary} !important;
          background-color: ${token.colorPrimary}0a !important;
        }
      `}</style>

      <Row gutter={[16, 16]}>
        {actions.map((action) => (
          <Col key={action.key} xs={24} sm={12} lg={6}>
            <Card
              hoverable
              className="dashboard-quick-action-card"
              onClick={() => navigate({ to: action.route })}
              style={{
                borderRadius: 12,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                height: '100%',
              }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${token.colorPrimary}12`,
                      color: token.colorPrimary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <AppIcon icon={ACTION_ICONS[action.key] ?? Icons.bookOpen} size={18} />
                  </div>
                  <Title level={5} style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>
                    {action.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                    {action.description}
                  </Text>
                </div>
                <AppIcon icon={Icons.chevronRight} size={12} style={{ marginTop: 4 }} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
