// Modified by Sekar Nagarajan (2026-09-15 15:00)
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

function routingLabel(item: ScheduleItem): string {
  if (item.isDirect) return "Direct";
  return `${item.transshipmentCount} ${
    item.transshipmentCount === 1 ? "stop" : "stops"
  }`;
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

export function buildShareScheduleSubject(schedules: ScheduleItem[]): string {
  if (schedules.length === 1) {
    const item = schedules[0];
    return `Sailing schedule — ${item.vesselName} ${item.voyage}${item.bound} (${item.polPortId} → ${item.podPortId})`;
  }
  if (schedules.length > 1) {
    const first = schedules[0];
    return `Sailing schedules — ${schedules.length} results (${first.polPortId} → ${first.podPortId})`;
  }
  return "Sailing schedules";
}

/** HTML body for FormRichTextEditor (Rates share-mail parity). */
export function buildShareScheduleMessage(schedules: ScheduleItem[]): string {
  if (schedules.length === 0) {
    return "<p>Please find the sailing schedule details below.</p>";
  }

  const parts: string[] = [
    "<p>Hello,</p>",
    "<p>Please find the sailing schedule details below.</p>",
  ];

  schedules.forEach((item, index) => {
    const recommended = item.isDefaultRoute ? " · Recommended route" : "";
    parts.push(
      `<p><strong>Sailing ${index + 1}: ${escapeHtml(item.serviceCode)} — ${escapeHtml(item.vesselName)} (${escapeHtml(item.voyage)}${escapeHtml(item.bound)})${escapeHtml(recommended)}</strong></p>`,
    );
    parts.push("<ul>");
    parts.push(`<li>Service: ${escapeHtml(item.serviceName)}</li>`);
    parts.push(`<li>Lane: ${escapeHtml(lane(item))}</li>`);
    parts.push(`<li>ETD: ${escapeHtml(item.etd)}</li>`);
    parts.push(`<li>ETA: ${escapeHtml(item.eta)}</li>`);
    parts.push(`<li>Transit: ${item.transitTimeDays} days</li>`);
    parts.push(`<li>Routing: ${escapeHtml(routingLabel(item))}</li>`);
    if (item.deadlines?.containerGateIn) {
      parts.push(
        `<li>Gate-in cut-off: ${escapeHtml(item.deadlines.containerGateIn)}</li>`,
      );
    }
    if (item.deadlines?.siDocClosing) {
      parts.push(
        `<li>SI cut-off: ${escapeHtml(item.deadlines.siDocClosing)}</li>`,
      );
    }
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
