// Modified by Sekar Nagarajan (2026-09-29 16:55)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, Typography } from "antd";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type {
  SIWizardStepProps,
  SiRoutingStepValues,
} from "../../types/si.types";
import { createSiRoutingStepSchema } from "../../types/si.types";

const { Text, Title } = Typography;

export function SiRoutingStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: SIWizardStepProps) {
  const { t } = useTranslation(["shipping-instruction", "common", "modules"]);
  const schema = useMemo(() => createSiRoutingStepSchema(t), [t]);

  const routing = data.routing ?? {
    originPrint: data.origin ?? "",
    polPrint: data.loadPort ?? "",
    podPrint: data.dischargePort ?? "",
    deliveryPrint: data.delivery ?? "",
    vesselVoyage: "",
    scheduleLegs: [],
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SiRoutingStepValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      originPrint: routing.originPrint,
      polPrint: routing.polPrint,
      podPrint: routing.podPrint,
      deliveryPrint: routing.deliveryPrint,
      vesselVoyage: routing.vesselVoyage,
    },
  });

  const routingPrintFields = [
    {
      name: "originPrint" as const,
      label: t("wizard.routing.originPrint"),
      bookingKey: "origin" as const,
    },
    {
      name: "polPrint" as const,
      label: t("wizard.routing.loadPortPrint"),
      bookingKey: "loadPort" as const,
    },
    {
      name: "podPrint" as const,
      label: t("wizard.routing.dischargePortPrint"),
      bookingKey: "dischargePort" as const,
    },
    {
      name: "deliveryPrint" as const,
      label: t("wizard.routing.deliveryPrint"),
      bookingKey: "delivery" as const,
    },
  ];

  const onValid = (values: SiRoutingStepValues) => {
    onUpdate({ routing: { ...routing, ...values } });
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      autoComplete="off"
      className="form-step-layout"
    >
      <div className="custom-scroll form-step-scroll si-master-step-stack">
        <Card
          className="form-step-card form-step-section si-master-step-card"
          title={
            <Title level={5} className="form-step-card-title">
              {t("wizard.routing.printTextTitle")}
            </Title>
          }
        >
          <div className="si-routing-form-grid">
            {routingPrintFields.map(({ name, label, bookingKey }) => {
              const bookingValue = data[bookingKey] ?? "—";
              return (
                <div className="form-field-cell" key={name}>
                  <label className="form-field-label">
                    {label} <Text type="danger">*</Text>
                  </label>
                  <Text type="secondary" className="si-routing-booking-hint">
                    {t("wizard.routing.bookingHint", { value: bookingValue })}
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
            <div className="form-field-cell">
              <label className="form-field-label">
                {t("labels.vesselVoyage")}
              </label>
              <Text
                type="secondary"
                className="si-routing-booking-hint si-routing-booking-hint--placeholder"
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
            className="form-step-card form-step-section si-master-step-card"
            title={
              <Title level={5} className="form-step-card-title">
                {t("wizard.routing.scheduleLegsTitle")}
              </Title>
            }
          >
            <div className="si-routing-legs">
              {routing.scheduleLegs.map((leg) => (
                <div className="form-field-cell" key={leg.id}>
                  <Text strong>
                    {leg.vesselName}
                    {leg.voyage ? ` / ${leg.voyage}` : ""}
                  </Text>
                  <Text type="secondary">
                    {leg.polPortName} → {leg.podPortName} ·{" "}
                    {t("wizard.routing.etd")} {leg.etd} ·{" "}
                    {t("wizard.routing.eta")} {leg.eta}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isSubmitting}>
          {t("common:actions.previous")}
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          {t("common:actions.next")}
        </AppButton>
      </div>
    </form>
  );
}
