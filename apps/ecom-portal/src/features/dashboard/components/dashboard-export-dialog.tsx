// Modified by Sekar Nagarajan (2026-09-08 15:44)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppModal, FormInput } from "@solverminds/shared-ui";
import { Flex, Radio, Spin, Typography, theme } from "antd";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import type { DashboardExportFormat } from "../hooks/use-dashboard-export";
import type { DashboardReport } from "../types/dashboard-export.types";
import { ReportHtmlPreview } from "./report-html-preview";

const { Text } = Typography;

const CONFIGURE_DIALOG_WIDTH = 520;
const PREVIEW_DIALOG_SIZE = "lg";

const exportFormSchema = z.object({
  reportTitle: z
    .string()
    .trim()
    .min(3, "Report title must be at least 3 characters")
    .max(150, "Report title must be at most 150 characters"),
  format: z.enum(["pdf", "pptx"]),
});

export type DashboardExportFormValues = z.infer<typeof exportFormSchema>;

export interface DashboardExportScopeRow {
  label: string;
  value: string;
}

export interface DashboardExportPreviewState {
  format: DashboardExportFormat;
  report: DashboardReport;
  filename: string;
}

export interface DashboardExportDialogProps {
  open: boolean;
  defaultTitle: string;
  scopeRows: DashboardExportScopeRow[];
  generating: boolean;
  downloading: boolean;
  preview: DashboardExportPreviewState | null;
  formatGeneratedAt: (isoUtc: string) => string;
  onCancel: () => void;
  onPreview: (values: DashboardExportFormValues) => void;
  onDownload: () => void;
  onBackFromPreview: () => void;
  onFormatChange?: (format: DashboardExportFormat) => void;
}

/** Configure → Preview (HTML) → Download (jsPDF / PPTX). */
export function DashboardExportDialog({
  open,
  defaultTitle,
  scopeRows,
  generating,
  downloading,
  preview,
  formatGeneratedAt,
  onCancel,
  onPreview,
  onDownload,
  onBackFromPreview,
  onFormatChange,
}: DashboardExportDialogProps) {
  const { token } = theme.useToken();
  const isPreviewMode = preview !== null;
  const busy = generating || downloading;

  const { control, handleSubmit } = useForm<DashboardExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: { reportTitle: defaultTitle, format: "pdf" },
  });

  const downloadLabel =
    preview?.format === "pptx" ? "Download PowerPoint" : "Download PDF";

  return (
    <AppModal
      open={open}
      title={isPreviewMode ? "Report Preview" : "Export Report"}
      dialogSize={isPreviewMode ? PREVIEW_DIALOG_SIZE : CONFIGURE_DIALOG_WIDTH}
      onCancel={onCancel}
      maskClosable={!busy}
      closable={!busy}
      footer={
        isPreviewMode ? (
          <Flex justify="flex-end" gap={token.marginXS}>
            <AppButton onClick={onBackFromPreview} disabled={busy}>
              Back
            </AppButton>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.download} size={16} />}
              loading={downloading}
              onClick={onDownload}
            >
              {downloadLabel}
            </AppButton>
          </Flex>
        ) : (
          <Flex justify="flex-end" gap={token.marginXS}>
            <AppButton onClick={onCancel} disabled={busy}>
              Cancel
            </AppButton>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.eye} size={16} />}
              loading={generating}
              onClick={handleSubmit(onPreview)}
            >
              Preview
            </AppButton>
          </Flex>
        )
      }
    >
      {isPreviewMode && preview ? (
        <DashboardExportPreviewPane
          preview={preview}
          generating={generating}
          formatGeneratedAt={formatGeneratedAt}
        />
      ) : (
        <Flex
          vertical
          gap={token.marginSM}
          style={{ paddingBlock: token.paddingXS }}
        >
          <FormInput
            control={control}
            name="reportTitle"
            label="Report Title"
            placeholder="e.g. Dashboard Report"
            autoFocus
            maxLength={150}
            disabled={busy}
          />

          <Flex vertical gap={token.marginXXS}>
            <Text style={{ fontSize: token.fontSizeSM }}>Format</Text>
            <Controller
              control={control}
              name="format"
              render={({ field }) => (
                <Radio.Group
                  value={field.value}
                  optionType="button"
                  buttonStyle="solid"
                  disabled={busy}
                  onChange={(e) => {
                    const next = e.target.value as DashboardExportFormat;
                    field.onChange(next);
                    onFormatChange?.(next);
                  }}
                >
                  <Radio.Button value="pdf">PDF</Radio.Button>
                  <Radio.Button value="pptx">PowerPoint</Radio.Button>
                </Radio.Group>
              )}
            />
          </Flex>

          {generating ? (
            <Flex
              vertical
              align="center"
              justify="center"
              gap={token.marginXS}
              style={{ paddingBlock: token.paddingLG }}
            >
              <Spin />
              <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Generating report…
              </Text>
            </Flex>
          ) : (
            <DashboardExportScopeBlock rows={scopeRows} />
          )}
        </Flex>
      )}
    </AppModal>
  );
}

function DashboardExportPreviewPane({
  preview,
  generating,
  formatGeneratedAt,
}: {
  preview: DashboardExportPreviewState;
  generating: boolean;
  formatGeneratedAt: (isoUtc: string) => string;
}) {
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={token.marginSM}>
      <div
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadius,
          overflow: "hidden",
          backgroundColor: token.colorFillQuaternary,
          minHeight: "60vh",
        }}
      >
        {generating ? (
          <Flex
            align="center"
            justify="center"
            style={{ minHeight: "60vh" }}
            gap={token.marginXS}
            vertical
          >
            <Spin />
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Updating preview…
            </Text>
          </Flex>
        ) : (
          <ReportHtmlPreview
            report={preview.report}
            format={preview.format}
            formatGeneratedAt={formatGeneratedAt}
          />
        )}
      </div>

      <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        Preview — final layout may differ slightly.
      </Text>
    </Flex>
  );
}

function DashboardExportScopeBlock({
  rows,
}: {
  rows: DashboardExportScopeRow[];
}) {
  const { token } = theme.useToken();

  if (rows.length === 0) {
    return null;
  }

  return (
    <div
      style={
        {
          // backgroundColor: token.colorFillQuaternary,
          // border: `1px solid ${token.colorBorderSecondary}`,
          // borderRadius: token.borderRadius,
          // paddingInline: token.paddingSM,
          // paddingBlock: token.paddingXS,
        }
      }
    >
      {/* <Text
        type="secondary"
        style={{
          fontSize: token.fontSizeSM,
          fontWeight: token.fontWeightStrong,
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        Will be exported with
      </Text>
      <Flex
        vertical
        gap={token.marginXXS}
        style={{ marginTop: token.marginXS }}
      >
        {rows.map((row) => (
          <Flex key={row.label} gap={token.marginSM}>
            <Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM, minWidth: 90 }}
            >
              {row.label}
            </Text>
            <Text style={{ fontSize: token.fontSizeSM }}>{row.value}</Text>
          </Flex>
        ))}
      </Flex> */}
    </div>
  );
}
