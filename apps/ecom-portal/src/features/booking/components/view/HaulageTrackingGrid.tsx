// Modified by Sekar Nagarajan (2026-09-01 12:22)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import type { DataViewColumn } from "@solverminds/shared-ui/data-view";
import { Card, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { ModuleEmptyState } from "../../../../components/shared/module-empty-state";

const { Title } = Typography;

interface HaulageTrackingGridProps {
  bookingId?: string;
}

interface HaulageDetails {
  id: string;
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

export function HaulageTrackingGrid({ bookingId }: HaulageTrackingGridProps) {
  const { t } = useTranslation("booking");

  const columns = useMemo<DataViewColumn<HaulageDetails>[]>(
    () => [
      { field: "containerNo", headerName: t("haulage.columns.containerNo"), minWidth: 150 },
      { field: "equipmentType", headerName: t("haulage.columns.equipmentType"), minWidth: 150 },
      {
        field: "customerReference",
        headerName: t("haulage.columns.customerReference"),
        minWidth: 180,
      },
      { field: "pickupLocationCode", headerName: t("haulage.columns.pickupLocCode"), minWidth: 150 },
      { field: "pickupLocationName", headerName: t("haulage.columns.pickupLocName"), minWidth: 200 },
      { field: "stopSequence", headerName: t("haulage.columns.stopSeq"), minWidth: 100 },
      { field: "address", headerName: t("haulage.columns.address"), minWidth: 250 },
      {
        field: "tmsScheduledPickup",
        headerName: t("haulage.columns.tmsSchePickup"),
        minWidth: 180,
      },
      { field: "tmsActualPickup", headerName: t("haulage.columns.tmsActPickup"), minWidth: 180 },
      { field: "tmsScheduledDrop", headerName: t("haulage.columns.tmsScheDrop"), minWidth: 180 },
      { field: "tmsActualDrop", headerName: t("haulage.columns.tmsActDrop"), minWidth: 180 },
    ],
    [t],
  );
  // Mock until haulage REST exists — keyed by bookingId for stable remounts
  const mockData: HaulageDetails[] = bookingId
    ? [
        {
          id: `${bookingId}-haul-1`,
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
        {
          id: `${bookingId}-haul-2`,
          containerNo: "CMAU7654321",
          equipmentType: "20DV",
          customerReference: "REF-002",
          pickupLocationCode: "USNYC",
          pickupLocationName: "New York",
          stopSequence: "2",
          address: "45 Pier Street, NY",
          tmsScheduledPickup: "2026-09-01 11:00",
          tmsActualPickup: "",
          tmsScheduledDrop: "2026-09-01 16:00",
          tmsActualDrop: "",
        },
      ]
    : [];

  if (!bookingId) return null;

  return (
    <div className="booking-view-row">
      <Card
        className="booking-panel"
        title={
          <span className="booking-section-title">
            <AppIcon icon={Icons.truck} size={16} />
            <Title level={5} className="booking-panel__title">
              {t("haulage.title")}
            </Title>
          </span>
        }
      >
        <div className="booking-haulage-grid responsive-table-wrap custom-scroll ag-theme-alpine">
          <ListView
            rowData={mockData}
            columnDefs={columns}
            emptyState={
              <ModuleEmptyState
                variant="blank"
                title={t("haulage.emptyTitle")}
                message={t("haulage.emptyMessage")}
              />
            }
            showToolbar={false}
            sideBar={false}
            pagination
            paginationPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            gridOptions={{
              animateRows: true,
              getRowId: (params) => params.data.id,
            }}
          />
        </div>
        <div className="booking-disclaimer">
          {t("haulage.disclaimer")}
        </div>
      </Card>
    </div>
  );
}
