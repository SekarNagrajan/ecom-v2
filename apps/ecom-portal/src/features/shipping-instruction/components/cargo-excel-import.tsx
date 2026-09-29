// Modified by Sekar Nagarajan (2026-09-16 15:12)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { Space } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { BookingImportModuleStyles } from "../../booking-import/components/booking-import-module-styles";
import { SpreadsheetImportWorkbench } from "../../import-workbench/components/spreadsheet-import-workbench";
import type {
  SpreadsheetImportCommitResult,
  SpreadsheetImportValidateResult,
} from "../../import-workbench/types/import-workbench.types";
import { readExcelFileEngine } from "../../import-workbench/utils/read-excel-file-engine";
import { downloadSpreadsheetImportTemplate } from "../../import-workbench/utils/spreadsheet-import-template.utils";
import { createCargoImportAdapter } from "../import/cargo-import.adapter";
import type { CargoImportPayload } from "../import/cargo-import.types";
import { mapCargoImportRows } from "../import/map-cargo-import-rows";
import type { SIContainer } from "../types/si.types";

export type CargoExcelDocumentKind = "SI" | "B/L";

interface CargoExcelImportProps {
  /** Document number shown in the import modal title (SI No / B/L No). */
  documentNo: string;
  /** Used in confirm copy when replacing existing cargo. */
  documentKind?: CargoExcelDocumentKind;
  containerCount?: number;
  onImported?: (containers: SIContainer[]) => void;
}

export function CargoExcelImport({
  documentNo,
  documentKind = "SI",
  containerCount = 0,
  onImported,
}: CargoExcelImportProps) {
  const { t } = useTranslation(["bill-of-lading", "common"]);
  const toast = useToast();
  const confirm = useConfirm();
  const [exporting, setExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cargoImportAdapter = useMemo(
    () => createCargoImportAdapter(t),
    [t],
  );

  const handleExportTemplate = async () => {
    setExporting(true);
    try {
      await downloadSpreadsheetImportTemplate(cargoImportAdapter);
      toast.success(t("import.toasts.templateDownloaded"));
    } catch {
      toast.error(t("import.toasts.templateFailed"));
    } finally {
      setExporting(false);
    }
  };

  const handleOpenImport = () => {
    if (containerCount > 0) {
      confirm.danger({
        title: t("import.confirm.replaceTitle"),
        content: t("import.confirm.replaceContent", { documentKind }),
        okText: t("import.confirm.replaceOk"),
        cancelText: t("common:actions.cancel"),
        onOk: () => {
          setModalOpen(true);
        },
      });
      return;
    }
    setModalOpen(true);
  };

  const handleValidate = async (
    _payloads: CargoImportPayload[],
  ): Promise<SpreadsheetImportValidateResult> => {
    return { errors: [] };
  };

  const handleCommit = async (
    payloads: CargoImportPayload[],
  ): Promise<SpreadsheetImportCommitResult> => {
    const containers = mapCargoImportRows(payloads);
    if (containers.length === 0) {
      toast.error(t("import.toasts.noValidRows"));
      return {
        totalRows: payloads.length,
        successCount: 0,
        failedCount: payloads.length,
        created: [],
        errors: payloads.map((_, index) => ({
          rowNumber: index + 1,
          message: t("import.toasts.rowUnmapped"),
        })),
      };
    }

    onImported?.(containers);
    toast.success(
      t("import.toasts.imported", {
        containers: containers.length,
        lines: payloads.length,
      }),
    );
    setModalOpen(false);

    return {
      totalRows: payloads.length,
      successCount: payloads.length,
      failedCount: 0,
      created: payloads.map((_, index) => ({
        rowNumber: index + 1,
        uuid: containers[Math.min(index, containers.length - 1)]?.id ?? null,
      })),
      errors: [],
    };
  };

  const titleSuffix = documentNo || documentKind;

  return (
    <>
      <BookingImportModuleStyles />
      <Space wrap>
        <AppButton
          icon={<AppIcon icon={Icons.download} size={14} tone="download" />}
          loading={exporting}
          onClick={() => void handleExportTemplate()}
        >
          {t("import.actions.exportTemplate")}
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.filePlus} size={14} tone="create" />}
          onClick={() => handleOpenImport()}
        >
          {t("import.actions.importExcel")}
        </AppButton>
      </Space>

      <AppModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        dialogSize="xl"
        destroyOnHidden
        footer={null}
        title={t("import.modalTitle", { suffix: titleSuffix })}
        className="cargo-excel-import-modal"
        classNames={{
          body: "cargo-excel-import-modal__body custom-scroll",
        }}
      >
        <div className="cargo-excel-import-modal__content">
          <SpreadsheetImportWorkbench
            adapter={cargoImportAdapter}
            engine={readExcelFileEngine}
            onCancel={() => setModalOpen(false)}
            onValidate={handleValidate}
            onCommit={handleCommit}
            title={t("import.workbenchTitle")}
          />
        </div>
      </AppModal>
    </>
  );
}
