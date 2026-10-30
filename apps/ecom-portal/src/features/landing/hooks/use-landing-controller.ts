// Modified by Sekar Nagarajan (2026-10-18 10:30)

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { usePostLoginRedirectStore } from "../../auth/stores/use-post-login-redirect-store";
import { landingTabToAppPath } from "../../auth/utils/public-menu-access";
import { validateCaptcha } from "../api/landing.api";
import { usePortByCode, useTabConfig } from "../api/landing.queries";
import {
  type LandingTab,
  type RatesSearchForm,
  type ScheduleSearchForm,
  type TrackingSearchForm,
  createRatesSearchSchema,
  createTrackingSearchSchema,
  scheduleSearchSchema,
} from "../types/landing.types";
import {
  DEFAULT_EQUIPMENT_CODE,
  DEFAULT_LANE,
  RATES_SHIPMENT_LEAD_DAYS,
  SCHEDULE_WINDOW_DAYS,
  buildRatesSearchParams,
  buildScheduleSearchParams,
  buildTrackingSearchParams,
  portLabelOf,
} from "../utils/landing-search";

interface UseLandingControllerOptions {
  /** Called when an explicit login action is triggered (optional intended path). */
  onLoginRequired: (intendedPath?: string) => void;
}


export function useLandingController({
  onLoginRequired,
}: UseLandingControllerOptions) {
  const { t } = useTranslation(["landing", "common", "modules"]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LandingTab>("schedules");
  const [isSearching, setIsSearching] = useState(false);
  const setIntendedPath = usePostLoginRedirectStore((s) => s.setIntendedPath);
  const { data: tabConfigData } = useTabConfig();
  const tabConfig = tabConfigData ?? {
    schedules: "public" as const,
    tracking: "public" as const,
    rates: "public" as const,
  };

  const trackingSchema = useMemo(() => createTrackingSearchSchema(t), [t]);
  const ratesSchema = useMemo(() => createRatesSearchSchema(t), [t]);

  // Default lane labels come from the ports master ("INNSA - NHAVA SHEVA,MUMBAI"), not from literals.
  const { data: defaultPol } = usePortByCode(DEFAULT_LANE.pol);
  const { data: defaultPod } = usePortByCode(DEFAULT_LANE.pod);
  const defaultPolLabel = defaultPol ? portLabelOf(defaultPol) : DEFAULT_LANE.pol;
  const defaultPodLabel = defaultPod ? portLabelOf(defaultPod) : DEFAULT_LANE.pod;

  const requireLoginForTab = (tab: LandingTab): boolean =>
    tabConfig[tab] === "login-required";

  const handleTabChange = (tab: LandingTab) => {
    if (requireLoginForTab(tab)) {
      const path = landingTabToAppPath(tab);
      setIntendedPath(path);
      onLoginRequired(path);
      return;
    }
    setActiveTab(tab);
  };

  const navigateWithSearch = (
    pathname: "/app/schedules" | "/app/tracking" | "/app/rates",
    params: URLSearchParams,
  ) => {
    setIsSearching(true);
    const search = Object.fromEntries(params.entries());
    const startedAt = Date.now();
    const minSpinnerMs = 450;

    void navigate({
      to: pathname,
      search: search as never,
      replace: false,
    })
      .catch(() => {
        // Keep the landing panel interactive if navigation is blocked
      })
      .finally(() => {
        const wait = Math.max(0, minSpinnerMs - (Date.now() - startedAt));
        window.setTimeout(() => setIsSearching(false), wait);
      });
  };

  const scheduleForm = useForm<ScheduleSearchForm>({
    resolver: zodResolver(scheduleSearchSchema),
    // `values` re-syncs the lane labels once the ports master answers; fields the user already edited are kept.
    values: {
      pol: defaultPolLabel,
      pod: defaultPodLabel,
      fromDate: dayjs().format("YYYY-MM-DD"),
      toDate: dayjs().add(SCHEDULE_WINDOW_DAYS, "day").format("YYYY-MM-DD"),
    },
    resetOptions: { keepDirtyValues: true },
  });

  const handleScheduleSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSearching) return;
    if (requireLoginForTab("schedules")) {
      const path = landingTabToAppPath("schedules");
      setIntendedPath(path);
      onLoginRequired(path);
      return;
    }
    const params = new URLSearchParams(buildScheduleSearchParams(scheduleForm.getValues()));
    navigateWithSearch("/app/schedules", params);
  };

  const trackingForm = useForm<TrackingSearchForm>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      // Modified by Sekar Nagarajan (2026-10-17 01:50) — a booking that exists in the extracted fixtures
      searchType: "BOOKING",
      trackingNumber: "SVMDMU2694105",
      captcha: "",
    },
  });

  const handleTrackingSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSearching) return;
    if (requireLoginForTab("tracking")) {
      const path = landingTabToAppPath("tracking");
      setIntendedPath(path);
      onLoginRequired(path);
      return;
    }

    void trackingForm.handleSubmit(async (values) => {
      const captchaCode = values.captcha.trim();
      const captchaOk = await validateCaptcha(captchaCode);
      if (!captchaOk) {
        trackingForm.setError("captcha", {
          type: "remote",
          message: t("errors.captchaIncorrect"),
        });
        return;
      }

      const params = new URLSearchParams(buildTrackingSearchParams(values));
      navigateWithSearch("/app/tracking", params);
    })();
  };

  const ratesForm = useForm<RatesSearchForm>({
    resolver: zodResolver(ratesSchema),
    values: {
      pol: defaultPolLabel,
      pod: defaultPodLabel,
      equipmentType: DEFAULT_EQUIPMENT_CODE,
      shipmentDate: dayjs().add(RATES_SHIPMENT_LEAD_DAYS, "day").format("YYYY-MM-DD"),
      captcha: "",
    },
    resetOptions: { keepDirtyValues: true },
  });

  const handleRatesSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSearching) return;
    if (requireLoginForTab("rates")) {
      const path = landingTabToAppPath("rates");
      setIntendedPath(path);
      onLoginRequired(path);
      return;
    }

    void ratesForm.handleSubmit(async (values) => {
      const captchaCode = values.captcha.trim();
      const captchaOk = await validateCaptcha(captchaCode, "LoginRate");
      if (!captchaOk) {
        ratesForm.setError("captcha", {
          type: "remote",
          message: t("errors.captchaIncorrect"),
        });
        return;
      }

      const params = new URLSearchParams(buildRatesSearchParams(values));
      navigateWithSearch("/app/rates", params);
    })();
  };

  return {
    activeTab,
    handleTabChange,
    tabConfig,
    isSearching,
    scheduleForm,
    handleScheduleSubmit,
    trackingForm,
    handleTrackingSubmit,
    ratesForm,
    handleRatesSubmit,
  };
}
