// Created by Sekar Nagarajan (2026-09-02 11:20)
import { Input, Radio } from "antd";

import type { ReferenceField } from "../utils/reference-field.utils";

export interface ReferenceFieldInputProps {
  field: ReferenceField;
  onUpdateValue: (id: string, value: string) => void;
}

/** Shared text/radio value editor for grid and list reference field views. */
export function ReferenceFieldInput({
  field,
  onUpdateValue,
}: ReferenceFieldInputProps) {
  if (field.type === "radio") {
    return (
      <Radio.Group
        value={field.value}
        onChange={(event) => onUpdateValue(field.id, event.target.value)}
        className="ref-fields-radio"
        optionType="button"
        buttonStyle="solid"
        options={(field.options ?? []).map((opt) => ({
          label: opt,
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
