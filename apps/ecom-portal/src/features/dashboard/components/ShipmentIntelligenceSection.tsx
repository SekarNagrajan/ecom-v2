// Section 5: Interactive Shipment Intelligence & Top Consignees
// Modified by sekar nagarajan (2026-08-21)

import { EyeOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Card, Col, Progress, Row, Tabs, theme, Typography } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef, useState } from 'react';
import type { IntelligenceBreakdown, TopConsignee } from '../mocks/dashboard.mock';
import {
  MOCK_INTELLIGENCE_BY_ORIGIN,
  MOCK_INTELLIGENCE_BY_POD,
  MOCK_INTELLIGENCE_BY_POL,
} from '../mocks/dashboard.mock';

const { Text } = Typography;

interface DonutChartProps {
  data: IntelligenceBreakdown[];
  totalFeus: number;
}

function DonutChart({ data, totalFeus }: DonutChartProps) {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current = echarts.init(ref.current, undefined, { renderer: 'svg' });
    const handleResize = () => chartRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => { chartRef.current?.dispose(); window.removeEventListener('resize', handleResize); };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} FEUs ({d}%)' },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: { text: totalFeus.toLocaleString(), textAlign: 'center', fill: token.colorText, fontSize: 20, fontWeight: 'bold' },
        },
        {
          type: 'text',
          left: 'center',
          top: '52%',
          style: { text: 'FEUs', textAlign: 'center', fill: token.colorTextSecondary, fontSize: 11 },
        },
      ],
      series: [
        {
          type: 'pie',
          radius: ['50%', '76%'],
          center: ['50%', '47%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { scale: true, scaleSize: 4 },
          data: data.map((d) => ({ value: d.feus, name: d.name, itemStyle: { color: d.color } })),
        },
      ],
    });
  }, [data, totalFeus, token]);

  return <div ref={ref} style={{ width: '100%', height: 180 }} />;
}

interface BreakdownTableProps {
  data: IntelligenceBreakdown[];
}

function BreakdownTable({ data }: BreakdownTableProps) {
  const { token } = theme.useToken();
  const max = data[0]?.feus ?? 1;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            {['Origin', 'FEUs', '% Total', ''].map((h) => (
              <th key={h} style={{ padding: '4px 6px', color: token.colorTextSecondary, textAlign: h === 'FEUs' || h === '% Total' ? 'right' : 'left', fontWeight: 600, fontSize: 10, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : token.colorFillAlter }}>
              <td style={{ padding: '5px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                <Text style={{ fontSize: 11 }} ellipsis>{row.name}</Text>
              </td>
              <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 700 }}>{row.feus.toLocaleString()}</td>
              <td style={{ padding: '5px 6px', textAlign: 'right', color: token.colorTextSecondary }}>{row.pctOfTotal}%</td>
              <td style={{ padding: '5px 6px', minWidth: 60 }}>
                <Progress percent={Math.round((row.feus / max) * 100)} showInfo={false} size="small" strokeColor={row.color} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const INTELLIGENCE_TABS = [
  { key: 'origin', label: 'By Origin', data: MOCK_INTELLIGENCE_BY_ORIGIN },
  { key: 'pol', label: 'By POL', data: MOCK_INTELLIGENCE_BY_POL },
  { key: 'pod', label: 'By POD', data: MOCK_INTELLIGENCE_BY_POD },
  { key: 'pickup', label: 'By Pickup', data: MOCK_INTELLIGENCE_BY_ORIGIN },
  { key: 'consignee', label: 'By Consignee', data: MOCK_INTELLIGENCE_BY_POL },
  { key: 'destination', label: 'By Destination', data: MOCK_INTELLIGENCE_BY_POD },
];

export function InteractiveShipmentIntelligenceCard() {
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState('origin');
  const currentTab = INTELLIGENCE_TABS.find((t) => t.key === activeTab)!;
  const totalFeus = currentTab.data.reduce((s, d) => s + d.feus, 0);

  const cardStyle = {
    borderRadius: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    height: '100%',
  };

  return (
    <Card
      style={cardStyle}
      styles={{ body: { padding: '16px 20px' } }}
      title={<Text strong style={{ fontSize: 14 }}>5. Interactive Shipment Intelligence</Text>}
      extra={
        <AppButton type="link" size="small" icon={<EyeOutlined />}>
          Report →
        </AppButton>
      }
    >
      <Tabs
        size="small"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={INTELLIGENCE_TABS.map((t) => ({ key: t.key, label: t.label }))}
        style={{ marginBottom: 0 }}
      />
      <Row gutter={12} style={{ marginTop: 8 }}>
        <Col xs={24} sm={9}>
          <DonutChart data={currentTab.data} totalFeus={totalFeus} />
        </Col>
        <Col xs={24} sm={15}>
          <BreakdownTable data={currentTab.data} />
        </Col>
      </Row>
    </Card>
  );
}

interface TopConsigneesProps {
  consignees: TopConsignee[];
}

export function TopConsigneesCard({ consignees }: TopConsigneesProps) {
  const { token } = theme.useToken();
  const max = consignees[0]?.feus ?? 1;

  const cardStyle = {
    borderRadius: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    height: '100%',
  };

  return (
    <Card
      style={cardStyle}
      styles={{ body: { padding: '16px 20px' } }}
      title={<Text strong style={{ fontSize: 14 }}>Top Consignees (By FEUs)</Text>}
      extra={<AppButton type="link" size="small">View All</AppButton>}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {['Company Name', 'FEUs', '% Total', 'Volume Share'].map((h) => (
              <th key={h} style={{ padding: '4px 6px', color: token.colorTextSecondary, textAlign: h === 'FEUs' || h === '% Total' ? 'right' : 'left', fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {consignees.map((c, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : token.colorFillAlter }}>
              <td style={{ padding: '7px 6px', fontWeight: 500 }}>{c.name}</td>
              <td style={{ padding: '7px 6px', textAlign: 'right', fontWeight: 700 }}>{c.feus.toLocaleString()}</td>
              <td style={{ padding: '7px 6px', textAlign: 'right', color: token.colorTextSecondary }}>{c.pctOfTotal}%</td>
              <td style={{ padding: '7px 6px', minWidth: 90 }}>
                <Progress percent={Math.round((c.feus / max) * 100)} showInfo={false} size="small" strokeColor={c.color} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

interface ShipmentIntelligenceProps {
  consignees: TopConsignee[];
}

export function ShipmentIntelligenceSection({ consignees }: ShipmentIntelligenceProps) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <InteractiveShipmentIntelligenceCard />
      </Col>
      <Col xs={24} lg={10}>
        <TopConsigneesCard consignees={consignees} />
      </Col>
    </Row>
  );
}
