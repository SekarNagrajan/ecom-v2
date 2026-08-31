// Created by Sekar Nagarajan (2026-08-31 14:46)
import { AppButton } from "@solverminds/shared-ui";
import { Dropdown, Input, Radio, Typography } from "antd";
import { useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import {
  createReferenceField,
  REFERENCE_FIELD_CATALOG,
  type ReferenceField,
  type ReferenceFieldCatalogItem,
} from "../utils/reference-field.utils";
import { ReferenceFieldsStyles } from "./reference-fields-styles";

const { Text, Title } = Typography;

export interface ReferenceFieldsPanelProps {
  fields: ReferenceField[];
  onChange: (next: ReferenceField[]) => void;
  /** Prefill Rate Reference No. when adding that catalog item. */
  rateReferenceNo?: string | null;
}

export function ReferenceFieldsPanel({
  fields,
  onChange,
  rateReferenceNo,
}: ReferenceFieldsPanelProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const existingKeys = new Set(fields.map((f) => f.key));

  const addField = (item: ReferenceFieldCatalogItem) => {
    if (existingKeys.has(item.key)) return;
    const preferred =
      item.key === "rateRefNo" ? rateReferenceNo ?? undefined : undefined;
    onChange([...fields, createReferenceField(item, preferred)]);
    setCatalogOpen(false);
  };

  const updateValue = (id: string, value: string) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const deleteField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const catalogItems = REFERENCE_FIELD_CATALOG.map((item) => {
    const alreadyAdded = existingKeys.has(item.key);
    return {
      key: item.key,
      disabled: alreadyAdded,
      label: (
        <div className="ref-fields-catalog-item">
          <span>{item.label}</span>
          {alreadyAdded ? (
            <Text type="success" className="ref-fields-catalog-item__tag">
              Added
            </Text>
          ) : item.type === "radio" ? (
            <Text type="secondary" className="ref-fields-catalog-item__tag">
              radio
            </Text>
          ) : null}
        </div>
      ),
      onClick: () => addField(item),
    };
  });

  return (
    <>
      <ReferenceFieldsStyles />
      <div className="ref-fields-header">
        <div className="ref-fields-header__intro">
          <span className="ref-fields-header__icon app-icon-inherit">
            <AppIcon icon={Icons.fileText} size={18} />
          </span>
          <div>
            <div className="ref-fields-header__title-row">
              <Title level={5} className="ref-fields-header__title">
                References
              </Title>
              <Text type="secondary" className="ref-fields-header__count">
                ({fields.length} fields)
              </Text>
            </div>
            <Text type="secondary" className="ref-fields-header__hint">
              Add reference fields to help identify and track this shipment
            </Text>
          </div>
        </div>

        <Dropdown
          open={catalogOpen}
          onOpenChange={setCatalogOpen}
          trigger={["click"]}
          menu={{
            items: catalogItems,
            className: "ref-fields-catalog-menu custom-scroll",
          }}
        >
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={14} />}
          >
            Add Reference Field
          </AppButton>
        </Dropdown>
      </div>

      {fields.length === 0 ? (
        <div className="ref-fields-empty">
          <AppIcon icon={Icons.fileText} size={40} tone="muted" />
          <Text strong>No reference fields added yet</Text>
          <Text type="secondary">
            Click &quot;Add Reference Field&quot; to get started
          </Text>
        </div>
      ) : (
        <div className="ref-fields-list">
          {fields.map((field) => (
            <div key={field.id} className="ref-fields-row">
              <div className="ref-fields-row__label">{field.name}</div>
              <div className="ref-fields-row__value">
                {field.type === "radio" ? (
                  <Radio.Group
                    value={field.value}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                    className="ref-fields-radio"
                    optionType="button"
                    buttonStyle="solid"
                    options={(field.options ?? []).map((opt) => ({
                      label: opt,
                      value: opt,
                    }))}
                  />
                ) : (
                  <Input
                    size="large"
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                    className="form-field-full-width"
                  />
                )}
              </div>
              <div className="ref-fields-row__actions">
                <ListActionsRow>
                  <ListActionButton
                    title="Remove Field"
                    icon={
                      <AppIcon icon={Icons.trash} size={16} tone="delete" />
                    }
                    tone="delete"
                    onClick={() => deleteField(field.id)}
                  />
                </ListActionsRow>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
