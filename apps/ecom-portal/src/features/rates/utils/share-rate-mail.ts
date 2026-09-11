// Modified by Sekar Nagarajan (2026-09-11 16:31)
import type { CombinedRateItem } from "../components/RateCardList";
import type { ShareRateMailRateSummary } from "../types/rates.types";

function money(currency: string, amount: number): string {
  return `${currency} ${amount.toFixed(2)}`;
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

export function buildShareRateSubject(rates: CombinedRateItem[]): string {
  if (rates.length === 1) {
    const rate = rates[0];
    return `Freight rate quote — ${rate.code} (${rate.originPort} → ${rate.deliveryPort})`;
  }
  if (rates.length > 1) {
    const first = rates[0];
    return `Freight rate quotes — ${rates.length} results (${first.originPort} → ${first.deliveryPort})`;
  }
  return "Freight rate quotes";
}

/** HTML body for FormRichTextEditor (CRM email composer parity). */
export function buildShareRateMessage(rates: CombinedRateItem[]): string {
  if (rates.length === 0) {
    return "<p>Please find the freight rate details below.</p>";
  }

  const parts: string[] = [
    "<p>Hello,</p>",
    "<p>Please find the freight rate details below.</p>",
  ];

  rates.forEach((rate, index) => {
    parts.push(
      `<p><strong>Rate ${index + 1}: ${escapeHtml(rate.code)} (${escapeHtml(rate.type)})</strong></p>`,
    );
    parts.push("<ul>");
    parts.push(`<li>Title: ${escapeHtml(rate.title)}</li>`);
    parts.push(`<li>Lane: ${escapeHtml(lane(rate))}</li>`);
    parts.push(`<li>Equipment: ${escapeHtml(rate.eqpType)}</li>`);
    parts.push(
      `<li>Commodity: ${escapeHtml(rate.commodityName || rate.commodity)}</li>`,
    );
    parts.push(
      `<li>Ocean freight: ${escapeHtml(money(rate.currency, rate.baseAmount))}</li>`,
    );
    parts.push(
      `<li>Surcharges (est.): ${escapeHtml(money(rate.currency, rate.surchargeAmount))}</li>`,
    );
    parts.push(
      `<li>Total (est.): ${escapeHtml(money(rate.currency, rate.totalEstimatedAmount))}</li>`,
    );
    parts.push(
      `<li>Validity: ${escapeHtml(rate.effectiveFrom)} to ${escapeHtml(rate.effectiveTo)}</li>`,
    );
    parts.push("</ul>");
  });

  parts.push("<p>Regards,<br/>E-Com Portal</p>");
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
