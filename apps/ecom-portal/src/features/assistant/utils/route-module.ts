// Modified by Sekar Nagarajan (2026-10-20 14:14)

/** Maps a portal pathname to a suggestion module key. */
export function routeToModule(pathname: string): string {
  if (pathname.includes("/booking")) return "booking";
  if (pathname.includes("/tracking")) return "tracking";
  if (pathname.includes("/schedules")) return "schedules";
  if (pathname.includes("/shipping-instruction")) return "shipping-instruction";
  if (pathname.includes("/rates") || pathname.includes("/tariff")) return "rates";
  if (pathname.includes("/vgm")) return "vgm";
  if (pathname.includes("/bl")) return "bl";
  if (pathname.includes("/carbon")) return "carbon";
  return "default";
}
