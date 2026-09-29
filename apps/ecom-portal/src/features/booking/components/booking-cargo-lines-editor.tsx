// Modified by Sekar Nagarajan (2026-09-11 11:52)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import {
  Input,
  InputNumber,
  Segmented,
  Select,
  Tooltip,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { CargoLinesEditorStyles } from "../../shipping-instruction/components/cargo-lines-editor-styles";
import { useBookingLookups } from "../api/booking.queries";
import {
  createCargoSchema,
  createEmptyCommodity,
  createEmptyContainer,
  syncMockContainerSeqFromNos,
  type CargoData,
  type CommodityItem,
  type ContainerItem,
} from "../types/booking.types";
import {
  countContainerIssues,
  firstContainerErrorIndex,
  matchesCargoSearch,
} from "../utils/booking-cargo-completeness";
import { BookingCargoEditorStyles } from "./booking-cargo-editor-styles";
import { BookingCargoGridView } from "./booking-cargo-grid-view";
import { BookingCargoListView } from "./booking-cargo-list-view";

const { Text } = Typography;

const PAGE_SIZE = 12; // containers per page
const MAX_ADD_QTY = 20; // keep bulk-add manageable

type CargoViewMode = "list" | "grid";

interface BookingCargoLinesEditorProps {
  defaultValues: CargoData;
  onSubmit: (data: CargoData) => void;
  onPrevious: () => void;
}

export function BookingCargoLinesEditor({
  defaultValues,
  onSubmit,
  onPrevious,
}: BookingCargoLinesEditorProps) {
  const { t } = useTranslation(["booking", "common"]);
  const toast = useToast();
  const { data: packageTypes = [] } = useBookingLookups("packageTypes");
  const { data: containerTypes = [] } = useBookingLookups("containerTypes");
  const { data: dgClasses = [] } = useBookingLookups("dgClasses");

  const schema = useMemo(() => createCargoSchema((k) => t(k)), [t]);

  const [viewMode, setViewMode] = useState<CargoViewMode>("list");
  const [search, setSearch] = useState("");
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(
    defaultValues.containers[0]?.id ?? null,
  );
  const [addQty, setAddQty] = useState(1);
  const [addType, setAddType] = useState(
    defaultValues.containers[0]?.containerType ||
      containerTypes[0]?.value ||
      "20DC",
  );
  const [page, setPage] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CargoData>({
    resolver: zodResolver(schema) as Resolver<CargoData>,
    defaultValues,
  });

  const {
    fields: containerFields,
    append: appendContainer,
    remove: removeContainer,
  } = useFieldArray({ control, name: "containers" });

  const containersWatch = watch("containers") ?? [];

  const issueCount = containersWatch.reduce(
    (n, c) => n + countContainerIssues(c),
    0,
  );
  const lineCount = containersWatch.reduce(
    (n, c) => n + (c.commodities?.length ?? 0),
    0,
  );
  const packageCount = containersWatch.reduce(
    (n, c) =>
      n +
      (c.commodities ?? []).reduce(
        (sum, line) => sum + Number(line.packageQuantity || 0),
        0,
      ),
    0,
  );

  const filteredIndexes = containersWatch
    .map((c, index) => ({ c, index }))
    .filter(({ c }) => {
      if (!matchesCargoSearch(c, search)) return false;
      if (incompleteOnly && countContainerIssues(c) === 0) return false;
      return true;
    })
    .map(({ index }) => index);

  const pageCount = Math.max(1, Math.ceil(filteredIndexes.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageIndexes = filteredIndexes.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const handleAddContainers = () => {
    const qty = Math.max(1, Math.min(MAX_ADD_QTY, addQty || 1));
    syncMockContainerSeqFromNos(
      getValues("containers").map((c) => c.containerNo),
    );
    for (let i = 0; i < qty; i += 1) {
      appendContainer(createEmptyContainer(addType));
    }
    setAddQty(1);
    setPage(Math.floor((containersWatch.length + qty - 1) / PAGE_SIZE));
  };

  const handleDuplicateContainer = (index: number) => {
    const current = getValues(`containers.${index}`);
    if (!current) return;
    syncMockContainerSeqFromNos(
      getValues("containers").map((c) => c.containerNo),
    );
    const fresh = createEmptyContainer(current.containerType);
    const clone: ContainerItem = {
      ...structuredClone(current),
      id: fresh.id,
      containerNo: fresh.containerNo,
      commodities: (current.commodities ?? []).map((line) => ({
        ...structuredClone(line),
        id: createEmptyCommodity().id,
      })),
    };
    appendContainer(clone);
    toast.success(t("wizard.cargo.containerDuplicated"));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        const errorIndex = firstContainerErrorIndex(formErrors);
        if (errorIndex === null) return;
        const container = containersWatch[errorIndex];
        const fieldId =
          containerFields[errorIndex]?.id ??
          container?.id ??
          String(errorIndex);
        setExpandedId(container?.id ?? fieldId);
        setViewMode("list");
        setPage(Math.floor(errorIndex / PAGE_SIZE));
      })}
      autoComplete="off"
      className="form-step-layout"
    >
      <CargoLinesEditorStyles />
      <BookingCargoEditorStyles />
      <div className="custom-scroll form-step-scroll">
        <div className="si-cargo-editor">
          <div className="si-cargo-controls">
            <div className="si-cargo-toolbar">
              <div className="si-cargo-toolbar__filters">
                <Input
                  allowClear
                  size="large"
                  className="si-cargo-toolbar__search"
                  placeholder={t("wizard.cargo.searchPlaceholder")}
                  prefix={<AppIcon icon={Icons.search} size={15} />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="si-cargo-toolbar__actions">
                {/* Modified by Sekar Nagarajan (2026-09-02 17:36) */}
                <Segmented
                  className="booking-cargo-view-segmented"
                  size="large"
                  value={viewMode}
                  onChange={(v) => setViewMode(v as CargoViewMode)}
                  options={[
                    {
                      value: "list",
                      icon: <AppIcon icon={Icons.layoutList} size={18} />,
                    },
                    {
                      value: "grid",
                      icon: <AppIcon icon={Icons.layoutGrid} size={18} />,
                    },
                  ]}
                />
                <div className="si-cargo-toolbar__add">
                  <Tooltip title={t("wizard.cargo.quantityToAdd")}>
                    <span>
                      <InputNumber
                        className="si-cargo-toolbar__add-qty"
                        size="large"
                        min={1}
                        max={MAX_ADD_QTY}
                        value={addQty}
                        onChange={(v) =>
                          setAddQty(
                            Math.max(1, Math.min(MAX_ADD_QTY, Number(v) || 1)),
                          )
                        }
                      />
                    </span>
                  </Tooltip>
                  <Text
                    type="secondary"
                    className="si-cargo-toolbar__add-times"
                  >
                    ×
                  </Text>
                  <Tooltip title={t("wizard.cargo.containerType")}>
                    <span>
                      <Select
                        className="si-cargo-toolbar__add-type"
                        size="large"
                        value={addType}
                        options={containerTypes}
                        onChange={setAddType}
                        showSearch
                        optionFilterProp="label"
                        optionLabelProp="value"
                        popupMatchSelectWidth={280}
                      />
                    </span>
                  </Tooltip>
                  <AppButton
                    type="primary"
                    className="si-cargo-toolbar__add-btn"
                    icon={<AppIcon icon={Icons.plus} size={13} />}
                    onClick={handleAddContainers}
                  >
                    {t("wizard.cargo.addContainerBtn")}
                  </AppButton>
                </div>
              </div>
            </div>

            <div className="si-cargo-summary" aria-live="polite">
              <span className="si-cargo-summary__metric">
                <Text strong className="si-cargo-summary__metric-value">
                  {containersWatch.length}
                </Text>
                <Text type="secondary">{t("wizard.cargo.summaryContainers")}</Text>
              </span>
              <span className="si-cargo-summary__metric">
                <Text strong className="si-cargo-summary__metric-value">
                  {lineCount}
                </Text>
                <Text type="secondary">{t("wizard.cargo.summaryCommodities")}</Text>
              </span>
              <span className="si-cargo-summary__metric">
                <Text strong className="si-cargo-summary__metric-value">
                  {packageCount.toLocaleString()}
                </Text>
                <Text type="secondary">{t("wizard.cargo.summaryPackages")}</Text>
              </span>
              {issueCount > 0 ? (
                <span className="si-cargo-vchip si-cargo-vchip--warn">
                  <AppIcon icon={Icons.alertTriangle} size={12} tone="edit" />
                  {t("wizard.cargo.issueCount", { count: issueCount })}
                </span>
              ) : (
                <span className="si-cargo-vchip si-cargo-vchip--ok">
                  <AppIcon icon={Icons.check} size={12} />
                  {t("wizard.cargo.allComplete")}
                </span>
              )}
              {search || incompleteOnly ? (
                <Text
                  type="secondary"
                  className="si-cargo-summary__filter-hint"
                >
                  {t("wizard.cargo.showingFiltered", { shown: filteredIndexes.length, total: containersWatch.length })}
                </Text>
              ) : null}
            </div>
          </div>

          {viewMode === "list" ? (
            <BookingCargoListView
              pageIndexes={pageIndexes}
              containerFields={containerFields}
              containersWatch={containersWatch}
              control={control}
              errors={errors as Record<string, unknown>}
              packageTypes={packageTypes}
              containerTypes={containerTypes}
              dgClasses={dgClasses}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              setValue={setValue}
              getValues={getValues}
              watch={watch}
              toastError={(msg) => toast.error(msg)}
              toastSuccess={(msg) => toast.success(msg)}
              onDuplicate={handleDuplicateContainer}
              onDelete={(index) => {
                if (containerFields.length <= 1) {
                  toast.error(t("wizard.cargo.atLeastOneContainer"));
                  return;
                }
                removeContainer(index);
              }}
            />
          ) : (
            <BookingCargoGridView
              pageIndexes={pageIndexes}
              containersWatch={containersWatch}
              control={control}
              errors={errors as Record<string, unknown>}
              packageTypes={packageTypes}
              containerTypes={containerTypes}
              dgClasses={dgClasses}
              setValue={setValue}
              onAddLine={(ci) => {
                const lines = getValues(`containers.${ci}.commodities`) ?? [];
                setValue(`containers.${ci}.commodities`, [
                  ...lines,
                  createEmptyCommodity(),
                ]);
              }}
              onDuplicateLine={(ci, mi) => {
                const lines = getValues(`containers.${ci}.commodities`) ?? [];
                const source = lines[mi];
                if (!source) return;
                const next = [...lines];
                const copy: CommodityItem = {
                  ...structuredClone(source),
                  id: createEmptyCommodity().id,
                };
                next.splice(mi + 1, 0, copy);
                setValue(`containers.${ci}.commodities`, next);
              }}
              onRemoveLine={(ci, mi) => {
                const lines = getValues(`containers.${ci}.commodities`) ?? [];
                if (lines.length <= 1) {
                  toast.error(t("wizard.cargo.atLeastOneCommodity"));
                  return;
                }
                setValue(
                  `containers.${ci}.commodities`,
                  lines.filter((_, i) => i !== mi),
                );
              }}
            />
          )}

          {filteredIndexes.length > PAGE_SIZE ? (
            <div className="si-cargo-pager">
              <Text>
                {t("wizard.cargo.pagerRange", { from: safePage * PAGE_SIZE + 1, to: Math.min((safePage + 1) * PAGE_SIZE, filteredIndexes.length), total: filteredIndexes.length })}
              </Text>
              <div className="list-actions-row">
                <AppButton
                  disabled={safePage === 0}
                  icon={<AppIcon icon={Icons.chevronLeft} size={16} />}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                />
                <Text>
                  {t("wizard.cargo.pagerPage", { page: safePage + 1, pageCount })}
                </Text>
                <AppButton
                  disabled={safePage >= pageCount - 1}
                  icon={<AppIcon icon={Icons.chevronRight} size={16} />}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="form-step-footer">
        <AppButton htmlType="button" onClick={onPrevious}>
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" htmlType="submit">
          {t("common:actions.next")}
        </AppButton>
      </div>
    </form>
  );
}
