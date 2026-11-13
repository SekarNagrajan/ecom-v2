// Created by Sekar Nagarajan (2026-09-08 15:44)
import { AppButton } from "@solverminds/shared-ui";
import { useDateFormat, useToast } from "@solverminds/shared-ui/hooks";
import { Tooltip } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { useDashboardExport } from "../hooks/use-dashboard-export";
import { getDashboardFilterLabel } from "../utils/filter-dashboard-shipments";
import {
  DashboardExportDialog,
  type DashboardExportFormValues,
  type DashboardExportPreviewState,
  type DashboardExportScopeRow,
} from "./dashboard-export-dialog";

export interface DashboardExportButtonProps {
  activeFilter?: string;
  filterLabel?: string;
  shipmentCount?: number;
  totalShipmentCount?: number;
  disabled?: boolean;
}

/** Export control for the enhanced dashboard header. */
export function DashboardExportButton({
  activeFilter = "all",
  filterLabel,
  shipmentCount,
  totalShipmentCount,
  disabled = false,
}: DashboardExportButtonProps) {
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<DashboardExportPreviewState | null>(
    null,
  );
  const { formatDateTime } = useDateFormat();
  const { generatePreview, downloadExport, isGenerating, isDownloading } =
    useDashboardExport({ activeFilter });

  const resolvedFilterLabel =
    filterLabel || getDashboardFilterLabel(activeFilter, t);

  const scopeRows: DashboardExportScopeRow[] = [
    { label: t("export.scopeKpiFilter"), value: resolvedFilterLabel },
    {
      label: t("export.scopeShipments"),
      value:
        shipmentCount === undefined
          ? t("export.currentDashboardData")
          : totalShipmentCount !== undefined
            ? t("export.shipmentsOf", {
                shown: shipmentCount,
                total: totalShipmentCount,
              })
            : String(shipmentCount),
    },
  ];

  const handleClose = () => {
    setPreview(null);
    setOpen(false);
  };

  const handlePreview = async ({
    reportTitle,
    format,
  }: DashboardExportFormValues) => {
    try {
      const result = await generatePreview({
        reportTitle,
        format,
        activeFilter,
      });
      setPreview({
        format: result.format,
        report: result.report,
        filename: result.filename,
      });
    } catch {
      // Hook toasted.
    }
  };

  const handleDownload = async () => {
    if (!preview) return;
    try {
      const result = await downloadExport({
        reportTitle: preview.report.title,
        format: preview.format,
        report: preview.report,
        activeFilter,
      });
      if (result.missingChartCount > 0) {
        toast.warning(
          result.missingChartCount === 1
            ? t("export.chartsMissingOne", {
                count: result.missingChartCount,
              })
            : t("export.chartsMissingOther", {
                count: result.missingChartCount,
              }),
        );
      }
      toast.success(t("export.downloaded", { title: preview.report.title }));
      handleClose();
    } catch {
      // Hook toasted.
    }
  };

  return (
    <>
      <Tooltip title={t("export.buttonTooltip")}>
        <AppButton
          icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
          onClick={() => setOpen(true)}
          disabled={disabled}
          loading={(isGenerating || isDownloading) && !open}
          aria-label={t("export.buttonTooltip")}
        >
          {t("common:actions.export")}
        </AppButton>
      </Tooltip>

      {open ? (
        <DashboardExportDialog
          open={open}
          defaultTitle={t("export.defaultTitle")}
          scopeRows={scopeRows}
          generating={isGenerating}
          downloading={isDownloading}
          preview={preview}
          formatGeneratedAt={(isoUtc) => formatDateTime(isoUtc)}
          onCancel={handleClose}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onBackFromPreview={() => setPreview(null)}
          onFormatChange={() => setPreview(null)}
        />
      ) : null}
    </>
  );
}
