// Modified by Sekar Nagarajan (2026-09-10 22:13)
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import { useState } from "react";

import { useTranslation } from "react-i18next";
import { Icons } from "../../../components/icons";
import { BookingTemplateModalShell } from "../../../components/shared/booking-template-modal-shell";
import {
  buildRetryAction,
  ModuleEmptyState,
} from "../../../components/shared/module-empty-state";
import { bookingApi } from "../api/booking.api";
import { bookingKeys } from "../api/booking.keys";
import type { SelectedRoute } from "../types/booking.types";
import { BookingRouteCard } from "./booking-route-card";

interface RoutingSelectModalProps {
  open: boolean;
  origin: string;
  delivery: string;
  cargoReadyDate: string;
  /** Currently chosen route — highlighted in the list when changing route. */
  selectedRouteId?: string | null;
  onCancel: () => void;
  onSelect: (route: SelectedRoute) => void;
}

export function RoutingSelectModal({
  open,
  origin,
  delivery,
  cargoReadyDate,
  selectedRouteId = null,
  onCancel,
  onSelect,
}: RoutingSelectModalProps) {
  const { t } = useTranslation(["booking", "common"]);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const {
    data: routes = [],
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: bookingKeys.routing(origin, delivery, cargoReadyDate),
    queryFn: () =>
      bookingApi.searchRouting({ origin, delivery, cargoReadyDate }),
    enabled: open && Boolean(origin && delivery && cargoReadyDate),
    // 30 seconds
    staleTime: 30_000,
  });

  const handleClose = () => {
    setExpandedRouteId(null);
    onCancel();
  };

  return (
    <BookingTemplateModalShell
      open={open}
      onClose={handleClose}
      icon={Icons.ship}
      title={t("booking:wizard.routing.selectVesselRoute")}
      subtitle={t("booking:wizard.routing.modalSubtitle", {
        origin: origin || "—",
        delivery: delivery || "—",
        date: cargoReadyDate || "—",
      })}
      dialogSize="xl"
    >
      <div className="booking-routing-modal custom-scroll">
        {isFetching ? (
          <div
            className="booking-routing-modal__loading"
            aria-label={t("booking:wizard.routing.loadingAria")}
            role="status"
          >
            <Spin size="medium" />
          </div>
        ) : null}

        {!isFetching && isError ? (
          <ModuleEmptyState
            variant="error"
            title={t("booking:wizard.routing.loadErrorTitle")}
            message={t("booking:wizard.routing.loadErrorMessage")}
            actions={[buildRetryAction(() => void refetch())]}
            artSize="sm"
          />
        ) : null}

        {!isFetching && !isError && routes.length === 0 ? (
          <ModuleEmptyState
            variant="filtered"
            title={t("booking:wizard.routing.emptyTitle")}
            message={t("booking:wizard.routing.emptyMessage")}
            artSize="sm"
          />
        ) : null}

        {!isFetching && !isError
          ? routes.map((route) => {
              const isSelected = selectedRouteId === route.routeId;
              return (
                <BookingRouteCard
                  key={route.routeId}
                  route={route}
                  selected={isSelected}
                  expanded={expandedRouteId === route.routeId}
                  onToggle={() =>
                    setExpandedRouteId((prev) =>
                      prev === route.routeId ? null : route.routeId,
                    )
                  }
                  action={{
                    label: isSelected ? t("booking:wizard.routing.selected") : t("common:actions.select"),
                    icon: Icons.check,
                    type: isSelected ? "default" : "primary",
                    onClick: () => onSelect(route),
                  }}
                />
              );
            })
          : null}
      </div>
    </BookingTemplateModalShell>
  );
}
