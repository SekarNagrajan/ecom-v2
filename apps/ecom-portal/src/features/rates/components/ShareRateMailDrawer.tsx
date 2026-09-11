// Modified by Sekar Nagarajan (2026-09-11 16:31)
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppDrawer } from "@solverminds/shared-ui";
import { FormRichTextEditor } from "@solverminds/shared-ui/form-editor";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Form, Input, Typography, theme } from "antd";
import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { AppIcon, Icons } from "../../../components/icons";
import { useShareRateMailMutation } from "../api/rates.queries";
import {
  buildShareRateMessage,
  buildShareRateSubject,
  stripHtml,
  toShareRateSummary,
} from "../utils/share-rate-mail";
import type { CombinedRateItem } from "./RateCardList";

const { Text } = Typography;

const emailListSchema = z
  .string()
  .trim()
  .min(1, "Recipient email is required")
  .refine((value) => {
    const parts = value
      .split(/[;,]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return false;
    return parts.every((part) => z.string().email().safeParse(part).success);
  }, "Enter a valid email address (separate multiple with commas)");

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
  }, "Enter valid CC email addresses (separate with commas)");

const shareMailSchema = z.object({
  to: emailListSchema,
  cc: optionalEmailListSchema,
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(200, "Subject must be 200 characters or fewer"),
  message: z
    .string()
    .min(1, "Message is required")
    .refine((html) => stripHtml(html).length > 0, "Message is required")
    .refine(
      (html) => stripHtml(html).length <= 4000,
      "Message must be 4000 characters or fewer",
    ),
});

type ShareMailForm = z.infer<typeof shareMailSchema>;

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
  const { token } = theme.useToken();
  const toast = useToast();
  const shareMutation = useShareRateMailMutation();
  const isSubmitting = shareMutation.isPending;

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
      subject: buildShareRateSubject(rates),
      message: buildShareRateMessage(rates),
    });
  }, [open, rates, reset]);

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
            `Rate quote emailed successfully (${
              result.recipientCount
            } recipient${result.recipientCount === 1 ? "" : "s"}).`,
          );
          reset();
          onClose();
        },
        onError: () => {
          toast.error("Failed to share rate quote by email. Please try again.");
        },
      },
    );
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  return (
    <AppDrawer
      title="Share via Mail"
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
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            loading={isSubmitting}
            icon={<AppIcon icon={Icons.send} size={16} />}
            onClick={handleSubmit(onSubmit)}
          >
            Send Email
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
              Sharing {rates.length} rate{rates.length === 1 ? "" : "s"}
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
              {rates.length > 5 ? (
                <li>
                  <Text type="secondary">
                    +{rates.length - 5} more rate
                    {rates.length - 5 === 1 ? "" : "s"}
                  </Text>
                </li>
              ) : null}
            </ul>
          </div>

          <Form layout="vertical" requiredMark={false}>
            <Form.Item
              label={
                <span className="form-field-label">
                  To
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
                    placeholder="recipient@company.com"
                    status={errors.to ? "error" : undefined}
                    prefix={<AppIcon icon={Icons.mail} size={16} />}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={<span className="form-field-label">Cc</span>}
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
                    placeholder="optional@company.com"
                    status={errors.cc ? "error" : undefined}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="form-field-label">
                  Subject
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
                label="Message"
                required
                minHeight={token.controlHeightLG * 6}
                enableLinks
                enableLists
                enableTextAlignment
                enableHeadings
                enableUndo
                showToolbar
                toolbarPosition="top"
                placeholder="Compose your rate quote message…"
              />
            </div>
          </Form>
        </form>
      </FormProvider>
    </AppDrawer>
  );
}
