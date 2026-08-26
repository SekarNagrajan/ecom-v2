// Modified by Sekar Nagarajan (2026-08-26 12:19)
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Card, Space, Tag } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../components/icons";
import { buildActionsColumn } from "../../components/shared/build-actions-column";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import {
  ListActionButton,
  ListActionsRow,
} from "../../components/shared/list-action-button";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import {
  useCancelSiMutation,
  useSiListQuery,
} from "./api/si.queries";
import { SiModuleStyles } from "./components/si-module-styles";
import { SiViewDrawer } from "./components/view/SiViewDrawer";
import type { SIListDTO } from "./types/si.types";
import { getSiStatusTagColor } from "./utils/si-status";

export function ShippingInstructionDashboardRoute() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const [selectedRecord, setSelectedRecord] = useState<SIListDTO | null>(null);

  const { data: siList = [], isLoading } = useSiListQuery();
  const cancelMutation = useCancelSiMutation();

  const openWizard = (id: string) => {
    navigate({ to: `/app/shipping-instruction/wizard/${id}` });
  };

  const handleView = (record: SIListDTO) => {
    setSelectedRecord(record);
  };

  const handleRowDoubleClick = (
    event: RowDoubleClickedEvent<SIListDTO>,
  ) => {
    const record = event.data;
    if (!record) return;
    if (record.status === "Create SI" || record.status === "Draft") {
      openWizard(record.id);
      return;
    }
    handleView(record);
  };

  const handleCancel = (record: SIListDTO) => {
    confirm.danger({
      title: "Cancel Shipping Instruction",
      content: "Are you sure you want to cancel this Shipping Instruction?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await cancelMutation.mutateAsync(record.id);
          toast.success(
            `Shipping Instruction ${record.siNo || record.id} cancelled.`,
          );
        } catch {
          toast.error("Failed to cancel Shipping Instruction.");
        }
      },
    });
  };

  return (
    <FeaturePageShell>
      <SiModuleStyles />
      <Space direction="vertical" size="large" className="feature-page-stack">
        <ModuleScreenHeader
          icon={Icons.clipboardList}
          title={MODULE_TITLES.shippingInstructions}
        />

        <Card className="si-list-card feature-page-card" bordered={false}>
          <div className="si-list-grid responsive-table-wrap custom-scroll ag-theme-alpine">
            <ListView
              rowData={siList}
              loading={isLoading}
              defaultColDef={{ filter: true }}
              columnDefs={[
                buildActionsColumn<SIListDTO>({
                  field: "id",
                  width: 150,
                  cellRenderer: (params: { data?: SIListDTO }) => {
                    const data = params.data;
                    if (!data) return null;
                    return (
                      <ListActionsRow>
                        {data.status === "Accepted" ? (
                          <ListActionButton
                            title="Locked"
                            icon={
                              <AppIcon
                                icon={Icons.lock}
                                size={16}
                                tone="muted"
                              />
                            }
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          />
                        ) : null}

                        {data.status === "Create SI" ? (
                          <ListActionButton
                            title="Create SI"
                            icon={
                              <AppIcon
                                icon={Icons.plus}
                                size={16}
                                tone="create"
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              openWizard(data.id);
                            }}
                          />
                        ) : null}

                        {data.status === "Draft" ? (
                          <ListActionButton
                            title="Edit Draft"
                            icon={
                              <AppIcon
                                icon={Icons.edit}
                                size={16}
                                tone="edit"
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              openWizard(data.id);
                            }}
                          />
                        ) : null}

                        {["Submitted", "Accepted", "Declined"].includes(
                          data.status,
                        ) ? (
                          <ListActionButton
                            title="View Details"
                            icon={
                              <AppIcon
                                icon={Icons.eye}
                                size={16}
                                tone="view"
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(data);
                            }}
                          />
                        ) : null}

                        {data.status === "Submitted" ? (
                          <ListActionButton
                            title="Edit SI"
                            icon={
                              <AppIcon
                                icon={Icons.edit}
                                size={16}
                                tone="edit"
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              openWizard(data.id);
                            }}
                          />
                        ) : null}

                        {data.status === "Declined" ||
                        data.blStatus === "Cancelled" ? (
                          <ListActionButton
                            title="Resubmit"
                            icon={
                              <AppIcon
                                icon={Icons.refreshCw}
                                size={16}
                                tone="history"
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              if (data.status === "Declined") {
                                confirm.warning({
                                  title: "Carrier Remarks",
                                  content:
                                    "Please review and correct the reported discrepancies before resubmitting.",
                                  onOk: () => openWizard(data.id),
                                });
                              } else {
                                openWizard(data.id);
                              }
                            }}
                          />
                        ) : null}

                        {data.status === "Submitted" ? (
                          <ListActionButton
                            title="Cancel SI"
                            icon={
                              <AppIcon
                                icon={Icons.circleX}
                                size={16}
                                tone="reject"
                              />
                            }
                            danger
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(data);
                            }}
                          />
                        ) : null}
                      </ListActionsRow>
                    );
                  },
                }),
                {
                  field: "status",
                  headerName: "Status",
                  cellRenderer: (params: { value?: string }) => (
                    <Tag color={getSiStatusTagColor(params.value ?? "")}>
                      {params.value}
                    </Tag>
                  ),
                },
                { field: "bookingNo", headerName: "Booking No" },
                { field: "blNo", headerName: "B/L No" },
                { field: "siNo", headerName: "SI No" },
                { field: "agencyRefNo", headerName: "Agency Ref No" },
                { field: "origin", headerName: "Origin" },
                { field: "delivery", headerName: "Delivery" },
                { field: "createdDate", headerName: "Created Date" },
                { field: "submittedDate", headerName: "Submitted Date" },
              ]}
              gridOptions={{
                onRowDoubleClicked: handleRowDoubleClick,
              }}
            />
          </div>
        </Card>

        {selectedRecord ? (
          <SiViewDrawer
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        ) : null}
      </Space>
    </FeaturePageShell>
  );
}
