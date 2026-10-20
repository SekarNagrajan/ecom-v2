// Modified by Sekar Nagarajan (2026-10-20 14:14)
import { AppButton } from "@solverminds/shared-ui";
import { useConfirm, useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Descriptions, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../../components/icons";
import {
  applyPrefillBooking,
  wizardHasDraftData,
} from "../../actions/prefill-booking.action";
import { useAssistantStore } from "../../store/assistant.store";
import type { AssistantCard } from "../../types/assistant.types";

export function BookingPrefillCard({ card }: { card: AssistantCard }) {
  const { t } = useTranslation("assistant");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const confirm = useConfirm();
  const toast = useToast();
  const closeDrawer = useAssistantStore((s) => s.closeDrawer);

  const origin =
    typeof card.arguments.origin === "string"
      ? card.arguments.origin
      : typeof card.arguments.pol === "string"
        ? card.arguments.pol
        : "";
  const delivery =
    typeof card.arguments.delivery === "string"
      ? card.arguments.delivery
      : typeof card.arguments.pod === "string"
        ? card.arguments.pod
        : "";
  const cargoReady =
    typeof card.arguments.cargo_ready_date === "string"
      ? card.arguments.cargo_ready_date
      : typeof card.arguments.cargoReadyDate === "string"
        ? card.arguments.cargoReadyDate
        : "";

  function apply() {
    void (async () => {
      const result = await applyPrefillBooking(card.arguments);
      if (!result.ok && result.reason === "not_allowed") {
        toast.warning(t("bookingNotAllowed"));
        return;
      }
      if (!result.ok) {
        toast.error(t("errors.TOOL_FAILED"));
        return;
      }
      closeDrawer();
      navigate({ to: "/app/booking/new" });
    })();
  }

  function onOpen() {
    const replacing =
      wizardHasDraftData() && pathname.startsWith("/app/booking/new");
    if (replacing) {
      confirm.warning({
        title: t("prefill.replaceTitle"),
        content: t("prefill.replaceBody"),
        okText: t("prefill.replaceOk"),
        onOk: apply,
      });
      return;
    }
    confirm.show({
      title: t("prefill.replaceTitle", { defaultValue: t("confirmPrefillTitle") }),
      content: t("prefill.replaceBody", { defaultValue: t("confirmPrefillBody") }),
      okText: t("prefill.open", { defaultValue: t("openBooking") }),
      cancelText: t("dismiss"),
      onOk: apply,
    });
  }

  return (
    <div className="assistant-card assistant-card--prefill">
      <div className="assistant-card__head">
        <Typography.Title level={5} className="assistant-card__title">
          {t("prefill.title")}
        </Typography.Title>
        <Tag color="processing">{t("prefill.tag")}</Tag>
      </div>
      <Descriptions
        size="small"
        column={1}
        items={[
          { key: "o", label: t("prefill.origin"), children: origin || "—" },
          {
            key: "d",
            label: t("prefill.delivery"),
            children: delivery || "—",
          },
          ...(cargoReady
            ? [
                {
                  key: "c",
                  label: t("prefill.cargoReady"),
                  children: cargoReady,
                },
              ]
            : []),
        ]}
      />
      <div className="assistant-card__footer">
        <AppButton
          type="primary"
          icon={<AppIcon icon={Icons.arrowRight} size={16} />}
          onClick={onOpen}
        >
          {t("prefill.open")}
        </AppButton>
      </div>
    </div>
  );
}
