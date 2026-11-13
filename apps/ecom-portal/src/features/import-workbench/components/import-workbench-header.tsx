// Modified by Sekar Nagarajan (2026-09-15 17:20)
import {
  AppButton,
  AppDrawer,
  AppFileUpload,
  AppPopover,
} from "@solverminds/shared-ui";
import { useAntdBreakpoint } from "@solverminds/shared-ui/hooks";
import { Typography, theme } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { SpreadsheetImportFieldDefinition } from "../types/import-workbench.types";
import { ImportColumnGuidePopoverContent } from "./import-column-guide-popover-content";

interface ImportWorkbenchHeaderProps<TValues extends object> {
  accept: string;
  canSubmit: boolean;
  canExport: boolean;
  disableFileActions: boolean;
  fileName?: string;
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[];
  isSubmitting: boolean;
  isDownloadingTemplate?: boolean;
  maxSizeBytes: number;
  onBack: () => void;
  onDownloadTemplate?: () => void | Promise<void>;
  onExportReview: () => void;
  onFileSelect: (file: File) => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
  onValidationError: (message: string | null) => void;
  submitLabel: string;
  subtitle?: string;
  title: string;
}

export function ImportWorkbenchHeader<TValues extends object>({
  accept,
  canSubmit,
  canExport,
  disableFileActions,
  fileName,
  fields,
  isSubmitting,
  isDownloadingTemplate = false,
  maxSizeBytes,
  onBack,
  onDownloadTemplate,
  onExportReview,
  onFileSelect,
  onSubmit,
  onValidationError,
  submitLabel,
  subtitle,
  title,
}: ImportWorkbenchHeaderProps<TValues>) {
  const { t } = useTranslation(["import-workbench", "common"]);
  const { token } = theme.useToken();
  const { isMobile } = useAntdBreakpoint();
  const [isColumnGuideOpen, setIsColumnGuideOpen] = useState(false);
  const hasFile = Boolean(fileName);
  const resolvedSubtitle = subtitle ?? t("header.defaultSubtitle");
  const columnGuideContent = (
    <ImportColumnGuidePopoverContent fields={fields} />
  );

  return (
    <header className="import-wb__header">
      <div className="import-wb__header-row">
        <div className="import-wb__title-block">
          <AppButton
            type="text"
            icon={<AppIcon icon={Icons.chevronLeft} size={16} />}
            onClick={onBack}
            aria-label={t("common:actions.back")}
          />
          <div className="import-wb__title-text">
            <Typography.Title level={4}>{title}</Typography.Title>
            <Typography.Text type="secondary">{resolvedSubtitle}</Typography.Text>
          </div>
        </div>

        <div className="import-wb__actions custom-scroll">
          {hasFile ? (
            <AppFileUpload
              mode="button"
              accept={accept}
              maxSizeBytes={maxSizeBytes}
              buttonLabel={t("header.replaceFile")}
              onFileSelect={onFileSelect}
              onValidationError={onValidationError}
              showFeedback={false}
              disabled={disableFileActions}
            />
          ) : null}
          {onDownloadTemplate ? (
            <AppButton
              icon={<AppIcon icon={Icons.download} size={16} />}
              onClick={() => void onDownloadTemplate()}
              loading={isDownloadingTemplate}
              disabled={disableFileActions}
            >
              {t("header.downloadTemplate")}
            </AppButton>
          ) : null}
          {!isMobile ? (
            <AppPopover
              trigger="click"
              placement="bottomRight"
              content={columnGuideContent}
              styles={{
                container: {
                  maxHeight: 420,
                  maxWidth: 520,
                  overflowX: "hidden",
                  overflowY: "auto",
                },
              }}
            >
              <AppButton icon={<AppIcon icon={Icons.info} size={16} />}>
                {t("header.columnGuide")}
              </AppButton>
            </AppPopover>
          ) : (
            <AppButton
              icon={<AppIcon icon={Icons.info} size={16} />}
              onClick={() => setIsColumnGuideOpen(true)}
            >
              {t("header.columnGuide")}
            </AppButton>
          )}
          {hasFile ? (
            <AppButton
              icon={<AppIcon icon={Icons.fileText} size={16} />}
              onClick={onExportReview}
              disabled={!canExport}
            >
              {t("header.exportReview")}
            </AppButton>
          ) : null}
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.inbox} size={16} />}
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!canSubmit}
          >
            {submitLabel}
          </AppButton>
        </div>
      </div>

      {isMobile ? (
        <AppDrawer
          open={isColumnGuideOpen}
          onClose={() => setIsColumnGuideOpen(false)}
          title={t("header.columnGuide")}
          placement="bottom"
          dialogSize="xs"
          destroyOnHidden
          footer={null}
          styles={{
            body: {
              padding: token.paddingSM,
              overflowY: "auto",
            },
          }}
        >
          {columnGuideContent}
        </AppDrawer>
      ) : null}
    </header>
  );
}
