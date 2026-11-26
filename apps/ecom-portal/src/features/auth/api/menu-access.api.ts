// Modified by Sekar Nagarajan (2026-11-26 16:45)
import { getStoredToken } from "@solverminds/platform";

/** GET /api/config/menu-access — fetch refNo-to-Category map */
export async function fetchMenuCategories(): Promise<Record<string, "D" | "P">> {
  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch("/api/config/menu-access", { headers });

  if (!res.ok) {
    throw new Error("Failed to load menu configuration");
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "Failed to load menu configuration: API returned non-JSON (check MSW / Vite proxy).",
    );
  }

  const json = (await res.json()) as { data: Record<string, "D" | "P"> };
  return json.data;
}
