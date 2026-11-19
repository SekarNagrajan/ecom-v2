import { AppButton } from "@solverminds/shared-ui";
import { Tooltip, Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import type { VendorApprovalItem } from "../types/vendor-approvals.types";

const { Text } = Typography;

const TYPE_LABEL: Record<VendorApprovalItem["type"], string> = {
  BOOKING: "Booking",
  SI: "SI",
  VGM: "VGM",
};

function summarizeTypes(rows: VendorApprovalItem[]): string {
  const counts: Partial<Record<VendorApprovalItem["type"], number>> = {};
  for (const row of rows) {
    counts[row.type] = (counts[row.type] ?? 0) + 1;
  }
  return (Object.keys(counts) as VendorApprovalItem["type"][])
    .map((type) => {
      const count = counts[type] ?? 0;
      return `${count} ${TYPE_LABEL[type]}${count === 1 ? "" : "s"}`;
    })
    .join(" · ");
}

export interface VendorApprovalsBulkBarProps {
  selectedRows: VendorApprovalItem[];
  pendingInViewCount: number;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  onSelectAllPending: () => void;
}

export function VendorApprovalsBulkBar({
  selectedRows,
  pendingInViewCount,
  onApprove,
  onReject,
  onClear,
  onSelectAllPending,
}: VendorApprovalsBulkBarProps) {
  const count = selectedRows.length;
  if (count === 0) return null;

  const typeSummary = summarizeTypes(selectedRows);
  const canSelectMore = pendingInViewCount > count;

  return (
    <div
      className="va-bulk-bar"
      role="region"
      aria-label="Bulk approval actions"
    >
      <div className="va-bulk-bar__info">
        <span className="va-bulk-bar__badge" aria-hidden>
          {count}
        </span>
        <div className="va-bulk-bar__copy">
          <Text strong className="va-bulk-bar__title">
            {count === 1
              ? "1 request selected"
              : `${count} requests selected`}
          </Text>
          <Text type="secondary" className="va-bulk-bar__subtitle">
            {typeSummary}
            {canSelectMore
              ? ` · ${pendingInViewCount - count} more pending in view`
              : null}
          </Text>
        </div>
      </div>

      <div className="va-bulk-bar__actions">
        {/* {canSelectMore ? (
          <AppButton type="link" size="small" onClick={onSelectAllPending}>
            Select all pending
          </AppButton>
        ) : null} */}
        <AppButton
          type="primary"
          icon={<AppIcon icon={Icons.checkCircle} size={16} />}
          onClick={onApprove}
        >
          Approve
        </AppButton>
        <AppButton
          danger
          icon={<AppIcon icon={Icons.circleX} size={16} tone="delete" />}
          onClick={onReject}
        >
          Reject
        </AppButton>
        <Tooltip title="Clear selection">
          <AppButton
            type="text"
            shape="circle"
            className="va-bulk-bar__dismiss"
            icon={<AppIcon icon={Icons.x} size={16} tone="delete" />}
            onClick={onClear}
            aria-label="Clear selection"
          />
        </Tooltip>
      </div>
    </div>
  );
}

export function buildBulkConfirmContent(
  rows: VendorApprovalItem[],
  action: "approve" | "reject",
): string {
  const verb = action === "approve" ? "Approve" : "Reject";
  const count = rows.length;
  const preview = rows
    .slice(0, 3)
    .map((row) => row.referenceNo)
    .join(", ");
  const overflow = count > 3 ? ` and ${count - 3} more` : "";
  return `${verb} ${count} pending request${count === 1 ? "" : "s"} (${preview}${overflow})? This cannot be undone from this screen.`;
}
