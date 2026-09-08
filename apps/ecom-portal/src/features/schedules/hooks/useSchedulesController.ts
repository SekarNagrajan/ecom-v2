// Modified by Sekar Nagarajan (2026-09-08 16:25)
// Schedule Feature Controller — results only after Search (or landing deep-link)

import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { schedulesApi } from "../api/schedules.api";
import type {
  ScheduleItem,
  ScheduleSearchParams,
  VesselParticulars,
} from "../types/schedules.types";

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

  const [viewMode, setViewMode] = useState<"LIST" | "CALENDAR">("LIST");
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedVessel, setSelectedVessel] = useState<VesselParticulars | null>(
    null,
  );
  const [isVesselModalOpen, setIsVesselModalOpen] = useState(false);

  const [ratesSchedule, setRatesSchedule] = useState<ScheduleItem | null>(null);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);

  const [carbonSchedule, setCarbonSchedule] = useState<ScheduleItem | null>(
    null,
  );
  const [isCarbonModalOpen, setIsCarbonModalOpen] = useState(false);

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
    const deepLink = readDeepLinkSearchParams();
    if (!deepLink) {
      return;
    }
    void fetchSchedules(deepLink);
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

  const handleBookNow = (_schedule: ScheduleItem) => {
    navigate({ to: "/app/booking/new" });
  };

  return {
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
  };
}
