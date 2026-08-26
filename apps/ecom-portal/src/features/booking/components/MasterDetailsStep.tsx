// Modified by Sekar Nagarajan (2026-08-26 11:51)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import {
  AutoComplete,
  Card,
  Col,
  DatePicker,
  Input,
  Row,
  Segmented,
  Select,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AppIcon, Icons } from "../../../components/icons";
import { usePortSearch } from "../../landing/api/landing.queries";
import { useBookingStore } from "../stores/booking.store";
import {
  masterDetailsSchema,
  type MasterDetailsData,
} from "../types/booking.types";
import { BookingModuleStyles } from "./booking-module-styles";
import { SelectTemplateModal } from "./SelectTemplateModal";

const { Text } = Typography;

const POPULAR_PORTS = [
  { value: "USNYC", label: "USNYC - New York, USA" },
  { value: "SGSIN", label: "SGSIN - Singapore, Singapore" },
  { value: "NLRTM", label: "NLRTM - Rotterdam, Netherlands" },
  { value: "CNSHA", label: "CNSHA - Shanghai, China" },
  { value: "DEHAM", label: "DEHAM - Hamburg, Germany" },
  { value: "INNSA", label: "INNSA - Nhava Sheva, India" },
  { value: "AEDXB", label: "AEDXB - Jebel Ali, UAE" },
  { value: "GBFEL", label: "GBFEL - Felixstowe, UK" },
];

function usePortAutocomplete(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const { data: ports = [], isFetching } = usePortSearch(query);

  const options =
    query.trim().length >= 2
      ? ports.map((p) => ({
          value: p.portCode,
          label: `${p.portCode} - ${p.portName}`,
        }))
      : POPULAR_PORTS.filter(
          (p) =>
            !query ||
            p.label.toLowerCase().includes(query.toLowerCase()) ||
            p.value.toLowerCase().includes(query.toLowerCase()),
        );

  return { query, setQuery, options, isFetching };
}

export function MasterDetailsStep() {
  const { payload, updateMasterDetails, nextStep } = useBookingStore();
  const [showAdditional, setShowAdditional] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const originAC = usePortAutocomplete(payload.masterDetails?.origin || "");
  const deliveryAC = usePortAutocomplete(payload.masterDetails?.delivery || "");

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(masterDetailsSchema),
    defaultValues: payload.masterDetails || {
      origin: "",
      delivery: "",
      cargoReadyDate: "",
      haulageOriginType: "Merchant",
      haulageDestinationType: "Merchant",
      carriageContract: "",
      onlineBookingNo: "",
      agreementParty: "",
      preferredAgency: "",
      additionalInformation: "",
    },
  });

  useEffect(() => {
    if (payload.masterDetails) {
      reset(payload.masterDetails);
      originAC.setQuery(payload.masterDetails.origin || "");
      deliveryAC.setQuery(payload.masterDetails.delivery || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from store only
  }, [payload.masterDetails, reset]);

  const handleSwapPorts = () => {
    const origin = getValues("origin");
    const delivery = getValues("delivery");
    setValue("origin", delivery, { shouldValidate: true, shouldDirty: true });
    setValue("delivery", origin, { shouldValidate: true, shouldDirty: true });
    originAC.setQuery(delivery || "");
    deliveryAC.setQuery(origin || "");
  };

  const onSubmit = (data: MasterDetailsData) => {
    updateMasterDetails(data);
    nextStep();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className="form-step-layout"
    >
      <BookingModuleStyles />
      <div className="custom-scroll form-step-scroll">
        <Card className="form-step-card form-step-section">
          <div className="form-step-toolbar">
            <AppButton
              type="primary"
              className="booking-template-select-btn"
              icon={<AppIcon icon={Icons.notebook} size={16} />}
              onClick={() => setIsTemplateModalOpen(true)}
            >
              Select Template
            </AppButton>
          </div>

          <div className="booking-port-row">
            <label className="form-field-label booking-port-row__origin-label">
              Origin <Text type="danger">*</Text>
            </label>
            <div className="booking-port-row__origin-field">
              <Controller
                control={control}
                name="origin"
                render={({ field }) => (
                  <AutoComplete
                    {...field}
                    className="booking-port-field"
                    options={originAC.options}
                    onSearch={originAC.setQuery}
                    onSelect={(val) => {
                      field.onChange(val);
                      originAC.setQuery(String(val));
                    }}
                    onChange={(val) => {
                      field.onChange(val);
                      originAC.setQuery(String(val ?? ""));
                    }}
                    size="large"
                  >
                    <Input
                      size="large"
                      placeholder="Search origin port (e.g. USNYC)"
                      prefix={<AppIcon icon={Icons.mapPin} size={16} />}
                      allowClear
                    />
                  </AutoComplete>
                )}
              />
            </div>
            {errors.origin ? (
              <Text
                type="danger"
                className="form-field-error booking-port-row__origin-error"
              >
                {errors.origin.message as string}
              </Text>
            ) : (
              <span className="booking-port-row__origin-error" aria-hidden />
            )}

            <div className="booking-port-row__swap">
              <Tooltip title="Swap Origin and Delivery">
                <AppButton
                  type="default"
                  size="large"
                  shape="circle"
                  icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
                  onClick={handleSwapPorts}
                  aria-label="Swap origin and delivery ports"
                />
              </Tooltip>
            </div>

            <label className="form-field-label booking-port-row__delivery-label">
              Delivery <Text type="danger">*</Text>
            </label>
            <div className="booking-port-row__delivery-field">
              <Controller
                control={control}
                name="delivery"
                render={({ field }) => (
                  <AutoComplete
                    {...field}
                    className="booking-port-field"
                    options={deliveryAC.options}
                    onSearch={deliveryAC.setQuery}
                    onSelect={(val) => {
                      field.onChange(val);
                      deliveryAC.setQuery(String(val));
                    }}
                    onChange={(val) => {
                      field.onChange(val);
                      deliveryAC.setQuery(String(val ?? ""));
                    }}
                    size="large"
                  >
                    <Input
                      size="large"
                      placeholder="Search delivery port (e.g. GBFEL)"
                      prefix={<AppIcon icon={Icons.truck} size={16} />}
                      allowClear
                    />
                  </AutoComplete>
                )}
              />
            </div>
            {errors.delivery ? (
              <Text
                type="danger"
                className="form-field-error booking-port-row__delivery-error"
              >
                {errors.delivery.message as string}
              </Text>
            ) : (
              <span className="booking-port-row__delivery-error" aria-hidden />
            )}

            <label className="form-field-label booking-port-row__date-label">
              Cargo Ready Date <Text type="danger">*</Text>
            </label>
            <div className="booking-port-row__date-field">
              <Controller
                control={control}
                name="cargoReadyDate"
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    className="booking-port-field"
                    size="large"
                    format="DD-MMM-YYYY"
                    value={value ? dayjs(value) : null}
                    onChange={(date) =>
                      onChange(date ? date.format("YYYY-MM-DD") : "")
                    }
                  />
                )}
              />
            </div>
            {errors.cargoReadyDate ? (
              <Text
                type="danger"
                className="form-field-error booking-port-row__date-error"
              >
                {errors.cargoReadyDate.message as string}
              </Text>
            ) : (
              <span className="booking-port-row__date-error" aria-hidden />
            )}
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <label className="form-field-label">Haulage Origin</label>
              <Controller
                control={control}
                name="haulageOriginType"
                render={({ field: { value, onChange } }) => (
                  <Segmented
                    options={["Carrier", "Merchant"]}
                    value={value}
                    onChange={onChange}
                    block
                  />
                )}
              />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-field-label">Haulage Destination</label>
              <Controller
                control={control}
                name="haulageDestinationType"
                render={({ field: { value, onChange } }) => (
                  <Segmented
                    options={["Carrier", "Merchant"]}
                    value={value}
                    onChange={onChange}
                    block
                  />
                )}
              />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-field-label">Carriage Contract</label>
              <Controller
                control={control}
                name="carriageContract"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Carriage Contract"
                    options={[]}
                    className="form-field-full-width"
                  />
                )}
              />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-field-label">Online Booking No</label>
              <Controller
                control={control}
                name="onlineBookingNo"
                render={({ field }) => (
                  <Input {...field} disabled size="large" />
                )}
              />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-field-label">Agreement Party</label>
              <Controller
                control={control}
                name="agreementParty"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Agreement Party"
                    size="large"
                  />
                )}
              />
            </Col>

            <Col xs={24} md={8}>
              <label className="form-field-label">Preferred Agency</label>
              <Controller
                control={control}
                name="preferredAgency"
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[]}
                    className="form-field-full-width"
                  />
                )}
              />
            </Col>
          </Row>

          <div className="form-step-section">
            <div
              className="form-section-toggle"
              onClick={() => setShowAdditional(!showAdditional)}
            >
              {showAdditional ? (
                <AppIcon icon={Icons.minus} size={16} />
              ) : (
                <AppIcon icon={Icons.plus} size={16} />
              )}
              Additional Information
            </div>

            {showAdditional && (
              <div className="form-step-section">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={6}>
                    <label className="form-field-label">Rate Reference</label>
                    <Controller
                      control={control}
                      name="rateReference"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Rate Reference"
                          size="large"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Agency Reference</label>
                    <Controller
                      control={control}
                      name="agencyReference"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Agency Reference"
                          size="large"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Ocean Freight</label>
                    <Controller
                      control={control}
                      name="oceanFreight"
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Option"
                          options={[
                            { label: "Prepaid", value: "Prepaid" },
                            { label: "Collect", value: "Collect" },
                          ]}
                          className="form-field-full-width"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">
                      Place of Final Receipt
                    </label>
                    <Controller
                      control={control}
                      name="placeOfFinalReceipt"
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Place"
                          options={[]}
                          className="form-field-full-width"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">NAT Code</label>
                    <Controller
                      control={control}
                      name="natCode"
                      render={({ field }) => (
                        <Input {...field} placeholder="NAT Code" size="large" />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Haulage Type</label>
                    <Controller
                      control={control}
                      name="haulageType"
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Type"
                          options={[
                            { label: "Live Load", value: "Live Load" },
                            { label: "Drop Only", value: "Drop Only" },
                            { label: "Pickup only", value: "Pickup only" },
                            { label: "Pickup & Drop", value: "Pickup & Drop" },
                          ]}
                          className="form-field-full-width"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Pickup Date</label>
                    <Controller
                      control={control}
                      name="pickupDate"
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          format="DD-MMM-YYYY"
                          value={value ? dayjs(value) : null}
                          onChange={(date) =>
                            onChange(date ? date.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Drop Date</label>
                    <Controller
                      control={control}
                      name="dropDate"
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          format="DD-MMM-YYYY"
                          value={value ? dayjs(value) : null}
                          onChange={(date) =>
                            onChange(date ? date.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Hauler Code</label>
                    <Controller
                      control={control}
                      name="haulerCode"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Hauler Code"
                          size="large"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Customer PO</label>
                    <Controller
                      control={control}
                      name="customerPo"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Customer PO"
                          size="large"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Ref Type</label>
                    <Controller
                      control={control}
                      name="refType"
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Ref Type"
                          options={[
                            { label: "Normal", value: "Normal" },
                            { label: "Express", value: "Express" },
                          ]}
                          className="form-field-full-width"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">Export Ref</label>
                    <Controller
                      control={control}
                      name="exportRef"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Export Ref"
                          size="large"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">
                      Empty Pickup Point
                    </label>
                    <Controller
                      control={control}
                      name="emptyPickupPoint"
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Point"
                          options={[
                            { label: "Terminal", value: "Terminal" },
                            { label: "Depot", value: "Depot" },
                          ]}
                          className="form-field-full-width"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">
                      Select Empty Pick Up
                    </label>
                    <Controller
                      control={control}
                      name="emptyPickupFacility"
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Pick Up"
                          options={[]}
                          className="form-field-full-width"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">
                      Empty Pickup Date
                    </label>
                    <Controller
                      control={control}
                      name="emptyPickupDate"
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          format="DD-MMM-YYYY"
                          value={value ? dayjs(value) : null}
                          onChange={(date) =>
                            onChange(date ? date.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">
                      Customer Reference
                    </label>
                    <Controller
                      control={control}
                      name="customerReference"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Customer Reference"
                          size="large"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">ACID</label>
                    <Controller
                      control={control}
                      name="acid"
                      render={({ field }) => (
                        <Input {...field} placeholder="ACID" size="large" />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">DPW Shipper Type</label>
                    <Controller
                      control={control}
                      name="dpwShipperType"
                      render={({ field }) => (
                        <Select
                          {...field}
                          placeholder="Select Shipper Type"
                          options={[]}
                          className="form-field-full-width"
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={6}>
                    <label className="form-field-label">DPW Shipper Code</label>
                    <Controller
                      control={control}
                      name="dpwShipperCode"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Shipper Code"
                          size="large"
                          disabled
                        />
                      )}
                    />
                  </Col>

                  <Col xs={24} md={24}>
                    <label className="form-field-label">General Notes</label>
                    <Controller
                      control={control}
                      name="additionalInformation"
                      render={({ field }) => (
                        <Input.TextArea
                          {...field}
                          rows={3}
                          placeholder="Enter any additional details or notes"
                        />
                      )}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton>Previous</AppButton>
        <AppButton type="primary" htmlType="submit">
          Next
        </AppButton>
      </div>

      <SelectTemplateModal
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
      />
    </form>
  );
}
