// Modified by Sekar Nagarajan (2026-09-11 18:25)
// QuoteRequestDrawer — ApplicationResource_en.properties Request for Quote fields

import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDrawer, AppTextarea } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Form, Input, InputNumber, Select, Typography } from "antd";
import type { TFunction } from "i18next";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { useAiTextAssist } from "../../ai-assist";
import { useCreateQuoteMutation } from "../api/rates.queries";
import type { CreateQuoteInput } from "../types/rates.types";

const { Text } = Typography;

function createQuoteSchema(t: TFunction<"rates">) {
  return z.object({
    originPort: z.string().min(1, t("quoteRequest.validation.portOfLoadRequired")),
    deliveryPort: z
      .string()
      .min(1, t("quoteRequest.validation.portOfDischargeRequired")),
    eqpType: z.string().min(1, t("quoteRequest.validation.cargoTypeRequired")),
    eqpQuantity: z
      .number()
      .min(1, t("quoteRequest.validation.cargoQuantityMin")),
    commodity: z.string().min(1, t("quoteRequest.validation.commodityRequired")),
    cargoWeightKg: z
      .number()
      .min(100, t("quoteRequest.validation.cargoWeightRequired")),
    expectedAmountUsd: z.number().optional(),
    comments: z.string().optional(),
  });
}

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
  const { t } = useTranslation(["rates", "common", "modules"]);
  const toast = useToast();
  const { textareaAssistProps } = useAiTextAssist();
  const createMutation = useCreateQuoteMutation();
  const isSubmitting = createMutation.isPending;
  const quoteSchema = useMemo(() => createQuoteSchema(t), [t]);

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
      eqpQuantity:
        initialValues?.eqpQuantity ?? DEFAULT_QUOTE_VALUES.eqpQuantity,
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
          t("quoteRequest.toasts.success", { quoteNo: newQuote.quoteNo }),
        );
        reset();
        onClose();
      },
      onError: () => {
        toast.error(t("quoteRequest.toasts.error"));
      },
    });
  };

  return (
    <AppDrawer
      title={t("quoteRequest.title")}
      open={open}
      onClose={onClose}
      width={520}
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      classNames={{
        body: "rates-drawer-body custom-scroll",
        footer: "rates-drawer-footer",
      }}
      footer={
        <div className="rates-drawer-actions custom-scroll">
          <AppButton danger onClick={onClose} disabled={isSubmitting}>
            {t("common:actions.cancel")}
          </AppButton>
          <AppButton
            type="primary"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {t("actions.submitRequestForQuote")}
          </AppButton>
        </div>
      }
    >
      <Form layout="vertical" requiredMark={false}>
        <Form.Item
          label={
            <span className="form-field-label">
              {t("quoteRequest.fields.portOfLoad")}{" "}
              <Text type="danger">*</Text>
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
                  { value: "USNYC", label: t("options.ports.USNYC") },
                  { value: "DEHAM", label: t("options.ports.DEHAM") },
                  { value: "INNSA", label: t("options.ports.INNSA") },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">
              {t("quoteRequest.fields.portOfDischarge")}{" "}
              <Text type="danger">*</Text>
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
                  { value: "SGSIN", label: t("options.ports.SGSIN") },
                  { value: "CNSHA", label: t("options.ports.CNSHA") },
                  { value: "AEDXB", label: t("options.ports.AEDXB") },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="form-field-label">
              {t("quoteRequest.fields.cargoType")}{" "}
              <Text type="danger">*</Text>
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
                    label: t("options.equipment.20dv"),
                  },
                  {
                    value: "40' High Cube Dry",
                    label: t("options.equipment.40hc"),
                  },
                  {
                    value: "40' Reefer Container",
                    label: t("options.equipment.40rf"),
                  },
                ]}
              />
            )}
          />
        </Form.Item>

        <div className="rates-drawer-form-row">
          <Form.Item
            label={
              <span className="form-field-label">
                {t("quoteRequest.fields.cargoQuantity")}{" "}
                <Text type="danger">*</Text>
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
                <InputNumber
                  {...field}
                  min={1}
                  size="large"
                  className="rates-input-full"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="form-field-label">
                {t("quoteRequest.fields.commodity")}{" "}
                <Text type="danger">*</Text>
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
                  placeholder={t("quoteRequest.placeholders.commodity")}
                />
              )}
            />
          </Form.Item>
        </div>

        <div className="rates-drawer-form-row">
          <Form.Item
            label={
              <span className="form-field-label">
                {t("quoteRequest.fields.cargoWeight")}{" "}
                <Text type="danger">*</Text>
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
              <span className="form-field-label">
                {t("quoteRequest.fields.expectedRate")}
              </span>
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
        </div>

        <Form.Item
          label={
            <span className="form-field-label">
              {t("quoteRequest.fields.comments")}
            </span>
          }
        >
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <AppTextarea
                {...field}
                rows={3}
                placeholder={t("quoteRequest.placeholders.comments")}
                {...textareaAssistProps}
              />
            )}
          />
        </Form.Item>
      </Form>
    </AppDrawer>
  );
}
