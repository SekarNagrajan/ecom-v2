// Modified by Sekar Nagarajan (2026-11-25 15:10)
import { useToast } from "@solverminds/shared-ui/hooks";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { createCheckout } from "../api/payments.api";
import type { CreateCheckoutRequest, PayPendingItem } from "../types/payments.types";

/** Build a same-agency checkout payload from selected pay-pending lines. */
export function buildCheckoutRequest(
  selected: PayPendingItem[],
): CreateCheckoutRequest | { error: string } {
  if (selected.length === 0) {
    return { error: "empty" };
  }
  const agencyCode = selected[0].agencyCode;
  if (!selected.every((item) => item.agencyCode === agencyCode)) {
    return { error: "mixedAgency" };
  }
  // Prefer INV when any selected line is invoice-based (dashboard outstanding).
  const paymentType = selected.every((i) => i.paymentType === "BL")
    ? "BL"
    : selected.every((i) => i.paymentType === "BKG")
      ? "BKG"
      : "INV";
  const customerType = paymentType === "INV" ? "IN" : selected[0].customerType || "SH";
  const references = selected.map((item) => ({
    refNo: paymentType === "INV" && item.invNo ? item.invNo : item.refNo,
    amount: item.amountUsd,
    customerType: item.customerType,
  }));
  const totalAmount = Math.round(references.reduce((s, r) => s + r.amount, 0) * 100) / 100;
  return {
    paymentType,
    customerType,
    agencyCode,
    totalAmount,
    references,
  };
}

function parseCheckoutPath(checkoutUrl: string): {
  pathname: string;
  requestId: string;
} | null {
  try {
    const url = new URL(checkoutUrl, window.location.origin);
    const requestId = url.searchParams.get("requestId")?.trim() ?? "";
    if (!requestId) return null;
    return { pathname: url.pathname, requestId };
  } catch {
    return null;
  }
}

export function usePaymentCheckout() {
  const { t } = useTranslation(["payments", "common"]);
  const toast = useToast();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);

  const startCheckout = async (selected: PayPendingItem[]): Promise<boolean> => {
    const built = buildCheckoutRequest(selected);
    if ("error" in built) {
      if (built.error === "empty") {
        toast.error(t("toasts.selectItems"));
      } else if (built.error === "mixedAgency") {
        toast.error(t("toasts.sameAgencyRequired"));
      }
      return false;
    }

    setPaying(true);
    try {
      const res = await createCheckout(built);
      if (res.error || !res.data?.success || !res.data.checkoutUrl) {
        toast.error(res.error?.message ?? res.data?.message ?? t("toasts.checkoutFailed"));
        return false;
      }
      const parsed = parseCheckoutPath(res.data.checkoutUrl);
      if (parsed?.pathname.includes("/checkout/success")) {
        await navigate({
          to: "/app/payments/checkout/success" as never,
          search: { requestId: parsed.requestId } as never,
        });
      } else if (parsed?.pathname.includes("/checkout/cancel")) {
        await navigate({
          to: "/app/payments/checkout/cancel" as never,
          search: { requestId: parsed.requestId } as never,
        });
      } else {
        window.location.assign(res.data.checkoutUrl);
      }
      return true;
    } finally {
      setPaying(false);
    }
  };

  return { paying, startCheckout, buildCheckoutRequest };
}
