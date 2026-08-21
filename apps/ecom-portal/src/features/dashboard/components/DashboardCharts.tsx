// Booking, BL, SI status charts — parity with DashBoardCharts.jsp (AmCharts → ECharts)
// ECharts is available in the monorepo workspace (echarts ^6.0.0)
// Modified by sekar nagarajan (2026-08-21)

import { Card, Col, Empty, Row, theme } from 'antd';
import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';
import type { BookingStatusChartItem } from '../api/dashboard.api';

interface ChartProps {
  data: BookingStatusChartItem[];
  type: 'bar' | 'pie';
  height?: number;
}

function EChartsCanvas({ data, type, height = 240 }: ChartProps) {
  const { token } = theme.useToken();
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current = echarts.init(ref.current, undefined, { renderer: 'svg' });
    return () => {
      chartRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const option =
      type === 'bar'
        ? {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: 8, right: 8, top: 12, bottom: 8, containLabel: true },
          xAxis: {
            type: 'category',
            data: data.map((d) => d.status),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { fontSize: 11, color: token.colorTextSecondary },
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { fontSize: 11, color: token.colorTextSecondary },
            splitLine: { lineStyle: { color: token.colorBorderSecondary } },
          },
          series: [
            {
              type: 'bar',
              data: data.map((d) => ({
                value: d.count,
                itemStyle: { color: d.color, borderRadius: [4, 4, 0, 0] },
              })),
              label: { show: true, position: 'top', fontSize: 11 },
            },
          ],
        }
        : {
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { orient: 'horizontal', bottom: 0, textStyle: { fontSize: 11, color: token.colorTextSecondary } },
          series: [
            {
              type: 'pie',
              radius: ['35%', '65%'],
              center: ['50%', '45%'],
              data: data.map((d) => ({
                value: d.count,
                name: d.status,
                itemStyle: { color: d.color },
              })),
              label: { show: false },
              emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.15)' } },
            },
          ],
        };
    chartRef.current.setOption(option);
  }, [data, type, token]);

  useEffect(() => {
    const handleResize = () => chartRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={ref} style={{ width: '100%', height }} />;
}

interface DashboardChartsProps {
  bookingChart: BookingStatusChartItem[];
  blChart: BookingStatusChartItem[];
  siChart: BookingStatusChartItem[];
}

export function DashboardCharts({ bookingChart, blChart, siChart }: DashboardChartsProps) {
  const { token } = theme.useToken();

  const cardStyle = {
    borderRadius: 16,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* Booking Status — Bar chart (parity: getBookingChart() in DashBoardCharts.jsp) */}
      <Col xs={24} md={12}>
        <Card title="Booking Status" style={cardStyle} styles={{ body: { padding: '16px 20px' } }}>
          {bookingChart.length === 0 ? (
            <Empty style={{ padding: 40 }} />
          ) : (
            <EChartsCanvas data={bookingChart} type="bar" height={240} />
          )}
        </Card>
      </Col>

      {/* BL Status — Pie chart (parity: getSiChart() in DashBoardCharts.jsp) */}
      <Col xs={24} md={6}>
        <Card title="Bill of Lading Status" style={cardStyle} styles={{ body: { padding: '16px 20px' } }}>
          {blChart.length === 0 ? (
            <Empty style={{ padding: 40 }} />
          ) : (
            <EChartsCanvas data={blChart} type="pie" height={240} />
          )}
        </Card>
      </Col>

      {/* SI Status — Pie chart (parity: getBlChart() in DashBoardCharts.jsp) */}
      <Col xs={24} md={6}>
        <Card title="Shipping Instruction Status" style={cardStyle} styles={{ body: { padding: '16px 20px' } }}>
          {siChart.length === 0 ? (
            <Empty style={{ padding: 40 }} />
          ) : (
            <EChartsCanvas data={siChart} type="pie" height={240} />
          )}
        </Card>
      </Col>
    </Row>
  );
}
