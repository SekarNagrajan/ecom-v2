import { AppButton, AppModal, AppTextarea } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { useEffect, useState } from "react";

import { useAiTextAssist } from "../../ai-assist";
import type { VendorApprovalItem } from "../types/vendor-approvals.types";

const { Text } = Typography;

const MIN_REMARKS_LENGTH = 3;
const MAX_REMARKS_LENGTH = 500;

export interface VendorApprovalsRejectModalProps {
  open: boolean;
  items: VendorApprovalItem[];
  onCancel: () => void;
  onConfirm: (remarks: string) => void;
}

export function VendorApprovalsRejectModal({
  open,
  items,
  onCancel,
  onConfirm,
}: VendorApprovalsRejectModalProps) {
  const { textareaAssistProps } = useAiTextAssist();
  const [remarks, setRemarks] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setRemarks("");
      setTouched(false);
    }
  }, [open]);

  const trimmed = remarks.trim();
  const isEmpty = trimmed.length === 0;
  const isTooShort = trimmed.length > 0 && trimmed.length < MIN_REMARKS_LENGTH;
  const canSubmit = trimmed.length >= MIN_REMARKS_LENGTH;
  const count = items.length;
  const isBulk = count > 1;

  const previewRefs = items
    .slice(0, 3)
    .map((item) => item.referenceNo)
    .join(", ");
  const overflow = count > 3 ? ` and ${count - 3} more` : "";

  const handleConfirm = () => {
    setTouched(true);
    if (!canSubmit) return;
    onConfirm(trimmed);
  };

  return (
    <AppModal
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      title={isBulk ? `Reject ${count} Requests` : "Reject Request"}
      className="va-reject-modal-dialog"
      classNames={{
        body: "va-reject-modal-dialog__body",
        footer: "va-reject-modal-dialog__footer-wrap",
      }}
      footer={
        <div className="va-reject-modal__footer">
          <AppButton onClick={onCancel}>Cancel</AppButton>
          <AppButton danger type="primary" onClick={handleConfirm}>
            {isBulk ? `Reject ${count}` : "Reject"}
          </AppButton>
        </div>
      }
    >
      <div className="va-reject-modal">
        <Text className="va-reject-modal__intro">
          {isBulk
            ? `You are rejecting ${count} pending requests (${previewRefs}${overflow}). Please provide a reason before continuing.`
            : `Reject ${items[0]?.referenceNo ?? "this request"} for ${items[0]?.customerName ?? "the customer"}? Please provide a reason.`}
        </Text>

        <div className="va-reject-modal__field">
          <label className="va-reject-modal__label" htmlFor="va-reject-remarks">
            Rejection remarks{" "}
            <span className="va-reject-modal__required">*</span>
          </label>
          <AppTextarea
            id="va-reject-remarks"
            value={remarks}
            rows={5}
            maxLength={MAX_REMARKS_LENGTH}
            showCount
            placeholder="Enter the reason for rejection"
            status={touched && (isEmpty || isTooShort) ? "error" : undefined}
            onChange={(event) => setRemarks(event.target.value)}
            onBlur={() => setTouched(true)}
            {...textareaAssistProps}
          />
          {touched && isEmpty ? (
            <Text type="danger" className="va-reject-modal__error">
              Remarks are required to reject.
            </Text>
          ) : null}
          {touched && isTooShort ? (
            <Text type="danger" className="va-reject-modal__error">
              Please enter at least {MIN_REMARKS_LENGTH} characters.
            </Text>
          ) : null}
        </div>
      </div>
    </AppModal>
  );
}
