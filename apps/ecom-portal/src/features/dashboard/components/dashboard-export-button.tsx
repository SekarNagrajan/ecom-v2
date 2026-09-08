// Created by Sekar Nagarajan (2026-09-08 15:44)
import { AppButton } from "@solverminds/shared-ui";
import { useDateFormat, useToast } from "@solverminds/shared-ui/hooks";
import { Tooltip } from "antd";
import { useState } from "react";

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
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<DashboardExportPreviewState | null>(
    null,
  );
  const { formatDateTime } = useDateFormat();
  const { generatePreview, downloadExport, isGenerating, isDownloading } =
    useDashboardExport({ activeFilter });

  const resolvedFilterLabel =
    filterLabel || getDashboardFilterLabel(activeFilter);

  const scopeRows: DashboardExportScopeRow[] = [
    { label: "KPI filter", value: resolvedFilterLabel },
    {
      label: "Shipments",
      value:
        shipmentCount === undefined
          ? "Current dashboard data"
          : totalShipmentCount !== undefined
            ? `${shipmentCount} of ${totalShipmentCount}`
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
          `${result.missingChartCount} chart${
            result.missingChartCount === 1 ? "" : "s"
          } could not be rendered and appear as placeholders.`,
        );
      }
      toast.success(`"${preview.report.title}" downloaded`);
      handleClose();
    } catch {
      // Hook toasted.
    }
  };

  return (
    <>
      <Tooltip title="Export Report">
        <AppButton
          icon={<AppIcon icon={Icons.download} size={16} />}
          onClick={() => setOpen(true)}
          disabled={disabled}
          loading={(isGenerating || isDownloading) && !open}
          aria-label="Export Report"
        >
          Export
        </AppButton>
      </Tooltip>

      {open ? (
        <DashboardExportDialog
          open={open}
          defaultTitle="Dashboard Report"
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
