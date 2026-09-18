// Modified by Sekar Nagarajan (2026-09-18 10:45)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useEffect, useState } from "react";

import { trackingApi } from "../api/tracking.api";
import type {
  ContainerEquipment,
  TrackingSearchParams,
  TrackingSearchResult,
  TrackingSearchType,
} from "../types/tracking.types";
import { resolveTrackingSearchType } from "../utils/resolve-tracking-search-type";

export function useTrackingController() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<TrackingSearchParams>({
    searchType: "CONTAINER",
    searchValue: "",
  });
  const [hasSearched, setHasSearched] = useState(false);

  const [trackingResult, setTrackingResult] =
    useState<TrackingSearchResult | null>(null);
  const [selectedContainer, setSelectedContainer] =
    useState<ContainerEquipment | null>(null);
  const [isMovementDrawerOpen, setIsMovementDrawerOpen] = useState(false);
  const [isLiveMapOpen, setIsLiveMapOpen] = useState(false);

  const clearResults = () => {
    setTrackingResult(null);
    setHasSearched(false);
    setSelectedContainer(null);
    setIsMovementDrawerOpen(false);
    setIsLiveMapOpen(false);
  };

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
      setHasSearched(true);
      setSelectedContainer(null);
      setIsMovementDrawerOpen(false);
      setIsLiveMapOpen(false);
      if (!data) {
        toast.info("No tracking records found for that reference");
      }
    } catch {
      setTrackingResult(null);
      setHasSearched(true);
      toast.error("Failed to load tracking data for the requested reference");
    } finally {
      setIsLoading(false);
    }
  };

  /** Tab switch: clear prior result set until user searches again. */
  const handleSearchTypeChange = (searchType: TrackingSearchType) => {
    clearResults();
    setSearchParams({ searchType, searchValue: "" });
  };

  const handleReset = () => {
    clearResults();
    setSearchParams({ searchType: searchParams.searchType, searchValue: "" });
  };

  // Deep-link from landing — honour searchType (Container / Booking / BL)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const trackingNo =
      urlParams.get("trackingNumber") || urlParams.get("logintracno");
    if (!trackingNo) return;

    const searchType = resolveTrackingSearchType(
      trackingNo,
      urlParams.get("searchType") || urlParams.get("refNoType"),
    );

    void executeSearch({
      searchType,
      searchValue: trackingNo,
    });
    // Mount-only URL bootstrap (parity with landing deep-link).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, []);

  const handleOpenMovements = (container: ContainerEquipment) => {
    setIsLiveMapOpen(false);
    setSelectedContainer(container);
    setIsMovementDrawerOpen(true);
  };

  const handleCloseMovements = () => {
    setIsMovementDrawerOpen(false);
  };

  const handleOpenLiveMap = (container: ContainerEquipment) => {
    setIsMovementDrawerOpen(false);
    setSelectedContainer(container);
    setIsLiveMapOpen(true);
  };

  const handleCloseLiveMap = () => {
    setIsLiveMapOpen(false);
  };

  return {
    isLoading,
    searchParams,
    hasSearched,
    trackingResult,
    executeSearch,
    handleSearchTypeChange,
    handleReset,
    selectedContainer,
    isMovementDrawerOpen,
    isLiveMapOpen,
    handleOpenMovements,
    handleCloseMovements,
    handleOpenLiveMap,
    handleCloseLiveMap,
  };
}
