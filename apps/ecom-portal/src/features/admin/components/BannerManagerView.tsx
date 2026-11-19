// Modified by Sekar Nagarajan (2026-11-12 18:15)
/**
 * Banners & Assets — landing hero slides in a DataView grid with a create drawer. The image is
 * referenced by URL/path (asset upload is a follow-up); a live thumbnail previews the URL.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  FormInput,
  FormInputNumber,
  FormSwitch,
} from "@solverminds/shared-ui";
import { DataView, type DataViewColumn } from "@solverminds/shared-ui/data-view";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Col, Image, Row, Typography } from "antd";
import { useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { buildActionsColumn } from "../../../components/shared/build-actions-column";
import {
  FIELD_GUTTER,
  FIELD_ITEM_PROPS,
  optLabel,
  reqLabel,
} from "../../../components/shared/form-field-label";
import {
  ListActionButton,
  ListActionsRow,
} from "../../../components/shared/list-action-button";
import { ModuleEmptyState } from "../../../components/shared/module-empty-state";
import { useLocalGridProfiles } from "../../../components/shared/use-local-grid-profiles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import {
  BANNER_UPSERT_DEFAULTS,
  BannerUpsertSchema,
  type BannerConfig,
  type BannerUpsertValues,
} from "../types/admin.types";
import { nextOrder } from "../utils/admin.utils";
import { AdminDrawer } from "./shared/AdminDrawer";
import { AdminFormSection } from "./shared/AdminFormSection";
import { AdminSectionPage } from "./shared/AdminSectionPage";
import { AdminStatusPill } from "./shared/AdminStatusPill";

const { Text } = Typography;

interface BannerManagerViewProps {
  banners: BannerConfig[];
  onCreate: (banner: Omit<BannerConfig, "id">) => Promise<BannerConfig>;
  isCreating: boolean;
  isFetching: boolean;
}

export function BannerManagerView({
  banners,
  onCreate,
  isCreating,
  isFetching,
}: BannerManagerViewProps) {
  const toast = useToast();
  const { profileHandlers } = useLocalGridProfiles("admin-banners");
  const addButtonRef = useRef<HTMLSpanElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<BannerUpsertValues>({
    resolver: zodResolver(BannerUpsertSchema) as Resolver<BannerUpsertValues>,
    defaultValues: BANNER_UPSERT_DEFAULTS,
    mode: "onChange",
  });
  const imageUrl = form.watch("imageUrl");

  const rows = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);

  const openDrawer = () => {
    form.reset({ ...BANNER_UPSERT_DEFAULTS, sortOrder: nextOrder(banners) });
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    form.reset(BANNER_UPSERT_DEFAULTS);
  };

  const handleCreate = form.handleSubmit(async (values) => {
    try {
      await onCreate({
        title: values.title,
        imageUrl: values.imageUrl,
        linkUrl: values.linkUrl || undefined,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      });
      closeDrawer();
    } catch {
      /* surfaced by the mutation's onError toast */
    }
  });

  const copyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      toast.success("Image path copied");
    } catch {
      toast.error("Couldn't copy the image path");
    }
  };

  const columnDefs: DataViewColumn<BannerConfig>[] = [
    {
      ...buildActionsColumn<BannerConfig>({
        field: "id",
        width: 100,
        cellRenderer: (params) => {
          const row = params.data;
          if (!row) return null;
          return (
            <ListActionsRow>
              <ListActionButton
                title="Preview Banner"
                tone="view"
                icon={<AppIcon icon={Icons.eye} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(row.imageUrl);
                }}
              />
              <ListActionButton
                title="Copy Image Path"
                tone="muted"
                icon={<AppIcon icon={Icons.copy} size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  void copyPath(row.imageUrl);
                }}
              />
            </ListActionsRow>
          );
        },
      }),
      colId: "actions",
    },
    {
      headerName: "Status",
      field: "isActive",
      width: 120,
      cellRenderer: (params: { value?: boolean }) => (
        <AdminStatusPill tone={params.value ? "success" : "neutral"}>
          {params.value ? "Active" : "Inactive"}
        </AdminStatusPill>
      ),
      valueFormatter: (params) => (params.value ? "Active" : "Inactive"),
    },
    {
      headerName: "Order",
      field: "sortOrder",
      width: 96,
      sort: "asc",
      cellRenderer: (params: { value?: number }) => <Text code>#{params.value}</Text>,
    },
    {
      headerName: "Preview",
      field: "imageUrl",
      colId: "preview",
      width: 140,
      sortable: false,
      filter: false,
      cellRenderer: (params: { value?: string; data?: BannerConfig }) =>
        params.value ? (
          <Image
            src={params.value}
            alt={params.data?.title ?? "Banner"}
            width={96}
            height={44}
            preview={false}
            className="admin-banner-thumb"
          />
        ) : null,
    },
    { headerName: "Title", field: "title", flex: 1.4, minWidth: 180 },
    {
      headerName: "Image Path",
      field: "imageUrl",
      flex: 1.4,
      minWidth: 200,
      tooltipField: "imageUrl",
      cellRenderer: (params: { value?: string }) => <Text code>{params.value}</Text>,
    },
    {
      headerName: "Link",
      field: "linkUrl",
      flex: 1,
      minWidth: 160,
      cellRenderer: (params: { value?: string }) =>
        params.value ? (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-link-cell"
            aria-label="Open link in new tab"
          >
            <span className="admin-link-cell__text">{params.value}</span>
            <AppIcon icon={Icons.externalLink} size={14} />
          </a>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <AdminSectionPage
      extra={
        <span ref={addButtonRef} className="admin-section__action">
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.plus} size={16} />}
            onClick={openDrawer}
          >
            Add Banner
          </AppButton>
        </span>
      }
    >
      <div className="admin-banner-form">
        <div className="admin-grid-wrap responsive-table-wrap custom-scroll">
          <DataView
            rowData={rows}
            columnDefs={columnDefs}
            loading={isFetching}
            emptyState={
              <ModuleEmptyState
                variant="blank"
                title="No banners yet"
                message="Add a landing hero slide to get started."
                actions={[{ key: "add", label: "Add Banner", type: "primary", onClick: openDrawer }]}
              />
            }
            allowedViewModes={["list"]}
            defaultViewMode="list"
            renderToolbar={() => null}
            className="admin-data-view"
            listOptions={{
              ...profileHandlers,
              showToolbar: { showTotalCount: true, fullScreen: true },
              sideBar: true,
              pagination: true,
              paginationPageSize: 20,
              pageSizeOptions: [10, 20, 50, 100],
              defaultColDef: { filter: true },
              gridOptions: {
                domLayout: "autoHeight",
                getRowId: (params: { data: BannerConfig }) => params.data.id,
              },
            }}
          />
        </div>
      </div>

      {/* Programmatic full-size preview for the Actions column */}
      <Image
        src={previewUrl ?? undefined}
        alt="Banner preview"
        className="admin-visually-hidden"
        preview={{
          visible: previewUrl !== null,
          src: previewUrl ?? undefined,
          onVisibleChange: (visible) => {
            if (!visible) setPreviewUrl(null);
          },
        }}
      />

      {drawerOpen ? (
        <AdminDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          icon={Icons.image}
          title="Add Banner"
          subtitle="Landing hero slide shown in the public carousel."
          isPending={isCreating}
          isDirty={form.formState.isDirty}
          primaryLabel="Add Banner"
          primaryIcon={Icons.plus}
          onPrimary={() => void handleCreate()}
          returnFocusRef={addButtonRef}
        >
          <AdminFormSection step={1} title="Content" hint="What the slide shows and where it links.">
            <Row gutter={FIELD_GUTTER}>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="title"
                  label={reqLabel("Banner Title")}
                  size="large"
                  placeholder="e.g. SOLAS VGM Digital Filing"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInput
                  control={form.control}
                  name="linkUrl"
                  label={optLabel("Link URL")}
                  size="large"
                  placeholder="Where the slide navigates (optional)"
                  prefix={<AppIcon icon={Icons.link} size={16} />}
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.full}>
                <FormInput
                  control={form.control}
                  name="imageUrl"
                  label={reqLabel("Image URL")}
                  size="large"
                  placeholder="https://… or /assets/hero.png"
                  prefix={<AppIcon icon={Icons.image} size={16} />}
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              {imageUrl && !form.formState.errors.imageUrl ? (
                <Col {...RESPONSIVE_COL.full}>
                  <Image
                    src={imageUrl}
                    alt="Image preview"
                    preview={false}
                    className="admin-banner-thumb admin-banner-thumb--form"
                    fallback=""
                  />
                </Col>
              ) : null}
            </Row>
          </AdminFormSection>

          <AdminFormSection step={2} title="Placement" hint="Position in the carousel and whether it is live.">
            <Row gutter={FIELD_GUTTER} align="bottom">
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormInputNumber
                  control={form.control}
                  name="sortOrder"
                  label={reqLabel("Display Order")}
                  size="large"
                  min={1}
                  numericMode="positive-integer"
                  className="admin-stack-full"
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
              <Col {...RESPONSIVE_COL.formHalf}>
                <FormSwitch
                  control={form.control}
                  name="isActive"
                  label={optLabel("Active")}
                  description="Inactive banners stay saved but are hidden from the landing page."
                  formItemProps={FIELD_ITEM_PROPS}
                />
              </Col>
            </Row>
          </AdminFormSection>
        </AdminDrawer>
      ) : null}
    </AdminSectionPage>
  );
}
