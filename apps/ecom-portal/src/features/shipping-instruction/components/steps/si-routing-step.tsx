// Modified by Sekar Nagarajan (2026-08-28 12:50)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "@solverminds/shared-ui";
import { Card, Input, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";

import type {
  SIWizardStepProps,
  SiRoutingStepValues,
} from "../../types/si.types";
import { siRoutingStepSchema } from "../../types/si.types";

const { Text, Title } = Typography;

const ROUTING_PRINT_FIELDS = [
  {
    name: "originPrint",
    label: "Origin (Print)",
    bookingKey: "origin" as const,
  },
  {
    name: "polPrint",
    label: "Load Port (Print)",
    bookingKey: "loadPort" as const,
  },
  {
    name: "podPrint",
    label: "Discharge Port (Print)",
    bookingKey: "dischargePort" as const,
  },
  {
    name: "deliveryPrint",
    label: "Delivery (Print)",
    bookingKey: "delivery" as const,
  },
] as const;

export function SiRoutingStep({
  data,
  onNext,
  onPrevious,
  onUpdate,
  isSubmitting,
}: SIWizardStepProps) {
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
    resolver: zodResolver(siRoutingStepSchema),
    defaultValues: {
      originPrint: routing.originPrint,
      polPrint: routing.polPrint,
      podPrint: routing.podPrint,
      deliveryPrint: routing.deliveryPrint,
      vesselVoyage: routing.vesselVoyage,
    },
  });

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
              Routing — Print Text
            </Title>
          }
        >
          <div className="si-routing-form-grid">
            {ROUTING_PRINT_FIELDS.map(({ name, label, bookingKey }) => {
              const bookingValue = data[bookingKey] ?? "—";
              return (
                <div className="form-field-cell" key={name}>
                  <label className="form-field-label">
                    {label} <Text type="danger">*</Text>
                  </label>
                  <Text type="secondary" className="si-routing-booking-hint">
                    Booking: {bookingValue}
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
              <label className="form-field-label">Vessel / Voyage</label>
              <Text
                type="secondary"
                className="si-routing-booking-hint si-routing-booking-hint--placeholder"
              >
                Optional schedule reference
              </Text>
              <Controller
                control={control}
                name="vesselVoyage"
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder="Vessel / Voyage"
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
                Schedule Legs
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
                    {leg.polPortName} → {leg.podPortName} · ETD {leg.etd} · ETA{" "}
                    {leg.eta}
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <div className="form-step-footer">
        <AppButton onClick={onPrevious} disabled={isSubmitting}>
          Previous
        </AppButton>
        <AppButton type="primary" htmlType="submit" disabled={isSubmitting}>
          Next
        </AppButton>
      </div>
    </form>
  );
}
