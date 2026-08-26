// Created by Sekar Nagarajan (2026-08-26 12:48)
import { Typography } from "antd";

const { Text } = Typography;

/** Required field label — asterisk after label text (agenct.md). */
export function vgmReqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

export function vgmOptionalLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}
