// Modified by Sekar Nagarajan (2026-08-24 16:05)
import { Card, Col, Flex, Row, Typography, theme } from 'antd';
import type { LucideIcon } from 'lucide-react';

import { AppIcon, Icons } from '../../../components/icons';
import type { DashboardStatCard } from '../mocks/dashboard.mock';

const { Text, Title } = Typography;

interface DashboardStatCardsProps {
  stats: DashboardStatCard[];
}

type StatThemeKey = DashboardStatCard['key'];

const STAT_ICONS: Record<StatThemeKey, LucideIcon> = {
  activeBookings: Icons.clipboardList,
  inTransit: Icons.truck,
  pendingSiBl: Icons.fileCheck,
  outstanding: Icons.banknote,
};

function getStatTheme(key: StatThemeKey, token: ReturnType<typeof theme.useToken>['token']) {
  switch (key) {
    case 'activeBookings':
      return {
        accent: token.colorPrimary,
        iconBg: `${token.colorPrimary}14`,
        trendColor: token.colorSuccess,
        trendIcon: Icons.arrowUp,
      };
    case 'inTransit':
      return {
        accent: token.colorSuccess,
        iconBg: `${token.colorSuccess}14`,
        trendColor: token.colorSuccess,
        trendIcon: Icons.arrowUp,
      };
    case 'pendingSiBl':
      return {
        accent: token.colorWarning,
        iconBg: `${token.colorWarning}14`,
        trendColor: token.colorError,
        trendIcon: Icons.arrowDown,
      };
    case 'outstanding':
      return {
        accent: token.colorError,
        iconBg: `${token.colorError}14`,
        trendColor: token.colorError,
        trendIcon: Icons.arrowDown,
      };
    default:
      return {
        accent: token.colorPrimary,
        iconBg: `${token.colorPrimary}14`,
        trendColor: token.colorTextSecondary,
        trendIcon: null,
      };
  }
}

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat) => {
        const statTheme = getStatTheme(stat.key, token);
        const icon = STAT_ICONS[stat.key];

        return (
          <Col key={stat.key} xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                background: token.colorBgContainer,
                height: '100%',
              }}
              styles={{ body: { padding: '18px 20px' } }}
            >
              <Flex align="flex-start" justify="space-between" gap={12}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: token.colorTextSecondary,
                      display: 'block',
                      marginBottom: 10,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Title
                    level={3}
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      color: statTheme.accent,
                      fontSize: stat.key === 'outstanding' ? 26 : 32,
                    }}
                  >
                    {stat.value}
                  </Title>
                  <Flex align="center" gap={4} style={{ marginTop: 8 }}>
                    {statTheme.trendIcon ? (
                      <span style={{ color: statTheme.trendColor, display: 'inline-flex' }}>
                        <AppIcon icon={statTheme.trendIcon} size={11} />
                      </span>
                    ) : null}
                    <Text style={{ fontSize: 12, color: statTheme.trendColor, fontWeight: 500 }}>
                      {stat.subtitle}
                    </Text>
                  </Flex>
                </div>

                {icon ? (
                  <div
                    className="app-icon-inherit"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: statTheme.iconBg,
                      color: statTheme.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AppIcon icon={icon} size={20} />
                  </div>
                ) : null}
              </Flex>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
