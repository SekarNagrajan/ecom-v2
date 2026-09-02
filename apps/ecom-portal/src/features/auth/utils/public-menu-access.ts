// Modified by Sekar Nagarajan (2026-09-02 15:18)
/**
 * Public-menu access helpers — parity with JSP menu Category D (public) vs P (privileged).
 * Falls back to hard-coded keys when the backend menu-access API hasn't loaded yet.
 */

/** Fallback menu keys reachable without login (Category D / JSP whitelist). */
export const PUBLIC_MENU_KEYS = new Set([
  "home",
  "schedules",
  "tracking",
  "rates",
  "tariff",
  "contact-us",
]);

/** Capability code -> sidebar menu key mapping */
const CAPABILITY_TO_MENU_KEY: Record<string, string> = {
  SCH: "schedules",
  TRK: "tracking",
  BKG: "booking",
  SI: "si",
  BL: "bl",
  VGM: "vgm",
  DO: "do",
  CRO: "cro",
  ARN: "arrival-notice",
  STMT: "customer-stmt",
  CO2: "carbon",
  PAY: "payments",
};

export function capabilityToMenuKey(capCode: string): string | undefined {
  return CAPABILITY_TO_MENU_KEY[capCode];
}

export function menuKeyToCapability(menuKey: string): string | undefined {
  return Object.entries(CAPABILITY_TO_MENU_KEY).find(
    ([, v]) => v === menuKey,
  )?.[0];
}

export function isPublicMenuKey(
  key: string,
  menuCategories?: Record<string, "D" | "P"> | null,
): boolean {
  if (menuCategories) {
    const capCode = menuKeyToCapability(key);
    if (capCode && menuCategories[capCode] === "D") return true;
    if (capCode && menuCategories[capCode] === "P") return false;
  }
  return PUBLIC_MENU_KEYS.has(key);
}

/**
 * Map public sidebar menu keys to post-login `/app` (or public) paths.
 * Mirrors AuthenticatedSidebar routing.
 */
export function menuKeyToAppPath(key: string): string {
  switch (key) {
    case "home":
      return "/";
    case "contact-us":
      return "/contact-us";
    case "rates":
    case "tariff":
      return "/app/rates";
    case "si":
      return "/app/shipping-instruction";
    case "do":
      return "/app/delivery-order";
    case "arrival-notice":
      return "/app/arrival-notice";
    case "customer-stmt":
      return "/app/customer-stmt";
    case "payments":
      return "/app/payments";
    case "carbon":
      return "/app/carbon";
    case "booking":
      return "/app/booking";
    case "vgm":
      return "/app/vgm";
    case "bl":
      return "/app/bl";
    case "cro":
      return "/app/cro";
    case "schedules":
      return "/app/schedules";
    case "tracking":
      return "/app/tracking";
    default:
      return `/app/${key}`;
  }
}

/**
 * Resolve the active sidebar menu key from the current pathname.
 * Path segments (e.g. `shipping-instruction`) often differ from menu keys (`si`).
 */
export function appPathnameToMenuKey(pathname: string): string {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/contact-us")) return "contact-us";
  if (pathname.startsWith("/register")) return "home";

  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "schedules") return "schedules";
  if (segments[0] === "tracking") return "tracking";

  if (segments[0] !== "app") return "dashboard";

  const moduleSeg = segments[1] || "dashboard";
  switch (moduleSeg) {
    case "shipping-instruction":
      return "si";
    case "delivery-order":
      return "do";
    case "Dashboard":
    case "Dashboard ":
      return "dashboard";
    default:
      return moduleSeg;
  }
}

/** Parent submenu keys that must stay open when a child module is active. */
export function menuKeyToOpenGroupKeys(menuKey: string): string[] {
  if (menuKey === "schedules" || menuKey === "tracking") {
    return ["schedules-group"];
  }
  if (
    menuKey === "admin" ||
    menuKey === "payments" ||
    menuKey === "customer-stmt" ||
    menuKey === "carbon"
  ) {
    return ["more-group"];
  }
  return [];
}

/** Landing hero tab → app path for post-login resume. */
export function landingTabToAppPath(
  tab: "schedules" | "tracking" | "rates",
): string {
  return menuKeyToAppPath(tab);
}
