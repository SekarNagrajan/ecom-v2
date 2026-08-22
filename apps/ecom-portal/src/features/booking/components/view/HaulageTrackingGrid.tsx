// Created by Antigravity (2026-08-22 10:25)
import { Card, Typography, theme } from 'antd';
import { ListView } from '@solverminds/shared-ui/data-view/list-view';
import type { ColDef } from 'ag-grid-community';

const { Title } = Typography;

interface HaulageTrackingGridProps {
  bookingId?: string;
}

interface HaulageDetails {
  containerNo: string;
  equipmentType: string;
  customerReference: string;
  pickupLocationCode: string;
  pickupLocationName: string;
  stopSequence: string;
  address: string;
  tmsScheduledPickup: string;
  tmsActualPickup: string;
  tmsScheduledDrop: string;
  tmsActualDrop: string;
}

const columns: ColDef[] = [
  { field: 'containerNo', headerName: 'Container No', minWidth: 150 },
  { field: 'equipmentType', headerName: 'Equipment Type', minWidth: 150 },
  { field: 'customerReference', headerName: 'Customer Reference', minWidth: 180 },
  { field: 'pickupLocationCode', headerName: 'Pickup Loc Code', minWidth: 150 },
  { field: 'pickupLocationName', headerName: 'Pickup Loc Name', minWidth: 200 },
  { field: 'stopSequence', headerName: 'Stop Seq', minWidth: 100 },
  { field: 'address', headerName: 'Address', minWidth: 250 },
  { field: 'tmsScheduledPickup', headerName: 'TMS Sche. Pickup', minWidth: 180 },
  { field: 'tmsActualPickup', headerName: 'TMS Act. Pickup', minWidth: 180 },
  { field: 'tmsScheduledDrop', headerName: 'TMS Sche. Drop', minWidth: 180 },
  { field: 'tmsActualDrop', headerName: 'TMS Act. Drop', minWidth: 180 },
];

export function HaulageTrackingGrid({ bookingId }: HaulageTrackingGridProps) {
  const { token } = theme.useToken();
  
  // Mock data representing the payload from the legacy BookingHaulageDetails
  const mockData: HaulageDetails[] = [
    {
      containerNo: 'CMAU1234567',
      equipmentType: '40HC',
      customerReference: 'REF-001',
      pickupLocationCode: 'USNYC',
      pickupLocationName: 'New York',
      stopSequence: '1',
      address: '123 Harbor Way, NY',
      tmsScheduledPickup: '2026-09-01 10:00',
      tmsActualPickup: '2026-09-01 10:15',
      tmsScheduledDrop: '2026-09-01 14:00',
      tmsActualDrop: '',
    }
  ];

  if (!bookingId) return null;

  return (
    <Card title={<Title level={5} style={{ margin: 0 }}>Haulage Tracking Details</Title>} style={{ marginBottom: 24 }}>
      <div style={{ height: 300 }} className="ag-theme-alpine">
        <ListView
          rowData={mockData}
          columnDefs={columns}
          style={{ height: '100%', border: `1px solid ${token.colorBorderSecondary}` }}
        />
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: token.colorTextSecondary }}>
        * Disclaimer: All haulage times are subject to local traffic and terminal conditions.
      </div>
    </Card>
  );
}
