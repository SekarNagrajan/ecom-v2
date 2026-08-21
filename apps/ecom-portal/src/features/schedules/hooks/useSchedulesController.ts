// Schedule Feature Controller Hook
// Parity with legacy eCommSchedules.jsp & SchedulebetweenlocationView.jsp state management
// Modified by sekar nagarajan (2026-08-21)

import { useNavigate } from '@tanstack/react-router';
import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { schedulesApi } from '../api/schedules.api';
import type { ScheduleItem, ScheduleSearchParams, VesselParticulars } from '../types/schedules.types';

export function useSchedulesController() {
  const navigate = useNavigate();

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
      message.error('Failed to load vessel schedules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch for default Point-to-Point route
    fetchSchedules({
      searchType: 'POINT_TO_POINT',
      polCode: 'USNYC',
      podCode: 'SGSIN',
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

  const handleBookNow = (schedule: ScheduleItem) => {
    message.success(`Initiating booking for Service ${schedule.serviceCode} (${schedule.polPortId} → ${schedule.podPortId})`);
    // Route to Booking creation page with route parameters
    navigate({ to: '/app/booking-management' });
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
