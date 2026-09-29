// Modified by Sekar Nagarajan (2026-09-11 18:25)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { FormRichTextEditor } from "@solverminds/shared-ui/form-editor";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Form, Input, Typography, theme } from "antd";
import type { TFunction } from "i18next";
import { useEffect, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import { useAiTextAssist } from "../../ai-assist";
import { useShareRateMailMutation } from "../api/rates.queries";
import type { CombinedRateItem } from "../types/rates.types";
import {
  buildShareRateMessage,
  buildShareRateSubject,
  stripHtml,
  toShareRateSummary,
} from "../utils/share-rate-mail";

const { Text } = Typography;

function createShareMailSchema(t: TFunction<"rates">) {
  const emailListSchema = z
    .string()
    .trim()
    .min(1, t("shareMail.validation.toRequired"))
    .refine((value) => {
      const parts = value
        .split(/[;,]/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 0) return false;
      return parts.every((part) => z.string().email().safeParse(part).success);
    }, t("shareMail.validation.toInvalid"));

  const optionalEmailListSchema = z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const parts = value
        .split(/[;,]/)
        .map((p) => p.trim())
        .filter(Boolean);
      return parts.every((part) => z.string().email().safeParse(part).success);
    }, t("shareMail.validation.ccInvalid"));

  return z.object({
    to: emailListSchema,
    cc: optionalEmailListSchema,
    subject: z
      .string()
      .trim()
      .min(1, t("shareMail.validation.subjectRequired"))
      .max(200, t("shareMail.validation.subjectMax")),
    message: z
      .string()
      .min(1, t("shareMail.validation.messageRequired"))
      .refine(
        (html) => stripHtml(html).length > 0,
        t("shareMail.validation.messageRequired"),
      )
      .refine(
        (html) => stripHtml(html).length <= 4000,
        t("shareMail.validation.messageMax"),
      ),
  });
}

type ShareMailForm = z.infer<ReturnType<typeof createShareMailSchema>>;

interface ShareRateMailDrawerProps {
  open: boolean;
  onClose: () => void;
  rates: CombinedRateItem[];
}

export function ShareRateMailDrawer({
  open,
  onClose,
  rates,
}: ShareRateMailDrawerProps) {
  const { t } = useTranslation(["rates", "common", "modules"]);
  const { token } = theme.useToken();
  const toast = useToast();
  const { richTextAssistProps } = useAiTextAssist();
  const shareMutation = useShareRateMailMutation();
  const isSubmitting = shareMutation.isPending;
  const shareMailSchema = useMemo(() => createShareMailSchema(t), [t]);

  const form = useForm<ShareMailForm>({
    resolver: zodResolver(shareMailSchema),
    defaultValues: {
      to: "",
      cc: "",
      subject: "",
      message: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset({
      to: "",
      cc: "",
      subject: buildShareRateSubject(rates, t),
      message: buildShareRateMessage(rates, t),
    });
  }, [open, rates, reset, t]);

  const onSubmit = (data: ShareMailForm) => {
    shareMutation.mutate(
      {
        to: data.to.trim(),
        cc: data.cc?.trim() || undefined,
        subject: data.subject.trim(),
        message: data.message,
        rates: rates.map(toShareRateSummary),
      },
      {
        onSuccess: (result) => {
          toast.success(
            t("shareMail.toasts.success", {
              count: result.recipientCount,
            }),
          );
          reset();
          onClose();
        },
        onError: () => {
          toast.error(t("shareMail.toasts.error"));
        },
      },
    );
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const moreCount = Math.max(rates.length - 5, 0);

  return (
    <AppDrawer
      title={t("shareMail.title")}
      open={open}
      onClose={handleClose}
      width={740}
      destroyOnClose
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      classNames={{
        body: "rates-drawer-body custom-scroll",
        footer: "rates-drawer-footer",
      }}
      footer={
        <div className="rates-drawer-actions custom-scroll">
          <AppButton danger onClick={handleClose} disabled={isSubmitting}>
            {t("common:actions.cancel")}
          </AppButton>
          <AppButton
            type="primary"
            loading={isSubmitting}
            icon={<AppIcon icon={Icons.send} size={16} />}
            onClick={handleSubmit(onSubmit)}
          >
            {t("actions.sendEmail")}
          </AppButton>
        </div>
      }
    >
      <FormProvider {...form}>
        <form
          className="rates-share-mail-form"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="rates-share-mail-summary">
            <Text strong className="rates-share-mail-summary__title">
              {t("shareMail.sharingCount", { count: rates.length })}
            </Text>
            <ul className="rates-share-mail-summary__list">
              {rates.slice(0, 5).map((rate) => (
                <li key={rate.id}>
                  <Text>
                    {rate.code} · {rate.originPort} → {rate.deliveryPort} ·{" "}
                    {rate.currency} {rate.totalEstimatedAmount.toFixed(2)}
                  </Text>
                </li>
              ))}
              {moreCount > 0 ? (
                <li>
                  <Text type="secondary">
                    {t("shareMail.moreRates", { count: moreCount })}
                  </Text>
                </li>
              ) : null}
            </ul>
          </div>

          <Form layout="vertical" requiredMark={false}>
            <Form.Item
              label={
                <span className="form-field-label">
                  {t("shareMail.to")}
                  <Text type="danger"> *</Text>
                </span>
              }
              validateStatus={errors.to ? "error" : undefined}
              help={errors.to?.message}
            >
              <Controller
                control={control}
                name="to"
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder={t("shareMail.placeholders.to")}
                    status={errors.to ? "error" : undefined}
                    prefix={<AppIcon icon={Icons.mail} size={16} />}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="form-field-label">{t("shareMail.cc")}</span>
              }
              validateStatus={errors.cc ? "error" : undefined}
              help={errors.cc?.message}
            >
              <Controller
                control={control}
                name="cc"
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    placeholder={t("shareMail.placeholders.cc")}
                    status={errors.cc ? "error" : undefined}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="form-field-label">
                  {t("shareMail.subject")}
                  <Text type="danger"> *</Text>
                </span>
              }
              validateStatus={errors.subject ? "error" : undefined}
              help={errors.subject?.message}
            >
              <Controller
                control={control}
                name="subject"
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    maxLength={200}
                    status={errors.subject ? "error" : undefined}
                  />
                )}
              />
            </Form.Item>

            <div className="rates-share-mail-editor">
              <FormRichTextEditor
                name="message"
                control={control}
                label={t("shareMail.message")}
                required
                minHeight={token.controlHeightLG * 6}
                enableLinks
                enableLists
                enableTextAlignment
                enableHeadings
                enableUndo
                showToolbar
                toolbarPosition="top"
                placeholder={t("shareMail.placeholders.message")}
                {...richTextAssistProps}
              />
            </div>
          </Form>
        </form>
      </FormProvider>
    </AppDrawer>
  );
}
