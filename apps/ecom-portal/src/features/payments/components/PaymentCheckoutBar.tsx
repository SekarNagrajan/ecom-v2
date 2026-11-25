// Modified by Sekar Nagarajan (2026-11-25 15:00)
import { AppButton } from "@solverminds/shared-ui";
import { Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AppIcon, Icons } from "../../../components/icons";
import type { PayPendingItem } from "../types/payments.types";

const { Text } = Typography;

interface PaymentCheckoutBarProps {
  selected: PayPendingItem[];
  paying?: boolean;
  onPay: () => void;
}

export function PaymentCheckoutBar({ selected, paying = false, onPay }: PaymentCheckoutBarProps) {
  const { t } = useTranslation(["payments", "common"]);

  const total = useMemo(
    () => Math.round(selected.reduce((s, item) => s + item.amountUsd, 0) * 100) / 100,
    [selected],
  );

  const sameAgency =
    selected.length <= 1 || selected.every((item) => item.agencyCode === selected[0]?.agencyCode);

  const agencyLabel = selected.length > 0 && sameAgency ? selected[0].agencyCode : null;

  return (
    <div className="pay-pending-bar">
      <div className="pay-pending-bar__summary">
        {selected.length === 0 ? (
          <Text type="secondary">{t("bar.selectHint")}</Text>
        ) : (
          <>
            <Text className="pay-pending-bar__count">
              {t("selectedCount", {
                count: selected.length,
                amount: total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
              })}
            </Text>
            {agencyLabel ? (
              <Text type="secondary" className="pay-pending-bar__agency">
                {t("bar.agency", { agency: agencyLabel })}
              </Text>
            ) : null}
            {!sameAgency ? (
              <Text type="danger" className="pay-pending-bar__warning">
                {t("mixedAgencies")}
              </Text>
            ) : null}
          </>
        )}
      </div>

      <div className="pay-pending-bar__actions">
        <AppButton
          type="primary"
          loading={paying}
          disabled={selected.length === 0 || !sameAgency}
          icon={<AppIcon icon={Icons.creditCard} size={14} />}
          onClick={onPay}
        >
          {t("actions.paySelected")}
        </AppButton>
      </div>
    </div>
  );
}
