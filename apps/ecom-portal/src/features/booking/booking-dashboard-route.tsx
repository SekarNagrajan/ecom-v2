// Modified by Sekar Nagarajan (2026-09-15 11:40)
import { AppButton } from "@solverminds/shared-ui";
import {
  DataView,
  type DataViewColumn,
} from "@solverminds/shared-ui/data-view";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { RowDoubleClickedEvent } from "ag-grid-community";
import { Card, Dropdown, Space, Tag } from "antd";
import { useCallback, useMemo, useState } from "react";

import { AppIcon, Icons } from "../../components/icons";
import { NavBookingIcon } from "../../components/icons/nav-svg-icons";
import { buildActionsColumn } from "../../components/shared/build-actions-column";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { useModuleCardPagination } from "../../components/shared/hooks/use-module-card-pagination";
import { useModuleViewMode } from "../../components/shared/hooks/use-module-view-mode";
import {
  ListActionButton,
  ListActionsRow,
} from "../../components/shared/list-action-button";
import { ModuleCardViewPanel } from "../../components/shared/module-card-view-panel";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import { bookingApi } from "./api/booking.api";
import { bookingKeys } from "./api/booking.keys";
import { BookingModuleStyles } from "./components/booking-module-styles";
import { BookingListCard } from "./components/list/booking-list-card";
import { ManageTemplateModal } from "./components/ManageTemplateModal";
import { BookingViewDrawer } from "./components/view/BookingViewDrawer";
import { useBookingStore } from "./stores/booking.store";
import type { BookingListDTO } from "./types/booking-list.types";
import { getBookingListStatusColor } from "./types/booking-list.types";

const VIEW_MODE_KEY = "ecom.booking.viewMode";

export function BookingDashboardRoute() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingListDTO | null>(
    null,
  );
  const { viewMode, setViewMode } = useModuleViewMode(VIEW_MODE_KEY);
  const {
    page: cardPage,
    pageSize: cardPageSize,
    onPaginationChange: onCardPaginationChange,
  } = useModuleCardPagination();

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: bookingKeys.list(),
    queryFn: async () => {
      const res = await fetch("/api/booking/list");
      const json = await res.json();
      return json.data as BookingListDTO[];
    },
  });

  const handleView = useCallback((booking: BookingListDTO) => {
    setSelectedBooking(booking);
  }, []);

  const handleAmend = useCallback(
    (booking: BookingListDTO) => {
      navigate({ to: `/app/booking/${booking.id}/amend` });
    },
    [navigate],
  );

  const handleDuplicate = useCallback(
    async (booking: BookingListDTO) => {
      try {
        const payload = await bookingApi.getBookingById(booking.id);
        useBookingStore.getState().initializeFromBooking(payload);
        toast.success(`Duplicated booking ${booking.bookingNo}`);
        navigate({ to: "/app/booking/new" });
      } catch {
        toast.error(`Failed to duplicate booking ${booking.bookingNo}`);
      }
    },
    [navigate, toast],
  );

  const handleDownloadPdf = useCallback(
    async (booking: BookingListDTO) => {
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
    },
    [toast],
  );

  const handleCancel = useCallback(
    (booking: BookingListDTO) => {
      confirm.danger({
        title: "Cancel Booking",
        content: "Are you sure you want to cancel this booking?",
        okText: "Yes",
        cancelText: "No",
        onOk: async () => {
          try {
            await bookingApi.cancelBooking(booking.id);
            await queryClient.invalidateQueries({ queryKey: ["bookings"] });
            await queryClient.invalidateQueries({
              queryKey: bookingKeys.list(),
            });
            toast.success(`Booking ${booking.bookingNo} cancelled.`);
          } catch {
            toast.error(`Failed to cancel booking ${booking.bookingNo}.`);
          }
        },
      });
    },
    [confirm, queryClient, toast],
  );

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title="Couldn't load bookings"
      message="The request didn't complete. Check your connection and try again."
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="blank"
      title="No bookings yet"
      message="Create a booking to start managing your shipments."
    />
  );

  const columnDefs = useMemo<DataViewColumn<BookingListDTO>[]>(
    () => [
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
                icon={<AppIcon icon={Icons.eye} size={16} tone="view" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(record);
                }}
              />
              <ListActionButton
                title="Amendment (Edit)"
                icon={<AppIcon icon={Icons.edit} size={16} tone="edit" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAmend(record);
                }}
              />
              <ListActionButton
                title="Duplicate Booking"
                icon={<AppIcon icon={Icons.copy} size={16} tone="create" />}
                tone="create"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDuplicate(record);
                }}
              />
              <ListActionButton
                title="Download PDF"
                icon={
                  <AppIcon icon={Icons.fileText} size={16} tone="download" />
                }
                tone="download"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleDownloadPdf(record);
                }}
              />
              <ListActionButton
                title="Cancel Booking"
                icon={<AppIcon icon={Icons.circleX} size={16} tone="reject" />}
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
      {
        field: "bookingNo",
        headerName: "Booking No",
        minWidth: 140,
        flex: 1.1,
        isPrimary: true,
      },
      {
        field: "onlineRefNo",
        headerName: "Online Ref",
        minWidth: 130,
        flex: 1,
      },
      {
        field: "agencyRefNo",
        headerName: "Agency Ref",
        minWidth: 120,
        flex: 1,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        width: 150,
        flex: 0,
        cellRenderer: (params: { value?: string }) => {
          const val = params.value as BookingListDTO["status"] | undefined;
          return (
            <Tag
              className="booking-list-status-tag module-status-tag"
              color={val ? getBookingListStatusColor(val) : "default"}
            >
              {val}
            </Tag>
          );
        },
      },
      {
        field: "origin",
        headerName: "Origin",
        minWidth: 120,
        flex: 1,
        isSecondary: true,
      },
      { field: "delivery", headerName: "Delivery", minWidth: 120, flex: 1 },
      { field: "createdDate", headerName: "Created", minWidth: 110, flex: 0.9 },
      {
        field: "confirmedDate",
        headerName: "Confirmed",
        minWidth: 110,
        flex: 0.9,
      },
      {
        field: "dgStatus",
        headerName: "DG",
        width: 80,
        maxWidth: 90,
        cellClass: "booking-list-cell--center",
      },
      {
        field: "teusCount",
        headerName: "TEUs",
        width: 90,
        maxWidth: 100,
        cellClass: "booking-list-cell--center",
      },
      {
        field: "submittedDate",
        headerName: "Submitted",
        minWidth: 110,
        flex: 0.9,
      },
    ],
    [handleAmend, handleCancel, handleDownloadPdf, handleDuplicate, handleView],
  );

  const renderCard = useCallback(
    (item: BookingListDTO, state: { isSelected: boolean }) => (
      <BookingListCard
        booking={item}
        isSelected={state.isSelected}
        onView={handleView}
        onAmend={handleAmend}
        onDuplicate={handleDuplicate}
        onDownloadPdf={handleDownloadPdf}
        onCancel={handleCancel}
      />
    ),
    [handleAmend, handleCancel, handleDownloadPdf, handleDuplicate, handleView],
  );

  return (
    <FeaturePageShell>
      <BookingModuleStyles />
      <Card className="feature-page-card booking-page-card" bordered={false}>
        <div className="booking-page-layout">
          <div className="booking-page-header">
            <ModuleScreenHeader
              icon={NavBookingIcon}
              title={MODULE_TITLES.booking}
              recordCount={bookings.length}
              subtitle="Create and manage bookings, amend drafts, and track confirmation status."
              marginBottom={0}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              viewModePlacement="after"
              extra={
                <Space wrap align="center" className="custom-scroll">
                  <AppButton
                    icon={<AppIcon icon={Icons.settings} size={16} />}
                    onClick={() => setIsTemplateModalOpen(true)}
                  >
                    Manage Template
                  </AppButton>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "new-booking",
                          label: "New Booking",
                          icon: <AppIcon icon={Icons.plus} size={16} />,
                          onClick: () => {
                            useBookingStore.getState().resetWizard();
                            navigate({ to: "/app/booking/new" });
                          },
                        },
                        {
                          key: "import-booking",
                          label: "Import Booking",
                          icon: <AppIcon icon={Icons.upload} size={16} />,
                          onClick: () => {
                            navigate({ to: "/app/booking/import" });
                          },
                        },
                      ],
                    }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <AppButton
                      type="primary"
                      icon={<AppIcon icon={Icons.plus} size={16} />}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        New Booking
                        <AppIcon icon={Icons.chevronDown} size={14} />
                      </span>
                    </AppButton>
                  </Dropdown>
                </Space>
              }
            />
          </div>

          <div className="booking-grid-wrap booking-grid-wrap--no-toolbar">
            <div className="booking-list-grid responsive-table-wrap custom-scroll ag-theme-alpine">
              {isError && bookings.length === 0 && !isLoading ? (
                emptyState
              ) : (
                <ModuleCardViewPanel active={viewMode === "card"}>
                  <DataView
                    key={viewMode}
                    rowData={bookings}
                    loading={isLoading}
                    emptyState={emptyState}
                    columnDefs={columnDefs}
                    defaultViewMode={viewMode}
                    allowedViewModes={["list", "card"]}
                    onViewModeChange={setViewMode}
                    renderToolbar={() => null}
                    className="booking-data-view"
                    listOptions={{
                      showToolbar: false,
                      sideBar: false,
                      defaultColDef: { filter: true },
                      gridOptions: {
                        getRowId: (params) => params.data.id,
                        onRowDoubleClicked: (
                          event: RowDoubleClickedEvent<BookingListDTO>,
                        ) => {
                          if (event.data) handleView(event.data);
                        },
                      },
                    }}
                    cardOptions={{
                      renderCard,
                      minCardWidth: 360,
                      paginationMode: "pagination",
                      page: cardPage,
                      pageSize: cardPageSize,
                      totalCount: bookings.length,
                      onPaginationChange: onCardPaginationChange,
                      enableLongPressSelection: false,
                      surfacePadding: 16,
                      gutter: [16, 16],
                      surfaceBackground: "transparent",
                    }}
                  />
                </ModuleCardViewPanel>
              )}
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
