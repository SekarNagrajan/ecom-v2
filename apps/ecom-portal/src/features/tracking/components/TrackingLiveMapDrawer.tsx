// Modified by Sekar Nagarajan (2026-09-01 18:55)
import { AppDrawer } from "@solverminds/shared-ui";
import { Empty, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import { useLiveVessels } from "../hooks/use-live-vessels";
import { useTrackingMockVessels } from "../hooks/use-tracking-mock-vessels";
import type {
  ContainerEquipment,
  TrackingAisVessel,
  TrackingSearchResult,
} from "../types/tracking.types";
import { getAisProxyUrl } from "../utils/tracking-ais.utils";
import { ShipTrackingMap } from "./ship-tracking-map";

const { Title, Text } = Typography;

interface TrackingLiveMapDrawerProps {
  open: boolean;
  onClose: () => void;
  container: ContainerEquipment | null;
  shipment: TrackingSearchResult | null;
}

function mergeVessels(
  mock: TrackingAisVessel[],
  live: TrackingAisVessel[],
): TrackingAisVessel[] {
  const primary = mock.filter((v) => v.isPrimary);
  const liveTraffic = live.filter(
    (v) => !primary.some((p) => p.mmsi === v.mmsi),
  );
  if (liveTraffic.length === 0) return mock;
  const mockTraffic = mock.filter((v) => !v.isPrimary);
  return [...primary, ...liveTraffic, ...mockTraffic].slice(0, 24);
}

export function TrackingLiveMapDrawer({
  open,
  onClose,
  container,
  shipment,
}: TrackingLiveMapDrawerProps) {
  const proxyUrl = getAisProxyUrl();
  const { vessels: mockVessels, paths } = useTrackingMockVessels(
    open ? shipment : null,
    open ? container : null,
  );
  const liveVessels = useLiveVessels(open ? proxyUrl : undefined);
  const vessels = mergeVessels(mockVessels, liveVessels);

  // Live vessels have no densified paths — pad with nulls so indices stay aligned
  // only for mock fleet; when live merges in, map uses vessel index into mock paths.
  const mapPaths = vessels.map((v) => {
    const mockIdx = mockVessels.findIndex((m) => m.mmsi === v.mmsi);
    return mockIdx >= 0 ? paths[mockIdx] ?? null : null;
  });

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
              Container Live Map
            </Title>
            <Text type="secondary" className="tracking-drawer-title__meta">
              <strong>{container.containerNo}</strong>
              {" · "}
              {shipment.vesselName} / {shipment.voyage}
              {" · "}
              {shipment.polPortCode} → {shipment.podPortCode}
              {proxyUrl ? " · Live AIS proxy" : " · Mock AIS"}
            </Text>
          </div>
        </div>
      }
    >
      {open && (routeMap || vessels.length > 0) ? (
        <ShipTrackingMap
          vessels={vessels}
          paths={mapPaths}
          shipment={shipment}
        />
      ) : (
        <div className="tracking-live-map__empty">
          <Empty description="Live route geometry is not available for this shipment." />
        </div>
      )}
    </AppDrawer>
  );
}
