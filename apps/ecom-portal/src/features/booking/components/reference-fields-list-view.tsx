// Created by Sekar Nagarajan (2026-09-02 11:20)
import { Typography } from "antd";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import type { ReferenceField } from "../utils/reference-field.utils";
import { ReferenceFieldInput } from "./reference-field-input";

const { Text } = Typography;

const TABLE_HEADERS = ["Field Name", "Value", "Actions"] as const;

export interface ReferenceFieldsListViewProps {
  fields: ReferenceField[];
  onUpdateValue: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}

/** Tabular list layout — Field Name | Value | Actions columns. */
export function ReferenceFieldsListView({
  fields,
  onUpdateValue,
  onDelete,
}: ReferenceFieldsListViewProps) {
  return (
    <div className="ref-fields-table-wrap">
      <div className="custom-scroll ref-fields-table-scroll">
        <table className="ref-fields-table">
          <thead>
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th
                  key={header}
                  className={
                    header === "Actions"
                      ? "ref-fields-table__th-actions"
                      : undefined
                  }
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.id}>
                <td className="ref-fields-table__td-name">
                  <Text strong className="ref-fields-table__name">
                    {field.name}
                  </Text>
                </td>
                <td className="ref-fields-table__td-value">
                  <ReferenceFieldInput
                    field={field}
                    onUpdateValue={onUpdateValue}
                  />
                </td>
                <td className="ref-fields-table__td-actions">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
