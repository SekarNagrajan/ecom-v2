// Modified by Sekar Nagarajan (2026-11-12 15:10)
/** Pure helpers shared by the Control Panel sections. */
import { MODULE_TITLES } from "../../../constants/module-titles";
import type { CustomerAdvisory, MenuConfig, ModuleMappingMenu } from "../types/admin.types";

/**
 * Await a mutation whose errors are already surfaced by its hook's onError toast, so callers
 * that only need the promise to settle (close a drawer, reset a form) don't get an unhandled
 * rejection.
 */
export async function settleMutation(run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch {
    /* surfaced by the mutation's onError toast */
  }
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

// ---------------------------------------------------------------------------
// Customer advisories
// ---------------------------------------------------------------------------
export type AdvisoryStatus = "active" | "scheduled" | "expired" | "inactive";

/** ISO calendar date (YYYY-MM-DD) for "today" in the browser's zone. */
export function todayIsoDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Derive the display status from the flag and the validity window ('' effectiveTo = open-ended). */
export function advisoryStatus(
  advisory: Pick<CustomerAdvisory, "isActive" | "effectiveFrom" | "effectiveTo">,
  today: string = todayIsoDate(),
): AdvisoryStatus {
  if (!advisory.isActive) return "inactive";
  if (advisory.effectiveFrom && advisory.effectiveFrom > today) return "scheduled";
  if (advisory.effectiveTo && advisory.effectiveTo < today) return "expired";
  return "active";
}

// ---------------------------------------------------------------------------
// Module mapping / creation
// ---------------------------------------------------------------------------
/** Legacy menu RefNo → portal module title key (MODULE_TITLES / modules.json). */
const REFNO_TO_MODULE_TITLE: Record<string, keyof typeof MODULE_TITLES> = {
  DBD: "dashboard",
  SCH: "schedules",
  TRK: "tracking",
  RAT: "rates",
  TAR: "tariff",
  BKG: "booking",
  SHI: "shippingInstruction",
  VGM: "vgm",
  BOL: "billOfLading",
  BBP: "billOfLadingSummary",
  DEO: "deliveryOrder",
  ARN: "arrivalNotice",
  CRO: "containerReleaseOrder",
  USC: "userCreation",
  PAY: "paymentHistory",
  CUS: "customerStatement",
  CEC: "carbonCalculator",
  RAQ: "quotes",
};

/**
 * Human-readable module name for a mapping entry: the portal's canonical module title when the
 * RefNo is known (so "OBLPrint" shows as "Bill of Lading"), otherwise the stored menu name.
 */
export function menuDisplayName(
  menu: Pick<ModuleMappingMenu, "menuName" | "refNo">,
  titles: Record<keyof typeof MODULE_TITLES, string> = MODULE_TITLES,
): string {
  const key = menu.refNo ? REFNO_TO_MODULE_TITLE[menu.refNo.toUpperCase()] : undefined;
  return key ? titles[key] : menu.menuName;
}

/** Server identity of a menu row (menus.bridge matches on refNo + parentMenu + userType). */
export function menuRowId(menu: Pick<MenuConfig, "refNo" | "parentMenu" | "userType">): string {
  return `${menu.refNo}|${menu.parentMenu ?? ""}|${menu.userType ?? "U"}`.toUpperCase();
}

/** Next free display order for a new menu / banner: max + 1 (1 when the list is empty). */
export function nextOrder(items: ReadonlyArray<{ orderNo?: number; sortOrder?: number }>): number {
  const max = items.reduce((acc, item) => Math.max(acc, item.orderNo ?? item.sortOrder ?? 0), 0);
  return max + 1;
}
