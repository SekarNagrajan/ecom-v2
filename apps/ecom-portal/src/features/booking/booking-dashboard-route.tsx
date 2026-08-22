// Created by Antigravity (2026-08-22 10:00)
import { BookOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { AppButton } from '@solverminds/shared-ui';
import { ListView } from '@solverminds/shared-ui/data-view/list-view';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, Space, Tag, Typography } from 'antd';
import { useState } from 'react';
import { ManageTemplateModal } from './components/ManageTemplateModal';
import type { BookingListDTO } from './types/booking-list.types';

const { Title, Text } = Typography;

export function BookingDashboardRoute() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', fromDate, toDate],
    queryFn: async () => {
      const res = await fetch('/api/booking/list');
      const json = await res.json();
      return json.data as BookingListDTO[];
    }
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space align="center" size={10}>
          <BookOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
            E-BOOKING
          </Title>
        </Space>

        <Space>
          <AppButton icon={<SettingOutlined />} onClick={() => setIsTemplateModalOpen(true)}>Manage Template</AppButton>
          <AppButton type="primary" icon={<PlusOutlined />} onClick={() => navigate({ to: '/app/booking/new' })}>
            New Booking
          </AppButton>
        </Space>
      </div>





      <Card style={{ padding: 0 }} bodyStyle={{ padding: 0 }}>
        <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
          <ListView
            rowData={bookings}
            loading={isLoading}
            defaultColDef={{ filter: true }}
            columnDefs={[
              { field: 'bookingNo', headerName: 'Booking No', flex: 1 },
              { field: 'onlineRefNo', headerName: 'Online Reference Number', flex: 1 },
              { field: 'agencyRefNo', headerName: 'Agency Ref No.', flex: 1 },
              {
                field: 'status',
                headerName: 'Status',
                flex: 1,
                cellRenderer: (params: any) => {
                  const val = params.value;
                  const color = val === 'Confirmed' ? 'success' : val === 'Awaiting Acceptance' ? 'processing' : 'error';
                  return <Tag color={color}>{val}</Tag>;
                }
              },
              { field: 'origin', headerName: 'Origin', flex: 1 },
              { field: 'delivery', headerName: 'Delivery', flex: 1 },
              { field: 'createdDate', headerName: 'Created Date', flex: 1 },
              { field: 'confirmedDate', headerName: 'Confirmed Date', flex: 1 },
              { field: 'dgStatus', headerName: 'DG Status', width: 100 },
              { field: 'teusCount', headerName: 'TEUs count', width: 120 },
              { field: 'submittedDate', headerName: 'Submitted Date', flex: 1 },
            ]}
            onRowClicked={(e: any) => navigate({ to: `/app/booking/${e.data.id}` })}
          />
        </div>
      </Card>

      <ManageTemplateModal
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
      />
    </Space>
  );
}
