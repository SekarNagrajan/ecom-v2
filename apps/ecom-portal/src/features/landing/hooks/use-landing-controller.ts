// Modified by Sekar Nagarajan (2026-08-22 00:06)
// Landing Controller Hook — 100% public access to Schedules, Tracking, and Rates tabs with seamless search navigation

import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  type LandingTab,
  type RatesSearchForm,
  type ScheduleSearchForm,
  type TrackingSearchForm,
  ratesSearchSchema,
  scheduleSearchSchema,
  trackingSearchSchema,
} from '../types/landing.types';

interface UseLandingControllerOptions {
  /** Called when an explicit login action is triggered */
  onLoginRequired: () => void;
}

export function useLandingController({ onLoginRequired: _onLoginRequired }: UseLandingControllerOptions) {
  // Always default to 'schedules' tab — public search access
  const [activeTab, setActiveTab] = useState<LandingTab>('schedules');

  const navigate = useNavigate();

  // Allow unrestricted switching between search tabs without forcing login
  const handleTabChange = (tab: LandingTab) => {
    setActiveTab(tab);
  };

  // ── Schedule form ─────────────────────────────────────────────────────────
  const scheduleForm = useForm<ScheduleSearchForm>({
    resolver: zodResolver(scheduleSearchSchema),
    defaultValues: {
      pol: 'USNYC - New York',
      pod: 'SGSIN - Singapore',
      fromDate: dayjs().format('YYYY-MM-DD'),
      toDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
    },
  });

  const handleScheduleSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const values = scheduleForm.getValues();
    const polCode = values.pol ? values.pol.split(' - ')[0].trim() : 'USNYC';
    const podCode = values.pod ? values.pod.split(' - ')[0].trim() : 'SGSIN';
    const fromDate = values.fromDate || dayjs().format('YYYY-MM-DD');
    const toDate = values.toDate || dayjs().add(14, 'day').format('YYYY-MM-DD');

    const params = new URLSearchParams({
      pol: polCode,
      pod: podCode,
      fromDate,
      toDate,
      schetype: 'loginschedule',
    });
    window.location.href = `/app/schedules?${params.toString()}`;
  };

  // ── Tracking form ─────────────────────────────────────────────────────────
  const trackingForm = useForm<TrackingSearchForm>({
    resolver: zodResolver(trackingSearchSchema),
    defaultValues: {
      trackingNumber: 'SMLU8829102',
      captcha: '',
    },
  });

  const handleTrackingSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const values = trackingForm.getValues();
    const trackNo = values.trackingNumber?.trim() || 'SMLU8829102';
    const params = new URLSearchParams({
      trackingNumber: trackNo,
      logintracno: trackNo,
      tracktype: 'logintracking',
    });
    window.location.href = `/app/tracking?${params.toString()}`;
  };

  // ── Rates form ────────────────────────────────────────────────────────────
  const ratesForm = useForm<RatesSearchForm>({
    resolver: zodResolver(ratesSearchSchema),
    defaultValues: {
      pol: 'USNYC - New York',
      pod: 'SGSIN - Singapore',
      equipmentType: "20' Dry Standard",
      shipmentDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      captcha: '',
    },
  });

  const handleRatesSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    const values = ratesForm.getValues();
    const polCode = values.pol ? values.pol.split(' - ')[0].trim() : 'USNYC';
    const podCode = values.pod ? values.pod.split(' - ')[0].trim() : 'SGSIN';
    const eqp = values.equipmentType || "20' Dry Standard";
    const shipmentDate = values.shipmentDate || dayjs().add(7, 'day').format('YYYY-MM-DD');

    const params = new URLSearchParams({
      pol: polCode,
      pod: podCode,
      ratepol: polCode,
      ratepod: podCode,
      eqpType: eqp,
      rateseqp: eqp,
      shipmentdate: shipmentDate,
      loginratetype: 'loginratetype',
    });
    window.location.href = `/app/rates?${params.toString()}`;
  };

  return {
    activeTab,
    handleTabChange,
    tabConfig: { schedules: 'public', tracking: 'public', rates: 'public' },
    scheduleForm,
    handleScheduleSubmit,
    trackingForm,
    handleTrackingSubmit,
    ratesForm,
    handleRatesSubmit,
  };
}
