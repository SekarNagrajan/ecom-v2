// Modified by Sekar Nagarajan (2026-10-19 12:10)
// Schedule Feature Controller — results only after Search (or landing deep-link)

import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useBookingStore } from "../../booking/stores/booking.store";
import { buildMasterDetailsFromSchedule } from "../../booking/utils/map-schedule-to-master-details";
import { schedulesApi } from "../api/schedules.api";
import type {
  ScheduleItem,
  ScheduleSearchParams,
  VesselParticulars,
} from "../types/schedules.types";
import { downloadSchedulesCsv } from "../utils/schedule-export";
import { useScheduleViewMode } from "./use-schedule-view-mode";

function readDeepLinkSearchParams(): ScheduleSearchParams | null {
  const searchParams = new URLSearchParams(window.location.search);
  const pol = searchParams.get("pol");
  const pod = searchParams.get("pod");
  const vessel = searchParams.get("vessel");
  const port = searchParams.get("port");

  // Idle until the user searches — only auto-run when a deep link carries criteria.
  if (!pol && !pod && !vessel && !port) {
    return null;
  }

  if (vessel) {
    return {
      searchType: "VESSEL_SCHEDULE",
      vesselCode: vessel,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
    };
  }

  if (port && !pol && !pod) {
    return {
      searchType: "PORT_SCHEDULE",
      portCode: port,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
    };
  }

  return {
    searchType: "POINT_TO_POINT",
    polCode: pol || undefined,
    podCode: pod || undefined,
    fromDate: searchParams.get("fromDate") || undefined,
    toDate: searchParams.get("toDate") || undefined,
  };
}

export function useSchedulesController() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation("schedules");

  const { viewMode, setViewMode } = useScheduleViewMode();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  /** Criteria the page was opened with (landing search / deep link); the filter form mirrors them. */
  const [initialParams] = useState<ScheduleSearchParams | null>(() =>
    readDeepLinkSearchParams(),
  );

  const [selectedVessel, setSelectedVessel] =
    useState<VesselParticulars | null>(null);
  const [isVesselModalOpen, setIsVesselModalOpen] = useState(false);

  const [ratesSchedule, setRatesSchedule] = useState<ScheduleItem | null>(null);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);

  const [carbonSchedule, setCarbonSchedule] = useState<ScheduleItem | null>(
    null,
  );
  const [isCarbonModalOpen, setIsCarbonModalOpen] = useState(false);
  const [isShareMailOpen, setIsShareMailOpen] = useState(false);

  async function fetchSchedules(params: ScheduleSearchParams) {
    setHasSearched(true);
    setIsLoading(true);
    try {
      const data = await schedulesApi.searchSchedules(params);
      setSchedules(data);
    } catch {
      toast.error("Failed to load vessel schedules");
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!initialParams) {
      return;
    }
    void fetchSchedules(initialParams);
    // Deep-link bootstrap only — intentional mount-once sync with URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount deep-link only
  }, []);

  const handleSearch = (params: ScheduleSearchParams) => {
    void fetchSchedules(params);
  };

  const handleResetSearch = () => {
    setHasSearched(false);
    setSchedules([]);
    setIsLoading(false);
  };

  const handleViewVessel = async (vesselCode: string) => {
    const vessel = await schedulesApi.getVesselDetails(vesselCode);
    setSelectedVessel(vessel);
    setIsVesselModalOpen(true);
  };

  const handleCloseVesselModal = () => {
    setIsVesselModalOpen(false);
    setSelectedVessel(null);
  };

  const handleOpenRates = (schedule: ScheduleItem) => {
    setRatesSchedule(schedule);
    setIsRatesModalOpen(true);
  };

  const handleCloseRates = () => {
    setIsRatesModalOpen(false);
    setRatesSchedule(null);
  };

  const handleOpenCarbon = (schedule: ScheduleItem) => {
    setCarbonSchedule(schedule);
    setIsCarbonModalOpen(true);
  };

  const handleCloseCarbon = () => {
    setIsCarbonModalOpen(false);
    setCarbonSchedule(null);
  };

  const handleBookNow = (schedule: ScheduleItem) => {
    // Same gate as card / rates-drawer Book Now (cut-off or sailed → blocked).
    if (!schedule.bookingAllowed) {
      toast.warning(t("bookingNotAllowedToast"));
      return;
    }
    // Fresh wizard seeded from the chosen sailing (list / rates drawer Book Now).
    const store = useBookingStore.getState();
    store.resetWizard();
    store.updateMasterDetails(buildMasterDetailsFromSchedule(schedule));
    toast.success(
      t("bookNowToast", {
        vessel: schedule.vesselName,
        voyage: schedule.voyage,
        pol: schedule.polPortId,
        pod: schedule.podPortId,
      }),
    );
    navigate({ to: "/app/booking/new" });
  };

  const handleShareResultsViaMail = () => {
    if (!hasSearched || schedules.length === 0) {
      toast.warning(
        "Search for sailings first, then share the results by email.",
      );
      return;
    }
    setIsShareMailOpen(true);
  };

  const handleCloseShareMail = () => {
    setIsShareMailOpen(false);
  };

  const handleExport = () => {
    if (!hasSearched || schedules.length === 0) {
      toast.warning(t("exportEmptyToast"));
      return;
    }
    try {
      downloadSchedulesCsv(schedules);
      toast.success(t("exportSuccessToast", { count: schedules.length }));
    } catch {
      toast.error(t("exportFailedToast"));
    }
  };

  return {
    initialParams,
    viewMode,
    setViewMode,
    schedules,
    isLoading,
    hasSearched,
    handleSearch,
    handleResetSearch,
    handleViewVessel,
    selectedVessel,
    isVesselModalOpen,
    handleCloseVesselModal,
    ratesSchedule,
    isRatesModalOpen,
    handleOpenRates,
    handleCloseRates,
    carbonSchedule,
    isCarbonModalOpen,
    handleOpenCarbon,
    handleCloseCarbon,
    handleBookNow,
    handleShareResultsViaMail,
    isShareMailOpen,
    handleCloseShareMail,
    handleExport,
  };
}
