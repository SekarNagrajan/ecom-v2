// Modified by Sekar Nagarajan (2026-09-29 12:50)
import { AppButton } from "@solverminds/shared-ui";
import { useToast } from "@solverminds/shared-ui/hooks";
import { Card, InputNumber, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import { createBLPaymentIntent } from "../api/bl.api";
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
  const { t } = useTranslation(["bill-of-lading", "common", "modules"]);
  const toast = useToast();
  const [amountUsd, setAmountUsd] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);

  const selectedRows = useMemo(
    () => rows.filter((r) => selectedBlNos.includes(r.blNo)),
    [rows, selectedBlNos],
  );

  const defaultAmount = useMemo(
    () =>
      selectedRows.reduce((sum, r) => sum + (r.payAmountUsd ?? 0), 0) || null,
    [selectedRows],
  );

  const displayAmount = amountUsd ?? defaultAmount ?? 0;

  const sameAgency =
    selectedRows.length <= 1 ||
    selectedRows.every(
      (r) => r.issueAgency === selectedRows[0]?.issueAgency,
    );

  const handlePay = async () => {
    if (selectedBlNos.length === 0) {
      toast.error(t("toasts.selectBlForPayment"));
      return;
    }
    if (!sameAgency) {
      toast.error(t("toasts.sameAgencyRequired"));
      return;
    }
    setPaying(true);
    try {
      const res = await createBLPaymentIntent(selectedBlNos, displayAmount);
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      const secret = res.data?.clientSecret?.slice(0, 20) ?? "";
      toast.success(t("toasts.paymentIntentCreated", { secret }));
      onSelectionChange([]);
    } finally {
      setPaying(false);
    }
  };

  if (!enabled || selectedBlNos.length === 0) return null;

  return (
    <Card size="small" className="bl-payment-bar">
      <Space wrap align="center">
        <AppIcon icon={Icons.creditCard} size={18} />
        <Text strong>
          {t("payment.selectedCount", { count: selectedBlNos.length })}
        </Text>
        <InputNumber
          min={0}
          prefix="$"
          value={displayAmount}
          onChange={(val) => setAmountUsd(Number(val ?? 0))}
        />
        <AppButton type="primary" loading={paying} onClick={handlePay}>
          {t("actions.payWithStripeMock")}
        </AppButton>
        {!sameAgency ? (
          <Text type="danger">{t("payment.mixedAgencies")}</Text>
        ) : null}
      </Space>
    </Card>
  );
}
