// Schedule Calendar View Component
// Parity with eCommSchedules.jsp FullCalendar integration
// Modified by Antigravity (2026-08-21)

import { CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { Badge, Card, Col, Row, Space, theme, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import type { ScheduleItem } from '../types/schedules.types';

const { Text, Title } = Typography;

interface ScheduleCalendarViewProps {
  schedules: ScheduleItem[];
  onSelectSchedule: (schedule: ScheduleItem) => void;
}

export function ScheduleCalendarView({ schedules, onSelectSchedule }: ScheduleCalendarViewProps) {
  const { token } = theme.useToken();
  const [currentMonth, setCurrentMonth] = useState(dayjs('2026-09-01'));

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.startOf('month').day(); // 0 is Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  return (
    <Card
      style={{
        borderRadius: 16,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
      styles={{ body: { padding: 20 } }}
    >
      {/* Calendar Month Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space align="center" size={8}>
          <CalendarOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
          <Title level={4} style={{ margin: 0 }}>
            {currentMonth.format('MMMM YYYY')} Vessel Schedule Matrix
          </Title>
        </Space>
        <Space>
          <AppButton icon={<LeftOutlined />} onClick={prevMonth}>
            Previous Month
          </AppButton>
          <AppButton icon={<RightOutlined />} onClick={nextMonth}>
            Next Month
          </AppButton>
        </Space>
      </div>

      {/* Weekday Labels Header */}
      <Row gutter={[8, 8]} style={{ marginBottom: 8, textAlign: 'center', fontWeight: 700, color: token.colorTextSecondary }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Col span={3} key={day} style={{ width: '14.28%' }}>
            {day}
          </Col>
        ))}
      </Row>

      {/* Calendar Grid Cells */}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* Blank Padding for Start Day */}
        {Array.from({ length: startDayOfWeek }).map((_, idx) => (
          <div
            key={`blank-${idx}`}
            style={{
              width: '14.28%',
              height: 100,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgLayout,
              opacity: 0.5,
            }}
          />
        ))}

        {/* Days of Month */}
        {daysArray.map((dayNum) => {
          const dateStr = currentMonth.date(dayNum).format('YYYY-MM-DD');

          // Find schedule items matching departure date on this day
          const matchingSchedules = schedules.filter((s) => s.etd.startsWith(dateStr));

          return (
            <div
              key={dayNum}
              style={{
                width: '14.28%',
                height: 105,
                border: `1px solid ${token.colorBorderSecondary}`,
                padding: 6,
                background: token.colorBgContainer,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 12 }}>
                  {dayNum}
                </Text>
                {matchingSchedules.length > 0 && (
                  <Badge count={matchingSchedules.length} style={{ backgroundColor: token.colorPrimary }} />
                )}
              </div>

              <div style={{ overflowY: 'auto', marginTop: 4 }}>
                {matchingSchedules.map((sch) => (
                  <div
                    key={sch.id}
                    onClick={() => onSelectSchedule(sch)}
                    style={{
                      background: token.colorPrimaryBg,
                      color: token.colorPrimary,
                      borderRadius: 4,
                      padding: '2px 4px',
                      fontSize: 10,
                      fontWeight: 600,
                      marginBottom: 2,
                      cursor: 'pointer',
                      borderLeft: `3px solid ${token.colorPrimary}`,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={`${sch.vesselName} (${sch.serviceCode}) - ${sch.polPortId} to ${sch.podPortId}`}
                  >
                    🚢 {sch.serviceCode} - {sch.vesselCode}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
