// Modified by Sekar Nagarajan (2026-09-18 10:45)

import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { usePostLoginRedirectStore } from "../../auth/stores/use-post-login-redirect-store";
import { landingTabToAppPath } from "../../auth/utils/public-menu-access";
import { validateCaptcha } from "../api/landing.api";
import { useTabConfig } from "../api/landing.queries";
import {
  type LandingTab,
  type RatesSearchForm,
  type ScheduleSearchForm,
  type TrackingSearchForm,
  ratesSearchSchema,
  scheduleSearchSchema,
  trackingSearchSchema,
} from "../types/landing.types";

interface UseLandingControllerOptions {
  /** Called when an explicit login action is triggered (optional intended path). */
  onLoginRequired: (intendedPath?: string) => void;
}

const INCORRECT_CAPTCHA_MESSAGE = "Captcha Entered Incorrectly";

/** Landing schedule/rates defaults — CNSHA → AEJEA. */
const DEFAULT_POL_LABEL = "CNSHA - SHANGHAI HONGQIAO INT APT";
const DEFAULT_POD_LABEL = "AEJEA - JEBEL ALI, UAE";
const DEFAULT_POL_CODE = "CNSHA";
const DEFAULT_POD_CODE = "AEJEA";

export function useLandingController({
  onLoginRequired,
}: UseLandingControllerOptions) {
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
    defaultValues: {
      pol: DEFAULT_POL_LABEL,
      pod: DEFAULT_POD_LABEL,
      fromDate: dayjs().format("YYYY-MM-DD"),
      toDate: dayjs().add(14, "day").format("YYYY-MM-DD"),
    },
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
    const values = scheduleForm.getValues();
    const polCode = values.pol
      ? values.pol.split(" - ")[0].trim()
      : DEFAULT_POL_CODE;
    const podCode = values.pod
      ? values.pod.split(" - ")[0].trim()
      : DEFAULT_POD_CODE;
    const fromDate = values.fromDate || dayjs().format("YYYY-MM-DD");
    const toDate = values.toDate || dayjs().add(14, "day").format("YYYY-MM-DD");

    const params = new URLSearchParams({
      pol: polCode,
      pod: podCode,
      fromDate,
      toDate,
      schetype: "loginschedule",
    });
    navigateWithSearch("/app/schedules", params);
  };

  const trackingForm = useForm<TrackingSearchForm>({
    resolver: zodResolver(trackingSearchSchema),
    defaultValues: {
      searchType: "CONTAINER",
      trackingNumber: "SMLU8829102",
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
          message: INCORRECT_CAPTCHA_MESSAGE,
        });
        return;
      }

      // Modified by Sekar Nagarajan (2026-09-18 10:45)
      const trackNo = values.trackingNumber.trim();
      const searchType = values.searchType;
      const params = new URLSearchParams({
        trackingNumber: trackNo,
        logintracno: trackNo,
        searchType,
        tracktype: "logintracking",
      });
      navigateWithSearch("/app/tracking", params);
    })();
  };

  const ratesForm = useForm<RatesSearchForm>({
    resolver: zodResolver(ratesSearchSchema),
    defaultValues: {
      pol: DEFAULT_POL_LABEL,
      pod: DEFAULT_POD_LABEL,
      equipmentType: "20' Dry Standard",
      shipmentDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
      captcha: "",
    },
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
          message: INCORRECT_CAPTCHA_MESSAGE,
        });
        return;
      }

      const polCode = values.pol
        ? values.pol.split(" - ")[0].trim()
        : DEFAULT_POL_CODE;
      const podCode = values.pod
        ? values.pod.split(" - ")[0].trim()
        : DEFAULT_POD_CODE;
      const eqp = values.equipmentType || "20' Dry Standard";
      const shipmentDate =
        values.shipmentDate || dayjs().add(7, "day").format("YYYY-MM-DD");

      const params = new URLSearchParams({
        pol: polCode,
        pod: podCode,
        ratepol: polCode,
        ratepod: podCode,
        eqpType: eqp,
        rateseqp: eqp,
        shipmentdate: shipmentDate,
        loginratetype: "loginratetype",
      });
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
