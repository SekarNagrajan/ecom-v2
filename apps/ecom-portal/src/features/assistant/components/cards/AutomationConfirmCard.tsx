// Modified by Sekar Nagarajan (2026-10-20 16:57)
import { AppButton } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { Descriptions, Tag, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import { submitBookingAfterConfirm } from "../../actions/submit-booking.action";
import { useAssistantStore } from "../../store/assistant.store";
import type { AssistantCard } from "../../types/assistant.types";

export function AutomationConfirmCard({ card }: { card: AssistantCard }) {
  const { t } = useTranslation("assistant");
  const confirm = useConfirm();
  const toast = useToast();
  const navigate = useNavigate();
  const closeDrawer = useAssistantStore((s) => s.closeDrawer);
  const [submitting, setSubmitting] = useState(false);

  const summary =
    typeof card.arguments.summary === "string" ? card.arguments.summary : "";
  const origin =
    typeof card.arguments.origin === "string" ? card.arguments.origin : "";
  const delivery =
    typeof card.arguments.delivery === "string" ? card.arguments.delivery : "";
  const scheduleId =
    typeof card.arguments.schedule_id === "string"
      ? card.arguments.schedule_id
      : "";

  function onConfirm() {
    confirm.warning({
      title: t("automation.confirmTitle"),
      content: t("automation.confirmBody"),
      okText: t("automation.confirmOk"),
      cancelText: t("dismiss"),
      onOk: () => {
        void (async () => {
          setSubmitting(true);
          try {
            const result = await submitBookingAfterConfirm(card.arguments);
            if (result.ok === false) {
              if (result.reason === "booking_not_allowed") {
                toast.warning(t("bookingNotAllowed"));
              } else {
                toast.error(
                  t("automation.submitFailed", {
                    reason: result.reason,
                    defaultValue: `Submit failed (${result.reason})`,
                  }),
                );
              }
              return;
            }
            const ref = result.response.data?.bookingReference;
            toast.success(
              t("automation.submitSuccess", {
                reference: ref || "—",
                defaultValue: `Booking submitted${ref ? `: ${ref}` : ""}`,
              }),
            );
            closeDrawer();
            navigate({ to: "/app/booking" });
          } finally {
            setSubmitting(false);
          }
        })();
      },
    });
  }

  return (
    <div className="assistant-card assistant-card--automation">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t("automation.title")}
        </Typography.Title>
        <Tag color="warning">{t("automation.tag")}</Tag>
      </div>
      {summary ? (
        <div className="assistant-card__body">{summary}</div>
      ) : null}
      <Descriptions
        size="small"
        column={1}
        items={[
          ...(origin
            ? [{ key: "o", label: t("prefill.origin"), children: origin }]
            : []),
          ...(delivery
            ? [
                {
                  key: "d",
                  label: t("prefill.delivery"),
                  children: delivery,
                },
              ]
            : []),
          ...(scheduleId
            ? [
                {
                  key: "s",
                  label: t("automation.scheduleId"),
                  children: scheduleId,
                },
              ]
            : []),
        ]}
      />
      <div className="assistant-card__footer">
        <AppButton
          type="primary"
          danger
          loading={submitting}
          icon={<AppIcon icon={Icons.check} size={16} />}
          onClick={onConfirm}
        >
          {t("automation.confirmOk")}
        </AppButton>
      </div>
    </div>
  );
}
