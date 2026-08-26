// Modified by Sekar Nagarajan (2026-08-26 17:19)
import { Typography } from "antd";

const { Text } = Typography;

/** Label above input (agenct — field name first, value below). */
export const VGM_FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

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
