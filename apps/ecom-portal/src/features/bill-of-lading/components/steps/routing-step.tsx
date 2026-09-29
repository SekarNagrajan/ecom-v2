// Modified by Sekar Nagarajan (2026-08-28 11:29)
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Input, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BLRoutingStepValues } from "../../types/bl.types";
import { blRoutingStepSchema } from "../../types/bl.types";
import { BlWizardFooter } from "../bl-wizard-footer";
import type { BLWizardStepProps } from "./MasterDetailsStep";

const { Text } = Typography;

const ROUTING_PRINT_FIELD_NAMES = [
  "originPrint",
  "polPrint",
  "podPrint",
  "deliveryPrint",
] as const satisfies ReadonlyArray<
  keyof Pick<
    BLRoutingStepValues,
    "originPrint" | "polPrint" | "podPrint" | "deliveryPrint"
  >
>;

export function RoutingStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: BLWizardStepProps) {
  const { t } = useTranslation(["bill-of-lading", "common"]);

  const routingPrintLabels: Record<
    (typeof ROUTING_PRINT_FIELD_NAMES)[number],
    string
  > = {
    originPrint: t("labels.originPrint"),
    polPrint: t("wizard.routing.loadPortPrint"),
    podPrint: t("wizard.routing.dischargePortPrint"),
    deliveryPrint: t("labels.deliveryPrint"),
  };

  const routing = data.routing ?? {
    originPrint: data.origin,
    polPrint: data.loadPort,
    podPrint: data.dischargePort,
    deliveryPrint: data.delivery,
    vesselVoyage: "",
    scheduleLegs: [],
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BLRoutingStepValues>({
    resolver: zodResolver(blRoutingStepSchema),
    defaultValues: {
      originPrint: routing.originPrint,
      polPrint: routing.polPrint,
      podPrint: routing.podPrint,
      deliveryPrint: routing.deliveryPrint,
      vesselVoyage: routing.vesselVoyage,
    },
  });

  const onValid = (values: BLRoutingStepValues) => {
    onUpdate({
      routing: {
        ...routing,
        ...values,
      },
    });
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll">
        <Card
          className="form-step-card form-step-section"
          title={t("wizard.routing.printTextTitle")}
        >
          <div className="bl-master-detail-grid bl-routing-form-grid">
            {ROUTING_PRINT_FIELD_NAMES.map((name) => {
              const label = routingPrintLabels[name];
              const bookingValue =
                name === "originPrint"
                  ? data.origin
                  : name === "polPrint"
                    ? data.loadPort
                    : name === "podPrint"
                      ? data.dischargePort
                      : data.delivery;
              const bookingHint = t("wizard.routing.bookingHint", {
                value: bookingValue,
              });

              return (
                <div className="form-field-cell bl-master-readonly-field" key={name}>
                  <label className="form-field-label">
                    {label} <Text type="danger">*</Text>
                  </label>
                  <Text
                    type="secondary"
                    ellipsis={{ tooltip: bookingHint }}
                    className="bl-routing-booking-hint"
                  >
                    {bookingHint}
                  </Text>
                  <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <Input {...field} size="large" maxLength={149} />
                    )}
                  />
                  {errors[name] ? (
                    <Text type="danger" className="form-field-error">
                      {errors[name]?.message}
                    </Text>
                  ) : null}
                </div>
              );
            })}
            <div className="form-field-cell bl-master-readonly-field">
              <label className="form-field-label">
                {t("labels.vesselVoyage")}
              </label>
              <Text
                type="secondary"
                className="bl-routing-booking-hint bl-routing-booking-hint--placeholder"
              >
                {t("wizard.routing.vesselOptionalHint")}
              </Text>
              <Controller
                control={control}
                name="vesselVoyage"
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder={t("labels.vesselVoyage")}
                  />
                )}
              />
            </div>
          </div>
        </Card>

        {routing.scheduleLegs.length > 0 ? (
          <Card
            className="form-step-card form-step-section"
            title={t("labels.scheduleLegs")}
          >
            {routing.scheduleLegs.map((leg) => (
              <div key={leg.id} className="bl-routing-leg">
                <Text strong>
                  {leg.vesselName} {leg.voyage ? `/ ${leg.voyage}` : ""}
                </Text>
                <Text type="secondary">
                  {leg.polPortName} → {leg.podPortName} · {t("wizard.routing.etd")}{" "}
                  {leg.etd} · {t("wizard.routing.eta")} {leg.eta}
                </Text>
              </div>
            ))}
          </Card>
        ) : null}
      </div>

      <BlWizardFooter
        onPrevious={onPrevious}
        nextHtmlType="submit"
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
