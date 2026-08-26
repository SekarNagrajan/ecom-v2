// Modified by Sekar Nagarajan (2026-08-26 16:10)
// Schedule Feature Controller Hook with URL query param auto-fetch on mount

import { useToast } from '@solverminds/shared-ui/hooks';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { schedulesApi } from '../api/schedules.api';
import type { ScheduleItem, ScheduleSearchParams, VesselParticulars } from '../types/schedules.types';

export function useSchedulesController() {
  const navigate = useNavigate();
  const toast = useToast();

  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedVessel, setSelectedVessel] = useState<VesselParticulars | null>(null);
  const [isVesselModalOpen, setIsVesselModalOpen] = useState<boolean>(false);

  const [ratesSchedule, setRatesSchedule] = useState<ScheduleItem | null>(null);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState<boolean>(false);

  const [carbonSchedule, setCarbonSchedule] = useState<ScheduleItem | null>(null);
  const [isCarbonModalOpen, setIsCarbonModalOpen] = useState<boolean>(false);

  const fetchSchedules = useCallback(async (params: ScheduleSearchParams) => {
    setIsLoading(true);
    try {
      const data = await schedulesApi.searchSchedules(params);
      setSchedules(data);
    } catch {
      toast.error('Failed to load vessel schedules');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Parse URL query params passed from Landing page
    const searchParams = new URLSearchParams(window.location.search);
    const pol = searchParams.get('pol') || 'USNYC';
    const pod = searchParams.get('pod') || 'SGSIN';
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;

    fetchSchedules({
      searchType: 'POINT_TO_POINT',
      polCode: pol,
      podCode: pod,
      fromDate: fromDate,
      toDate: toDate,
    });
  }, [fetchSchedules]);

  const handleSearch = (params: ScheduleSearchParams) => {
    fetchSchedules(params);
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
    navigate({ to: '/app/booking/new' });
  };

  return {
    viewMode,
    setViewMode,
    schedules,
    isLoading,
    handleSearch,
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
