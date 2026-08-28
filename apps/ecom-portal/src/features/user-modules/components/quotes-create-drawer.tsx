// Modified by Sekar Nagarajan (2026-08-26 16:15)
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppButton,
  AppDrawer,
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@solverminds/shared-ui";
import { Col, Row, Typography } from "antd";
import { useForm, type Resolver } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { MODULE_TITLES } from "../../../constants/module-titles";
import { RESPONSIVE_COL } from "../../../constants/responsive-grid";
import { useCreateQuoteMutation } from "../api/user-modules.queries";
import type { CreateQuoteRequestPayload } from "../types/user-modules.types";
import { createQuoteRequestSchema } from "../types/user-modules.types";
import { UmPanelHeader } from "./um-panel-header";

const { Text } = Typography;

const FIELD_ITEM_PROPS = {
  layout: "vertical" as const,
  colon: false,
};

const POL_OPTIONS = [
  { value: "Port of New York (USNYC)", label: "USNYC - Port of New York" },
  { value: "Port of Rotterdam (NLRTM)", label: "NLRTM - Port of Rotterdam" },
  { value: "Hamburg Port (DEHAM)", label: "DEHAM - Hamburg Port" },
];

const POD_OPTIONS = [
  { value: "Port of Singapore (SGSIN)", label: "SGSIN - Port of Singapore" },
  { value: "Shanghai Port (CNSHA)", label: "CNSHA - Shanghai Port" },
  { value: "Jebel Ali (AEJEA)", label: "AEJEA - Jebel Ali Port" },
];

const EQUIPMENT_OPTIONS = [
  {
    value: "20ft Standard Container (20GP)",
    label: "20ft Standard Container (20GP)",
  },
  {
    value: "40ft High Cube Container (40HC)",
    label: "40ft High Cube Container (40HC)",
  },
  {
    value: "40ft Reefer Container (40RF)",
    label: "40ft Reefer Container (40RF)",
  },
];

const QUOTE_DEFAULTS: CreateQuoteRequestPayload = {
  polPort: "",
  podPort: "",
  equipmentType: "",
  commodity: "",
  targetDate: "",
  remarks: "",
};

function reqLabel(label: string) {
  return (
    <span className="form-field-label">
      {label} <Text type="danger">*</Text>
    </span>
  );
}

function optLabel(label: string) {
  return <span className="form-field-label">{label}</span>;
}

export interface QuotesCreateDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function QuotesCreateDrawer({ open, onClose }: QuotesCreateDrawerProps) {
  const { mutateAsync: createQuote, isPending: isSubmitting } =
    useCreateQuoteMutation();

  const form = useForm<CreateQuoteRequestPayload>({
    resolver: zodResolver(
      createQuoteRequestSchema,
    ) as Resolver<CreateQuoteRequestPayload>,
    defaultValues: QUOTE_DEFAULTS,
  });

  const handleClose = () => {
    form.reset(QUOTE_DEFAULTS);
    onClose();
  };

  const handleSave = form.handleSubmit(async (values) => {
    await createQuote(values);
    handleClose();
  });

  return (
    <AppDrawer
      open={open}
      onClose={handleClose}
      placement="right"
      dialogSize="md"
      destroyOnClose
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      classNames={{
        header: "um-drawer-header-bar",
        body: "um-drawer-body custom-scroll",
        footer: "um-drawer-footer-bar",
      }}
      styles={{ body: { padding: 0 } }}
      title={
        <UmPanelHeader
          icon={Icons.edit}
          title={MODULE_TITLES.quotes}
          description="Submit a new ocean freight rate quotation request for the selected trade lane."
          compact
        />
      }
      footer={
        <div className="um-drawer-footer form-step-footer">
          <AppButton onClick={handleClose} disabled={isSubmitting} danger>
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            icon={<AppIcon icon={Icons.save} size={16} />}
            loading={isSubmitting}
            onClick={handleSave}
          >
            Save
          </AppButton>
        </div>
      }
    >
      <div className="um-form-section">
        <Row gutter={[16, 16]} align="top">
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormSelect
              control={form.control}
              name="polPort"
              label={reqLabel("Port of Loading (POL)")}
              size="large"
              placeholder="Select origin port"
              options={POL_OPTIONS}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormSelect
              control={form.control}
              name="podPort"
              label={reqLabel("Port of Discharge (POD)")}
              size="large"
              placeholder="Select destination port"
              options={POD_OPTIONS}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormSelect
              control={form.control}
              name="equipmentType"
              label={reqLabel("Equipment Type")}
              size="large"
              placeholder="Select container type"
              options={EQUIPMENT_OPTIONS}
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.formHalf}>
            <FormInput
              control={form.control}
              name="commodity"
              label={reqLabel("Commodity Description")}
              size="large"
              placeholder="e.g. General Cargo, Electronics"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.full}>
            <FormDatePicker
              control={form.control}
              name="targetDate"
              label={reqLabel("Target Departure Date")}
              size="large"
              valueFormat="calendar-date"
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
          <Col {...RESPONSIVE_COL.full}>
            <FormTextarea
              control={form.control}
              name="remarks"
              label={optLabel("Additional Shipment Remarks")}
              rows={4}
              placeholder="Enter any special handling notes, target rates, or commodity specs..."
              formItemProps={FIELD_ITEM_PROPS}
            />
          </Col>
        </Row>
      </div>
    </AppDrawer>
  );
}
