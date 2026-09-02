// Modified by Sekar Nagarajan (2026-09-01 14:38)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Space } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import { TrackingModuleStyles } from "./components/tracking-module-styles";
import { TrackingContainersTable } from "./components/TrackingContainersTable";
import { TrackingLiveMapDrawer } from "./components/TrackingLiveMapDrawer";
import { TrackingMovementDrawer } from "./components/TrackingMovementDrawer";
import { TrackingOverview } from "./components/TrackingOverview";
import { TrackingSearchFilter } from "./components/TrackingSearchFilter";
import { useTrackingController } from "./hooks/useTrackingController";
// Modified by Sekar Nagarajan (2026-09-02 14:56)
import { NavTrackingIcon } from "../../components/icons/nav-svg-icons";

export function TrackingRoute() {
  const toast = useToast();
  const {
    isLoading,
    trackingResult,
    executeSearch,
    selectedContainer,
    isMovementDrawerOpen,
    isLiveMapOpen,
    handleOpenMovements,
    handleCloseMovements,
    handleOpenLiveMap,
    handleCloseLiveMap,
  } = useTrackingController();

  return (
    <FeaturePageShell>
      <TrackingModuleStyles />
      <Card className="feature-page-card" bordered={false}>
        <ModuleScreenHeader
          icon={NavTrackingIcon}
          title={MODULE_TITLES.tracking}
          subtitle="Track real-time container movements, vessel voyage milestones, port cut-offs, and transport event logs."
          extra={
            <Space align="center" size={12} wrap>
              <AppButton
                icon={
                  <AppIcon icon={Icons.download} size={16} tone="download" />
                }
                onClick={() =>
                  toast.success(
                    "Exporting container tracking trace history to Excel…",
                  )
                }
              >
                Export Excel
              </AppButton>
              <AppButton
                icon={<AppIcon icon={Icons.mail} size={16} tone="navigate" />}
                onClick={() =>
                  toast.info("Opening tracking status email share dialog…")
                }
              >
                Share via Mail
              </AppButton>
            </Space>
          }
        />

        <TrackingSearchFilter onSearch={executeSearch} isLoading={isLoading} />

        {trackingResult ? (
          <Space
            direction="vertical"
            size="large"
            className="feature-page-stack"
          >
            <TrackingOverview data={trackingResult} />
            <div className="responsive-table-wrap custom-scroll">
              <TrackingContainersTable
                containers={trackingResult.containers}
                onViewMovements={handleOpenMovements}
                onViewLiveMap={handleOpenLiveMap}
              />
            </div>
          </Space>
        ) : null}

        <TrackingMovementDrawer
          container={selectedContainer}
          open={isMovementDrawerOpen}
          onClose={handleCloseMovements}
        />

        <TrackingLiveMapDrawer
          container={selectedContainer}
          shipment={trackingResult}
          open={isLiveMapOpen}
          onClose={handleCloseLiveMap}
        />
      </Card>
    </FeaturePageShell>
  );
}
