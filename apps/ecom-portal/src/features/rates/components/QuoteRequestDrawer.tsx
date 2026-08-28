// Modified by Sekar Nagarajan (2026-08-28 15:09)
// QuoteRequestDrawer — ApplicationResource_en.properties Request for Quote fields

import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Form, Input, InputNumber, Select, Space, Typography } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateQuoteMutation } from "../api/rates.queries";
import type { CreateQuoteInput } from "../types/rates.types";

const { Text } = Typography;

const quoteSchema = z.object({
  originPort: z.string().min(1, "Port of Load is required"),
  deliveryPort: z.string().min(1, "Port of Discharge is required"),
  eqpType: z.string().min(1, "Cargo Type is required"),
  eqpQuantity: z.number().min(1, "Cargo Quantity must be at least 1"),
  commodity: z.string().min(1, "Commodity is required"),
  cargoWeightKg: z.number().min(100, "Cargo Weight is required"),
  expectedAmountUsd: z.number().optional(),
  comments: z.string().optional(),
});

const DEFAULT_QUOTE_VALUES: CreateQuoteInput = {
  originPort: "USNYC",
  deliveryPort: "SGSIN",
  eqpType: "40' High Cube Dry",
  eqpQuantity: 1,
  commodity: "General Merchandise",
  cargoWeightKg: 15000,
};

interface QuoteRequestDrawerProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<CreateQuoteInput>;
}

export function QuoteRequestDrawer({
  open,
  onClose,
  initialValues,
}: QuoteRequestDrawerProps) {
  const toast = useToast();
  const createMutation = useCreateQuoteMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateQuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: DEFAULT_QUOTE_VALUES,
  });

  // Prefill from rates search when drawer opens (external sync)
  useEffect(() => {
    if (!open) return;
    reset({
      ...DEFAULT_QUOTE_VALUES,
      ...initialValues,
      eqpQuantity: initialValues?.eqpQuantity ?? DEFAULT_QUOTE_VALUES.eqpQuantity,
      cargoWeightKg:
        initialValues?.cargoWeightKg ?? DEFAULT_QUOTE_VALUES.cargoWeightKg,
      commodity:
        initialValues?.commodity && initialValues.commodity !== "ALL"
          ? initialValues.commodity
          : DEFAULT_QUOTE_VALUES.commodity,
      eqpType:
        initialValues?.eqpType && initialValues.eqpType !== "ALL"
          ? initialValues.eqpType
          : DEFAULT_QUOTE_VALUES.eqpType,
    });
  }, [open, initialValues, reset]);

  const onSubmit = (data: CreateQuoteInput) => {
    createMutation.mutate(data, {
      onSuccess: (newQuote) => {
        toast.success(
          `Request for Quote ${newQuote.quoteNo} submitted successfully!`,
        );
        reset();
        onClose();
      },
      onError: () => {
        toast.error("Failed to submit Request for Quote. Please try again.");
      },
    });
  };

  return (
    <AppDrawer
      title="Request for Quote"
      open={open}
      onClose={onClose}
      width={520}
      classNames={{ body: "rates-drawer-body custom-scroll" }}
      extra={
        <Space size={8}>
          <AppButton onClick={onClose}>Cancel</AppButton>
          <AppButton
            type="primary"
            loading={createMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Submit Request for Quote
          </AppButton>
        </Space>
      }
    >
      <Form layout="vertical" requiredMark={false}>
        <Form.Item
          label={
            <span className="form-field-label">
              Port of Load (POL) <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.originPort ? "error" : ""}
          help={
            errors.originPort ? (
              <Text type="danger" className="form-field-error">
                {errors.originPort.message}
              </Text>
            ) : undefined
          }
        >
          <Controller
            name="originPort"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                showSearch
                options={[
                  { value: "USNYC", label: "USNYC - New York, USA" },
                  { value: "DEHAM", label: "DEHAM - Hamburg, Germany" },
                  { value: "INNSA", label: "INNSA - Nhava Sheva, India" },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">
              Port of Discharge (POD) <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.deliveryPort ? "error" : ""}
          help={
            errors.deliveryPort ? (
              <Text type="danger" className="form-field-error">
                {errors.deliveryPort.message}
              </Text>
            ) : undefined
          }
        >
          <Controller
            name="deliveryPort"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                showSearch
                options={[
                  { value: "SGSIN", label: "SGSIN - Singapore, Singapore" },
                  { value: "CNSHA", label: "CNSHA - Shanghai, China" },
                  { value: "AEDXB", label: "AEDXB - Jebel Ali, UAE" },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">
              Cargo Type <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.eqpType ? "error" : ""}
          help={
            errors.eqpType ? (
              <Text type="danger" className="form-field-error">
                {errors.eqpType.message}
              </Text>
            ) : undefined
          }
        >
          <Controller
            name="eqpType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                size="large"
                options={[
                  {
                    value: "20' Standard Dry",
                    label: "20' Standard Dry (20DV)",
                  },
                  {
                    value: "40' High Cube Dry",
                    label: "40' High Cube Dry (40HC)",
                  },
                  {
                    value: "40' Reefer Container",
                    label: "40' Reefer Container (40RF)",
                  },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">
              Cargo Quantity <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.eqpQuantity ? "error" : ""}
          help={
            errors.eqpQuantity ? (
              <Text type="danger" className="form-field-error">
                {errors.eqpQuantity.message}
              </Text>
            ) : undefined
          }
        >
          <Controller
            name="eqpQuantity"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={1} size="large" className="rates-input-full" />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">
              Commodity <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.commodity ? "error" : ""}
          help={
            errors.commodity ? (
              <Text type="danger" className="form-field-error">
                {errors.commodity.message}
              </Text>
            ) : undefined
          }
        >
          <Controller
            name="commodity"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                size="large"
                placeholder="e.g. General Cargo / Machinery"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">
              Cargo Weight (kg) <Text type="danger">*</Text>
            </span>
          }
          validateStatus={errors.cargoWeightKg ? "error" : ""}
          help={
            errors.cargoWeightKg ? (
              <Text type="danger" className="form-field-error">
                {errors.cargoWeightKg.message}
              </Text>
            ) : undefined
          }
        >
          <Controller
            name="cargoWeightKg"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={100}
                size="large"
                className="rates-input-full"
                addonAfter="kg"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">Expected Target Rate (USD)</span>
          }
        >
          <Controller
            name="expectedAmountUsd"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                size="large"
                className="rates-input-full"
                prefix="$"
                addonAfter="USD"
              />
            )}
          />
        </Form.Item>

        <Form.Item label={<span className="form-field-label">Comments</span>}>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder="Special stowage or temperature requirements..."
              />
            )}
          />
        </Form.Item>
      </Form>
    </AppDrawer>
  );
}
