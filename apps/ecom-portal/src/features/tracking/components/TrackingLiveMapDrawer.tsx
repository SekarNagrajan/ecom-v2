// Modified by Sekar Nagarajan (2026-09-01 14:49)
import { AppDrawer } from "@solverminds/shared-ui";
import { Empty, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  ContainerEquipment,
  TrackingSearchResult,
} from "../types/tracking.types";
import { TrackingLiveMapCanvas } from "./TrackingLiveMapCanvas";

const { Title, Text } = Typography;

interface TrackingLiveMapDrawerProps {
  open: boolean;
  onClose: () => void;
  container: ContainerEquipment | null;
  shipment: TrackingSearchResult | null;
}

export function TrackingLiveMapDrawer({
  open,
  onClose,
  container,
  shipment,
}: TrackingLiveMapDrawerProps) {
  if (!container || !shipment) return null;

  const routeMap = shipment.routeMap;

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      dialogSize="lg"
      classNames={{ body: "tracking-drawer-body custom-scroll" }}
      title={
        <div className="tracking-drawer-title">
          <AppIcon icon={Icons.mapPin} size={20} tone="track" />
          <div>
            <Title level={4} className="tracking-drawer-title__text">
              Interactive Container Live Map
            </Title>
            <Text type="secondary" className="tracking-drawer-title__meta">
              <strong>{container.containerNo}</strong>
              {" · "}
              {shipment.vesselName} / {shipment.voyage}
              {" · "}
              {shipment.polPortCode} → {shipment.podPortCode}
            </Text>
          </div>
        </div>
      }
    >
      {routeMap ? (
        <TrackingLiveMapCanvas
          shipment={shipment}
          container={container}
          routeMap={routeMap}
          liveAis={shipment.liveAis}
        />
      ) : (
        <div className="tracking-live-map__empty">
          <Empty description="Live route geometry is not available for this shipment." />
        </div>
      )}
    </AppDrawer>
  );
}
