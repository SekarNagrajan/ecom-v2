// Modified by Sekar Nagarajan (2026-09-16 15:12)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { Space } from "antd";
import { useState } from "react";

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

const cargoImportAdapter = createCargoImportAdapter();

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
  const toast = useToast();
  const confirm = useConfirm();
  const [exporting, setExporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleExportTemplate = async () => {
    setExporting(true);
    try {
      await downloadSpreadsheetImportTemplate(cargoImportAdapter);
      toast.success("Template downloaded.");
    } catch {
      toast.error("Template download failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleOpenImport = () => {
    if (containerCount > 0) {
      confirm.danger({
        title: "Replace existing cargo?",
        content: `Importing Excel will replace the containers and cargo lines currently on this ${documentKind}. Continue?`,
        okText: "Replace & Import",
        cancelText: "Cancel",
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
      toast.error("No valid cargo rows to import.");
      return {
        totalRows: payloads.length,
        successCount: 0,
        failedCount: payloads.length,
        created: [],
        errors: payloads.map((_, index) => ({
          rowNumber: index + 1,
          message: "Row could not be mapped to a container",
        })),
      };
    }

    onImported?.(containers);
    toast.success(
      `Imported ${containers.length} container${
        containers.length === 1 ? "" : "s"
      } (${payloads.length} cargo line${payloads.length === 1 ? "" : "s"}).`,
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
          Export Template
        </AppButton>
        <AppButton
          icon={<AppIcon icon={Icons.filePlus} size={14} tone="create" />}
          onClick={() => handleOpenImport()}
        >
          Import Excel
        </AppButton>
      </Space>

      <AppModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        dialogSize="xl"
        destroyOnHidden
        footer={null}
        title={`Import Cargo — ${titleSuffix}`}
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
            title="Cargo Spreadsheet Import"
          />
        </div>
      </AppModal>
    </>
  );
}
