// Modified by Sekar Nagarajan (2026-09-11 00:18)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useQuery } from "@tanstack/react-query";
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
import { Controller, useForm, type Resolver } from "react-hook-form";

import { useTranslation } from "react-i18next";
import { AppIcon, Icons } from "../../../components/icons";
import { usePortSearch } from "../../landing/api/landing.queries";
import { bookingApi, type BookingRateOption } from "../api/booking.api";
import { bookingKeys } from "../api/booking.keys";
import { useBookingLookups } from "../api/booking.queries";
import { extractPortCode } from "../mocks/booking-routing.mock";
import { useBookingStore } from "../stores/booking.store";
import {
  masterDetailsSchema,
  type MasterDetailsData,
  type SelectedRoute,
} from "../types/booking.types";
import { pickDefaultBookingRoute } from "../utils/pick-default-booking-route";
import { BookingModuleStyles } from "./booking-module-styles";
import { BookingRouteCard } from "./booking-route-card";
import { BookingSelectedRatePanel } from "./booking-selected-rate-panel";
import { RoutingSelectModal } from "./RoutingSelectModal";
import { SelectTemplateModal } from "./SelectTemplateModal";

const { Text } = Typography;

const POPULAR_PORTS = [
  { value: "USNYC - New York, USA", label: "USNYC - New York, USA" },
  {
    value: "SGSIN - Singapore, Singapore",
    label: "SGSIN - Singapore, Singapore",
  },
  {
    value: "NLRTM - Rotterdam, Netherlands",
    label: "NLRTM - Rotterdam, Netherlands",
  },
  { value: "CNSHA - Shanghai, China", label: "CNSHA - Shanghai, China" },
  {
    value: "CNHUA - Huangpu (Guangzhou), China",
    label: "CNHUA - Huangpu (Guangzhou), China",
  },
  { value: "DEHAM - Hamburg, Germany", label: "DEHAM - Hamburg, Germany" },
  { value: "INNSA - Nhava Sheva, India", label: "INNSA - Nhava Sheva, India" },
  { value: "AEDXB - Jebel Ali, UAE", label: "AEDXB - Jebel Ali, UAE" },
  { value: "AEJEA - Jebel Ali, UAE", label: "AEJEA - Jebel Ali, UAE" },
  { value: "GBFEL - Felixstowe, UK", label: "GBFEL - Felixstowe, UK" },
];

/** Prefer "CODE - Name" display; expand bare codes via popular ports when possible. */
function resolvePortDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes(" - ")) return trimmed;
  const code = extractPortCode(trimmed);
  const popular = POPULAR_PORTS.find((p) => extractPortCode(p.value) === code);
  return popular?.label ?? trimmed;
}

function routeMatchesPorts(
  route: SelectedRoute | null | undefined,
  origin: string,
  delivery: string,
) {
  if (!route) return false;
  return (
    extractPortCode(route.polPortId) === extractPortCode(origin) &&
    extractPortCode(route.podPortId) === extractPortCode(delivery)
  );
}

// Modified by Sekar Nagarajan (2026-09-01 12:02) — port fields show CODE - Name like dropdown
function usePortAutocomplete(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const { data: ports = [], isFetching } = usePortSearch(query);

  const options =
    query.trim().length >= 2
      ? ports.map((p) => {
          const display = `${p.portCode} - ${p.portName}`;
          return {
            value: display,
            label: display,
          };
        })
      : POPULAR_PORTS.filter(
          (p) =>
            !query ||
            p.label.toLowerCase().includes(query.toLowerCase()) ||
            extractPortCode(p.value)
              .toLowerCase()
              .includes(query.toLowerCase()),
        );

  return { query, setQuery, options, isFetching };
}

export function MasterDetailsStep() {
  const { t } = useTranslation(["booking", "common", "modules"]);
  const toast = useToast();
  const { payload, updateMasterDetails, nextStep, prevStep } =
    useBookingStore();
  const [showAdditional, setShowAdditional] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isValidatingContract, setIsValidatingContract] = useState(false);
  const [isApplyingDefaultRoute, setIsApplyingDefaultRoute] = useState(false);

  const { data: carriageContracts = [] } =
    useBookingLookups("carriageContracts");
  const { data: agencies = [] } = useBookingLookups("agencies");
  const { data: placesOfReceipt = [] } = useBookingLookups("placesOfReceipt");
  const { data: emptyPickupFacilities = [] } = useBookingLookups(
    "emptyPickupFacilities",
  );
  const { data: dpwShipperTypes = [] } = useBookingLookups("dpwShipperTypes");

  const originAC = usePortAutocomplete(
    resolvePortDisplay(payload.masterDetails?.origin || ""),
  );
  const deliveryAC = usePortAutocomplete(
    resolvePortDisplay(payload.masterDetails?.delivery || ""),
  );

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MasterDetailsData>({
    // Modified by Sekar Nagarajan (2026-08-27 18:41)
    resolver: zodResolver(masterDetailsSchema) as Resolver<MasterDetailsData>,
    defaultValues: payload.masterDetails
      ? {
          ...payload.masterDetails,
          origin: resolvePortDisplay(payload.masterDetails.origin || ""),
          delivery: resolvePortDisplay(payload.masterDetails.delivery || ""),
        }
      : {
          origin: "",
          delivery: "",
          cargoReadyDate: dayjs().format("YYYY-MM-DD"),
          haulageOriginType: "Merchant",
          haulageDestinationType: "Merchant",
          carriageContract: "",
          onlineBookingNo: "",
          agreementParty: "",
          preferredAgency: "",
          additionalInformation: "",
          selectedRoute: null,
          selectedRate: null,
        },
  });

  const selectedRoute = watch("selectedRoute");
  const selectedRate = watch("selectedRate");
  const originValue = watch("origin");
  const deliveryValue = watch("delivery");
  const cargoReadyDate = watch("cargoReadyDate");

  const canSearchRates =
    Boolean(originValue?.trim()) && Boolean(deliveryValue?.trim());

  const { data: availableRates = [], isFetching: ratesLoading } = useQuery({
    queryKey: bookingKeys.rates(
      originValue?.trim() || "",
      deliveryValue?.trim() || "",
    ),
    queryFn: () =>
      bookingApi.searchRates({
        origin: originValue.trim(),
        delivery: deliveryValue.trim(),
      }),
    enabled: canSearchRates && !selectedRate,
  });

  useEffect(() => {
    if (payload.masterDetails) {
      const nextOrigin = resolvePortDisplay(payload.masterDetails.origin || "");
      const nextDelivery = resolvePortDisplay(
        payload.masterDetails.delivery || "",
      );
      reset({
        ...payload.masterDetails,
        origin: nextOrigin,
        delivery: nextDelivery,
      });
      originAC.setQuery(nextOrigin);
      deliveryAC.setQuery(nextDelivery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from store only
  }, [payload.masterDetails, reset]);

  const clearSelectedRoute = () => {
    setValue("selectedRoute", null, { shouldDirty: true });
  };

  const clearSelectedRate = () => {
    setValue("selectedRate", null, { shouldDirty: true });
    setValue("rateReference", "", { shouldDirty: true });
  };

  /** Fetch sailings for the lane and apply the carrier default route when present. */
  const applyDefaultRouteForLane = async (
    origin: string,
    delivery: string,
    readyDate: string,
  ): Promise<SelectedRoute | null> => {
    if (!origin.trim() || !delivery.trim() || !readyDate.trim()) {
      return null;
    }

    setIsApplyingDefaultRoute(true);
    try {
      const routes = await bookingApi.searchRouting({
        origin: origin.trim(),
        delivery: delivery.trim(),
        cargoReadyDate: readyDate.trim(),
      });
      const defaultRoute = pickDefaultBookingRoute(routes);
      if (defaultRoute && routeMatchesPorts(defaultRoute, origin, delivery)) {
        setValue("selectedRoute", defaultRoute, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return defaultRoute;
      }
      setValue("selectedRoute", null, { shouldDirty: true });
      return null;
    } catch {
      setValue("selectedRoute", null, { shouldDirty: true });
      return null;
    } finally {
      setIsApplyingDefaultRoute(false);
    }
  };

  // Modified by Sekar Nagarajan (2026-08-31 13:09)
  const handleSelectRate = async (rate: BookingRateOption) => {
    setValue("selectedRate", rate, { shouldDirty: true });
    setValue("rateReference", rate.rateNo, { shouldDirty: true });

    const origin = getValues("origin");
    const delivery = getValues("delivery");
    const readyDate = getValues("cargoReadyDate");

    if (!readyDate?.trim()) {
      clearSelectedRoute();
      toast.success(
        t("booking:wizard.toasts.rateSelected", { rateNo: rate.rateNo }),
      );
      toast.info(t("booking:wizard.toasts.setCargoReadyForRoute"));
      return;
    }

    const route = await applyDefaultRouteForLane(origin, delivery, readyDate);
    if (route) {
      updateMasterDetails({
        ...getValues(),
        selectedRate: rate,
        rateReference: rate.rateNo,
        selectedRoute: route,
      });
      toast.success(
        t("booking:wizard.toasts.rateSelectedWithRoute", {
          rateNo: rate.rateNo,
          service: route.serviceName,
        }),
      );
      return;
    }

    updateMasterDetails({
      ...getValues(),
      selectedRate: rate,
      rateReference: rate.rateNo,
      selectedRoute: null,
    });
    toast.success(
      t("booking:wizard.toasts.rateSelected", { rateNo: rate.rateNo }),
    );
    toast.info(t("booking:wizard.toasts.noDefaultRoute"));
  };

  const handleSwapPorts = () => {
    const origin = resolvePortDisplay(getValues("origin"));
    const delivery = resolvePortDisplay(getValues("delivery"));
    setValue("origin", delivery, { shouldValidate: true, shouldDirty: true });
    setValue("delivery", origin, { shouldValidate: true, shouldDirty: true });
    originAC.setQuery(delivery || "");
    deliveryAC.setQuery(origin || "");
    clearSelectedRoute();
    clearSelectedRate();
  };

  const onSubmit = (data: MasterDetailsData) => {
    // JSP parity: block Next until a vessel/route is chosen for this POL/POD
    if (!routeMatchesPorts(data.selectedRoute, data.origin, data.delivery)) {
      updateMasterDetails({ ...data, selectedRoute: null });
      setIsRoutingModalOpen(true);
      return;
    }
    updateMasterDetails(data);
    nextStep();
  };

  const handleRouteSelect = (route: SelectedRoute) => {
    const draft = getValues();
    const nextData: MasterDetailsData = { ...draft, selectedRoute: route };
    setValue("selectedRoute", route, {
      shouldDirty: true,
      shouldValidate: true,
    });
    updateMasterDetails(nextData);
    setIsRoutingModalOpen(false);
    toast.success(
      t("booking:wizard.toasts.routeSelected", {
        service: route.serviceName,
        vessel: route.vesselName,
      }),
    );
  };

  const hasValidRoute = routeMatchesPorts(
    selectedRoute,
    originValue,
    deliveryValue,
  );
  const showPairedRouteRate = Boolean(
    hasValidRoute && selectedRoute && selectedRate && canSearchRates,
  );

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
              onClick={() => setIsTemplateModalOpen(true)}
            >
              {t("booking:wizard.actions.selectTemplate")}
            </AppButton>
          </div>

          <div className="booking-port-row">
            <label className="form-field-label booking-port-row__origin-label">
              {t("booking:columns.origin")} <Text type="danger">*</Text>
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
                      const display = resolvePortDisplay(String(val));
                      field.onChange(display);
                      originAC.setQuery(display);
                      clearSelectedRoute();
                      clearSelectedRate();
                    }}
                    onChange={(val) => {
                      field.onChange(val);
                      originAC.setQuery(String(val ?? ""));
                      clearSelectedRoute();
                      clearSelectedRate();
                    }}
                    size="large"
                  >
                    <Input
                      size="large"
                      placeholder={t("booking:wizard.master.originPlaceholder")}
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
            ) : null}

            <div className="booking-port-row__swap">
              <Tooltip title={t("booking:wizard.master.swapPorts")}>
                <AppButton
                  type="default"
                  size="large"
                  shape="circle"
                  icon={<AppIcon icon={Icons.arrowLeftRight} size={16} />}
                  onClick={handleSwapPorts}
                  aria-label={t("booking:wizard.master.swapPortsAria")}
                />
              </Tooltip>
            </div>

            <label className="form-field-label booking-port-row__delivery-label">
              {t("booking:columns.delivery")} <Text type="danger">*</Text>
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
                      const display = resolvePortDisplay(String(val));
                      field.onChange(display);
                      deliveryAC.setQuery(display);
                      clearSelectedRoute();
                      clearSelectedRate();
                    }}
                    onChange={(val) => {
                      field.onChange(val);
                      deliveryAC.setQuery(String(val ?? ""));
                      clearSelectedRoute();
                      clearSelectedRate();
                    }}
                    size="large"
                  >
                    <Input
                      size="large"
                      placeholder={t(
                        "booking:wizard.master.deliveryPlaceholder",
                      )}
                      prefix={<AppIcon icon={Icons.mapPin} size={16} />}
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
            ) : null}

            <label className="form-field-label booking-port-row__date-label">
              {t("booking:wizard.master.cargoReadyDate")}{" "}
              <Text type="danger">*</Text>
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
                    onChange={(date) => {
                      const nextDate = date ? date.format("YYYY-MM-DD") : "";
                      onChange(nextDate);
                      clearSelectedRoute();
                      const rate = getValues("selectedRate");
                      if (rate && nextDate) {
                        void applyDefaultRouteForLane(
                          getValues("origin"),
                          getValues("delivery"),
                          nextDate,
                        ).then((route) => {
                          if (route) {
                            toast.success(
                              t("booking:wizard.toasts.defaultRouteApplied", {
                                service: route.serviceName,
                              }),
                            );
                          }
                        });
                      }
                    }}
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
            ) : null}
          </div>

          {/* Modified by Sekar Nagarajan (2026-09-01 16:05) — selected rate 70/30; Change Rate uses full-width table */}
          {hasValidRoute && selectedRoute ? (
            <div
              className={[
                "booking-selected-summary-row",
                showPairedRouteRate
                  ? "booking-selected-summary-row--route-rates"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <BookingRouteCard
                key={selectedRoute.routeId}
                route={selectedRoute}
                selected
                detailsMode="drawer"
                action={{
                  label: t("booking:wizard.routing.changeRoute"),
                  icon: Icons.refreshCw,
                  type: "default",
                  onClick: () => setIsRoutingModalOpen(true),
                }}
              />
              {canSearchRates ? (
                <BookingSelectedRatePanel
                  rates={availableRates}
                  selectedRate={selectedRate ?? null}
                  loading={ratesLoading}
                  selecting={isApplyingDefaultRoute}
                  onSelect={(rate) => void handleSelectRate(rate)}
                  onChange={clearSelectedRate}
                />
              ) : null}
            </div>
          ) : canSearchRates ? (
            <div className="booking-selected-summary-row">
              <BookingSelectedRatePanel
                rates={availableRates}
                selectedRate={selectedRate ?? null}
                loading={ratesLoading}
                selecting={isApplyingDefaultRoute}
                onSelect={(rate) => void handleSelectRate(rate)}
                onChange={clearSelectedRate}
              />
            </div>
          ) : null}

          {/* Modified by Sekar Nagarajan (2026-08-31 16:58) — gap from port row + five fields on one row from lg+ */}
          <Row gutter={[24, 24]} className="booking-master-options-row">
            <Col xs={24} md={12} lg={{ flex: "1 1 0%" }}>
              <label className="form-field-label">
                {t("booking:labels.haulageOrigin")}
              </label>
              <Controller
                control={control}
                name="haulageOriginType"
                render={({ field: { value, onChange } }) => (
                  <Segmented
                    className="form-field-full-width form-segmented"
                    options={[
                      {
                        label: t("booking:wizard.haulage.carrier"),
                        value: "Carrier",
                      },
                      {
                        label: t("booking:wizard.haulage.merchant"),
                        value: "Merchant",
                      },
                    ]}
                    value={value}
                    onChange={onChange}
                    block
                  />
                )}
              />
            </Col>

            <Col xs={24} md={12} lg={{ flex: "1 1 0%" }}>
              <label className="form-field-label">
                {t("booking:labels.haulageDestination")}
              </label>
              <Controller
                control={control}
                name="haulageDestinationType"
                render={({ field: { value, onChange } }) => (
                  <Segmented
                    className="form-field-full-width form-segmented"
                    options={[
                      {
                        label: t("booking:wizard.haulage.carrier"),
                        value: "Carrier",
                      },
                      {
                        label: t("booking:wizard.haulage.merchant"),
                        value: "Merchant",
                      },
                    ]}
                    value={value}
                    onChange={onChange}
                    block
                  />
                )}
              />
            </Col>

            <Col xs={24} md={12} lg={{ flex: "1 1 0%" }}>
              <label className="form-field-label">
                {t("booking:labels.carriageContract")}
              </label>
              <Controller
                control={control}
                name="carriageContract"
                render={({ field }) => (
                  <Select
                    {...field}
                    size="medium"
                    placeholder={t(
                      "booking:wizard.master.carriageContractPlaceholder",
                    )}
                    options={carriageContracts}
                    className="form-field-full-width"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                  />
                )}
              />
            </Col>

            <Col xs={24} md={12} lg={{ flex: "1 1 0%" }}>
              <label className="form-field-label">
                {t("booking:wizard.master.onlineBookingNo")}
              </label>
              <Controller
                control={control}
                name="onlineBookingNo"
                render={({ field }) => (
                  <Input {...field} disabled size="medium" />
                )}
              />
            </Col>

            {/* <Col xs={24} md={8}>
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
            </Col> */}

            <Col xs={24} md={12} lg={{ flex: "1 1 0%" }}>
              <label className="form-field-label">
                {t("booking:wizard.master.preferredAgency")}
              </label>
              <Controller
                control={control}
                name="preferredAgency"
                render={({ field }) => (
                  <Select
                    {...field}
                    size="medium"
                    options={agencies}
                    className="form-field-full-width"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder={t("booking:wizard.master.agencyPlaceholder")}
                  />
                )}
              />
            </Col>
          </Row>

          {/* <div className="form-step-section">
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

            {showAdditional ? (
              <div className="form-step-section">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={6}>
                    <label className="form-field-label">Rate Reference</label>
                    <Flex gap="small" align="flex-start">
                      <Controller
                        control={control}
                        name="rateReference"
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Rate Reference"
                            size="large"
                            className="form-field-full-width"
                          />
                        )}
                      />
                      <AppButton
                        loading={isValidatingContract}
                        onClick={async () => {
                          const ref = getValues("rateReference")?.trim();
                          if (!ref) {
                            toast.error(
                              "Enter a rate / contract reference first",
                            );
                            return;
                          }
                          setIsValidatingContract(true);
                          try {
                            const result = await bookingApi.validateContract(
                              ref,
                            );
                            if (result.valid) {
                              toast.success(
                                result.contractName
                                  ? `Valid: ${result.contractName}`
                                  : "Contract reference is valid",
                              );
                            } else {
                              toast.error("Contract reference is invalid");
                            }
                          } catch {
                            toast.error("Failed to validate contract");
                          } finally {
                            setIsValidatingContract(false);
                          }
                        }}
                      >
                        Validate
                      </AppButton>
                    </Flex>
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
                          size="large"
                          placeholder="Select Place"
                          options={placesOfReceipt}
                          className="form-field-full-width"
                          allowClear
                          showSearch
                          optionFilterProp="label"
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
                          size="large"
                          placeholder="Select Pick Up"
                          options={emptyPickupFacilities}
                          className="form-field-full-width"
                          allowClear
                          showSearch
                          optionFilterProp="label"
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
                          size="large"
                          placeholder="Select Shipper Type"
                          options={dpwShipperTypes}
                          className="form-field-full-width"
                          allowClear
                          showSearch
                          optionFilterProp="label"
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
            ) : null}
          </div> */}
        </Card>
      </div>

      <div className="form-step-footer">
        <AppButton onClick={prevStep}>{t("common:actions.previous")}</AppButton>
        <AppButton
          type="primary"
          htmlType="submit"
          loading={isApplyingDefaultRoute}
          disabled={isApplyingDefaultRoute}
        >
          {hasValidRoute
            ? t("common:actions.next")
            : t("booking:wizard.routing.selectVesselRoute")}
        </AppButton>
      </div>

      <SelectTemplateModal
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
      />

      <RoutingSelectModal
        open={isRoutingModalOpen}
        origin={originValue || ""}
        delivery={deliveryValue || ""}
        cargoReadyDate={cargoReadyDate || ""}
        selectedRouteId={selectedRoute?.routeId ?? null}
        onCancel={() => setIsRoutingModalOpen(false)}
        onSelect={handleRouteSelect}
      />
    </form>
  );
}
