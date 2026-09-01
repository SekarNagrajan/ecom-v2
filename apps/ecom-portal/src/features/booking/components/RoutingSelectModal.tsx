// Modified by Sekar Nagarajan (2026-09-01 15:52)
import { useQuery } from "@tanstack/react-query";
import { Empty, Spin } from "antd";
import { useState } from "react";

import { Icons } from "../../../components/icons";
import { BookingTemplateModalShell } from "../../../components/shared/booking-template-modal-shell";
import { bookingApi } from "../api/booking.api";
import { bookingKeys } from "../api/booking.keys";
import type { SelectedRoute } from "../types/booking.types";
import { BookingRouteCard } from "./booking-route-card";

interface RoutingSelectModalProps {
  open: boolean;
  origin: string;
  delivery: string;
  cargoReadyDate: string;
  onCancel: () => void;
  onSelect: (route: SelectedRoute) => void;
}

export function RoutingSelectModal({
  open,
  origin,
  delivery,
  cargoReadyDate,
  onCancel,
  onSelect,
}: RoutingSelectModalProps) {
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const {
    data: routes = [],
    isFetching,
    isError,
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
      title="Select Vessel / Route"
      subtitle={`${origin || "—"} → ${delivery || "—"} · Cargo ready ${
        cargoReadyDate || "—"
      }`}
      dialogSize="xl"
    >
      <div className="booking-routing-modal custom-scroll">
        {isFetching ? (
          <div
            className="booking-routing-modal__loading"
            aria-label="Loading"
            role="status"
          >
            <Spin size="medium" />
          </div>
        ) : null}

        {!isFetching && isError ? (
          <Empty description="Unable to load vessel schedules. Try again." />
        ) : null}

        {!isFetching && !isError && routes.length === 0 ? (
          <Empty description="No records found for this origin and delivery." />
        ) : null}

        {!isFetching && !isError
          ? routes.map((route) => (
              <BookingRouteCard
                key={route.routeId}
                route={route}
                expanded={expandedRouteId === route.routeId}
                onToggle={() =>
                  setExpandedRouteId((prev) =>
                    prev === route.routeId ? null : route.routeId,
                  )
                }
                action={{
                  label: "Select",
                  icon: Icons.check,
                  onClick: () => onSelect(route),
                }}
              />
            ))
          : null}
      </div>
    </BookingTemplateModalShell>
  );
}
