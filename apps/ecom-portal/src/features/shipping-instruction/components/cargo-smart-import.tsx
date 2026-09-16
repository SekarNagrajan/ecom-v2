// Modified by Sekar Nagarajan (2026-09-16 15:52)
import { AppButton, AppModal } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Space, Typography } from "antd";
import { useState } from "react";

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
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState<SmartImportRow[]>([]);

  const containerCount = new Set(rows.map((row) => row.containerId)).size;
  const lineCount = rows.length;

  const handleOpen = () => {
    if (containers.length === 0) {
      toast.error("Add containers before Smart Import.");
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
    const result = smartImportRowsToContainers(rows, containers);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onApplied?.(result.containers);
    toast.success("Cargo updated from Smart Import.");
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
        Smart Import
      </AppButton>

      <AppModal
        open={modalOpen}
        onCancel={handleCancel}
        dialogSize="xl"
        destroyOnHidden
        title="Smart Import"
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
              {containerCount} container{containerCount === 1 ? "" : "s"} ·{" "}
              {lineCount} cargo line{lineCount === 1 ? "" : "s"}
            </Typography.Text>
            <Space>
              <AppButton danger onClick={handleCancel}>
                Cancel
              </AppButton>
              <AppButton type="primary" onClick={() => handleUpdate()}>
                Update
              </AppButton>
            </Space>
          </div>
        }
      >
        <div className="cargo-smart-import-modal__content">
          <div className="cargo-smart-import-modal__banner">
            <Typography.Text className="cargo-smart-import-modal__hint">
              Click a cell to edit. Right-click a row for insert, duplicate,
              clear, select container lines, or delete. Container No, Type, and
              Commodity stay locked — edit SOC, Actual Container No, and seals
              to update the container.
            </Typography.Text>
          </div>
          {modalOpen && rows.length > 0 ? (
            <CargoSmartImportGrid
              rows={rows}
              onRowsChange={setRows}
              onDeleteWouldDropContainer={() => {
                toast.warning(
                  "Removing the last line for a container will block Update until that container has at least one line again.",
                );
              }}
            />
          ) : (
            <div className="cargo-smart-import-grid cargo-smart-import-grid--empty">
              <Typography.Text type="secondary">
                No cargo lines to edit.
              </Typography.Text>
            </div>
          )}
        </div>
      </AppModal>
    </>
  );
}
