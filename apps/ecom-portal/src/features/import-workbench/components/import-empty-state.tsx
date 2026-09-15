// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { AppFileUpload } from "@solverminds/shared-ui";
import { Typography, theme } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { SpreadsheetImportFieldDefinition } from "../types/import-workbench.types";
import { ImportFieldOverview } from "./import-field-overview";

interface ImportEmptyStateProps<TValues extends object> {
  accept: string;
  disabled?: boolean;
  fields: readonly SpreadsheetImportFieldDefinition<TValues>[];
  maxSizeBytes: number;
  onFileSelect: (file: File) => void | Promise<void>;
  onValidationError?: (message: string | null) => void;
}

export function ImportEmptyState<TValues extends object>({
  accept,
  disabled = false,
  fields,
  maxSizeBytes,
  onFileSelect,
  onValidationError,
}: ImportEmptyStateProps<TValues>) {
  const { token } = theme.useToken();
  const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);

  return (
    <div className="import-wb-empty">
      <section className="import-wb-empty__upload" aria-label="Upload workbook">
        <div className="import-wb-empty__upload-intro">
          <Typography.Title level={5} style={{ margin: 0 }}>
            Upload workbook
          </Typography.Title>
          <Typography.Text type="secondary">
            Drop your Excel file here, or download the template first so headers
            match required columns.
          </Typography.Text>
        </div>

        <div className="import-wb-empty__hints">
          <span className="import-wb-empty__hint">
            <AppIcon
              icon={Icons.fileText}
              size={16}
              style={{ color: token.colorPrimary }}
            />
            <Typography.Text>.xlsx only</Typography.Text>
          </span>
          <span className="import-wb-empty__hint">
            <AppIcon
              icon={Icons.shieldCheck}
              size={16}
              style={{ color: token.colorSuccess }}
            />
            <Typography.Text>Header row required</Typography.Text>
          </span>
          <span className="import-wb-empty__hint">
            <AppIcon
              icon={Icons.refreshCw}
              size={16}
              style={{ color: token.colorWarning }}
            />
            <Typography.Text>{`${maxMb} MB max`}</Typography.Text>
          </span>
        </div>

        <div className="import-wb-empty__dropzone">
          <AppFileUpload
            mode="dropzone"
            accept={accept}
            maxSizeBytes={maxSizeBytes}
            title="Drop workbook"
            description="Drag and drop or click to browse"
            onFileSelect={onFileSelect}
            onValidationError={onValidationError}
            showFeedback={false}
            disabled={disabled}
          />
        </div>
      </section>

      <aside className="import-wb-empty__guide" aria-label="Column guide">
        <div className="import-wb-empty__guide-head">
          <Typography.Title level={5} style={{ margin: 0 }}>
            Column guide
          </Typography.Title>
          <Typography.Text type="secondary">
            Required fields appear first in the template and in this list.
          </Typography.Text>
        </div>
        <div className="import-wb-empty__guide-body custom-scroll">
          <ImportFieldOverview fields={fields} compact />
        </div>
      </aside>
    </div>
  );
}
