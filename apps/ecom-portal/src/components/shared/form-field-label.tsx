// Created by Sekar Nagarajan (2026-11-12 12:40)
/**
 * Shared form-field label helpers (agenct.md rule: labels use `.form-field-label` and required
 * fields show a red asterisk AFTER the label text). Previously copy-pasted into ~11 feature files.
 */
import { Typography } from "antd";
import type { ReactNode } from "react";

const { Text } = Typography;

/** `Label *` — required field label. */
export function reqLabel(label: ReactNode): ReactNode {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

/** Plain label with the shared class (optional field). */
export function optLabel(label: ReactNode): ReactNode {
  return <span className="form-field-label">{label}</span>;
}

/** Vertical layout without the trailing colon — the house default for shared Form* fields. */
export const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

/** Row gutter used between form fields: [horizontal, vertical]. */
export const FIELD_GUTTER: [number, number] = [16, 20];
