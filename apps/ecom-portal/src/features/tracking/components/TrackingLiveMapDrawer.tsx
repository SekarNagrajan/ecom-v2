// Modified by Sekar Nagarajan (2026-09-04 16:45)
import { AppDrawer } from "@solverminds/shared-ui";
import { Card, Empty, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  ContainerEquipment,
  TrackingSearchResult,
} from "../types/tracking.types";
import { TrackingRouteMap } from "./TrackingRouteMap";

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
  const etd = shipment.actualEtd ?? shipment.etd;
  const aisUpdated = shipment.liveAis?.lastUpdate;
  const aisSource = shipment.liveAis?.source ?? "Satellite AIS";

  return (
    <AppDrawer
      open={open}
      onClose={onClose}
      dialogSize="xl"
      classNames={{ body: "tracking-drawer-body custom-scroll" }}
      title={
        <div className="tracking-drawer-title">
          <AppIcon icon={Icons.mapPin} size={20} tone="delete" />
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
            </Text>
          </div>
        </div>
      }
    >
      {open && routeMap ? (
        <div className="tracking-live-map-drawer-stack">
          {/* <Card
            className="tracking-overview tracking-live-map-drawer-stack__journey"
            bordered={false}
            title={
              <span className="tracking-route-map-card__title">
                <AppIcon icon={Icons.ship} size={16} />
                Cargo journey
              </span>
            }
          >
            <TrackingPipeline
              milestones={shipment.milestones}
              eta={shipment.eta}
              orientation="horizontal"
            />
          </Card> */}

          <Card
            className="tracking-route-map-card tracking-live-map-drawer-stack__map"
            bordered={false}
            title={
              <span className="tracking-route-map-card__title">
                <AppIcon icon={Icons.mapPin} size={16} tone="delete" />
                Live vessel position & route
              </span>
            }
          >
            <TrackingRouteMap
              key={`${container.containerNo}-${shipment.searchKey}`}
              routeMap={routeMap}
              liveAis={shipment.liveAis}
              polLabel={`${shipment.polPortName} — ${shipment.polPortCode}`}
              podLabel={`${shipment.podPortName} — ${shipment.podPortCode}`}
              polTerminal={shipment.polTerminal}
              podTerminal={shipment.podTerminal}
              vesselName={shipment.vesselName}
              voyage={shipment.voyage}
              etd={etd}
              eta={shipment.eta}
              progressPercent={shipment.progressPercent}
            />
          </Card>
        </div>
      ) : (
        <div className="tracking-live-map__empty">
          <Empty description="Live route geometry is not available for this shipment." />
        </div>
      )}
    </AppDrawer>
  );
}
