// Modified by Sekar Nagarajan (2026-11-25 15:25)
import { AppButton } from "@solverminds/shared-ui";
import { Spin, Tag, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { AppIcon, Icons } from "../../../components/icons";
import { FeaturePageShell } from "../../../components/shared/feature-page-shell";
import { cancelCheckoutSession, completeCheckoutSession } from "../api/payments.api";
import type { CheckoutSessionDTO } from "../types/payments.types";
import { PayPendingModuleStyles } from "./pay-pending-module-styles";

const { Text, Title } = Typography;

type ReturnMode = "success" | "cancel";

interface PaymentCheckoutReturnProps {
  mode: ReturnMode;
}

function readRequestId(search: unknown): string {
  if (search && typeof search === "object" && "requestId" in search) {
    return String((search as { requestId?: string }).requestId ?? "").trim();
  }
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get("requestId")?.trim() ?? "";
  }
  return "";
}

function formatUsd(amount: number, currency = "USD"): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPaidAt(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(+date)) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gatewayLabel(gateway?: string): string {
  if (!gateway) return "—";
  return gateway === "NGENIUS" ? "N-Genius" : "Stripe";
}

export function PaymentCheckoutReturn({ mode }: PaymentCheckoutReturnProps) {
  const { t } = useTranslation(["payments", "common"]);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const [busy, setBusy] = useState(true);
  const [requestId, setRequestId] = useState("");
  const [doneOk, setDoneOk] = useState(false);
  const [session, setSession] = useState<CheckoutSessionDTO | null>(null);
  const [copied, setCopied] = useState(false);
  const ran = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const id = readRequestId(search);
    setRequestId(id);

    void (async () => {
      if (!id) {
        setBusy(false);
        setDoneOk(false);
        return;
      }
      try {
        if (mode === "success") {
          const res = await completeCheckoutSession(id);
          const ok = Boolean(res.data?.success) && !res.error;
          setDoneOk(ok);
          if (res.data) setSession(res.data);
        } else {
          const res = await cancelCheckoutSession(id);
          const ok = Boolean(res.data?.success) && !res.error;
          setDoneOk(ok);
          if (res.data) setSession(res.data);
        }
      } finally {
        setBusy(false);
      }
    })();
  }, [mode, search]);

  const success = mode === "success";
  const tone = success ? (doneOk ? "success" : "error") : "cancel";

  const handleCopyRef = async () => {
    if (!requestId || copied) return;
    try {
      await navigator.clipboard.writeText(requestId);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => {
        setCopied(false);
        copyTimer.current = null;
      }, 2000);
    } catch {
      // Keep copy icon so the user can retry.
    }
  };

  const amountLabel =
    session?.amountUsd != null && session.amountUsd > 0
      ? formatUsd(session.amountUsd, session.currency ?? "USD")
      : null;

  const statusText =
    tone === "success"
      ? t("return.statusPaid")
      : tone === "cancel"
        ? t("return.statusCancelled")
        : t("return.statusFailed");

  return (
    <FeaturePageShell>
      <PayPendingModuleStyles />
      <div className="pay-checkout-return-page">
        <div className={`pay-checkout-return-card pay-checkout-return-card--${tone}`}>
          {busy ? (
            <div className="pay-checkout-return-card__busy">
              <Spin size="large" />
              <Text type="secondary">{t("return.processing")}</Text>
            </div>
          ) : (
            <>
              <div
                className={`pay-checkout-return-hero pay-checkout-return-hero--${tone}`}
                aria-hidden
              >
                <span className="pay-checkout-return-hero__spark pay-checkout-return-hero__spark--tl" />
                <span className="pay-checkout-return-hero__spark pay-checkout-return-hero__spark--tr" />
                <span className="pay-checkout-return-hero__doc app-icon-inherit">
                  <AppIcon icon={tone === "success" ? Icons.fileCheck : Icons.fileText} size={26} />
                </span>
                <span className="pay-checkout-return-hero__badge app-icon-inherit">
                  <AppIcon icon={tone === "success" ? Icons.check : Icons.circleX} size={12} />
                </span>
              </div>

              <div className="pay-checkout-return-card__intro">
                <Title level={2} className="pay-checkout-return-card__title">
                  {success
                    ? doneOk
                      ? t("return.successTitle")
                      : t("return.failedTitle")
                    : t("return.cancelTitle")}
                </Title>
                <Text type="secondary" className="pay-checkout-return-card__message">
                  {success
                    ? doneOk
                      ? t("return.successMessage")
                      : t("return.failedMessage")
                    : t("return.cancelMessage")}
                </Text>
              </div>

              {amountLabel ? (
                <div
                  className={`pay-checkout-return-amount-banner pay-checkout-return-amount-banner--${tone}`}
                >
                  <div className="pay-checkout-return-amount-banner__copy">
                    <Text className="pay-checkout-return-amount-banner__label">
                      {t("return.amountPaid")}
                    </Text>
                    <Text strong className="pay-checkout-return-amount-banner__value">
                      {amountLabel}
                    </Text>
                  </div>
                </div>
              ) : null}

              {(session || requestId) && (
                <div className="pay-checkout-return-meta" role="list">
                  <div className="pay-checkout-return-meta__item" role="listitem">
                    <div className="pay-checkout-return-meta__top">
                      <Tag
                        className={`pay-checkout-return-status pay-checkout-return-status--${tone}`}
                      >
                        {statusText}
                      </Tag>
                    </div>
                    <Text className="pay-checkout-return-meta__label">{t("return.status")}</Text>
                  </div>
                  <div className="pay-checkout-return-meta__item" role="listitem">
                    <div className="pay-checkout-return-meta__top">
                      <span className="pay-checkout-return-meta__icon app-icon-inherit">
                        <AppIcon icon={Icons.creditCard} size={15} />
                      </span>
                      <Text strong className="pay-checkout-return-meta__value">
                        {gatewayLabel(session?.gateway)}
                      </Text>
                    </div>
                    <Text className="pay-checkout-return-meta__label">{t("return.gateway")}</Text>
                  </div>
                  <div className="pay-checkout-return-meta__item" role="listitem">
                    <div className="pay-checkout-return-meta__top">
                      <span className="pay-checkout-return-meta__icon app-icon-inherit">
                        <AppIcon icon={Icons.building} size={15} />
                      </span>
                      <Text strong className="pay-checkout-return-meta__value">
                        {session?.agencyCode || "—"}
                      </Text>
                    </div>
                    <Text className="pay-checkout-return-meta__label">{t("return.agency")}</Text>
                  </div>
                  <div className="pay-checkout-return-meta__item" role="listitem">
                    <div className="pay-checkout-return-meta__top">
                      <span className="pay-checkout-return-meta__icon app-icon-inherit">
                        <AppIcon icon={Icons.calendar} size={15} />
                      </span>
                      <Text strong className="pay-checkout-return-meta__value">
                        {formatPaidAt(session?.paidAt)}
                      </Text>
                    </div>
                    <Text className="pay-checkout-return-meta__label">{t("return.paidAt")}</Text>
                  </div>
                </div>
              )}

              {requestId ? (
                <div className="pay-checkout-return-ref">
                  <span className="pay-checkout-return-ref__icon app-icon-inherit">
                    <AppIcon icon={Icons.fileText} size={16} />
                  </span>
                  <div className="pay-checkout-return-ref__copy">
                    <Text className="pay-checkout-return-ref__label">
                      {t("return.referenceLabel")}
                    </Text>
                    <Text strong className="pay-checkout-return-ref__value">
                      {requestId}
                    </Text>
                  </div>
                  <AppButton
                    type="text"
                    size="small"
                    className={["pay-checkout-return-ref__action", copied ? "is-copied" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    aria-label={
                      copied
                        ? t("actions.copied", {
                            label: t("return.referenceLabel"),
                          })
                        : t("actions.copy", {
                            label: t("return.referenceLabel"),
                          })
                    }
                    icon={
                      <AppIcon
                        icon={copied ? Icons.check : Icons.copy}
                        size={16}
                        tone={copied ? "create" : "view"}
                      />
                    }
                    onClick={() => void handleCopyRef()}
                  />
                </div>
              ) : null}

              <div className="pay-checkout-return-card__actions">
                <AppButton
                  type="primary"
                  size="large"
                  icon={<AppIcon icon={Icons.home} size={16} />}
                  onClick={() => void navigate({ to: "/app/dashboard" as never })}
                >
                  {t("actions.backToDashboard")}
                </AppButton>
                {tone === "success" ? (
                  <AppButton
                    size="large"
                    icon={<AppIcon icon={Icons.creditCard} size={16} />}
                    onClick={() => void navigate({ to: "/app/payments" as never })}
                  >
                    {t("actions.paymentHistory")}
                  </AppButton>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </FeaturePageShell>
  );
}
