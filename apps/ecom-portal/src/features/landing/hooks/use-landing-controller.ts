import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTabConfig } from '../api/landing.queries';
import {
  type LandingTab,
  type RatesSearchForm,
  type ScheduleSearchForm,
  type TrackingSearchForm,
  ratesSearchSchema,
  scheduleSearchSchema,
  trackingSearchSchema,
} from '../types/landing.types';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
interface UseLandingControllerOptions {
  /** Called when a tab that requires login is clicked */
  onLoginRequired: () => void;
}

export function useLandingController({ onLoginRequired }: UseLandingControllerOptions) {
  const { data: tabConfig } = useTabConfig();

  // Default to the first publicly-accessible tab — parity with JSP:
  // `$(".btn_sch / btn_tra / btn_rate").click()` on the first non-"P" category
  const defaultTab = (() => {
    if (!tabConfig || tabConfig.schedules === 'public') return 'schedules';
    if (tabConfig.tracking === 'public') return 'tracking';
    if (tabConfig.rates === 'public') return 'rates';
    return 'schedules';
  })();

  const [activeTab, setActiveTab] = useState<LandingTab>(defaultTab);

  // Re-sync when tabConfig loads (it starts undefined)
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (tab: LandingTab) => {
    const config = tabConfig ?? { schedules: 'public', tracking: 'public', rates: 'public' };
    if (config[tab] === 'login-required') {
      onLoginRequired();
      return;
    }
    setActiveTab(tab);
  };

  // ── Schedule form ─────────────────────────────────────────────────────────
  const scheduleForm = useForm<ScheduleSearchForm>({
    resolver: zodResolver(scheduleSearchSchema),
    defaultValues: { pol: '', pod: '', fromDate: '', toDate: '' },
  });

  const handleScheduleSubmit = scheduleForm.handleSubmit((values) => {
    const params = new URLSearchParams({
      pol: values.pol.split(' - ')[0].trim(),
      pod: values.pod.split(' - ')[0].trim(),
      fromDate: values.fromDate,
      toDate: values.toDate,
      schetype: 'loginschedule',
    });
    // Navigate to schedules search results — parity with JSP form action "schedules.do"
    window.location.href = `/schedules?${params.toString()}`;
  });

  // ── Tracking form ─────────────────────────────────────────────────────────
  const trackingForm = useForm<TrackingSearchForm>({
    resolver: zodResolver(trackingSearchSchema),
    defaultValues: { trackingNumber: '', captcha: '' },
  });

  const handleTrackingSubmit = trackingForm.handleSubmit((values) => {
    const params = new URLSearchParams({
      logintracno: values.trackingNumber,
      tracktype: 'logintracking',
    });
    window.location.href = `/tracking?${params.toString()}`;
  });

  // ── Rates form ────────────────────────────────────────────────────────────
  const ratesForm = useForm<RatesSearchForm>({
    resolver: zodResolver(ratesSearchSchema),
    defaultValues: { pol: '', pod: '', equipmentType: '', shipmentDate: '', captcha: '' },
  });

  const handleRatesSubmit = ratesForm.handleSubmit((values) => {
    const params = new URLSearchParams({
      ratepol: values.pol.split(' - ')[0].trim(),
      ratepod: values.pod.split(' - ')[0].trim(),
      rateseqp: values.equipmentType,
      shipmentdate: values.shipmentDate,
      loginratetype: 'loginratetype',
    });
    window.location.href = `/rates?${params.toString()}`;
  });

  return {
    activeTab,
    handleTabChange,
    tabConfig,
    scheduleForm,
    handleScheduleSubmit,
    trackingForm,
    handleTrackingSubmit,
    ratesForm,
    handleRatesSubmit,
  };
}
