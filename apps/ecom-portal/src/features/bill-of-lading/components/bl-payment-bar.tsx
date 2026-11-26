// Modified by Sekar Nagarajan (2026-11-25 15:10)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { Card, InputNumber, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { createCheckout } from "../../payments/api/payments.api";
import type { BLListDTO } from "../types/bl.types";

const { Text } = Typography;

interface BlPaymentBarProps {
  rows: BLListDTO[];
  selectedBlNos: string[];
  onSelectionChange: (blNos: string[]) => void;
  enabled?: boolean;
}

export function BlPaymentBar({
  rows,
  selectedBlNos,
  onSelectionChange,
  enabled = true,
}: BlPaymentBarProps) {
  const { t } = useTranslation(["bill-of-lading", "common", "modules", "payments"]);
  const toast = useToast();
  const navigate = useNavigate();
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedBlNos.includes(r.blNo)),
    [rows, selectedBlNos],
  );

  const defaultAmount = useMemo(
    () => selectedRows.reduce((sum, r) => sum + (r.payAmountUsd ?? 0), 0) || null,
    [selectedRows],
  );

  const displayAmount = amountUsd ?? defaultAmount ?? 0;

  const sameAgency =
    selectedRows.length <= 1 ||
    selectedRows.every((r) => r.issueAgency === selectedRows[0]?.issueAgency);

  const handlePay = async () => {
    if (selectedBlNos.length === 0) {
      toast.error(t("toasts.selectBlForPayment"));
      return;
    }
    if (!sameAgency) {
      toast.error(t("toasts.sameAgencyRequired"));
      return;
    }
    const agencyCode = String(selectedRows[0]?.issueAgency ?? "").trim();
    if (!agencyCode) {
      toast.error(t("toasts.sameAgencyRequired"));
      return;
    }
    if (!(displayAmount > 0)) {
      toast.error(t("toasts.selectBlForPayment"));
      return;
    }

    // Split total across selected B/Ls proportional to payAmountUsd (equal share fallback).
    const weights = selectedRows.map((r) => Math.max(0, r.payAmountUsd ?? 0));
    const weightSum = weights.reduce((s, w) => s + w, 0);
    const references = selectedRows.map((row, index) => {
      const share =
        weightSum > 0
          ? (weights[index] / weightSum) * displayAmount
          : displayAmount / selectedRows.length;
      return {
        refNo: row.blNo,
        amount: Math.round(share * 100) / 100,
        customerType: "SH",
      };
    });
    // Absorb rounding drift on the last reference.
    const refSum = references.reduce((s, r) => s + r.amount, 0);
    if (references.length > 0) {
      references[references.length - 1].amount =
        Math.round((references[references.length - 1].amount + (displayAmount - refSum)) * 100) /
        100;
    }

    setPaying(true);
    try {
      const res = await createCheckout({
        paymentType: "BL",
        customerType: "SH",
        agencyCode,
        totalAmount: Math.round(displayAmount * 100) / 100,
        references,
      });
      if (res.error || !res.data?.success || !res.data.checkoutUrl) {
        toast.error(
          res.error?.message ??
            res.data?.message ??
            t("toasts.paymentIntentCreated", { secret: "—" }),
        );
        return;
      }
      onSelectionChange([]);
      const requestId = res.data.requestId?.trim();
      if (requestId) {
        await navigate({
          to: "/app/payments/checkout/success" as never,
          search: { requestId } as never,
        });
      } else {
        window.location.assign(res.data.checkoutUrl);
      }
    } finally {
      setPaying(false);
    }
  };

  if (!enabled || selectedBlNos.length === 0) return null;

  return (
    <Card size="small" className="bl-payment-bar">
      <Space wrap align="center">
        <AppIcon icon={Icons.creditCard} size={18} />
        <Text strong>{t("payment.selectedCount", { count: selectedBlNos.length })}</Text>
        <InputNumber
          min={0}
          prefix="$"
          value={displayAmount}
          onChange={(val) => setAmountUsd(Number(val ?? 0))}
        />
        <AppButton type="primary" loading={paying} onClick={() => void handlePay()}>
          {t("actions.payWithStripeMock")}
        </AppButton>
        {!sameAgency ? <Text type="danger">{t("payment.mixedAgencies")}</Text> : null}
      </Space>
    </Card>
  );
}
