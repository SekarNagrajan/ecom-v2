// Created by Antigravity (2026-08-22 10:25)
import { Card, Typography, Space, theme } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import { BookingDetailsViewer } from './components/view/BookingDetailsViewer';
import { HaulageTrackingGrid } from './components/view/HaulageTrackingGrid';

const { Title } = Typography;

export function BookingViewRoute() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  
  // Note: useParams requires generic typed route matching in TanStack, 
  // but for this manual setup we use strict false or extract from props if provided.
  // We'll use a mocked hook or useParams with strict false.
  const { bookingId } = useParams({ strict: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Card style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={10}>
            <BookOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              VIEW BOOKING: {bookingId}
            </Title>
          </Space>
          <Space>
            <AppButton onClick={() => navigate({ to: '/app/booking' })}>Back to Dashboard</AppButton>
            <AppButton type="primary" onClick={() => navigate({ to: `/app/booking/${bookingId}/amend` })}>
              Amend Booking
            </AppButton>
          </Space>
        </div>
      </Card>

      <BookingDetailsViewer bookingId={bookingId} />
      <HaulageTrackingGrid bookingId={bookingId} />
    </div>
  );
}
