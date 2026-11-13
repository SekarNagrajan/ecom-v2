// Modified by Sekar Nagarajan (2026-09-15 15:00)
import type { TFunction } from "i18next";

import type {
  ScheduleItem,
  ShareScheduleMailSummary,
} from "../types/schedules.types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lane(item: ScheduleItem): string {
  return `${item.polPortId} (${item.polPortName}) → ${item.podPortId} (${item.podPortName})`;
}

function routingLabel(item: ScheduleItem, t: TFunction<"schedules">): string {
  if (item.isDirect) return t("list.direct");
  return t("list.stopCount", { count: item.transshipmentCount });
}

export function toShareScheduleSummary(
  item: ScheduleItem,
): ShareScheduleMailSummary {
  return {
    id: item.id,
    serviceCode: item.serviceCode,
    serviceName: item.serviceName,
    vesselName: item.vesselName,
    voyage: item.voyage,
    bound: item.bound,
    polPortId: item.polPortId,
    polPortName: item.polPortName,
    podPortId: item.podPortId,
    podPortName: item.podPortName,
    etd: item.etd,
    eta: item.eta,
    transitTimeDays: item.transitTimeDays,
    isDirect: item.isDirect,
    transshipmentCount: item.transshipmentCount,
    isDefaultRoute: item.isDefaultRoute,
    gateIn: item.deadlines?.containerGateIn ?? "",
    siClosing: item.deadlines?.siDocClosing ?? "",
  };
}

export function buildShareScheduleSubject(
  schedules: ScheduleItem[],
  t: TFunction<"schedules">,
): string {
  if (schedules.length === 1) {
    const item = schedules[0];
    return t("shareMail.subjectTemplate.single", {
      vessel: item.vesselName,
      voyage: item.voyage,
      bound: item.bound,
      pol: item.polPortId,
      pod: item.podPortId,
    });
  }
  if (schedules.length > 1) {
    const first = schedules[0];
    return t("shareMail.subjectTemplate.multiple", {
      count: schedules.length,
      pol: first.polPortId,
      pod: first.podPortId,
    });
  }
  return t("shareMail.subjectTemplate.empty");
}

/** HTML body for FormRichTextEditor (Rates share-mail parity). */
export function buildShareScheduleMessage(
  schedules: ScheduleItem[],
  t: TFunction<"schedules">,
): string {
  if (schedules.length === 0) {
    return `<p>${escapeHtml(t("shareMail.body.intro"))}</p>`;
  }

  const parts: string[] = [
    `<p>${escapeHtml(t("shareMail.body.hello"))}</p>`,
    `<p>${escapeHtml(t("shareMail.body.intro"))}</p>`,
  ];

  schedules.forEach((item, index) => {
    const recommended = item.isDefaultRoute
      ? t("shareMail.body.recommendedSuffix")
      : "";
    parts.push(
      `<p><strong>${escapeHtml(
        t("shareMail.body.sailingHeading", {
          index: index + 1,
          service: item.serviceCode,
          vessel: item.vesselName,
          voyage: item.voyage,
          bound: item.bound,
          recommended,
        }),
      )}</strong></p>`,
    );
    parts.push("<ul>");
    parts.push(
      `<li>${escapeHtml(t("shareMail.body.service", { value: item.serviceName }))}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(t("shareMail.body.lane", { value: lane(item) }))}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(t("shareMail.body.etd", { value: item.etd }))}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(t("shareMail.body.eta", { value: item.eta }))}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(
        t("shareMail.body.transit", { count: item.transitTimeDays }),
      )}</li>`,
    );
    parts.push(
      `<li>${escapeHtml(
        t("shareMail.body.routing", { value: routingLabel(item, t) }),
      )}</li>`,
    );
    if (item.deadlines?.containerGateIn) {
      parts.push(
        `<li>${escapeHtml(
          t("shareMail.body.gateIn", {
            value: item.deadlines.containerGateIn,
          }),
        )}</li>`,
      );
    }
    if (item.deadlines?.siDocClosing) {
      parts.push(
        `<li>${escapeHtml(
          t("shareMail.body.si", { value: item.deadlines.siDocClosing }),
        )}</li>`,
      );
    }
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
