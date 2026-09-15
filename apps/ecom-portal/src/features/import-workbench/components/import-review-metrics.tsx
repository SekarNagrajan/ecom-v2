// Modified by Sekar Nagarajan (2026-09-15 17:20)
import { theme } from "antd";

import { AppIcon, Icons } from "../../../components/icons";

interface ImportReviewMetricsProps {
  fileName: string;
  invalidRowCount: number;
  issueCount: number;
  rowCount: number;
  validRowCount: number;
}

export function ImportReviewMetrics({
  fileName,
  invalidRowCount,
  issueCount,
  rowCount,
  validRowCount,
}: ImportReviewMetricsProps) {
  const { token } = theme.useToken();

  return (
    <div className="import-wb-metrics" aria-label="Import review metrics">
      <div className="import-wb-metric import-wb-metric--file">
        <span className="import-wb-metric__label">
          <AppIcon
            icon={Icons.fileText}
            size={14}
            style={{ color: token.colorTextSecondary, marginRight: 4 }}
          />
          File
        </span>
        <span className="import-wb-metric__value import-wb-metric__value--sm" title={fileName}>
          {fileName}
        </span>
      </div>

      <div className="import-wb-metric">
        <span className="import-wb-metric__label">Rows</span>
        <span className="import-wb-metric__value">{rowCount}</span>
      </div>

      <div
        className={`import-wb-metric${
          invalidRowCount > 0 ? " import-wb-metric--invalid" : ""
        }`}
      >
        <span className="import-wb-metric__label">Invalid</span>
        <span
          className="import-wb-metric__value"
          style={{
            color: invalidRowCount > 0 ? token.colorError : undefined,
          }}
        >
          {invalidRowCount}
        </span>
      </div>

      <div
        className={`import-wb-metric${
          issueCount > 0 ? " import-wb-metric--issues" : ""
        }`}
      >
        <span className="import-wb-metric__label">Issues</span>
        <span
          className="import-wb-metric__value"
          style={{
            color: issueCount > 0 ? token.colorWarning : undefined,
          }}
        >
          {issueCount}
        </span>
      </div>

      <div className="import-wb-metric import-wb-metric--valid">
        <span className="import-wb-metric__label">Valid</span>
        <span
          className="import-wb-metric__value"
          style={{ color: token.colorSuccess }}
        >
          {validRowCount}
        </span>
      </div>
    </div>
  );
}
