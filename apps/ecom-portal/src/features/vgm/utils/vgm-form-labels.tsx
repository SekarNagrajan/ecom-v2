// Modified by Sekar Nagarajan (2026-09-01 10:52)
import { Typography } from "antd";

const { Text } = Typography;

/** Label above input (agenct — field name first, value below). */
export const VGM_FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

/** Label above input (agenct — field name first, value below). */
export function vgmReqLabel(label: string) {
  return (
    <label className="form-field-label">
      {label} <Text type="danger">*</Text>
    </label>
  );
}

export function vgmOptionalLabel(label: string) {
  return <label className="form-field-label">{label}</label>;
}
