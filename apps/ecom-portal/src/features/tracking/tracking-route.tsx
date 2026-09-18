// Modified by Sekar Nagarajan (2026-09-18 10:40)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, Space } from "antd";

import { AppIcon, Icons } from "../../components/icons";
import { NavTrackingIcon } from "../../components/icons/nav-svg-icons";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import { ModuleEmptyState } from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { MODULE_TITLES } from "../../constants/module-titles";
import { TrackingModuleStyles } from "./components/tracking-module-styles";
import { TrackingContainersTable } from "./components/TrackingContainersTable";
import { TrackingLiveMapDrawer } from "./components/TrackingLiveMapDrawer";
import { TrackingMovementDrawer } from "./components/TrackingMovementDrawer";
import { TrackingOverview } from "./components/TrackingOverview";
import { TrackingSearchFilter } from "./components/TrackingSearchFilter";
import { useTrackingController } from "./hooks/useTrackingController";

export function TrackingRoute() {
  const toast = useToast();
  const {
    isLoading,
    searchParams,
    hasSearched,
    trackingResult,
    executeSearch,
    handleSearchTypeChange,
    handleReset,
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

        <TrackingSearchFilter
          searchType={searchParams.searchType}
          searchValue={searchParams.searchValue}
          onSearch={executeSearch}
          onSearchTypeChange={handleSearchTypeChange}
          onReset={handleReset}
          isLoading={isLoading}
        />

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
        ) : hasSearched ? (
          <ModuleEmptyState
            artSize="sm"
            variant="blank"
            title="No tracking records found"
            message="Try another container, booking, or BL reference for this search type."
          />
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
