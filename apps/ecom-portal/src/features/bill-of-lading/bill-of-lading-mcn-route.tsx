// Modified by Sekar Nagarajan (2026-08-25 11:25)
import { AppButton } from "@solverminds/shared-ui";
import { DataView, DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Space, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons, NavIcons } from "../../components/icons";
import { buildActionsColumn } from "../../components/shared/build-actions-column";
import { FeaturePageShell } from "../../components/shared/feature-page-shell";
import {
  ModuleEmptyState,
  buildRetryAction,
} from "../../components/shared/module-empty-state";
import { ModuleScreenHeader } from "../../components/shared/module-screen-header";
import { useLocalGridProfiles } from "../../components/shared/use-local-grid-profiles";
import { useMCNListQuery, useMCNPrintMutation } from "./api/bl.queries";
import { BlModuleStyles } from "./components/bl-module-styles";
import { ManifestDrawer } from "./components/ManifestDrawer";
import type { MCNListDTO } from "./types/bl.types";

const { Text } = Typography;

export function BillOfLadingMcnListRoute() {
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const navigate = useNavigate();
  const { profileHandlers } = useLocalGridProfiles("bl-mcn");
  const { data: rows = [], isLoading, isError, refetch } = useMCNListQuery();
  const { mutate: printMcn } = useMCNPrintMutation();
  const [manifestMcnId, setManifestMcnId] = useState<string | null>(null);

  const columns: DataViewColumn<MCNListDTO>[] = useMemo(() => [
    buildActionsColumn<MCNListDTO>({
      field: "mcnId",
      width: 120,
      cellRenderer: (params) => {
        if (!params.data) return null;
        return (
          <Space size={4}>
            <AppButton
              type="text"
              size="small"
              icon={
                <AppIcon icon={Icons.edit} size={16} gridAction tone="edit" />
              }
              onClick={() =>
                navigate({ to: `/app/bl/mcn/${params.data!.mcnId}/edit` })
              }
            />
            <AppButton
              type="text"
              size="small"
              icon={
                <AppIcon icon={Icons.eye} size={16} gridAction tone="view" />
              }
              onClick={() => setManifestMcnId(params.data!.mcnId)}
            />
            <AppButton
              type="text"
              size="small"
              icon={
                <AppIcon
                  icon={Icons.printer}
                  size={16}
                  gridAction
                  tone="print"
                />
              }
              onClick={() => printMcn({ mcnId: params.data!.mcnId })}
            />
          </Space>
        );
      },
    }),
    { field: "mcnId", headerName: t("columns.mcnNo"), width: 140, pinned: "left" },
    { field: "blNo", headerName: t("columns.blNo"), width: 140 },
    { field: "bookingNo", headerName: t("columns.bookingNo"), width: 140 },
    {
      field: "status",
      headerName: t("columns.status"),
      width: 120,
      cellRenderer: (p: { value?: string }) => <Tag>{p.value}</Tag>,
    },
    { field: "origin", headerName: t("columns.origin"), width: 180 },
    { field: "delivery", headerName: t("columns.delivery"), width: 180 },
  ], [navigate, printMcn, t]);

  const emptyState = isError ? (
    <ModuleEmptyState
      variant="error"
      title={t("empty.mcnLoadErrorTitle")}
      message={t("empty.mcnLoadErrorMessage")}
      actions={[buildRetryAction(() => void refetch())]}
    />
  ) : (
    <ModuleEmptyState
      variant="blank"
      title={t("empty.mcnEmptyTitle")}
      message={t("empty.mcnEmptyMessage")}
    />
  );

  return (
    <FeaturePageShell>
      <BlModuleStyles />
      <Card className="feature-page-card bl-page-card" bordered={false}>
        <div className="bl-page-layout">
          <div className="bl-page-header">
            <ModuleScreenHeader
              icon={NavIcons.billOfLading}
              title={t("mcn.title")}
              // recordCount={rows.length}
              subtitle={t("mcn.subtitle")}
              marginBottom={0}
              extra={
                <AppButton onClick={() => navigate({ to: "/app/bl" })}>
                  {t("actions.back")}
                </AppButton>
              }
            />
          </div>
          <div className="bl-toolbar">
            <Text type="secondary">
              {t("mcn.manifestCount", { count: rows.length })}
            </Text>
          </div>
          <div className="bl-grid-wrap bl-grid-wrap--no-toolbar responsive-table-wrap">
            {isError && rows.length === 0 && !isLoading ? (
              emptyState
            ) : (
              <DataView
                rowData={rows}
                loading={isLoading}
                columnDefs={columns}
                emptyState={emptyState}
                allowedViewModes={["list"]}
                defaultViewMode="list"
                renderToolbar={() => null}
                listOptions={{
                  ...profileHandlers,
                  showToolbar: { showTotalCount: true, fullScreen: true },
                  sideBar: true,
                  pagination: true,
                  paginationPageSize: 20,
                  pageSizeOptions: [10, 20, 50, 100],
                  defaultColDef: { filter: true },
                }}
              />
            )}
          </div>
        </div>
      </Card>

      <ManifestDrawer
        open={Boolean(manifestMcnId)}
        mcnId={manifestMcnId}
        onClose={() => setManifestMcnId(null)}
      />
    </FeaturePageShell>
  );
}

export function BillOfLadingMcnViewRoute() {
  const navigate = useNavigate();
  const { mcnId } = useParams({ strict: false }) as { mcnId: string };

  return (
    <>
      <BlModuleStyles />
      <ManifestDrawer
        open
        mcnId={mcnId}
        onClose={() => navigate({ to: "/app/bl/mcn" })}
      />
    </>
  );
}
