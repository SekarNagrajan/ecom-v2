// Section 2: Top Active Lanes + Section 3: Lane Opportunity Visibility
// Modified by sekar nagarajan (2026-08-21)

import { ArrowRightOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Progress, Row, Space, Tag, theme, Typography } from 'antd';
import type { ContractedLane, LastUsedLane, OpportunityLane, TopLane } from '../mocks/dashboard.mock';

const { Text } = Typography;

interface TopLanesProps {
  lanes: TopLane[];
  lastUsed: LastUsedLane[];
}

export function TopActiveLanesSection({ lanes, lastUsed }: TopLanesProps) {
  const { token } = theme.useToken();
  const maxFeus = lanes[0]?.feus ?? 1;

  const cardStyle = {
    borderRadius: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  };

  return (
    <Card
      style={cardStyle}
      styles={{ body: { padding: '16px 20px' } }}
      title={<Text strong style={{ fontSize: 14 }}>2. Top Active Lanes (by FEUs)</Text>}
      extra={<AppButton type="link" size="small" icon={<EyeOutlined />}>View All</AppButton>}
    >
      {/* Lane Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr>
            {['Rank', 'Lane (POL → POD)', 'FEUs', '% of Total', 'Volume'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: h === 'Rank' ? 'center' : 'left',
                  fontSize: 11,
                  color: token.colorTextSecondary,
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lanes.map((lane) => (
            <tr key={lane.rank} style={{ background: lane.rank % 2 === 0 ? token.colorFillAlter : 'transparent' }}>
              <td style={{ textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 700, color: token.colorPrimary }}>{lane.rank}</td>
              <td style={{ padding: '8px', fontSize: 12 }}>
                <Space size={4}>
                  <Tag color="blue" style={{ fontSize: 10, margin: 0, fontFamily: 'monospace' }}>{lane.pol}</Tag>
                  <ArrowRightOutlined style={{ fontSize: 9, color: token.colorTextSecondary }} />
                  <Tag color="geekblue" style={{ fontSize: 10, margin: 0, fontFamily: 'monospace' }}>{lane.pod}</Tag>
                </Space>
              </td>
              <td style={{ padding: '8px', fontSize: 12, fontWeight: 700 }}>{lane.feus.toLocaleString()}</td>
              <td style={{ padding: '8px', fontSize: 12, color: token.colorTextSecondary }}>{lane.pctOfTotal}%</td>
              <td style={{ padding: '8px', minWidth: 100 }}>
                <Progress
                  percent={Math.round((lane.feus / maxFeus) * 100)}
                  showInfo={false}
                  size="small"
                  strokeColor={token.colorPrimary}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Last Used Lanes */}
      <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: 600, color: token.colorTextSecondary }}>Last Used Lanes</Text>
          <AppButton type="link" size="small">View All</AppButton>
        </div>
        <Row gutter={8}>
          {lastUsed.map((lane, idx) => (
            <Col key={idx} span={8}>
              <div
                style={{
                  background: token.colorFillAlter,
                  borderRadius: 8,
                  padding: '8px 10px',
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Space size={4}>
                  <Text style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>{lane.pol}</Text>
                  <ArrowRightOutlined style={{ fontSize: 8, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>{lane.pod}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>{lane.date}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Card>
  );
}

interface LaneOpportunityProps {
  contracted: ContractedLane[];
  opportunities: OpportunityLane[];
}

export function LaneOpportunitySection({ contracted, opportunities }: LaneOpportunityProps) {
  const { token } = theme.useToken();

  const cardStyle = {
    borderRadius: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  };

  return (
    <Card
      style={cardStyle}
      styles={{ body: { padding: '16px 20px' } }}
      title={<Text strong style={{ fontSize: 14 }}>3. Lane Opportunity Visibility</Text>}
      extra={<AppButton type="link" size="small">View All</AppButton>}
    >
      {/* Contracted Lanes with No Activity */}
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Contracted Lanes with Limited / No Activity (Last 90 Days)
        </Text>
        {contracted.map((lane, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: idx < contracted.length - 1 ? `1px solid ${token.colorBorderSecondary}` : 'none',
            }}
          >
            <Space size={4}>
              <Tag color="default" style={{ fontSize: 10, fontFamily: 'monospace' }}>{lane.pol}</Tag>
              <ArrowRightOutlined style={{ fontSize: 9, color: token.colorTextSecondary }} />
              <Tag color="default" style={{ fontSize: 10, fontFamily: 'monospace' }}>{lane.pod}</Tag>
            </Space>
            <Tag color="error" style={{ fontSize: 10, borderRadius: 10 }}>No Activity</Tag>
          </div>
        ))}
      </div>

      {/* Potential New Opportunities */}
      <div>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Potential New Opportunities (Based on History)
        </Text>
        {opportunities.map((lane, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: idx < opportunities.length - 1 ? `1px solid ${token.colorBorderSecondary}` : 'none',
            }}
          >
            <Space size={4}>
              <ThunderboltOutlined style={{ color: token.colorWarning, fontSize: 11 }} />
              <Tag color="blue" style={{ fontSize: 10, fontFamily: 'monospace' }}>{lane.pol}</Tag>
              <ArrowRightOutlined style={{ fontSize: 9, color: token.colorTextSecondary }} />
              <Tag color="blue" style={{ fontSize: 10, fontFamily: 'monospace' }}>{lane.pod}</Tag>
            </Space>
            <Tag
              color={lane.suggestion === 'High Potential' ? 'warning' : 'processing'}
              style={{ fontSize: 10, borderRadius: 10 }}
            >
              {lane.suggestion}
            </Tag>
          </div>
        ))}
      </div>
    </Card>
  );
}
