// Modified by Sekar Nagarajan (2026-08-25 19:00)
/**
 * Public-menu access helpers — parity with JSP menu Category D (public) vs P (privileged).
 * Hard-coded until full `/api/config/menu-access` Category map is available.
 */

/** Menu keys reachable without login (Category D / JSP whitelist). */
export const PUBLIC_MENU_KEYS = new Set([
  "home",
  "schedules",
  "tracking",
  "rates",
  "tariff",
  "contact-us",
]);

export function isPublicMenuKey(key: string): boolean {
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
  if (menuKey === "rates" || menuKey === "tariff") {
    return ["rates-group"];
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
