// Modified by Sekar Nagarajan (2026-09-08 15:44)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppModal, FormInput } from "@solverminds/shared-ui";
import { Flex, Radio, Spin, Typography, theme } from "antd";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import type { DashboardExportFormat } from "../hooks/use-dashboard-export";
import type { DashboardReport } from "../types/dashboard-export.types";
import { ReportHtmlPreview } from "./report-html-preview";

const { Text } = Typography;

const CONFIGURE_DIALOG_WIDTH = 520;
const PREVIEW_DIALOG_SIZE = "lg";

function createExportFormSchema(t: TFunction<"dashboard">) {
  return z.object({
    reportTitle: z
      .string()
      .trim()
      .min(3, t("export.validation.titleMin"))
      .max(150, t("export.validation.titleMax")),
    format: z.enum(["pdf", "pptx"]),
  });
}

export type DashboardExportFormValues = {
  reportTitle: string;
  format: DashboardExportFormat;
};

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
  const { t } = useTranslation(["dashboard", "common", "modules"]);
  const { token } = theme.useToken();
  const isPreviewMode = preview !== null;
  const busy = generating || downloading;
  const schema = useMemo(() => createExportFormSchema(t), [t]);

  const { control, handleSubmit } = useForm<DashboardExportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reportTitle: defaultTitle, format: "pdf" },
  });

  const downloadLabel =
    preview?.format === "pptx"
      ? t("export.downloadPptx")
      : t("export.downloadPdf");

  return (
    <AppModal
      open={open}
      title={
        isPreviewMode ? t("export.previewTitle") : t("export.dialogTitle")
      }
      dialogSize={isPreviewMode ? PREVIEW_DIALOG_SIZE : CONFIGURE_DIALOG_WIDTH}
      onCancel={onCancel}
      maskClosable={!busy}
      closable={!busy}
      footer={
        isPreviewMode ? (
          <Flex justify="flex-end" gap={token.marginXS}>
            <AppButton onClick={onBackFromPreview} disabled={busy}>
              {t("common:actions.back")}
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
              {t("common:actions.cancel")}
            </AppButton>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.eye} size={16} />}
              loading={generating}
              onClick={handleSubmit(onPreview)}
            >
              {t("export.preview")}
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
            label={t("export.reportTitle")}
            placeholder={t("export.reportTitlePlaceholder")}
            autoFocus
            maxLength={150}
            disabled={busy}
          />

          <Flex vertical gap={token.marginXXS}>
            <Text style={{ fontSize: token.fontSizeSM }}>
              {t("export.format")}
            </Text>
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
                  <Radio.Button value="pdf">{t("export.formatPdf")}</Radio.Button>
                  <Radio.Button value="pptx">
                    {t("export.formatPptx")}
                  </Radio.Button>
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
                {t("export.generating")}
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
  const { t } = useTranslation(["dashboard", "common", "modules"]);
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
              {t("export.updatingPreview")}
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
        {t("export.previewDisclaimer")}
      </Text>
    </Flex>
  );
}

function DashboardExportScopeBlock({
  rows,
}: {
  rows: DashboardExportScopeRow[];
}) {
  if (rows.length === 0) {
    return null;
  }

  return <div />;
}
