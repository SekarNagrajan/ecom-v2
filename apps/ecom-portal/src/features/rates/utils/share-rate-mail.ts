// Modified by Sekar Nagarajan (2026-09-11 16:31)
import type { TFunction } from "i18next";

import type {
  CombinedRateItem,
  ShareRateMailRateSummary,
} from "../types/rates.types";

function money(currency: string, amount: number): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function shareRateTypeLabel(
  type: CombinedRateItem["type"],
  t: TFunction<"rates">,
): string {
  switch (type) {
    case "CONTRACT":
      return t("options.rateType.contract");
    case "SURCHARGE":
      return t("options.rateType.surcharge");
    case "QUOTE":
      return t("options.rateType.quote");
    case "TARIFF":
      return t("options.rateType.tariff");
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function lane(rate: CombinedRateItem): string {
  return `${rate.originPort} (${rate.originPortName}) → ${rate.deliveryPort} (${rate.deliveryPortName})`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function toShareRateSummary(
  rate: CombinedRateItem,
): ShareRateMailRateSummary {
  return {
    id: rate.id,
    type: rate.type,
    code: rate.code,
    title: rate.title,
    originPort: rate.originPort,
    originPortName: rate.originPortName,
    deliveryPort: rate.deliveryPort,
    deliveryPortName: rate.deliveryPortName,
    eqpType: rate.eqpType,
    commodity: rate.commodity,
    commodityName: rate.commodityName,
    currency: rate.currency,
    baseAmount: rate.baseAmount,
    surchargeAmount: rate.surchargeAmount,
    totalEstimatedAmount: rate.totalEstimatedAmount,
    effectiveFrom: rate.effectiveFrom,
    effectiveTo: rate.effectiveTo,
  };
}

export function buildShareRateSubject(
  rates: CombinedRateItem[],
  t: TFunction<"rates">,
): string {
  if (rates.length === 1) {
    const rate = rates[0];
    return t("shareMail.subjectTemplate.single", {
      code: rate.code,
      pol: rate.originPort,
      pod: rate.deliveryPort,
    });
  }
  if (rates.length > 1) {
    const first = rates[0];
    return t("shareMail.subjectTemplate.multiple", {
      count: rates.length,
      pol: first.originPort,
      pod: first.deliveryPort,
    });
  }
  return t("shareMail.subjectTemplate.empty");
}

/** HTML body for FormRichTextEditor (CRM email composer parity). */
export function buildShareRateMessage(
  rates: CombinedRateItem[],
  t: TFunction<"rates">,
): string {
  if (rates.length === 0) {
    return `<p>${escapeHtml(t("shareMail.body.intro"))}</p>`;
  }

  const parts: string[] = [
    `<p>${escapeHtml(t("shareMail.body.hello"))}</p>`,
    `<p>${escapeHtml(t("shareMail.body.intro"))}</p>`,
  ];

  rates.forEach((rate, index) => {
    parts.push(
      `<p><strong>${escapeHtml(
        t("shareMail.body.rateHeading", {
          index: index + 1,
          code: rate.code,
          type: shareRateTypeLabel(rate.type, t),
        }),
      )}</strong></p>`,
    );
    parts.push("<ul>");
    parts.push(
      `<li>${escapeHtml(t("shareMail.body.title", { value: rate.title }))}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(t("shareMail.body.lane", { value: lane(rate) }))}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(t("shareMail.body.equipment", { value: rate.eqpType }))}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(
        t("shareMail.body.commodity", {
          value: rate.commodityName || rate.commodity,
        }),
      )}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(
        t("shareMail.body.oceanFreight", {
          value: money(rate.currency, rate.baseAmount),
        }),
      )}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(
        t("shareMail.body.surcharges", {
          value: money(rate.currency, rate.surchargeAmount),
        }),
      )}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(
        t("shareMail.body.total", {
          value: money(rate.currency, rate.totalEstimatedAmount),
        }),
      )}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(
        t("shareMail.body.validity", {
          from: rate.effectiveFrom,
          to: rate.effectiveTo,
        }),
      )}</li>`,
    );
    parts.push("</ul>");
  });

  parts.push(
    `<p>${escapeHtml(t("shareMail.body.regards"))}<br/>${escapeHtml(t("shareMail.body.signature"))}</p>`,
  );
  return parts.join("");
}

/** Strip tags for validation / plain-length checks. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
