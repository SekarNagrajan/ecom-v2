// Modified by Sekar Nagarajan (2026-10-20)
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";

import { ecomAiN8nProxyPlugin } from "./vite-ai-n8n-proxy";

/**
 * Last-resort /api/* handler: never fall through to the SPA HTML shell.
 * Unmatched API calls used to return 200 + `<!DOCTYPE html>`, and any
 * `res.json()` then crashed with "Unexpected token '<'".
 */
function ecomApiJson404FallbackPlugin(): Plugin {
  return {
    name: "ecom-api-json-404-fallback",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: {
              code: "NOT_FOUND",
              message: `No handler for ${req.method ?? "GET"} ${url}`,
            },
          }),
        );
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: {
              code: "NOT_FOUND",
              message: `No handler for ${req.method ?? "GET"} ${url}`,
            },
          }),
        );
      });
    },
  };
}

/** Resolve a package that may only exist under pnpm's virtual store. */
function resolveWorkspacePackage(packageName: string): string | undefined {
  const rootNodeModules = path.resolve(__dirname, "../../node_modules");
  const direct = path.join(rootNodeModules, packageName);
  if (fs.existsSync(direct)) {
    return direct;
  }

  const [scope, name] = packageName.startsWith("@")
    ? packageName.split("/")
    : [null, packageName];
  const pnpmDir = path.join(rootNodeModules, ".pnpm");
  if (!fs.existsSync(pnpmDir)) return undefined;

  const prefix = scope ? `${scope}+${name}@` : `${name}@`;
  const match = fs
    .readdirSync(pnpmDir)
    .find((entry) => entry.startsWith(prefix));
  if (!match) return undefined;

  const candidate = path.join(
    pnpmDir,
    match,
    "node_modules",
    ...(scope ? [scope, name] : [name]),
  );
  return fs.existsSync(candidate) ? candidate : undefined;
}

const tiptapCorePath = resolveWorkspacePackage("@tiptap/core");

/** Booking tables persisted by the mock layer under mock-data/runtime/. */
const BOOKING_RUNTIME_TABLES = [
  "bookings",
  "bookingCust",
  "bookingCargo",
  "bookingCommodity",
  "bookingDg",
  "bookingOog",
  "bookingRefer",
  "bookingLeg",
  "bookingHaulage",
  "bookingConf",
  "bookingFiles",
  "bookingIcs",
  "insurance",
  "bookingReference",
  "bookingCancel",
  "bookingSummary",
] as const;

/** SI (+ shared B/L amendment) tables under mock-data/runtime/si/. */
const SI_RUNTIME_TABLES = [
  "shippingInstructions",
  "siCust",
  "siCargo",
  "siCommodity",
  "siDg",
  "siOog",
  "siReefer",
  "siCharges",
  "siPayers",
  "siFiles",
  "siIcs",
  "siReference",
  "siRequestMaster",
  "siSummary",
  "siLocks",
] as const;

/** VGM declaration rows under mock-data/runtime/vgm/. */
const VGM_RUNTIME_TABLES = ["vgm"] as const;

/** User profile / alerts / account-lifecycle tables under mock-data/runtime/user/. */
const USER_RUNTIME_TABLES = [
  "users",
  "userDetails",
  "mailAlerts",
  "customerNotifications",
  "customerUsers",
  "ECOMRegHistory",
] as const;

/** Non-table session state (alert overrides + quotes) as session.json. */
const USER_RUNTIME_SIDECARS = ["session"] as const;

const BOOKING_RUNTIME_DIR = path.resolve(__dirname, "mock-data/runtime");
const SI_RUNTIME_DIR = path.resolve(__dirname, "mock-data/runtime/si");
const VGM_RUNTIME_DIR = path.resolve(__dirname, "mock-data/runtime/vgm");
const USER_RUNTIME_DIR = path.resolve(__dirname, "mock-data/runtime/user");

type RuntimeOverlayPayload = {
  version: number;
  counters: Record<string, number>;
  tables: Record<string, unknown[]>;
  sidecars?: Record<string, unknown>;
};

function readRequestBody(req: import("http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function readRuntimeOverlay(
  dir: string,
  tableNames: readonly string[],
  sidecarNames: readonly string[] = [],
): RuntimeOverlayPayload | null {
  const metaPath = path.join(dir, "_meta.json");
  if (!fs.existsSync(metaPath)) return null;
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
      version?: number;
      counters?: Record<string, number>;
    };
    const tables: Record<string, unknown[]> = {};
    for (const name of tableNames) {
      const file = path.join(dir, `${name}.json`);
      if (!fs.existsSync(file)) {
        tables[name] = [];
        continue;
      }
      const rows = JSON.parse(fs.readFileSync(file, "utf8"));
      tables[name] = Array.isArray(rows) ? rows : [];
    }
    const sidecars: Record<string, unknown> = {};
    for (const name of sidecarNames) {
      const file = path.join(dir, `${name}.json`);
      if (!fs.existsSync(file)) continue;
      sidecars[name] = JSON.parse(fs.readFileSync(file, "utf8"));
    }
    return {
      version: meta.version ?? 1,
      counters: meta.counters ?? {},
      tables,
      ...(Object.keys(sidecars).length ? { sidecars } : {}),
    };
  } catch {
    return null;
  }
}

function writeRuntimeOverlay(
  dir: string,
  tableNames: readonly string[],
  payload: {
    version?: number;
    counters?: Record<string, number>;
    tables?: Record<string, unknown[]>;
    sidecars?: Record<string, unknown>;
  },
  sidecarNames: readonly string[] = [],
) {
  fs.mkdirSync(dir, { recursive: true });
  const counters = payload.counters ?? {};
  const tables = payload.tables ?? {};
  fs.writeFileSync(
    path.join(dir, "_meta.json"),
    JSON.stringify({ version: payload.version ?? 1, counters }, null, 2),
  );
  for (const name of tableNames) {
    const rows = Array.isArray(tables[name]) ? tables[name] : [];
    fs.writeFileSync(
      path.join(dir, `${name}.json`),
      JSON.stringify(rows, null, 1),
    );
  }
  const sidecars = payload.sidecars ?? {};
  for (const name of sidecarNames) {
    if (!Object.prototype.hasOwnProperty.call(sidecars, name)) continue;
    fs.writeFileSync(
      path.join(dir, `${name}.json`),
      JSON.stringify(sidecars[name], null, 2),
    );
  }
}

/** Delete only known overlay files (never wipe sibling dirs like runtime/si/). */
function clearRuntimeOverlay(
  dir: string,
  tableNames: readonly string[],
  sidecarNames: readonly string[] = [],
) {
  if (!fs.existsSync(dir)) return;
  const known = new Set([
    ...tableNames.map((n) => `${n}.json`),
    ...sidecarNames.map((n) => `${n}.json`),
    "_meta.json",
  ]);
  for (const entry of fs.readdirSync(dir)) {
    if (!known.has(entry)) continue;
    const full = path.join(dir, entry);
    if (fs.statSync(full).isFile()) fs.unlinkSync(full);
  }
}

function handleRuntimeDbRoute(
  req: import("http").IncomingMessage,
  res: import("http").ServerResponse,
  opts: {
    dir: string;
    tables: readonly string[];
    sidecars?: readonly string[];
    json: (
      res: import("http").ServerResponse,
      body: unknown,
      status?: number,
    ) => void;
  },
): boolean {
  const sidecarNames = opts.sidecars ?? [];
  if (req.method === "GET") {
    const overlay = readRuntimeOverlay(opts.dir, opts.tables, sidecarNames);
    opts.json(res, {
      data: overlay ?? { version: 1, counters: {}, tables: null },
    });
    return true;
  }
  if (req.method === "PUT") {
    void readRequestBody(req).then((raw) => {
      try {
        const body = JSON.parse(raw || "{}") as {
          version?: number;
          counters?: Record<string, number>;
          tables?: Record<string, unknown[]>;
          sidecars?: Record<string, unknown>;
        };
        writeRuntimeOverlay(opts.dir, opts.tables, body, sidecarNames);
        opts.json(res, { data: { ok: true } });
      } catch (err) {
        opts.json(
          res,
          {
            error: {
              message:
                err instanceof Error ? err.message : "Invalid payload",
            },
          },
          400,
        );
      }
    });
    return true;
  }
  if (req.method === "DELETE") {
    clearRuntimeOverlay(opts.dir, opts.tables, sidecarNames);
    opts.json(res, { data: { ok: true } });
    return true;
  }
  return false;
}

/**
 * Dev-only fallback for booking / rates / public tenant when the MSW
 * service worker does not intercept (e.g. after a long HMR session, cookie
 * clear, or SW not claimed). MSW still owns these routes when active; this
 * only runs if the request reaches Vite.
 *
 * Also hosts GET|PUT|DELETE /api/_mock/{booking,si,vgm,user}-db so the
 * fixture layer can persist under mock-data/runtime/ (use msw `bypass` from handlers).
 */
function bookingMockApiPlugin(): Plugin {
  const json = (
    res: import("http").ServerResponse,
    body: unknown,
    status = 200,
  ) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
  };

  return {
    name: "booking-mock-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";

        if (url === "/api/_mock/booking-db") {
          if (
            handleRuntimeDbRoute(req, res, {
              dir: BOOKING_RUNTIME_DIR,
              tables: BOOKING_RUNTIME_TABLES,
              json,
            })
          ) {
            return;
          }
        }

        if (url === "/api/_mock/si-db") {
          if (
            handleRuntimeDbRoute(req, res, {
              dir: SI_RUNTIME_DIR,
              tables: SI_RUNTIME_TABLES,
              json,
            })
          ) {
            return;
          }
        }

        if (url === "/api/_mock/vgm-db") {
          if (
            handleRuntimeDbRoute(req, res, {
              dir: VGM_RUNTIME_DIR,
              tables: VGM_RUNTIME_TABLES,
              json,
            })
          ) {
            return;
          }
        }

        if (url === "/api/_mock/user-db") {
          if (
            handleRuntimeDbRoute(req, res, {
              dir: USER_RUNTIME_DIR,
              tables: USER_RUNTIME_TABLES,
              sidecars: USER_RUNTIME_SIDECARS,
              json,
            })
          ) {
            return;
          }
        }

        // Modified by Sekar Nagarajan (2026-09-08 10:50) — public tenant bootstrap fallback
        if (req.method === "GET" && url === "/api/public/tenant") {
          return json(res, {
            status: "SUCCESS",
            data: {
              id: "TENANT_01",
              name: "SVM E-Commerce Portal",
              customerCode: "CUST001",
              logoUrl: "/logos/tenant_01.png",
              primaryColor: "#1890ff",
              features: {
                defaultLandingRoute: "/app/dashboard",
                enableInsurance: true,
                enableProductDashboard: true,
                customerStatementEngine: "INVOICE",
                allowedModules: [
                  "dashboard",
                  "schedules",
                  "tracking",
                  "rates",
                  "booking",
                  "si",
                  "vgm",
                  "bl",
                  "do",
                  "arrival-notice",
                  "cro",
                  "payments",
                  "customer-stmt",
                  "carbon",
                  "contact-us",
                ],
              },
            },
          });
        }
        // Rates quotes are owned by MSW + user overlay (session.quotes). No Vite
        // invent-a-quote fallback — a missed intercept must not create non-persisted rows.
        if (req.method === "POST" && url === "/api/booking/submit") {
          return json(res, {
            data: {
              bookingReference: `BKG-${new Date().getFullYear()}-${Math.floor(
                10000 + Math.random() * 90000,
              )}`,
              status: "CONFIRMED",
              submittedAt: new Date().toISOString(),
            },
          });
        }
        if (req.method === "PUT" && url === "/api/booking/amend") {
          return json(res, {
            data: {
              bookingReference: `BKG-AMD-${new Date().getFullYear()}-${Math.floor(
                10000 + Math.random() * 90000,
              )}`,
              status: "CONFIRMED",
              submittedAt: new Date().toISOString(),
            },
          });
        }
        if (req.method === "POST" && url === "/api/booking/draft") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            let draftId = `draft-${Date.now()}`;
            try {
              const parsed = JSON.parse(body || "{}") as { draftId?: string };
              if (parsed.draftId) draftId = parsed.draftId;
            } catch {
              /* ignore */
            }
            json(res, { data: { draftId } });
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    bookingMockApiPlugin(),
    ecomAiN8nProxyPlugin(),
    // After booking + AI proxies so only truly unmatched /api/* become JSON 404.
    ecomApiJson404FallbackPlugin(),
  ],
  resolve: {
    alias: {
      ...(tiptapCorePath ? { "@tiptap/core": tiptapCorePath } : {}),
      "@solverminds/platform": path.resolve(
        __dirname,
        "../../libs/platform/src/index.ts",
      ),
      "@solverminds/auth": path.resolve(
        __dirname,
        "../../libs/auth/src/index.ts",
      ),
      "@solverminds/theme": path.resolve(
        __dirname,
        "../../libs/theme/src/index.ts",
      ),
      "@solverminds/shared-ui/styles.css": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/styles.css",
      ),
      "@solverminds/shared-ui/providers": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/providers/index.ts",
      ),
      "@solverminds/shared-ui/hooks": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/hooks/index.ts",
      ),
      "@solverminds/shared-ui/utils": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/utils/index.ts",
      ),
      "@solverminds/shared-ui/schemas": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/schemas/index.ts",
      ),
      "@solverminds/shared-ui/data-view/list-view": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/data-view/list-view/index.ts",
      ),
      "@solverminds/shared-ui/data-view/kanban-view": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/data-view/kanban-view/index.ts",
      ),
      "@solverminds/shared-ui/data-view/card-view": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/data-view/card-view/index.ts",
      ),
      "@solverminds/shared-ui/data-view/ag-grid-license": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/data-view/ag-grid-license.ts",
      ),
      "@solverminds/shared-ui/data-view": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/data-view/index.ts",
      ),
      "@solverminds/shared-ui/editor": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/ui/rich-text-editor/index.ts",
      ),
      "@solverminds/shared-ui/form-editor": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/form-fields/rich-text-editor/index.ts",
      ),
      "@solverminds/shared-ui/email": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/email/index.ts",
      ),
      "@solverminds/shared-ui/chart": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/components/chart/index.ts",
      ),
      "@solverminds/shared-ui": path.resolve(
        __dirname,
        "../../libs/shared/ui/src/index.ts",
      ),
      "@solverminds/shared-util": path.resolve(
        __dirname,
        "../../libs/shared-util/src/index.ts",
      ),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
