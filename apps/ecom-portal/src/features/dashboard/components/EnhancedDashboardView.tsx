// EnhancedDashboardView — main dashboard page
// CRM UI Architecture: Per-section independent Spin overlay loading matching DashboardSectionQuery
// 50:50 Ratio layout for sections + Redesigned Upcoming Shipment Planning
// Modified by Antigravity (2026-08-21 18:48)

import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate } from '@tanstack/react-router';
import { Alert, Col, Row, Select, Spin, theme, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  MOCK_CALENDAR_WEEKS,
  MOCK_CONTRACTED_LANES,
  MOCK_LAST_USED_LANES,
  MOCK_OPPORTUNITY_LANES,
  MOCK_PLANNING_KPIS,
  MOCK_TOP_CONSIGNEES,
  MOCK_TOP_LANES,
  MOCK_VOLUME_KPIS,
  MOCK_VOLUME_TREND,
} from '../mocks/dashboard.mock';
import { DashboardOngoingTable } from './DashboardOngoingTable';
import { LaneOpportunitySection, TopActiveLanesSection } from './LanesSection';
import { InteractiveShipmentIntelligenceCard, TopConsigneesCard } from './ShipmentIntelligenceSection';
import { ShipmentPlanningSection } from './ShipmentPlanningSection';
import { VolumeAnalyticsSection } from './VolumeAnalyticsSection';

const { Title, Text } = Typography;

const MOCK_COMPANY = 'Shipper Corp';
const MOCK_SHIPMENTS = [
  {
    id: '1', bookNo: 'BK2026001', blNo: 'APLA2026001', onlineRefNo: 'ORN-2026-001',
    originPortId: 'USNYC', originPortDesc: 'Port of New York', finalPortId: 'SGSIN', finalPortDesc: 'Port of Singapore',
    polAt: '2026-08-15', status: 'C' as const, siNo: 'SI-001', containerNo: 'MSKU1234567', teus: '2', amtBal: 0, invNo: '', invAgency: '', filterKey: 'bkConfirmed',
  },
  {
    id: '2', bookNo: 'BK2026002', blNo: '', onlineRefNo: 'ORN-2026-002',
    originPortId: 'NLRTM', originPortDesc: 'Port of Rotterdam', finalPortId: 'CNSHA', finalPortDesc: 'Port of Shanghai',
    polAt: '2026-08-22', status: 'C' as const, siNo: '', containerNo: 'TCKU5678901', teus: '1', amtBal: 18500.00, invNo: 'INV-2026-002', invAgency: 'SMA01', filterKey: 'siPending',
  },
  {
    id: '3', bookNo: 'BK2026003', blNo: 'APLA2026003', onlineRefNo: 'ORN-2026-003',
    originPortId: 'DEHAM', originPortDesc: 'Port of Hamburg', finalPortId: 'AEJEA', finalPortDesc: 'Jebel Ali Port',
    polAt: '2026-08-10', status: 'I' as const, siNo: 'SI-003', containerNo: 'CMAU7654321', teus: '4', amtBal: 42250.00, invNo: 'INV-2026-003', invAgency: 'SMA02', filterKey: 'bkConfirmed',
  },
];

function getGreeting() {
  const h = dayjs().hour();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function EnhancedDashboardView() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendPeriod, setTrendPeriod] = useState('Monthly');
  const [comparePeriod, setComparePeriod] = useState('Previous Period');

  const load = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div
      style={{
        padding: '20px 24px',
        minHeight: '100vh',
        background: token.colorBgLayout,
      }}
    >
      {/* ── Page Header (Persistent & Interactive per CRM Dashboard Standard) ──────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: -0.3 }}>
            {getGreeting()}, {MOCK_COMPANY}!
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Here's your shipment overview and insights.
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Compare with</Text>
          <Select
            value={comparePeriod}
            onChange={setComparePeriod}
            style={{ width: 160 }}
            size="middle"
            options={[
              { value: 'Previous Period', label: 'Previous Period' },
              { value: 'Last Year', label: 'Last Year' },
              { value: 'Last Quarter', label: 'Last Quarter' },
            ]}
          />
          <AppButton icon={<ReloadOutlined />} onClick={load} loading={loading} />
          <AppButton type="primary" icon={<PlusOutlined />} onClick={() => navigate({ to: '/app/schedules' })}>
            Create Booking
          </AppButton>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 20, borderRadius: 12 }}
          action={<AppButton size="small" onClick={load}>Retry</AppButton>}
        />
      )}

      {/* ── CRM Dashboard Architecture: Per-Section Independent Spin Overlays ───────── */}

      {/* ── Section 1: Volume Analytics ────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <Spin spinning={loading} size="medium" tip="Loading volume analytics...">
          <VolumeAnalyticsSection
            kpis={MOCK_VOLUME_KPIS}
            trend={MOCK_VOLUME_TREND}
            trendPeriod={trendPeriod}
            onTrendPeriodChange={setTrendPeriod}
          />
        </Spin>
      </div>

      {/* ── Sections 2 & 3: Lanes (50 : 50 Ratio Row) ───────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={12}>
          <Spin spinning={loading} size="medium" tip="Loading active lanes...">
            <TopActiveLanesSection lanes={MOCK_TOP_LANES} lastUsed={MOCK_LAST_USED_LANES} />
          </Spin>
        </Col>
        <Col xs={24} lg={12}>
          <Spin spinning={loading} size="medium" tip="Loading lane opportunities...">
            <LaneOpportunitySection contracted={MOCK_CONTRACTED_LANES} opportunities={MOCK_OPPORTUNITY_LANES} />
          </Spin>
        </Col>
      </Row>

      {/* ── Section 4 & 5: Upcoming Shipment Planning & Shipment Intelligence (50 : 50 Ratio Row) ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={12}>
          <Spin spinning={loading} size="medium" tip="Loading shipment planning...">
            <ShipmentPlanningSection kpis={MOCK_PLANNING_KPIS} calendar={MOCK_CALENDAR_WEEKS} />
          </Spin>
        </Col>
        <Col xs={24} lg={12}>
          <Spin spinning={loading} size="medium" tip="Loading shipment intelligence...">
            <InteractiveShipmentIntelligenceCard />
          </Spin>
        </Col>
      </Row>

      {/* ── Top Consignees Row ─────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <Spin spinning={loading} size="medium" tip="Loading top consignees...">
          <TopConsigneesCard consignees={MOCK_TOP_CONSIGNEES} />
        </Spin>
      </div>

      {/* ── Ongoing Transactions Table ─────────────────────── */}
      <div>
        <Spin spinning={loading} size="medium" tip="Loading ongoing transactions...">
          <DashboardOngoingTable
            shipments={MOCK_SHIPMENTS}
            activeFilter="all"
            filterLabel="All Shipments"
            onViewBooking={(bookNo) => console.log('View booking:', bookNo)}
            onViewBl={(blNo) => console.log('View BL:', blNo)}
            onCreateSi={(bookNo) => console.log('Create SI:', bookNo)}
          />
        </Spin>
      </div>
    </div>
  );
}
