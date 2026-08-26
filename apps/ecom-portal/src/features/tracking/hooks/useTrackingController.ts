// Modified by Sekar Nagarajan (2026-08-25 19:20)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useEffect, useState } from "react";

import { trackingApi } from "../api/tracking.api";
import type {
  ContainerEquipment,
  TrackingSearchParams,
  TrackingSearchResult,
} from "../types/tracking.types";

export function useTrackingController() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<TrackingSearchParams>({
    searchType: "CONTAINER",
    searchValue: "SMLU8829102",
  });

  const [trackingResult, setTrackingResult] =
    useState<TrackingSearchResult | null>(null);
  const [selectedContainer, setSelectedContainer] =
    useState<ContainerEquipment | null>(null);
  const [isMovementDrawerOpen, setIsMovementDrawerOpen] =
    useState<boolean>(false);

  const executeSearch = async (params: TrackingSearchParams) => {
    if (!params.searchValue || params.searchValue.trim().length < 3) {
      toast.error(
        "Please enter a valid Container, Booking, or Bill of Lading (BL) number",
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = await trackingApi.getTrackingDetails(params);
      setTrackingResult(data);
      setSearchParams(params);
    } catch {
      toast.error("Failed to load tracking data for the requested reference");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load auto-fetching URL parameters passed from Landing page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNo =
      urlParams.get("trackingNumber") ||
      urlParams.get("logintracno") ||
      "SMLU8829102";
    void executeSearch({
      searchType: "CONTAINER",
      searchValue: trackingNo,
    });
    // Mount-only URL bootstrap (parity with landing deep-link).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, []);

  const handleOpenMovements = (container: ContainerEquipment) => {
    setSelectedContainer(container);
    setIsMovementDrawerOpen(true);
  };

  const handleCloseMovements = () => {
    setIsMovementDrawerOpen(false);
    setSelectedContainer(null);
  };

  return {
    isLoading,
    searchParams,
    trackingResult,
    executeSearch,
    selectedContainer,
    isMovementDrawerOpen,
    handleOpenMovements,
    handleCloseMovements,
  };
}
