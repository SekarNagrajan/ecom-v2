// Modified by Sekar Nagarajan (2026-08-25 12:45)
import { AppButton, FormattedDate } from "@solverminds/shared-ui";
import { Space } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { StatementDTO } from "../types/customer-statement.types";
import { formatStatementAmount } from "../types/customer-statement.types";

interface StatementSummaryHeaderProps {
  statement: StatementDTO;
  exportingPdf: boolean;
  exportingXlsx: boolean;
  onExportPdf: () => void;
  onExportXlsx: () => void;
}

export function StatementSummaryHeader({
  statement,
  exportingPdf,
  exportingXlsx,
  onExportPdf,
  onExportXlsx,
}: StatementSummaryHeaderProps) {
  return (
    <div className="stmt-summary-header">
      <div className="stmt-summary-header__top">
        <div className="stmt-summary-header__meta">
          <span className="stmt-summary-header__account">
            {statement.accountName}
          </span>
          <span className="stmt-summary-header__period">
            <FormattedDate value={statement.period.from} />
            {" – "}
            <FormattedDate value={statement.period.to} />
            {" · "}
            {statement.currency}
          </span>
        </div>
        <div className="stmt-summary-header__actions">
          <Space wrap>
            <AppButton
              type="default"
              icon={<AppIcon icon={Icons.printer} size={16} tone="print" />}
              loading={exportingPdf}
              onClick={onExportPdf}
            >
              Export PDF
            </AppButton>
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.download} size={16} tone="download" />}
              loading={exportingXlsx}
              onClick={onExportXlsx}
            >
              Export Excel
            </AppButton>
          </Space>
        </div>
      </div>

      <div className="stmt-summary-cards">
        <div className="stmt-summary-card stmt-summary-card--opening">
          <span className="stmt-summary-card__label">Opening Balance</span>
          <span className="stmt-summary-card__value">
            {formatStatementAmount(
              statement.openingBalance,
              statement.currency,
            )}
          </span>
        </div>
        <div className="stmt-summary-card stmt-summary-card--closing">
          <span className="stmt-summary-card__label">Closing Balance</span>
          <span className="stmt-summary-card__value">
            {formatStatementAmount(
              statement.closingBalance,
              statement.currency,
            )}
          </span>
        </div>
        <div className="stmt-summary-card stmt-summary-card--net">
          <span className="stmt-summary-card__label">Net Movement</span>
          <span className="stmt-summary-card__value">
            {formatStatementAmount(statement.totals.net, statement.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
