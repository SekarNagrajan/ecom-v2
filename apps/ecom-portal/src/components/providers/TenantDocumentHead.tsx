// Created by Sekar Nagarajan (2026-11-13 01:10)
/**
 * Keeps the browser chrome in step with the active tenant: tab title, favicon (when the tenant
 * provides one) and the `theme-color` used by mobile browsers for the address bar.
 */
import { useTenantStore } from "@solverminds/auth";
import { env } from "@solverminds/platform";
import { useEffect } from "react";

const DEFAULT_FAVICON = "/solverminds-mark.png";

function upsertMeta(name: string, content: string): void {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function setFavicon(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (link.href !== new URL(href, window.location.origin).href) link.href = href;
}

export function TenantDocumentHead({ primaryColor }: { primaryColor: string }) {
  const tenant = useTenantStore((state) => state.activeTenant);

  useEffect(() => {
    document.title = tenant.name || env.VITE_APP_TITLE;
    setFavicon(tenant.faviconUrl || DEFAULT_FAVICON);
  }, [tenant.name, tenant.faviconUrl]);

  useEffect(() => {
    if (primaryColor) upsertMeta("theme-color", primaryColor);
  }, [primaryColor]);

  return null;
}
