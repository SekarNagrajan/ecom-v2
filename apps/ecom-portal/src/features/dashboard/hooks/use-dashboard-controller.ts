// Modified by Sekar Nagarajan (2026-09-08 12:27)
/**
 * Dashboard controller — enhancedDashboard.jsp parity.
 * Loads summary via dashboardApi (mock until REST facade exists).
 */
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import type { BLListDTO } from "../../bill-of-lading/types/bl.types";
import type { BookingListDTO } from "../../booking/types/booking-list.types";
import {
  dashboardApi,
  type DashboardShipment,
  type DashboardSummaryResponse,
} from "../api/dashboard.api";
import type { PlanningDaySelection } from "../mocks/dashboard.mock";
import { getDashboardFilterLabel } from "../utils/filter-dashboard-shipments";
import { mapDashboardShipmentToBlList } from "../utils/map-dashboard-shipment-to-bl";
import { mapDashboardShipmentToBookingList } from "../utils/map-dashboard-shipment-to-booking";

const ONGOING_TRANSACTIONS_ANCHOR_ID = "dashboard-ongoing-transactions";

function formatDashboardPort(
  portId?: string,
  portDesc?: string,
): string | undefined {
  if (portId && portDesc) return `${portId} - ${portDesc}`;
  return portId || portDesc || undefined;
}

function scrollToOngoingTransactions() {
  const panel = document.getElementById(ONGOING_TRANSACTIONS_ANCHOR_ID);
  panel?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function useDashboardController() {
  const navigate = useNavigate();
  const toast = useToast();

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterLabel, setFilterLabel] = useState("Total Shipments");
  const [trendPeriod, setTrendPeriod] = useState("Monthly");
  // Modified by Sekar Nagarajan (2026-09-01 12:45) — booking view drawer from ongoing table
  const [selectedBooking, setSelectedBooking] = useState<BookingListDTO | null>(
    null,
  );
  // Modified by Sekar Nagarajan (2026-09-01 12:52) — BL view drawer from ongoing table
  const [selectedBl, setSelectedBl] = useState<BLListDTO | null>(null);
  // Modified by Sekar Nagarajan (2026-09-07 18:42) — planning calendar day bookings
  const [planningDay, setPlanningDay] = useState<PlanningDaySelection | null>(
    null,
  );

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch {
      toast.error("Failed to load dashboard summary");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  // Modified by Sekar Nagarajan (2026-09-08 12:27) — all KPI clicks filter + scroll to ongoing
  const handleFilterChange = (filter: string, label: string) => {
    setActiveFilter(filter);
    setFilterLabel(label || getDashboardFilterLabel(filter));
    requestAnimationFrame(() => {
      scrollToOngoingTransactions();
    });
  };

  const handleViewShipments = () => {
    handleFilterChange("all", "Total Shipments");
  };

  const handleViewBooking = (shipment: DashboardShipment) => {
    if (!shipment.bookNo) {
      toast.error("Booking number is missing.");
      return;
    }
    setSelectedBl(null);
    setPlanningDay(null);
    setSelectedBooking(mapDashboardShipmentToBookingList(shipment));
  };

  const handleCloseBookingDrawer = () => {
    setSelectedBooking(null);
  };

  const handleViewBl = (shipment: DashboardShipment) => {
    if (!shipment.blNo) {
      toast.error("Bill of Lading number is missing.");
      return;
    }
    setSelectedBooking(null);
    setPlanningDay(null);
    setSelectedBl(mapDashboardShipmentToBlList(shipment));
  };

  const handleCloseBlDrawer = () => {
    setSelectedBl(null);
  };

  const handlePlanningDayClick = (selection: PlanningDaySelection) => {
    if (selection.bookings.length === 0) return;
    setSelectedBl(null);
    if (selection.bookings.length === 1) {
      setPlanningDay(null);
      setSelectedBooking(selection.bookings[0]);
      return;
    }
    setSelectedBooking(null);
    setPlanningDay(selection);
  };

  const handleClosePlanningDayDrawer = () => {
    setPlanningDay(null);
  };

  const handleViewPlanningBooking = (booking: BookingListDTO) => {
    setPlanningDay(null);
    setSelectedBl(null);
    setSelectedBooking(booking);
  };

  // Modified by Sekar Nagarajan (2026-09-01 12:41) — open Create SI wizard with selected row seed
  const handleCreateSi = (shipment: DashboardShipment) => {
    if (!shipment.bookNo) {
      toast.error("Booking number is missing.");
      return;
    }
    navigate({
      to: `/app/shipping-instruction/wizard/${shipment.bookNo}` as never,
      search: {
        fromDashboard: true,
        onlineRefNo: shipment.onlineRefNo || undefined,
        origin: formatDashboardPort(
          shipment.originPortId,
          shipment.originPortDesc,
        ),
        delivery: formatDashboardPort(
          shipment.finalPortId,
          shipment.finalPortDesc,
        ),
        containerNo: shipment.containerNo || undefined,
        blNo: shipment.blNo || undefined,
      } as never,
    });
  };

  const handleCreateBooking = () => {
    navigate({ to: "/app/booking/new" as never });
  };

  const handleViewAllPlanning = () => {
    navigate({ to: "/app/booking" as never });
  };

  return {
    summary,
    isLoading,
    activeFilter,
    filterLabel,
    trendPeriod,
    setTrendPeriod,
    selectedBooking,
    selectedBl,
    planningDay,
    loadSummary,
    handleFilterChange,
    handleViewShipments,
    handleViewBooking,
    handleCloseBookingDrawer,
    handleViewBl,
    handleCloseBlDrawer,
    handlePlanningDayClick,
    handleClosePlanningDayDrawer,
    handleViewPlanningBooking,
    handleCreateSi,
    handleCreateBooking,
    handleViewAllPlanning,
  };
}
