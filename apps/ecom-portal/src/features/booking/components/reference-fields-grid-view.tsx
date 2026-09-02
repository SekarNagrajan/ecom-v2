// Created by Sekar Nagarajan (2026-09-02 11:20)
import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import type { ReferenceField } from "../utils/reference-field.utils";
import { ReferenceFieldInput } from "./reference-field-input";

export interface ReferenceFieldsGridViewProps {
  fields: ReferenceField[];
  onUpdateValue: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}

/** Card grid layout — 3 columns on desktop, responsive down to 1. */
export function ReferenceFieldsGridView({
  fields,
  onUpdateValue,
  onDelete,
}: ReferenceFieldsGridViewProps) {
  return (
    <div className="ref-fields-list">
      {fields.map((field) => (
        <div key={field.id} className="ref-fields-row">
          <div className="ref-fields-row__top">
            <label className="form-field-label ref-fields-row__label">
              {field.name}
            </label>
            <div className="ref-fields-row__actions">
              <ListActionsRow>
                <ListActionButton
                  title="Remove Field"
                  icon={
                    <AppIcon icon={Icons.trash} size={16} tone="delete" />
                  }
                  tone="delete"
                  onClick={() => onDelete(field.id)}
                />
              </ListActionsRow>
            </div>
          </div>
          <div className="ref-fields-row__value">
            <ReferenceFieldInput
              field={field}
              onUpdateValue={onUpdateValue}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
