// Section 1: Shipment Volume Analytics — Redesigned layout with ZERO whitespace or gaps
// Follows agenct.md rules: token styling, no hardcoded colors, strict 50:50 ratio, seamless ECharts width fill
// Modified by sekar nagarajan (2026-08-21)

import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Card, Col, Row, Select, theme, Tooltip, Typography } from 'antd';
import * as echarts from 'echarts';
import { useLayoutEffect, useRef } from 'react';
import type { VolumeKpi, VolumeTrendPoint } from '../mocks/dashboard.mock';

const { Text, Title } = Typography;

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' });

    chart.setOption({
      grid: { top: 2, right: 0, bottom: 2, left: 0 },
      xAxis: { type: 'category', boundaryGap: false, show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value', show: false },
      series: [
        {
          type: 'line',
          data,
          smooth: true,
          symbol: 'none',
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${color}35` },
              { offset: 1, color: `${color}00` },
            ]),
          },
        },
      ],
    });

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [data, color]);

  return <div ref={ref} style={{ width: '100%', height: 32 }} />;
}

interface VolumeTrendChartProps {
  data: VolumeTrendPoint[];
  period: string;
  onPeriodChange: (v: string) => void;
}

function VolumeTrendChart({ data, period, onPeriodChange }: VolumeTrendChartProps) {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' });

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: token.colorPrimary, type: 'dashed' } },
        formatter: '{b}: <b>{c} FEUs</b>',
      },
      grid: { top: 16, right: 10, bottom: 30, left: 40, containLabel: false },
      xAxis: {
        type: 'category',
        boundaryGap: false, // Ensures wave line reaches 100% left to right with no empty gap
        data: data.map((d) => d.month),
        axisLine: { lineStyle: { color: token.colorBorderSecondary } },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: token.colorTextSecondary, rotate: 20 },
      },
      yAxis: {
        type: 'value',
        min: 'dataMin',
        axisLabel: { fontSize: 10, color: token.colorTextSecondary, formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)) },
        splitLine: { lineStyle: { color: token.colorBorderSecondary, type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'line',
          data: data.map((d) => d.feus),
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: token.colorPrimary, borderColor: '#fff', borderWidth: 2 },
          lineStyle: { color: token.colorPrimary, width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${token.colorPrimary}40` },
              { offset: 1, color: `${token.colorPrimary}00` },
            ]),
          },
        },
      ],
    });

    const handleResize = () => chart.resize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [data, token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong style={{ fontSize: 13, color: token.colorText }}>
          Volume Trend (FEUs){' '}
          <Tooltip title="Monthly FEU volume over the selected period">
            <InfoCircleOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
          </Tooltip>
        </Text>
        <Select
          size="small"
          value={period}
          onChange={onPeriodChange}
          style={{ width: 100 }}
          options={[
            { value: 'Monthly', label: 'Monthly' },
            { value: 'Weekly', label: 'Weekly' },
            { value: 'Quarterly', label: 'Quarterly' },
          ]}
        />
      </div>
      <div ref={ref} style={{ width: '100%', flex: 1, minHeight: 180 }} />
    </div>
  );
}

interface VolumeAnalyticsProps {
  kpis: VolumeKpi[];
  trend: VolumeTrendPoint[];
  trendPeriod: string;
  onTrendPeriodChange: (v: string) => void;
}

export function VolumeAnalyticsSection({ kpis, trend, trendPeriod, onTrendPeriodChange }: VolumeAnalyticsProps) {
  const { token } = theme.useToken();

  const cardStyle = {
    borderRadius: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    marginBottom: 20,
  };

  return (
    <Card
      style={cardStyle}
      styles={{ body: { padding: '16px 20px' } }}
      title={
        <Text strong style={{ fontSize: 14 }}>
          1. Shipment Volume Analytics (FEUs){' '}
          <Tooltip title="Freight Equivalent Units — standard container measurement">
            <InfoCircleOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
          </Tooltip>
        </Text>
      }
    >
      <Row gutter={[16, 16]} style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* Left Side: 4 KPI Cards (50% Width, Exactly fill available space) */}
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <Row gutter={[10, 10]} style={{ width: '100%', margin: 0 }}>
            {kpis.map((kpi) => {
              const isPositive = kpi.change >= 0;
              const badgeColor = isPositive ? token.colorSuccess : token.colorError;
              return (
                <Col key={kpi.label} xs={12} sm={12} md={6} lg={6} style={{ display: 'flex', padding: 4 }}>
                  <div
                    style={{
                      background: token.colorBgLayout,
                      borderRadius: 12,
                      padding: '12px 10px',
                      border: `1px solid ${token.colorBorderSecondary}`,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                          {kpi.label}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 8, opacity: 0.8 }}>
                        ({kpi.period})
                      </Text>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <Title level={3} style={{ margin: 0, lineHeight: 1, color: token.colorText, fontSize: 22, fontWeight: 800 }}>
                          {kpi.value.toLocaleString()}
                        </Title>
                        <Text style={{ fontSize: 10, color: token.colorTextSecondary }}>{kpi.unit}</Text>
                      </div>
                      <div style={{ marginTop: 6, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: badgeColor,
                            background: `${badgeColor}15`,
                            borderRadius: 4,
                            padding: '1px 5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          {Math.abs(kpi.change)}%
                        </span>
                        <Text type="secondary" style={{ fontSize: 9 }}>
                          vs prev ({kpi.changePrev.toLocaleString()})
                        </Text>
                      </div>
                    </div>
                    <Sparkline data={kpi.sparkline} color={badgeColor} />
                  </div>
                </Col>
              );
            })}
          </Row>
        </Col>

        {/* Right Side: Volume Trend Line Chart (50% Width, Full Height & Width) */}
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 12,
              padding: '12px 16px',
              border: `1px solid ${token.colorBorderSecondary}`,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <VolumeTrendChart data={trend} period={trendPeriod} onPeriodChange={onTrendPeriodChange} />
          </div>
        </Col>
      </Row>
    </Card>
  );
}
