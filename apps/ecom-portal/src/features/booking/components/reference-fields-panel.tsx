// Modified by Sekar Nagarajan (2026-09-02 11:21)
import { AppButton } from "@solverminds/shared-ui";
import { Checkbox, Divider, Popover, Segmented, Typography } from "antd";
import { useMemo, useState } from "react";

import { AppIcon, Icons } from "../../../components/icons";
import {
  createReferenceField,
  REFERENCE_FIELD_CATALOG,
  type ReferenceField,
  type ReferenceFieldKey,
} from "../utils/reference-field.utils";
import { ReferenceFieldsGridView } from "./reference-fields-grid-view";
import { ReferenceFieldsListView } from "./reference-fields-list-view";
import { ReferenceFieldsStyles } from "./reference-fields-styles";

const { Text, Title } = Typography;

type ReferenceViewMode = "grid" | "list";

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
  const [viewMode, setViewMode] = useState<ReferenceViewMode>("list");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [selectedCatalogKeys, setSelectedCatalogKeys] = useState<
    Set<ReferenceFieldKey>
  >(() => new Set());

  const existingKeys = new Set(fields.map((f) => f.key));

  const availableCatalogItems = useMemo(
    () =>
      REFERENCE_FIELD_CATALOG.filter(
        (item) => !fields.some((field) => field.key === item.key),
      ),
    [fields],
  );

  const allAvailableSelected =
    availableCatalogItems.length > 0 &&
    availableCatalogItems.every((item) => selectedCatalogKeys.has(item.key));

  const someAvailableSelected =
    selectedCatalogKeys.size > 0 && !allAvailableSelected;

  const handleCatalogOpenChange = (open: boolean) => {
    setCatalogOpen(open);
    if (open) {
      setSelectedCatalogKeys(new Set());
    }
  };

  const toggleCatalogKey = (key: ReferenceFieldKey, checked: boolean) => {
    setSelectedCatalogKeys((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleSelectAllCatalog = (checked: boolean) => {
    if (checked) {
      setSelectedCatalogKeys(
        new Set(availableCatalogItems.map((item) => item.key)),
      );
      return;
    }
    setSelectedCatalogKeys(new Set());
  };

  const addSelectedFields = () => {
    if (selectedCatalogKeys.size === 0) return;

    const nextFields = [...fields];
    for (const item of REFERENCE_FIELD_CATALOG) {
      if (!selectedCatalogKeys.has(item.key) || existingKeys.has(item.key)) {
        continue;
      }
      const preferred =
        item.key === "rateRefNo" ? rateReferenceNo ?? undefined : undefined;
      nextFields.push(createReferenceField(item, preferred));
    }

    onChange(nextFields);
    setSelectedCatalogKeys(new Set());
    setCatalogOpen(false);
  };

  const updateValue = (id: string, value: string) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const deleteField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const catalogPicker = (
    <div
      className="ref-fields-catalog-picker"
      onClick={(event) => event.stopPropagation()}
    >
      <Text strong className="ref-fields-catalog-picker__title">
        Select reference fields
      </Text>

      {availableCatalogItems.length === 0 ? (
        <Text type="secondary" className="ref-fields-catalog-picker__empty">
          All reference fields have been added
        </Text>
      ) : (
        <>
          <Checkbox
            className="ref-fields-catalog-picker__select-all"
            checked={allAvailableSelected}
            indeterminate={someAvailableSelected}
            onChange={(event) => handleSelectAllCatalog(event.target.checked)}
          >
            Select All
          </Checkbox>

          <Divider className="ref-fields-catalog-picker__divider" />

          <div className="ref-fields-catalog-picker__list custom-scroll">
            {REFERENCE_FIELD_CATALOG.map((item) => {
              const alreadyAdded = existingKeys.has(item.key);
              return (
                <Checkbox
                  key={item.key}
                  className="ref-fields-catalog-picker__option"
                  checked={selectedCatalogKeys.has(item.key)}
                  disabled={alreadyAdded}
                  onChange={(event) =>
                    toggleCatalogKey(item.key, event.target.checked)
                  }
                >
                  <span className="ref-fields-catalog-item">
                    <span>{item.label}</span>
                    {alreadyAdded ? (
                      <Text
                        type="success"
                        className="ref-fields-catalog-item__tag"
                      >
                        Added
                      </Text>
                    ) : item.type === "radio" ? (
                      <Text
                        type="secondary"
                        className="ref-fields-catalog-item__tag"
                      ></Text>
                    ) : null}
                  </span>
                </Checkbox>
              );
            })}
          </div>
        </>
      )}

      <Divider className="ref-fields-catalog-picker__divider" />

      <div className="ref-fields-catalog-picker__footer">
        <AppButton danger onClick={() => handleCatalogOpenChange(false)}>
          Cancel
        </AppButton>
        <AppButton
          type="primary"
          disabled={
            availableCatalogItems.length === 0 || selectedCatalogKeys.size === 0
          }
          onClick={addSelectedFields}
        >
          Add Selected
          {selectedCatalogKeys.size > 0 ? ` (${selectedCatalogKeys.size})` : ""}
        </AppButton>
      </div>
    </div>
  );

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
              {/* {fields.length > 0 ? (
                <Text type="secondary" className="ref-fields-header__count">
                  ({fields.length}{" "}
                  {fields.length === 1 ? "field" : "fields"})
                </Text>
              ) : null} */}
            </div>
            <Text type="secondary" className="ref-fields-header__hint">
              Add reference fields to help identify and track this shipment
            </Text>
          </div>
        </div>

        <div className="ref-fields-header__actions">
          {fields.length > 0 ? (
            <Segmented
              className="ref-fields-view-segmented"
              value={viewMode}
              onChange={(value) => setViewMode(value as ReferenceViewMode)}
              options={[
                {
                  value: "grid",
                  label: (
                    <span className="ref-fields-view-opt">
                      <AppIcon icon={Icons.layoutGrid} size={14} />
                      List
                    </span>
                  ),
                },
                {
                  value: "list",
                  label: (
                    <span className="ref-fields-view-opt">
                      <AppIcon icon={Icons.layoutList} size={14} />
                      Grid
                    </span>
                  ),
                },
              ]}
            />
          ) : null}

          <Popover
            open={catalogOpen}
            onOpenChange={handleCatalogOpenChange}
            trigger="click"
            placement="bottomRight"
            arrow={false}
            content={catalogPicker}
            overlayClassName="ref-fields-catalog-popover"
          >
            <AppButton
              type="primary"
              icon={<AppIcon icon={Icons.plus} size={14} />}
              disabled={availableCatalogItems.length === 0}
            >
              Add Reference Field
            </AppButton>
          </Popover>
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="ref-fields-empty">
          <AppIcon icon={Icons.fileText} size={40} tone="muted" />
          <Text strong>No reference fields added yet</Text>
          <Text type="secondary">
            Click &quot;Add Reference Field&quot; to get started
          </Text>
        </div>
      ) : viewMode === "grid" ? (
        <ReferenceFieldsGridView
          fields={fields}
          onUpdateValue={updateValue}
          onDelete={deleteField}
        />
      ) : (
        <ReferenceFieldsListView
          fields={fields}
          onUpdateValue={updateValue}
          onDelete={deleteField}
        />
      )}
    </>
  );
}
