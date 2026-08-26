// Modified by Sekar Nagarajan (2026-08-25 17:35)
/**
 * Dashboard controller — enhancedDashboard.jsp parity.
 * Loads summary via dashboardApi (mock until REST facade exists).
 */
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useToast } from "@solverminds/shared-ui/hooks";

import {
  dashboardApi,
  type DashboardSummaryResponse,
} from "../api/dashboard.api";
import { getDashboardFilterLabel } from "../utils/filter-dashboard-shipments";

export function useDashboardController() {
  const navigate = useNavigate();
  const toast = useToast();

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterLabel, setFilterLabel] = useState("Total Shipments");
  const [trendPeriod, setTrendPeriod] = useState("Monthly");

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch {
      toast.error("Failed to load dashboard summary");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  const handleFilterChange = (filter: string, label: string) => {
    setActiveFilter(filter);
    setFilterLabel(label || getDashboardFilterLabel(filter));
  };

  const handleViewBooking = (bookNo: string, _refNo: string) => {
    navigate({
      to: "/app/booking" as never,
      search: { bookNo } as never,
    });
  };

  const handleViewBl = (blNo: string, bookNo: string) => {
    navigate({
      to: "/app/bl" as never,
      search: { blNo, bookNo } as never,
    });
  };

  const handleCreateSi = (bookNo: string) => {
    navigate({
      to: "/app/shipping-instruction" as never,
      search: { bookNo } as never,
    });
  };

  const handleCreateBooking = () => {
    navigate({ to: "/app/booking/new" as never });
  };

  return {
    summary,
    isLoading,
    activeFilter,
    filterLabel,
    trendPeriod,
    setTrendPeriod,
    loadSummary,
    handleFilterChange,
    handleViewBooking,
    handleViewBl,
    handleCreateSi,
    handleCreateBooking,
  };
}
