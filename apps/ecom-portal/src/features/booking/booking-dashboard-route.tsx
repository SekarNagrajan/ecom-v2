// Modified by Sekar Nagarajan (2026-08-31 18:52)
import { AppButton } from "@solverminds/shared-ui";
import { ListView } from "@solverminds/shared-ui/data-view/list-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { bookingApi } from "./api/booking.api";
import { bookingKeys } from "./api/booking.keys";
import { BookingModuleStyles } from "./components/booking-module-styles";
import { ManageTemplateModal } from "./components/ManageTemplateModal";
import { BookingViewDrawer } from "./components/view/BookingViewDrawer";
import { useBookingStore } from "./stores/booking.store";
import type { BookingListDTO } from "./types/booking-list.types";
import { getBookingListStatusColor } from "./types/booking-list.types";

export function BookingDashboardRoute() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingListDTO | null>(
    null,
  );

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: bookingKeys.list(),
    queryFn: async () => {
      const res = await fetch("/api/booking/list");
      const json = await res.json();
      return json.data as BookingListDTO[];
    },
  });

  const handleView = (booking: BookingListDTO) => {
    setSelectedBooking(booking);
  };

  const handleAmend = (booking: BookingListDTO) => {
    navigate({ to: `/app/booking/${booking.id}/amend` });
  };

  const handleDuplicate = async (booking: BookingListDTO) => {
    try {
      const payload = await bookingApi.getBookingById(booking.id);
      useBookingStore.getState().initializeFromBooking(payload);
      toast.success(`Duplicated booking ${booking.bookingNo}`);
      navigate({ to: "/app/booking/new" });
    } catch {
      toast.error(`Failed to duplicate booking ${booking.bookingNo}`);
    }
  };

  const handleDownloadPdf = async (booking: BookingListDTO) => {
    try {
      const blob = await bookingApi.downloadBookingPdf(booking.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `booking-${booking.id}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded PDF for ${booking.bookingNo}`);
    } catch {
      toast.error(`Failed to download PDF for ${booking.bookingNo}`);
    }
  };

  const handleCancel = (booking: BookingListDTO) => {
    confirm.danger({
      title: "Cancel Booking",
      content: "Are you sure you want to cancel this booking?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await bookingApi.cancelBooking(booking.id);
          await queryClient.invalidateQueries({ queryKey: ["bookings"] });
          await queryClient.invalidateQueries({ queryKey: bookingKeys.list() });
          toast.success(`Booking ${booking.bookingNo} cancelled.`);
        } catch {
          toast.error(`Failed to cancel booking ${booking.bookingNo}.`);
        }
      },
    });
  };

  return (
    <FeaturePageShell>
      <BookingModuleStyles />
      <Card className="feature-page-card booking-page-card" bordered={false}>
        <div className="booking-page-layout">
          <div className="booking-page-header">
            <ModuleScreenHeader
              icon={Icons.bookOpen}
              title={MODULE_TITLES.booking}
              subtitle="Create and manage bookings, amend drafts, and track confirmation status."
              marginBottom={0}
              extra={
                <Space wrap className="custom-scroll">
                  <AppButton
                    icon={<AppIcon icon={Icons.settings} size={16} />}
                    onClick={() => setIsTemplateModalOpen(true)}
                  >
                    Manage Template
                  </AppButton>
                  <AppButton
                    type="primary"
                    icon={<AppIcon icon={Icons.plus} size={16} />}
                    onClick={() => navigate({ to: "/app/booking/new" })}
                  >
                    New Booking
                  </AppButton>
                </Space>
              }
            />
          </div>

          <div className="booking-grid-wrap">
            <div className="booking-list-grid responsive-table-wrap custom-scroll ag-theme-alpine">
              <ListView
                rowData={bookings}
                loading={isLoading}
                defaultColDef={{ filter: true }}
                columnDefs={[
                  buildActionsColumn<BookingListDTO>({
                    field: "id",
                    width: 210,
                    cellRenderer: (params: { data?: BookingListDTO }) => {
                      const record = params.data;
                      if (!record) return null;
                      return (
                        <ListActionsRow>
                          <ListActionButton
                            title="View Booking"
                            icon={
                              <AppIcon icon={Icons.eye} size={16} tone="view" />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(record);
                            }}
                          />
                          <ListActionButton
                            title="Amendment (Edit)"
                            icon={
                              <AppIcon
                                icon={Icons.edit}
                                size={16}
                                tone="edit"
                              />
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAmend(record);
                            }}
                          />
                          <ListActionButton
                            title="Duplicate Booking"
                            icon={
                              <AppIcon
                                icon={Icons.copy}
                                size={16}
                                tone="create"
                              />
                            }
                            tone="create"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDuplicate(record);
                            }}
                          />
                          <ListActionButton
                            title="Download PDF"
                            icon={
                              <AppIcon
                                icon={Icons.download}
                                size={16}
                                tone="download"
                              />
                            }
                            tone="download"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDownloadPdf(record);
                            }}
                          />
                          <ListActionButton
                            title="Cancel Booking"
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
                              handleCancel(record);
                            }}
                          />
                        </ListActionsRow>
                      );
                    },
                  }),
                  { field: "bookingNo", headerName: "Booking No", flex: 1 },
                  {
                    field: "onlineRefNo",
                    headerName: "Online Reference Number",
                    flex: 1,
                  },
                  {
                    field: "agencyRefNo",
                    headerName: "Agency Ref No.",
                    flex: 1,
                  },
                  {
                    field: "status",
                    headerName: "Status",
                    flex: 1,
                    cellRenderer: (params: { value?: string }) => {
                      const val = params.value as
                        | BookingListDTO["status"]
                        | undefined;
                      return (
                        <Tag
                          color={
                            val ? getBookingListStatusColor(val) : "default"
                          }
                        >
                          {val}
                        </Tag>
                      );
                    },
                  },
                  { field: "origin", headerName: "Origin", flex: 1 },
                  { field: "delivery", headerName: "Delivery", flex: 1 },
                  { field: "createdDate", headerName: "Created Date", flex: 1 },
                  {
                    field: "confirmedDate",
                    headerName: "Confirmed Date",
                    flex: 1,
                  },
                  { field: "dgStatus", headerName: "DG Status", width: 100 },
                  { field: "teusCount", headerName: "TEUs count", width: 120 },
                  {
                    field: "submittedDate",
                    headerName: "Submitted Date",
                    flex: 1,
                  },
                ]}
                gridOptions={{
                  onRowDoubleClicked: (
                    event: RowDoubleClickedEvent<BookingListDTO>,
                  ) => {
                    if (event.data) handleView(event.data);
                  },
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      <ManageTemplateModal
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
      />

      {selectedBooking ? (
        <BookingViewDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      ) : null}
    </FeaturePageShell>
  );
}
