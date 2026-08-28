// Modified by Sekar Nagarajan (2026-08-28 11:15)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Space, Typography, Upload } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type { SIContainer } from "../../shipping-instruction/types/si.types";
import { fetchBLExcelTemplate, importBLExcel } from "../api/bl.api";
import { DEFAULT_BL_WIZARD_CONFIG } from "../config/bl-wizard-config";
import { validateExcelFile } from "../utils/bl-excel-import.utils";

const { Text } = Typography;

interface BlExcelImportProps {
  blNo: string;
  containerCount?: number;
  onImported?: (containers: SIContainer[]) => void;
}

export function BlExcelImport({
  blNo,
  containerCount = 0,
  onImported,
}: BlExcelImportProps) {
  const toast = useToast();
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportTemplate = async () => {
    setExporting(true);
    try {
      const result = await fetchBLExcelTemplate(blNo);
      if (result.error || !result.data) {
        toast.error(result.error?.message ?? "Failed to download template");
        return;
      }
      const url = URL.createObjectURL(result.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `BL-${blNo}-cargo-template.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Template downloaded.");
    } catch {
      toast.error("Template download failed.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    const validation = validateExcelFile(
      file,
      DEFAULT_BL_WIZARD_CONFIG.allowedFileExtensions.filter((ext) =>
        [".xls", ".xlsx"].includes(ext),
      ),
      undefined,
      containerCount,
    );
    if (!validation.valid) {
      toast.error(validation.error ?? "Invalid file");
      return false;
    }

    setImporting(true);
    try {
      const result = await importBLExcel(blNo, file);
      if (result.error) {
        toast.error(result.error.message);
        return false;
      }
      toast.success("Cargo data imported successfully.");
      onImported?.([]);
    } catch {
      toast.error(`${file.name} import failed.`);
    } finally {
      setImporting(false);
    }
    return false;
  };

  return (
    <Space wrap className="bl-excel-import">
      <AppButton
        icon={<AppIcon icon={Icons.download} size={14} />}
        loading={exporting}
        onClick={() => void handleExportTemplate()}
      >
        Export Template
      </AppButton>
      <Upload
        accept=".xls,.xlsx"
        showUploadList={false}
        disabled={importing}
        beforeUpload={(file) => {
          void handleImport(file);
          return false;
        }}
      >
        <AppButton
          icon={<AppIcon icon={Icons.filePlus} size={14} />}
          loading={importing}
        >
          Import Excel
        </AppButton>
      </Upload>
    </Space>
  );
}
