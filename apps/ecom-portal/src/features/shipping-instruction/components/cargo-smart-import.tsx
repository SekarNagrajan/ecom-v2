// Modified by Sekar Nagarajan (2026-09-16 15:52)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Space, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import {
  containersToSmartImportRows,
  smartImportRowsToContainers,
} from "../smart-import/map-smart-import-rows";
import type { SmartImportRow } from "../smart-import/smart-import.types";
import type { SIContainer } from "../types/si.types";
import { CargoLinesEditorStyles } from "./cargo-lines-editor-styles";
import { CargoSmartImportGrid } from "./cargo-smart-import-grid";

interface CargoSmartImportProps {
  containers: SIContainer[];
  onApplied?: (containers: SIContainer[]) => void;
}

export function CargoSmartImport({
  containers,
  onApplied,
}: CargoSmartImportProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState<SmartImportRow[]>([]);

  const containerCount = new Set(rows.map((row) => row.containerId)).size;
  const lineCount = rows.length;

  const handleOpen = () => {
    if (containers.length === 0) {
      toast.error(t("import.smart.needContainers"));
      return;
    }
    setRows(containersToSmartImportRows(containers));
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setRows([]);
  };

  const handleUpdate = () => {
    const result = smartImportRowsToContainers(rows, containers, t);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onApplied?.(result.containers);
    toast.success(t("import.smart.updated"));
    setModalOpen(false);
    setRows([]);
  };

  return (
    <>
      <CargoLinesEditorStyles />
      <AppButton
        icon={<AppIcon icon={Icons.layoutGrid} size={14} tone="edit" />}
        onClick={() => handleOpen()}
      >
        {t("import.smart.title")}
      </AppButton>

      <AppModal
        open={modalOpen}
        onCancel={handleCancel}
        dialogSize="xl"
        destroyOnHidden
        title={t("import.smart.title")}
        className="cargo-smart-import-modal"
        classNames={{
          body: "cargo-smart-import-modal__body custom-scroll",
        }}
        footer={
          <div className="cargo-smart-import-modal__footer">
            <Typography.Text
              type="secondary"
              className="cargo-smart-import-modal__footer-meta"
            >
              {t("import.smart.footerMeta", {
                containers: containerCount,
                lines: lineCount,
              })}
            </Typography.Text>
            <Space>
              <AppButton danger onClick={handleCancel}>
                {t("common:actions.cancel")}
              </AppButton>
              <AppButton type="primary" onClick={() => handleUpdate()}>
                {t("import.smart.update")}
              </AppButton>
            </Space>
          </div>
        }
      >
        <div className="cargo-smart-import-modal__content">
          <div className="cargo-smart-import-modal__banner">
            <Typography.Text className="cargo-smart-import-modal__hint">
              {t("import.smart.hint")}
            </Typography.Text>
          </div>
          {modalOpen && rows.length > 0 ? (
            <CargoSmartImportGrid
              rows={rows}
              onRowsChange={setRows}
              onDeleteWouldDropContainer={() => {
                toast.warning(t("import.smart.lastLineWarning"));
              }}
            />
          ) : (
            <div className="cargo-smart-import-grid cargo-smart-import-grid--empty">
              <Typography.Text type="secondary">
                {t("import.smart.empty")}
              </Typography.Text>
            </div>
          )}
        </div>
      </AppModal>
    </>
  );
}
