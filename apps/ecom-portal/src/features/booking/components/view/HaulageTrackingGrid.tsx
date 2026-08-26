// Modified by Sekar Nagarajan (2026-08-26 11:40)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import type { ColDef } from "ag-grid-community";
import { Card, Typography } from "antd";

import { AppIcon, Icons } from "../../../../components/icons";

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
  { field: "containerNo", headerName: "Container No", minWidth: 150 },
  { field: "equipmentType", headerName: "Equipment Type", minWidth: 150 },
  {
    field: "customerReference",
    headerName: "Customer Reference",
    minWidth: 180,
  },
  { field: "pickupLocationCode", headerName: "Pickup Loc Code", minWidth: 150 },
  { field: "pickupLocationName", headerName: "Pickup Loc Name", minWidth: 200 },
  { field: "stopSequence", headerName: "Stop Seq", minWidth: 100 },
  { field: "address", headerName: "Address", minWidth: 250 },
  {
    field: "tmsScheduledPickup",
    headerName: "TMS Sche. Pickup",
    minWidth: 180,
  },
  { field: "tmsActualPickup", headerName: "TMS Act. Pickup", minWidth: 180 },
  { field: "tmsScheduledDrop", headerName: "TMS Sche. Drop", minWidth: 180 },
  { field: "tmsActualDrop", headerName: "TMS Act. Drop", minWidth: 180 },
];

export function HaulageTrackingGrid({ bookingId }: HaulageTrackingGridProps) {
  const mockData: HaulageDetails[] = [
    {
      containerNo: "CMAU1234567",
      equipmentType: "40HC",
      customerReference: "REF-001",
      pickupLocationCode: "USNYC",
      pickupLocationName: "New York",
      stopSequence: "1",
      address: "123 Harbor Way, NY",
      tmsScheduledPickup: "2026-09-01 10:00",
      tmsActualPickup: "2026-09-01 10:15",
      tmsScheduledDrop: "2026-09-01 14:00",
      tmsActualDrop: "",
    },
  ];

  if (!bookingId) return null;

  return (
    <Card
      className="booking-panel"
      title={
        <span className="booking-section-title">
          <AppIcon icon={Icons.truck} size={16} />
          <Title level={5} className="booking-panel__title">
            Haulage Tracking Details
          </Title>
        </span>
      }
    >
      <div className="booking-grid-wrap responsive-table-wrap custom-scroll ag-theme-alpine">
        <ListView
          rowData={mockData}
          columnDefs={columns}
          showToolbar={false}
        />
      </div>
      <div className="booking-disclaimer">
        * Disclaimer: All haulage times are subject to local traffic and
        terminal conditions.
      </div>
    </Card>
  );
}
