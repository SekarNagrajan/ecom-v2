// Section 4: Upcoming Shipment Planning — Redesigned & Aligned
// Modified by Antigravity (2026-08-21)

import { AlertOutlined, CalendarOutlined, EyeOutlined, FileTextOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Row, theme, Tooltip, Typography } from 'antd';
import type { CalendarWeek, PlanningKpi } from '../mocks/dashboard.mock';

const { Text, Title } = Typography;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface PlanningKpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}

function PlanningKpiCard({ icon, label, value, color, bg }: PlanningKpiCardProps) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        background: bg,
        borderRadius: 10,
        padding: '12px 10px',
        textAlign: 'center',
        border: `1px solid ${token.colorBorderSecondary}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        ellipsis
        style={{
          fontSize: 11,
          color: token.colorTextSecondary,
          fontWeight: 600,
          marginBottom: 4,
          maxWidth: '100%',
        }}
      >
        {label}
      </Text>
      <Title
        level={3}
        style={{
          margin: 0,
          color: color,
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {value}
      </Title>
    </div>
  );
}

interface ShipmentPlanningProps {
  kpis: PlanningKpi;
  calendar: CalendarWeek[];
}

export function ShipmentPlanningSection({ kpis, calendar }: ShipmentPlanningProps) {
  const { token } = theme.useToken();

  const cardStyle = {
    borderRadius: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    height: '100%',
  };

  const getCellBg = (count: number) => {
    if (count === 0) return 'transparent';
    if (count <= 2) return `${token.colorPrimary}12`;
    if (count <= 4) return `${token.colorPrimary}25`;
    return `${token.colorPrimary}40`;
  };

  return (
    <Card
      style={cardStyle}
      styles={{ body: { padding: '16px 20px' } }}
      title={<Text strong style={{ fontSize: 14 }}>4. Upcoming Shipment Planning</Text>}
      extra={<AppButton type="link" size="small" icon={<EyeOutlined />}>View All</AppButton>}
    >
      {/* 4 KPI summary cards aligned horizontally */}
      <Row gutter={[10, 10]} style={{ marginBottom: 18 }}>
        <Col span={6}>
          <PlanningKpiCard
            icon={<NodeIndexOutlined />}
            label="Bookings (Next 7 Days)"
            value={kpis.bookingsNext7Days}
            color={token.colorText}
            bg={token.colorFillAlter}
          />
        </Col>
        <Col span={6}>
          <PlanningKpiCard
            icon={<CalendarOutlined />}
            label="FEUs"
            value={kpis.feusNext7Days}
            color={token.colorPrimary}
            bg={`${token.colorPrimary}0D`}
          />
        </Col>
        <Col span={6}>
          <PlanningKpiCard
            icon={<FileTextOutlined />}
            label="Missing SI"
            value={kpis.missingSI}
            color={token.colorError}
            bg={`${token.colorError}0D`}
          />
        </Col>
        <Col span={6}>
          <PlanningKpiCard
            icon={<AlertOutlined />}
            label="At Risk"
            value={kpis.atRisk}
            color="#fa8c16"
            bg="#fa8c160D"
          />
        </Col>
      </Row>

      {/* Upcoming Bookings Calendar Header */}
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 12, color: token.colorTextSecondary }}>
          Upcoming Bookings Calendar (May / Jun 2025)
        </Text>
      </div>

      {/* Calendar table grid */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 8px', color: token.colorTextSecondary, textAlign: 'left', fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                Week
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  style={{
                    padding: '6px 4px',
                    color: token.colorTextSecondary,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 11,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  {d}
                </th>
              ))}
              <th
                style={{
                  padding: '6px 8px',
                  color: token.colorTextSecondary,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: 11,
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((week, idx) => (
              <tr key={week.week} style={{ background: idx % 2 === 0 ? 'transparent' : token.colorFillAlter }}>
                <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                  <Text style={{ fontSize: 11, fontWeight: 700, display: 'block', lineHeight: 1.2 }}>{week.week}</Text>
                  <Text type="secondary" style={{ fontSize: 10 }}>{week.dateRange}</Text>
                </td>
                {(Object.entries(week.days) as [string, number][])
                  .filter(([k]) => k !== 'total')
                  .map(([day, count]) => (
                    <td
                      key={day}
                      style={{
                        padding: '6px 4px',
                        textAlign: 'center',
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                      }}
                    >
                      <Tooltip title={`${count} booking(s)`}>
                        <div
                          style={{
                            width: 26,
                            height: 24,
                            borderRadius: 6,
                            background: getCellBg(count),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            fontWeight: count > 0 ? 700 : 400,
                            color: count > 0 ? token.colorPrimary : token.colorTextQuaternary,
                            fontSize: 11,
                          }}
                        >
                          {count || ''}
                        </div>
                      </Tooltip>
                    </td>
                  ))}
                <td
                  style={{
                    padding: '8px 8px',
                    textAlign: 'center',
                    fontWeight: 800,
                    color: token.colorPrimary,
                    fontSize: 12,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  {week.days.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorPrimary }} />
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Bookings</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: token.colorError }} />
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>Missing SI</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fa8c16' }} />
            <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>At Risk</Text>
          </div>
        </div>
      </div>
    </Card>
  );
}
