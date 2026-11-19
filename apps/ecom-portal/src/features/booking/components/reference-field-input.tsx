// Created by Sekar Nagarajan (2026-09-02 11:20)
import { Input, Radio } from "antd";
import { useTranslation } from "react-i18next";

import type { ReferenceField } from "../utils/reference-field.utils";

export interface ReferenceFieldInputProps {
  field: ReferenceField;
  onUpdateValue: (id: string, value: string) => void;
}

/** Shared text/radio value editor for grid and list reference field views. */
function translateOptionLabel(value: string, t: (key: string) => string): string {
  switch (value) {
    case "Prepaid": return t("booking:wizard.freight.prepaid");
    case "Collect": return t("booking:wizard.freight.collect");
    default: return value;
  }
}

export function ReferenceFieldInput({
  field,
  onUpdateValue,
}: ReferenceFieldInputProps) {
  const { t } = useTranslation("booking");
  if (field.type === "radio") {
    return (
      <Radio.Group
        value={field.value}
        onChange={(event) => onUpdateValue(field.id, event.target.value)}
        className="ref-fields-radio"
        optionType="button"
        buttonStyle="solid"
        options={(field.options ?? []).map((opt) => ({
          label: translateOptionLabel(opt, t),
          value: opt,
        }))}
      />
    );
  }

  return (
    <Input
      size="large"
      value={field.value}
      placeholder={field.placeholder}
      onChange={(event) => onUpdateValue(field.id, event.target.value)}
      className="form-field-full-width ref-fields-input"
    />
  );
}
