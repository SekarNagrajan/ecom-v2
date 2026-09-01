// Modified by Sekar Nagarajan (2026-09-01 17:40)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Input, Segmented, Tooltip, Typography } from "antd";
import { useState, type ReactNode } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { useBookingLookups } from "../../booking/api/booking.queries";
import {
  createEmptyCargoLine,
  createEmptyContainer,
  siCargoStepSchema,
  type SIContainer,
  type SiCargoStepForm,
} from "../types/si.types";
import {
  countContainerIssues,
  matchesCargoSearch,
} from "../utils/si-cargo-completeness";
import { CargoLinesEditorStyles } from "./cargo-lines-editor-styles";
import { SiCargoGridView } from "./si-cargo-grid-view";
import { SiCargoListView } from "./si-cargo-list-view";

const { Text } = Typography;

const PAGE_SIZE = 12; // containers per page
const MAX_ADD_QTY = 20; // keep bulk-add manageable

type CargoViewMode = "list" | "grid";

interface CargoLinesEditorProps {
  containers: SIContainer[];
  onNext: (containers: SIContainer[]) => void;
  onPrevious: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  showCancel?: boolean;
  renderContainerFooter?: (container: SIContainer, index: number) => ReactNode;
  endActions?: ReactNode;
}

export function CargoLinesEditor({
  containers,
  onNext,
  onPrevious,
  onCancel,
  isSubmitting,
  showCancel = false,
  renderContainerFooter,
  endActions,
}: CargoLinesEditorProps) {
  const toast = useToast();
  const { data: packageTypes = [] } = useBookingLookups("packageTypes");
  const { data: containerTypes = [] } = useBookingLookups("containerTypes");

  const [viewMode, setViewMode] = useState<CargoViewMode>("list");
  const [search, setSearch] = useState("");
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(
    containers[0]?.id ?? null,
  );
  const [addQty, setAddQty] = useState(1);
  const [addType, setAddType] = useState(
    containers[0]?.eqpSize || containerTypes[0]?.value || "40HC",
  );
  const [page, setPage] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<SiCargoStepForm>({
    resolver: zodResolver(siCargoStepSchema) as Resolver<SiCargoStepForm>,
    defaultValues: { containers },
  });

  const {
    fields: containerFields,
    append: appendContainer,
    remove: removeContainer,
  } = useFieldArray({ control, name: "containers" });

  const containersWatch = watch("containers") ?? [];

  const attentionCount = containersWatch.reduce(
    (n, c) => n + (countContainerIssues(c) > 0 ? 1 : 0),
    0,
  );
  const lineCount = containersWatch.reduce(
    (n, c) => n + (c.cargoLines?.length ?? 0),
    0,
  );
  const packageCount = containersWatch.reduce(
    (n, c) =>
      n +
      (c.cargoLines ?? []).reduce(
        (sum, line) => sum + Number(line.packageCount || 0),
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

  const onValid = (values: SiCargoStepForm) => {
    const merged = values.containers.map((formContainer, index) => ({
      ...containers[index],
      ...formContainer,
      eqpSize: formContainer.eqpSize || containers[index]?.eqpSize || "20DC",
      cargoLines: formContainer.cargoLines,
    }));
    onNext(merged as SIContainer[]);
  };

  const handleAddContainers = () => {
    const qty = Math.max(1, Math.min(MAX_ADD_QTY, addQty || 1));
    for (let i = 0; i < qty; i += 1) {
      appendContainer(
        createEmptyContainer(addType) as SiCargoStepForm["containers"][number],
      );
    }
    setAddQty(1);
    setPage(Math.floor((containersWatch.length + qty - 1) / PAGE_SIZE));
  };

  const handleDuplicateContainer = (index: number) => {
    const current = getValues(`containers.${index}`);
    if (!current) return;
    const clone = {
      ...current,
      id: createEmptyContainer().id,
      cargoLines: (current.cargoLines ?? []).map((line) => ({
        ...line,
        id: createEmptyCargoLine().id,
      })),
    } as SiCargoStepForm["containers"][number];
    appendContainer(clone);
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <CargoLinesEditorStyles />
      <div className="custom-scroll form-step-scroll">
        <div className="si-cargo-editor">
          <div className="si-cargo-controls">
            <div className="si-cargo-toolbar">
              <div className="si-cargo-toolbar__filters">
                <Input
                  allowClear
                  size="large"
                  className="si-cargo-toolbar__search"
                  placeholder="Search container or commodity…"
                  prefix={<AppIcon icon={Icons.search} size={15} />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
                <Tooltip title="Show Containers Missing Required Fields">
                  <AppButton
                    className={[
                      "si-cargo-chip",
                      incompleteOnly ? "si-cargo-chip--on" : undefined,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    icon={<AppIcon icon={Icons.alertTriangle} size={12} />}
                    onClick={() => {
                      setIncompleteOnly((v) => !v);
                      setPage(0);
                    }}
                  >
                    Incomplete only
                  </AppButton>
                </Tooltip>
              </div>

              {/* Modified by Sekar Nagarajan (2026-08-28 18:02) */}
              <div className="si-cargo-toolbar__actions">
                <Segmented
                  className="si-cargo-view-segmented"
                  value={viewMode}
                  onChange={(v) => setViewMode(v as CargoViewMode)}
                  options={[
                    {
                      value: "list",
                      label: (
                        <span className="si-cargo-view-opt">
                          <AppIcon icon={Icons.layoutList} size={14} />
                          List
                        </span>
                      ),
                    },
                    {
                      value: "grid",
                      label: (
                        <span className="si-cargo-view-opt">
                          <AppIcon icon={Icons.layoutGrid} size={14} />
                          Grid
                        </span>
                      ),
                    },
                  ]}
                />
                {/* <div className="si-cargo-toolbar__add">
                  <Tooltip title="Quantity To Add">
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
                  <Tooltip title="Container Type">
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
                    Add containers
                  </AppButton>
                </div> */}
              </div>
            </div>

            <div className="si-cargo-summary" aria-live="polite">
              <span className="si-cargo-summary__metric">
                <Text strong className="si-cargo-summary__metric-value">
                  {containersWatch.length}
                </Text>
                <Text type="secondary">containers</Text>
              </span>
              <span className="si-cargo-summary__metric">
                <Text strong className="si-cargo-summary__metric-value">
                  {lineCount}
                </Text>
                <Text type="secondary">commodities</Text>
              </span>
              <span className="si-cargo-summary__metric">
                <Text strong className="si-cargo-summary__metric-value">
                  {packageCount.toLocaleString()}
                </Text>
                <Text type="secondary">packages</Text>
              </span>
              {attentionCount > 0 ? (
                <span className="si-cargo-vchip si-cargo-vchip--warn">
                  <AppIcon icon={Icons.alertTriangle} size={12} tone="edit" />
                  {attentionCount} need attention
                </span>
              ) : (
                <span className="si-cargo-vchip si-cargo-vchip--ok">
                  <AppIcon icon={Icons.check} size={12} />
                  All complete
                </span>
              )}
              {search || incompleteOnly ? (
                <Text
                  type="secondary"
                  className="si-cargo-summary__filter-hint"
                >
                  Showing {filteredIndexes.length} of {containersWatch.length}
                </Text>
              ) : null}
            </div>
          </div>

          {viewMode === "list" ? (
            <SiCargoListView
              pageIndexes={pageIndexes}
              containerFields={containerFields}
              containersWatch={containersWatch}
              control={control}
              errors={errors as Record<string, unknown>}
              packageTypes={packageTypes}
              containerTypes={containerTypes}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              setValue={setValue}
              getValues={getValues}
              toastError={(msg) => toast.error(msg)}
              onDuplicate={handleDuplicateContainer}
              onDelete={(index) => {
                if (containerFields.length <= 1) {
                  toast.error("At least one container is required");
                  return;
                }
                removeContainer(index);
              }}
              renderContainerFooter={renderContainerFooter}
            />
          ) : (
            <SiCargoGridView
              pageIndexes={pageIndexes}
              containersWatch={containersWatch}
              control={control}
              packageTypes={packageTypes}
              setValue={setValue}
              onAddLine={(ci) => {
                const lines = getValues(`containers.${ci}.cargoLines`) ?? [];
                setValue(`containers.${ci}.cargoLines`, [
                  ...lines,
                  createEmptyCargoLine() as SiCargoStepForm["containers"][number]["cargoLines"][number],
                ]);
              }}
              onDuplicateLine={(ci, mi) => {
                const lines = getValues(`containers.${ci}.cargoLines`) ?? [];
                const source = lines[mi];
                if (!source) return;
                const next = [...lines];
                next.splice(mi + 1, 0, {
                  ...source,
                  id: createEmptyCargoLine().id,
                });
                setValue(`containers.${ci}.cargoLines`, next);
              }}
              onRemoveLine={(ci, mi) => {
                const lines = getValues(`containers.${ci}.cargoLines`) ?? [];
                if (lines.length <= 1) {
                  toast.error("At least one commodity is required");
                  return;
                }
                setValue(
                  `containers.${ci}.cargoLines`,
                  lines.filter((_, i) => i !== mi),
                );
              }}
            />
          )}

          {filteredIndexes.length > PAGE_SIZE ? (
            <div className="si-cargo-pager">
              <Text>
                {safePage * PAGE_SIZE + 1}–
                {Math.min((safePage + 1) * PAGE_SIZE, filteredIndexes.length)}{" "}
                of {filteredIndexes.length}
              </Text>
              <div className="list-actions-row">
                <AppButton
                  disabled={safePage === 0}
                  icon={<AppIcon icon={Icons.chevronLeft} size={16} />}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                />
                <Text>
                  Page {safePage + 1} / {pageCount}
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

      {/* Modified by Sekar Nagarajan (2026-09-01 17:40) — booking parity: Previous + Next on the right */}
      <div className="form-step-footer">
        <AppButton
          htmlType="button"
          onClick={onPrevious}
          disabled={isSubmitting}
        >
          Previous
        </AppButton>

        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
