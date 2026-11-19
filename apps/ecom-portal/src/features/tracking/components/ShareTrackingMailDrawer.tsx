// Modified by Sekar Nagarajan (2026-10-19)
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
import { useShareTrackingMailMutation } from "../api/tracking.queries";
import type { TrackingSearchResult } from "../types/tracking.types";
import {
  buildShareTrackingMessage,
  buildShareTrackingSubject,
  stripHtml,
  toShareTrackingSummary,
} from "../utils/share-tracking-mail";

const { Text } = Typography;

function createShareMailSchema(t: TFunction<"tracking">) {
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

interface ShareTrackingMailDrawerProps {
  open: boolean;
  onClose: () => void;
  result: TrackingSearchResult;
}

export function ShareTrackingMailDrawer({
  open,
  onClose,
  result,
}: ShareTrackingMailDrawerProps) {
  const { t } = useTranslation(["tracking", "common", "modules"]);
  const { token } = theme.useToken();
  const toast = useToast();
  const { richTextAssistProps } = useAiTextAssist();
  const shareMutation = useShareTrackingMailMutation();
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
      subject: buildShareTrackingSubject(result, t),
      message: buildShareTrackingMessage(result, t),
    });
  }, [open, result, reset, t]);

  const onSubmit = (data: ShareMailForm) => {
    shareMutation.mutate(
      {
        to: data.to.trim(),
        cc: data.cc?.trim() || undefined,
        subject: data.subject.trim(),
        message: data.message,
        tracking: toShareTrackingSummary(result),
      },
      {
        onSuccess: (shareResult) => {
          toast.success(
            t("shareMail.toasts.success", {
              count: shareResult.recipientCount,
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

  const previewContainers = result.containers.slice(0, 5);
  const moreCount = Math.max(result.containers.length - 5, 0);

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
        body: "tracking-drawer-body custom-scroll",
        footer: "tracking-share-mail-footer",
      }}
      footer={
        <div className="tracking-share-mail-actions custom-scroll">
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
          className="tracking-share-mail-form"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="tracking-share-mail-summary">
            <Text strong className="tracking-share-mail-summary__title">
              {t("shareMail.sharingTitle", {
                vessel: result.vesselName,
                voyage: result.voyage,
              })}
            </Text>
            <ul className="tracking-share-mail-summary__list">
              <li>
                <Text>
                  {result.polPortCode} → {result.podPortCode} · {result.etd} →{" "}
                  {result.eta}
                </Text>
              </li>
              {previewContainers.map((c) => (
                <li key={c.containerNo}>
                  <Text>
                    {c.containerNo} · {c.status} · {c.latestActivity}
                  </Text>
                </li>
              ))}
              {moreCount > 0 ? (
                <li>
                  <Text type="secondary">
                    {t("shareMail.moreContainers", { count: moreCount })}
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
              help={
                errors.to ? (
                  <Text type="danger" className="form-field-error">
                    {errors.to.message}
                  </Text>
                ) : undefined
              }
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
              help={
                errors.cc ? (
                  <Text type="danger" className="form-field-error">
                    {errors.cc.message}
                  </Text>
                ) : undefined
              }
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
              help={
                errors.subject ? (
                  <Text type="danger" className="form-field-error">
                    {errors.subject.message}
                  </Text>
                ) : undefined
              }
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

            <div className="tracking-share-mail-editor">
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
